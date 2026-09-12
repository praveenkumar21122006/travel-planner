import { Router } from "express";
import { z } from "zod";

import { authenticate } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";
import { fetchWeatherForecast } from "../services/weather.service";

export const weatherRouter = Router();

weatherRouter.use(authenticate);

const querySchema = z.object({
  city: z.string().min(1, "city is required"),
  country: z.string().optional(),
  days: z.coerce.number().int().min(1).max(16).default(5),
});

weatherRouter.get(
  "/forecast",
  asyncHandler(async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid query", parsed.error.flatten().fieldErrors);
    }

    const forecast = await fetchWeatherForecast({
      city: parsed.data.city,
      country: parsed.data.country,
      days: parsed.data.days,
    });

    res.json(forecast);
  })
);