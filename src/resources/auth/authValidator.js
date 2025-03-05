const Joi = require("joi");
const authValidator = {
  signup: Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
    phone: Joi.string().optional(),
  }),
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    fcmToken: Joi.string().optional(),
    country: Joi.string().optional(),
  }),
  requestOtp: Joi.object({
    email: Joi.string().required(),
  }),
  verifyOtp: Joi.object({
    email: Joi.string().required(),
    otp: Joi.number().required(),
  }),
  updateProfile: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    country: Joi.string().optional(),
  }),
  resetPassword: Joi.object({
    password: Joi.string().required(),
  }),
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
module.exports = authValidator;
