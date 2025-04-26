const express = require("express");
const controller = require("../auth/authController");
const { validateRequest } = require("../../utils/validateRequest");
const userValidator = require("./userValidator");
const {
  authUser,
  authAdmin,
} = require("../../middleware/authentication.middleware");
const userRouter = express.Router();
// Routes
userRouter
  .route("/signup")
  .post(validateRequest(userValidator.signup), controller.webSignup);
userRouter
  .route("/login")
  .post(validateRequest(userValidator.login), controller.webLogin);
userRouter.route("/dashboard").get(authAdmin, controller.dashboard);
userRouter
  .route("/dashboard/chart")
  .get(authAdmin, controller.getUserStatusByMonth);

userRouter.post("/requestOtp", controller.sendOtp);
userRouter.post("/verifyOtp", controller.verifyOtp);
userRouter.patch("/resetPassword", controller.resetPassword);
userRouter.patch("/forgotPassword", controller.forgotPassword);
userRouter.post("/refreshToken", controller.refreshToken);
userRouter.get("/", authAdmin, controller.getAll);

userRouter
  .route("/:id")
  .get(controller.getOne)
  .patch(authUser, validateRequest(userValidator.update), controller.update)
  .delete(controller.deleteUser);

module.exports = userRouter;
