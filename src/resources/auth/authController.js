const expressAsyncHandler = require("express-async-handler");
const userService = require("../user/userService");
const jwtServices = require("../../utils/jwtServices");
const uuid4 = require("uuid4");
const authServices = require("../../utils/authServices");
const OTP = require("../../utils/OTP");
//const sendMail = require("../../utils/sendMail");
const sendResponse = require("../../utils/sendResponse");
const responseStatusCodes = require("../../utils/responseStatusCode");
const { default: otp } = require("../../utils/OTP");
const authController = {
  // Signup route
  signup: expressAsyncHandler(async (req, res) => {
    const exist = await userService.isExist(req.body.email);
    if (exist) {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "User already exist",
        false,
        null,
        null
      );
    }
    req.body.role = "user";
    const result = await userService.create(req.body);
    if (result) {
      // const uuid = uuid4();
      // const refreshToken = await jwtServices.create({
      //   uuid,
      //   type: result.role,
      // });
      // const accessToken = await jwtServices.create(
      //   { userId: result.id, type: result.role },
      //   "30m"
      // );
      // authServices.add(result.id, String(uuid));
      return sendResponse(
        res,
        responseStatusCodes.CREATED,
        "User registered successfully",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Failed to register user",
        false,
        null,
        null
      );
    }
  }),

  // Signup route
  webSignup: expressAsyncHandler(async (req, res) => {
    const exist = await userService.isExist(req.body.email);
    if (exist) {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "User already exist",
        false,
        null,
        null
      );
    }
    req.body.role = "admin";
    const result = await userService.create(req.body);
    if (result) {
      return sendResponse(
        res,
        responseStatusCodes.CREATED,
        "User registered successfully",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Failed to register user",
        false,
        null,
        null
      );
    }
  }),

  // Login route
  login: expressAsyncHandler(async (req, res) => {
    const { email, password, fcmToken, country } = req.body;
    const user = await userService.getByEmail(email);
    if (user) {
      if (user?.status === "blocked") {
        return sendResponse(
          res,
          responseStatusCodes.BAD,
          "Your account is blocked",
          false,
          null,
          null
        );
      }
      const validatePassword = await userService.validatePassword(
        password,
        user.password
      );
      if (validatePassword) {
        let updatedUser = await userService.updateFcm(email, fcmToken, country);
        delete updatedUser.password;
        const uuid = uuid4();
        const refreshToken = await jwtServices.create({
          uuid,
          type: user.role,
        });
        const accessToken = await jwtServices.create(
          { userId: user._id.toString(), type: user.role },
          "30m"
        );
        authServices.add(user._id, String(uuid));
        (updatedUser.accessToken = accessToken),
          (updatedUser.refreshToken = refreshToken);
        return sendResponse(
          res,
          responseStatusCodes.OK,
          "Login Successfully",
          true,
          updatedUser,
          null
        );
      } else {
        return sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Credentials!",
          false,
          null,
          null
        );
      }
    } else {
      return sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "Invalid Credentials!",
        false,
        null,
        null
      );
    }
  }),

  // Web portal login route
  webLogin: expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Fields Missing",
        false,
        null,
        null
      );
    }
    const user = await userService.Weblogin(email);
    if (user) {
      const validatePassword = await userService.validatePassword(
        password,
        user.password
      );
      if (validatePassword) {
        delete user.password;
        return sendResponse(
          res,
          responseStatusCodes.OK,
          "Logged in Successfully",
          true,
          user,
          null
        );
      } else {
        return sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Credentials!",
          false,
          null,
          null
        );
      }
    } else {
      return sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "Invalid Credentials!",
        false,
        null,
        null
      );
    }
  }),

  // Get all users route
  getAll: expressAsyncHandler(async (req, res) => {
    const users = await userService.getAll(
      req.query.role,
      req.query.page,
      req.query.recordsPerPage,
      req.query.isExecutive,
      req.query.search
    );
    const count = await userService.countDocumment(
      req.query.role,
      req.query.search,
      req.query.isExecutive
    );
    return sendResponse(
      res,
      responseStatusCodes.OK,
      "Users",
      true,
      { users, count },
      null
    );
  }),

  // Get one user route
  getOne: expressAsyncHandler(async (req, res) => {
    const user = await userService.getOne(req.params.id);
    if (user) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "User",
        true,
        user,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.NOTFOUND,
        "User not found",
        false,
        null,
        null
      );
    }
  }),

  // Update user route
  update: expressAsyncHandler(async (req, res) => {
    const result = await userService.update(
      String(req.params.id),
      req.body,
      req
    );
    if (result) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "Profile Updated",
        true,
        result,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Failed to update",
        false,
        result,
        null
      );
    }
  }),

  // Delete user route
  deleteUser: expressAsyncHandler(async (req, res) => {
    const result = await userService.delete(String(req.params.id));
    if (result.affected) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "Deleted",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.NOTFOUND,
        "Not Found!",
        false,
        null,
        null
      );
    }
  }),

  // Send OTP route
  sendOtp: expressAsyncHandler(async (req, res) => {
    const value = otp();
    const result = await userService.requestOtp(
      String(req.body.email),
      Number(value)
    );
    console.log("result", result);
    if (result) {
      // await sendMail(req.body.email, otp);
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "OTP sent",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "OTP not sent",
        false,
        null,
        null
      );
    }
  }),

  // Verify OTP route
  verifyOtp: expressAsyncHandler(async (req, res) => {
    const isValidateExpireOtp = await userService.otpExpiryValidation(
      String(req.body.email)
    );
    if (!isValidateExpireOtp) {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "OTP expired, please try again",
        false,
        null,
        null
      );
    }
    const isValidOtp = await userService.isValidOtp(
      Number(req.body.otp),
      String(req.body.email)
    );
    if (isValidOtp) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "OTP Verified",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "OTP invalid!",
        false,
        null,
        null
      );
    }
  }),

  // Reset password route
  resetPassword: expressAsyncHandler(async (req, res) => {
    const { password } = req.body;
    const result = await userService.resetPassword(
      String(req.params.id),
      String(password)
    );
    if (result) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "Password has been changed successfully",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Failed to reset password",
        false,
        null,
        null
      );
    }
  }),

  // Forgot password route
  forgotPassword: expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await userService.forgotPassword(email, password);
    if (result) {
      return sendResponse(
        res,
        responseStatusCodes.OK,
        "Password Updated successfully",
        true,
        null,
        null
      );
    } else {
      return sendResponse(
        res,
        responseStatusCodes.BAD,
        "Password not Updated",
        false,
        null,
        null
      );
    }
  }),

  // Refresh token route
  refreshToken: expressAsyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const verifyToken = await jwtServices.authenticate(refreshToken);
    if (verifyToken) {
      const { uuid, type } = verifyToken;
      const AuthId = await authServices.findByUUID(String(uuid));
      if (AuthId) {
        const { userId } = AuthId;
        if (userId) {
          const accessToken = await jwtServices.create({ userId, type }, "5m");
          return sendResponse(
            res,
            responseStatusCodes.OK,
            "Access Token",
            true,
            { accessToken },
            null
          );
        } else {
          return sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            "Login please",
            false,
            null,
            null
          );
        }
      } else {
        return sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Login please",
          false,
          null,
          null
        );
      }
    } else {
      return sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "Login please",
        false,
        null,
        null
      );
    }
  }),
};

module.exports = authController;
