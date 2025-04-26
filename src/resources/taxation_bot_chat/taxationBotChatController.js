const asyncHandler = require("express-async-handler");
const taxationBotChatService = require("./taxationBotChatService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");
const taxationKeyWordsModel = require("./taxationKeyWordsModel");

//* Create chat
const create = asyncHandler(async (req, res) => {
  const { prompt, country } = req.query;
  if (!prompt || !country) {
    return sendResponse(
      res,
      responseStatusCodes.BAD,
      "Fields missing",
      false,
      null,
      null
    );
  }
  const promptLower = prompt.toLowerCase();
  const matchedKeyword = await taxationKeyWordsModel.find({
    $text: { $search: promptLower },
  });

  if (matchedKeyword.length === 0) {
    return sendResponse(
      res,
      responseStatusCodes.BAD,
      "Your query is not related to taxation.",
      false,
      null,
      null
    );
  }
  const chat = await taxationBotChatService.processPrompt(promptLower, country);
  if (chat) {
    return sendResponse(res, responseStatusCodes.OK, "Chat", true, chat, null);
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to create chat",
    false,
    null,
    null
  );
});

//* Get all notifications
const getAll = asyncHandler(async (req, res) => {
  const { user, type, page, limit } = req.query;
  const notifications = await taxationBotChatService.getAll(
    user || req.user._id,
    type,
    page,
    limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Notifications Retrieved",
    true,
    notifications,
    null
  );
});

//* Get one chat
const getOne = asyncHandler(async (req, res) => {
  const chat = await taxationBotChatService.getOne(req.params.id);
  if (chat) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Chat Retrieved",
      true,
      chat,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    "Chat Not Found",
    false,
    null,
    null
  );
});

//* Update chat
const update = asyncHandler(async (req, res) => {
  const result = await taxationBotChatService.update(req.params.id, req.body);
  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Chat Updated",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to update chat",
    false,
    null,
    null
  );
});

//* Delete chat
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await taxationBotChatService.delete(req.params.id);
  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Chat Deleted Successfully",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to delete chat",
    false,
    null,
    null
  );
});

module.exports = { create, getAll, getOne, update, deleteNotification };
