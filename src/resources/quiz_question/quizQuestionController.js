// Controller file (contactController.js)
const asyncHandler = require("express-async-handler");
const quizQuestionService = require("./quizQuestionService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");

const create = asyncHandler(async (req, res) => {
  const quiz = await quizQuestionService.addNew(req.body);
  return sendResponse(
    res,
    responseStatusCodes.CREATED,
    "Question request created",
    true,
    quiz,
    null
  );
});

const getAll = asyncHandler(async (req, res) => {
  const quizQuestions = await quizQuestionService.getAll(
    req.query.user,
    req.query.page,
    req.query.limit
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Questions retrieved",
    true,
    quizQuestions,
    null
  );
});
const getTopics = asyncHandler(async (req, res) => {
  const quizQuestions = await quizQuestionService.getTopics(
    req.query.user,
    Number(req.query.page),
    Number(req.query.limit)
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Questions retrieved",
    true,
    quizQuestions,
    null
  );
});

const getQuiz = asyncHandler(async (req, res) => {
  const quizQuestions = await quizQuestionService.getQuiz(
    req.user.id,
    req.query.topic
  );
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Questions retrieved",
    true,
    quizQuestions,
    null
  );
});

const getOne = asyncHandler(async (req, res) => {
  const quiz = await quizQuestionService.getOne(req.params.id);
  if (!quiz) {
    return sendResponse(
      res,
      responseStatusCodes.NOTFOUND,
      "Question not found",
      false,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Question retrieved",
    true,
    quiz,
    null
  );
});

const update = asyncHandler(async (req, res) => {
  const quiz = await quizQuestionService.update(req.params.id, req.body);
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Question updated",
    true,
    quiz,
    null
  );
});

const deleteQuiz = asyncHandler(async (req, res) => {
  await quizQuestionService.delete(req.params.id);
  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Question deleted",
    true,
    null,
    null
  );
});

module.exports = {
  create,
  getAll,
  getOne,
  update,
  deleteQuiz,
  getQuiz,
  getTopics,
};
