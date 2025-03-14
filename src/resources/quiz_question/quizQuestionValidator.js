const Joi = require("joi");
const quizQuestionValidator = {
  create: Joi.array().items({
    question: Joi.string().required(),
    optionA: Joi.string().required(),
    chapter: Joi.string().optional(),
    topic: Joi.string().optional(),
    optionB: Joi.string().required(),
    optionC: Joi.string().required(),
    optionD: Joi.string().required(),
    answer: Joi.string().required(),
  }),
  update: Joi.object({
    question: Joi.string().optional(),
    optionA: Joi.string().optional(),
    chapter: Joi.string().optional(),
    topic: Joi.string().optional(),
    optionB: Joi.string().optional(),
    optionC: Joi.string().optional(),
    optionD: Joi.string().optional(),
    answer: Joi.string().optional(),
  }),
};
module.exports = quizQuestionValidator;
