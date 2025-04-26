const asyncHandler = require("express-async-handler");
const quizAttemptService = require("./userQuizAttemptService");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");
const sendPushNotification = require("../../utils/firebase_service");
const notificationService = require("../notification/notificationService");

//* Create a new quiz attempt
const create = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log("user", req.user);
  const quizAttempt = await quizAttemptService.addNew(userId, req.body);

  if (quizAttempt) {
    await notificationService.addNew(
      "Quiz Attempted!",
      `You scored ${quizAttempt.obtainedMarks}/${quizAttempt.totalQuestions}.`,
      "quiz",
      req.user.id,
      quizAttempt?._id
    );
    if (req.user.fcmToken) {
      await sendPushNotification(
        req.user.fcmToken,
        "Quiz Attempted!",
        `You scored ${quizAttempt.obtainedMarks}/${quizAttempt.totalQuestions}.`,
        {
          id: quizAttempt?._id.toString(),
        }
      );
    }
    return sendResponse(
      res,
      responseStatusCodes.CREATED,
      "Quiz Attempt Created",
      true,
      quizAttempt,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to create quiz attempt",
    false,
    null,
    null
  );
});

//* Get all quiz attempts (optionally filtered by user)
const getAll = asyncHandler(async (req, res) => {
  const { user, page, limit } = req.query;
  const quizAttempts = await quizAttemptService.getAll(
    user || req.user._id,
    page,
    limit
  );

  return sendResponse(
    res,
    responseStatusCodes.OK,
    "Quiz Attempts Retrieved",
    true,
    quizAttempts,
    null
  );
});

//* Get one quiz attempt by ID
const getOne = asyncHandler(async (req, res) => {
  const quizAttempt = await quizAttemptService.getOne(req.params.id);

  if (quizAttempt) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Quiz Attempt Retrieved",
      true,
      quizAttempt,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    "Quiz Attempt Not Found",
    false,
    null,
    null
  );
});

//* Update quiz attempt (if needed)
const update = asyncHandler(async (req, res) => {
  const result = await quizAttemptService.update(req.params.id, req.body);

  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Quiz Attempt Updated",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to update quiz attempt",
    false,
    null,
    null
  );
});

//* Delete a quiz attempt
const deleteQuizAttempt = asyncHandler(async (req, res) => {
  const result = await quizAttemptService.delete(req.params.id);

  if (result) {
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Quiz Attempt Deleted Successfully",
      true,
      null,
      null
    );
  }
  return sendResponse(
    res,
    responseStatusCodes.BAD,
    "Failed to delete quiz attempt",
    false,
    null,
    null
  );
});

module.exports = { create, getAll, getOne, update, deleteQuizAttempt };
