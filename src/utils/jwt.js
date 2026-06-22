import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateToken = (userId) => {
  if (!config.jwt.secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
