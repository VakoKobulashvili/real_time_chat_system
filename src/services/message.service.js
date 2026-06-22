import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getConversationForUser = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation;
};

export const createMessage = async ({ conversationId, userId, content }) => {
  if (!content?.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const conversation = await getConversationForUser(conversationId, userId);

  const message = await Message.create({
    conversation: conversation._id,
    sender: userId,
    content: content.trim(),
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  await message.populate("sender", "username displayName avatar");

  return { message, conversationId: conversation._id.toString() };
};
