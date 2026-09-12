import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";

import { authRouter } from "./routes/auth";
import { tripsRouter } from "./routes/trips";
import { activitiesRouter } from "./routes/activities";
import { weatherRouter } from "./routes/weather";
import { citiesRouter } from "./routes/cities";
import { notFoundHandler, errorHandler } from "./middleware/error";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/trips/:tripId/activities", activitiesRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/cities", citiesRouter);

app.use(notFoundHandler);
app.use(errorHandler);