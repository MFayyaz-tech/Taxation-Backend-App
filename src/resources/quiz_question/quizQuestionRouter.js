const express = require("express");
const {
  create,
  update,
  getAll,
  getOne,
  deleteQuiz,
} = require("./quizQuestionController");
const { validateRequest } = require("../../utils/validateRequest");
const quizQuestionValidator = require("./quizQuestionValidator");
const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const quizQuestionRouter = express.Router();

quizQuestionRouter.post(
  "/",
  authAdmin,
  validateRequest(quizQuestionValidator.create),
  create
);
quizQuestionRouter.get("/", authUser, getAll);
quizQuestionRouter.get("/:id", authUser, getOne);
quizQuestionRouter.patch(
  "/:id",
  authAdmin,
  validateRequest(quizQuestionValidator.update),
  update
);
quizQuestionRouter.delete("/:id", authAdmin, deleteQuiz);
module.exports = quizQuestionRouter;
