const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Define the User Quiz Attempt Schema
const userQuizAttemptSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },
    attempts: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QuizQuestion", // Refers to the QuizQuestion model
          required: true,
        },
        answer: {
          type: String,
          required: true,
          enum: ["A", "B", "C", "D"], // User-selected answer
        },
        is_correct: {
          type: Boolean, // True if answer matches correct answer
          required: true,
        },
      },
    ],
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    wrongAnswers: {
      type: Number,
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
    },
    accuracyPercentage: {
      type: Number, // Calculated as (correctAnswers / totalQuestions) * 100
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("UserQuizAttempt", userQuizAttemptSchema);
