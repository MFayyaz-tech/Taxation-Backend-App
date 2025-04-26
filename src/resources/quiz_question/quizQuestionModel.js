const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define the Quiz schema
const quizQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
    },
    topic: {
      type: String,
    },
    optionA: {
      type: String,
      required: true,
    },
    optionB: {
      type: String,
      required: true,
    },
    optionC: {
      type: String,
      required: true,
    },
    optionD: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D"], // Restrict answer to A, B, C, or D
    },
    country: {
      type: String,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the Quiz model based on the schema
module.exports = model("QuizQuestion", quizQuestionSchema);
