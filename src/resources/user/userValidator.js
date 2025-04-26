const Joi = require("joi");
const userValidator = {
  signup: Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  }),
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
  update: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    country: Joi.string().optional(),
    status: Joi.string().optional().valid("active", "blocked"),
  }),
};
module.exports = userValidator;
