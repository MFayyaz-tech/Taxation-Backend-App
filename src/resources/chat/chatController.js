const expressAsyncHandler = require("express-async-handler");
const chatServices = require("./chatService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");

//* Get all chats
const getAll = expressAsyncHandler(async (req, res) => {
  const chats = await chatServices.getChats();
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Chats Retrieved",
    true,
    chats,
    null
  );
});
const getUserChats = expressAsyncHandler(async (req, res) => {
  const chats = await chatServices.userChats(req.params.id);
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Chats Retrieved",
    true,
    chats,
    null
  );
});
module.exports = { getAll, getUserChats };
