import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { AuthUser, JWTPayload } from "../types";
import { HttpError } from "./error";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing bearer token"));
  }

  const token = header.slice("Bearer ".length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new HttpError(500, "JWT_SECRET is not configured"));
  }

  try {
    const payload = jwt.verify(token, secret) as JWTPayload;
    if (!payload?.id) {
      return next(new HttpError(401, "Invalid token payload"));
    }
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}