import { Router } from "express";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", sendMessage);

export default router;
