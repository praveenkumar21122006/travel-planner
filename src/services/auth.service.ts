import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import type { AuthUser, JWTPayload } from "../types";

const SALT_ROUNDS = 10;

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export function signToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const payload: JWTPayload = { id: user.id, email: user.email };
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  const decoded = jwt.verify(token, secret) as JWTPayload;
  return decoded;
}