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
};
module.exports = userValidator;
