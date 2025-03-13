const Joi = require("joi");
const contactUsValidator = {
  create: Joi.object({
    email: Joi.string().required(),
    name: Joi.string().required(),
    message: Joi.string().required(),
  }),
  update: Joi.object({
    email: Joi.string().optional(),
    name: Joi.string().optional(),
    message: Joi.string().optional(),
    status: Joi.string().optional(),
  }),
};
module.exports = contactUsValidator;
