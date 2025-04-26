const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler.middleware");

//import dotenv
dotenv.config();
require("./db/db");
const sendResponse = require("./utils/sendResponse");
const responseStatusCodes = require("./utils/responseStatusCode");
const authRouter = require("./resources/auth/authRouter");
const userRouter = require("./resources/user/userRouter");
const contactUsRouter = require("./resources/contact_us/contactUsRouter");
const notificationRouter = require("./resources/notification/notificationRouter");
const quizQuestionRouter = require("./resources/quiz_question/quizQuestionRouter");
const userQuizAttempRouter = require("./resources/user_quiz_attempt/userQuizAttempRouter");
const taxationBotChatRouter = require("./resources/taxation_bot_chat/taxationBotChatRouter");
const chatRouter = require("./resources/chat/chatRouter");

require("./utils/firebase_service");
const app = express();

const corsOptions = {
  origin: "*", // or specify the allowed origins
};
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(express.json({ limit: "100mb" }));
app.use(morgan("dev"));

//default route
app.get("/", (req, res) => {
  res.status(200).send({ msg: "Welcome To Taxation Server" });
});

// print called route
app.use((req, res, next) => {
  console.log(`Route called: ${req.originalUrl}`);
  next();
});
//sendEmail();

//middleware
//app.use(authentication);
//apis routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/contactus", contactUsRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/question", quizQuestionRouter);
app.use("/api/attempt", userQuizAttempRouter);
app.use("/api/taxation-bot", taxationBotChatRouter);
app.use("/api/chat", chatRouter);

// app.use("/api/submodule", submoduleRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler (should come after all your specific route handlers)
app.use(async (req, res) => {
  await sendResponse(
    res,
    responseStatusCodes.NOTFOUND,
    "Not Found",
    false,
    null,
    null
  );

  return;
});

module.exports = app;
