import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { hashPassword, signToken, verifyPassword, verifyToken } from "../services/auth.service";
import { asyncHandler, HttpError } from "../middleware/error";
import { Router } from "express";
import type { AuthUser } from "../types";

export const prisma = new PrismaClient();

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid registration payload", parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, "An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const authUser: AuthUser = { id: user.id, email: user.email };
    const token = signToken(authUser);

    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid login payload", parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "Invalid email or password");
    }

    const authUser: AuthUser = { id: user.id, email: user.email };
    const token = signToken(authUser);

    res.json({ token, user: { id: user.id, email: user.email } });
  })
);

authRouter.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing bearer token");
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw new HttpError(401, "User no longer exists");
    }

    res.json({ valid: true, user: { id: user.id, email: user.email } });
  })
);