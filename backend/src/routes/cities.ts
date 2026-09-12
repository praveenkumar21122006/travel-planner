import { searchCities } from "../services/city.service";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { asyncHandler, HttpError } from "../middleware/error";

export const citiesRouter = Router();

citiesRouter.use(authenticate);

const querySchema = z.object({
  q: z.string().min(1, "Search query q is required"),
  max: z.coerce.number().int().min(1).max(20).default(10),
});

citiesRouter.get(
  "/autocomplete",
  asyncHandler(async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid query", parsed.error.flatten().fieldErrors);
    }

    const result = await searchCities(parsed.data.q, parsed.data.max);
    res.json(result);
  })
);