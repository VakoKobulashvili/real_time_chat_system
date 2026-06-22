import { Router } from "express";
import mongoose from "mongoose";
import authRoutes from "./auth.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    message: "Server is running",
    data: {
      uptime: process.uptime(),
      database: dbStatus[dbState] || "unknown",
    },
  });
});

router.use("/auth", authRoutes);

export default router;
