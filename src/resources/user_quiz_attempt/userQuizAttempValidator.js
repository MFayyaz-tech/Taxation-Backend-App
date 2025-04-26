const Joi = require("joi");
const userQuizAttempValidator = {
  create: Joi.array()
    .items({
      question: Joi.string().required(),
      answer: Joi.string().required().valid("A", "B", "C", "D"),
      is_correct: Joi.boolean().required(),
    })
    .required()
    .min(1),

  update: Joi.object({
    attempts: Joi.array().items({
      question: Joi.string().required(),
      answer: Joi.string().required().valid("A", "B", "C", "D"),
      is_correct: Joi.boolean().optional(),
    }),
    totalQuestions: Joi.number().optional(),
  }),
};
module.exports = userQuizAttempValidator;
