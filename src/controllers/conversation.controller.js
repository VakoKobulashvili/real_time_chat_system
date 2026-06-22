import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const getConversationForUser = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation;
};

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
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const conversation = await getConversationForUser(
    req.params.id,
    req.user._id,
  );

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content: content.trim(),
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  await message.populate("sender", "username displayName avatar");

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: { message },
  });
});
