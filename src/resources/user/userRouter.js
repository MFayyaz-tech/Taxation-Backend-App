const express = require("express");
const controller = require("../auth/authController");
const { validateRequest } = require("../../utils/validateRequest");
const userValidator = require("./userValidator");
const userRouter = express.Router();
// Routes
userRouter
  .route("/signup")
  .post(validateRequest(userValidator.signup), controller.signup);
userRouter
  .route("/login")
  .post(validateRequest(userValidator.login), controller.webLogin);
userRouter.post("/requestOtp", controller.sendOtp);
userRouter.post("/verifyOtp", controller.verifyOtp);
userRouter.patch("/resetPassword", controller.resetPassword);
userRouter.patch("/forgotPassword", controller.forgotPassword);
userRouter.post("/refreshToken", controller.refreshToken);
userRouter
  .route("/:id")
  .get(controller.getOne)
  .patch(controller.update)
  .delete(controller.deleteUser);

module.exports = userRouter;
