const express = require("express");
const controller = require("./taxationBotChatController");

const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const taxationBotChatRouter = express.Router();
// Routes
taxationBotChatRouter.route("/").get(controller.create);
// .get(authUser, controller.getAll);
//taxationBotChatRouter.route("/:id").get(authUser, controller.getOne);

module.exports = taxationBotChatRouter;
