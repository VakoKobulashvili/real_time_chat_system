import { catchAsync } from "../utils/catchAsync.js";
import {
  getConversationForUser,
  createMessage,
} from "../services/message.service.js";
import { getIO } from "../sockets/io.js";
import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "username displayName avatar isOnline")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    message: "Conversations retrieved",
    data: { conversations },
  });
});

export const createConversation = catchAsync(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) {
    throw new ApiError(400, "participantId is required");
  }

  if (participantId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot start a chat with yourself");
  }

  const participants = [req.user._id, participantId];

  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  })
    .populate("participants", "username displayName avatar isOnline")
    .populate("lastMessage");

  if (conversation) {
    return res.status(200).json({
      success: true,
      message: "Conversation already exists",
      data: { conversation },
    });
  }

  conversation = await Conversation.create({ participants });
  await conversation.populate(
    "participants",
    "username displayName avatar isOnline",
  );

  res.status(201).json({
    success: true,
    message: "Conversation created",
    data: { conversation },
  });
});

export const getMessages = catchAsync(async (req, res) => {
  await getConversationForUser(req.params.id, req.user._id);

  const messages = await Message.find({ conversation: req.params.id })
    .populate("sender", "username displayName avatar")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    message: "Messages retrieved",
    data: { messages },
  });
});

export const sendMessage = catchAsync(async (req, res) => {
  const { message, conversationId } = await createMessage({
    conversationId: req.params.id,
    userId: req.user._id,
    content: req.body.content,
  });

  const io = getIO();
  if (io) {
    io.to(`conversation:${conversationId}`).emit("new_message", { message });
  }

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: { message },
  });
});
