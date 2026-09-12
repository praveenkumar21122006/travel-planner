import { Router } from "express";
import { z } from "zod";

import { prisma } from "./auth";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";

export const tripsRouter = Router();

tripsRouter.use(authenticate);

const tripSchema = z.object({
  destinationCity: z.string().min(1, "Destination city is required"),
  country: z.string().min(1, "Country is required"),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
});

const tripUpdateSchema = tripSchema.partial();

const toTripDTO = (trip: {
  id: string;
  destinationCity: string;
  country: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}) => ({
  id: trip.id,
  destinationCity: trip.destinationCity,
  country: trip.country,
  startDate: trip.startDate.toISOString(),
  endDate: trip.endDate.toISOString(),
  createdAt: trip.createdAt.toISOString(),
});

tripsRouter.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user!.id },
      orderBy: { startDate: "asc" },
      include: {
        activities: {
          orderBy: [{ dayNumber: "asc" }, { timeSlot: "asc" }],
        },
      },
    });

    res.json(
      trips.map((trip) => ({
        ...toTripDTO(trip),
        activities: trip.activities.map((a) => ({
          id: a.id,
          tripId: a.tripId,
          dayNumber: a.dayNumber,
          timeSlot: a.timeSlot,
          title: a.title,
          description: a.description,
          createdAt: a.createdAt.toISOString(),
        })),
      }))
    );
  })
);

tripsRouter.get(
  "/:tripId",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId } = req.params;
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user!.id },
      include: {
        activities: {
          orderBy: [{ dayNumber: "asc" }, { timeSlot: "asc" }],
        },
      },
    });

    if (!trip) {
      throw new HttpError(404, "Trip not found");
    }

    res.json({
      ...toTripDTO(trip),
      activities: trip.activities.map((a) => ({
        id: a.id,
        tripId: a.tripId,
        dayNumber: a.dayNumber,
        timeSlot: a.timeSlot,
        title: a.title,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  })
);

tripsRouter.post(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = tripSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid trip payload", parsed.error.flatten().fieldErrors);
    }

    const { destinationCity, country, startDate, endDate } = parsed.data;
    if (new Date(endDate) < new Date(startDate)) {
      throw new HttpError(400, "endDate must be on or after startDate");
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.user!.id,
        destinationCity,
        country,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json(toTripDTO(trip));
  })
);

tripsRouter.patch(
  "/:tripId",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId } = req.params;
    const parsed = tripUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid trip payload", parsed.error.flatten().fieldErrors);
    }

    const existing = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user!.id },
    });
    if (!existing) {
      throw new HttpError(404, "Trip not found");
    }

    const next = parsed.data as Partial<typeof parsed.data> & {
      startDate?: string;
      endDate?: string;
    };
    const finalStart = next.startDate ? new Date(next.startDate) : existing.startDate;
    const finalEnd = next.endDate ? new Date(next.endDate) : existing.endDate;
    if (finalEnd < finalStart) {
      throw new HttpError(400, "endDate must be on or after startDate");
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(next.destinationCity && { destinationCity: next.destinationCity }),
        ...(next.country && { country: next.country }),
        ...(next.startDate && { startDate: finalStart }),
        ...(next.endDate && { endDate: finalEnd }),
      },
    });

    res.json(toTripDTO(trip));
  })
);

tripsRouter.delete(
  "/:tripId",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId } = req.params;
    const existing = await prisma.trip.findFirst({
      where: { id: tripId, userId: req.user!.id },
    });
    if (!existing) {
      throw new HttpError(404, "Trip not found");
    }

    await prisma.trip.delete({ where: { id: tripId } });
    res.status(204).end();
  })
);