const express = require("express");
const controller = require("./chatController");

const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const chatRouter = express.Router();
// Routes
chatRouter.route("/").get(authAdmin, controller.getAll);
chatRouter.route("/user/:id").get(authAdmin, controller.getUserChats);

// .get(authUser, controller.getAll);
//chatRouter.route("/:id").get(authUser, controller.getOne);

module.exports = chatRouter;
