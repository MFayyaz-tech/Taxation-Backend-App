const express = require("express");
const controller = require("./authController");
const { validateRequest } = require("../../utils/validateRequest");
const authValidator = require("./authValidator");
const { authUser } = require("../../middleware/authentication.middleware");
const authRouter = express.Router();
// Routes
authRouter
  .route("/signup")
  .post(validateRequest(authValidator.signup), controller.signup);
authRouter
  .route("/login")
  .post(validateRequest(authValidator.login), controller.login);
authRouter
  .route("/requestOtp")
  .post(validateRequest(authValidator.requestOtp), controller.sendOtp);
authRouter
  .route("/verifyOtp")
  .post(validateRequest(authValidator.verifyOtp), controller.verifyOtp);
authRouter.route("/resetPassword/:id").patch(
  validateRequest(authValidator.resetPassword),
  // authUser,
  controller.resetPassword
);
authRouter
  .route("/forgotPassword")
  .patch(
    validateRequest(authValidator.forgotPassword),
    controller.forgotPassword
  );
authRouter
  .route("/refreshToken")
  .post(validateRequest(authValidator.refreshToken), controller.refreshToken);

authRouter
  .route("/:id")
  .get(controller.getOne)
  .patch(controller.update)
  .delete(controller.deleteUser);

module.exports = authRouter;
