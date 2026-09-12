import { Router } from "express";
import { z } from "zod";

import { prisma } from "./auth";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import type { TimeSlot } from "../types";

export const activitiesRouter = Router({ mergeParams: true });

activitiesRouter.use(authenticate);

const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];

const activitySchema = z.object({
  dayNumber: z.number().int().min(1),
  timeSlot: z.enum(TIME_SLOTS as [TimeSlot, ...TimeSlot[]]),
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""),
});

const activityUpdateSchema = activitySchema.partial();

async function assertTripOwnership(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) {
    throw new HttpError(404, "Trip not found");
  }
  return trip;
}

activitiesRouter.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId } = req.params;
    await assertTripOwnership(req.user!.id, tripId);

    const activities = await prisma.activity.findMany({
      where: { tripId },
      orderBy: [{ dayNumber: "asc" }, { timeSlot: "asc" }],
    });

    res.json(activities.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
  })
);

activitiesRouter.post(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId } = req.params;
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid activity payload", parsed.error.flatten().fieldErrors);
    }

    await assertTripOwnership(req.user!.id, tripId);
    const { dayNumber, timeSlot, title, description } = parsed.data;

    const activity = await prisma.activity.create({
      data: { tripId, dayNumber, timeSlot, title, description },
    });

    res.status(201).json({ ...activity, createdAt: activity.createdAt.toISOString() });
  })
);

activitiesRouter.patch(
  "/:activityId",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId, activityId } = req.params;
    const parsed = activityUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid activity payload", parsed.error.flatten().fieldErrors);
    }

    await assertTripOwnership(req.user!.id, tripId);
    const existing = await prisma.activity.findFirst({ where: { id: activityId, tripId } });
    if (!existing) {
      throw new HttpError(404, "Activity not found");
    }

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: parsed.data,
    });

    res.json({ ...activity, createdAt: activity.createdAt.toISOString() });
  })
);

activitiesRouter.delete(
  "/:activityId",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { tripId, activityId } = req.params;
    await assertTripOwnership(req.user!.id, tripId);

    const existing = await prisma.activity.findFirst({ where: { id: activityId, tripId } });
    if (!existing) {
      throw new HttpError(404, "Activity not found");
    }

    await prisma.activity.delete({ where: { id: activityId } });
    res.status(204).end();
  })
);