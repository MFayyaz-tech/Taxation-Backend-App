const express = require("express");
const controller = require("./userQuizAttemptController");

const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const { validateRequest } = require("../../utils/validateRequest");
const userQuizAttempValidator = require("./userQuizAttempValidator");
const quizAttemptRouter = express.Router();
// Routes
quizAttemptRouter
  .route("/")
  .post(
    authUser,
    validateRequest(userQuizAttempValidator.create),
    controller.create
  )
  .get(authUser, controller.getAll);
quizAttemptRouter
  .route("/:id")
  .get(authUser, controller.getOne)
  .delete(authUser, controller.deleteQuizAttempt);

module.exports = quizAttemptRouter;
