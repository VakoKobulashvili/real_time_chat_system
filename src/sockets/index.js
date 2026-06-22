import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { config } from "../config/index.js";
import { User } from "../models/User.model.js";
import {
  createMessage,
  getConversationForUser,
} from "../services/message.service.js";
import { setIO } from "./io.js";

export const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
  });

  setIO(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });

    socket.broadcast.emit("user_online", {
      userId,
      isOnline: true,
    });

    socket.on("join_conversation", async (conversationId) => {
      try {
        await getConversationForUser(conversationId, socket.user._id);
        socket.join(`conversation:${conversationId}`);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("send_message", async ({ conversationId, content }) => {
      try {
        const { message, conversationId: roomId } = await createMessage({
          conversationId,
          userId: socket.user._id,
          content,
        });

        io.to(`conversation:${roomId}`).emit("new_message", { message });
      } catch (error) {
        socket.emit("error", {
          message: error.message || "Failed to send message",
        });
      }
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("user_offline", {
        userId,
        isOnline: false,
      });
    });
  });

  return io;
};
