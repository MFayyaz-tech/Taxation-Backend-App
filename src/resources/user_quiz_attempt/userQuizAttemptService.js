const userQuizAttemptModel = require("./userQuizAttemptModel");
const QuizQuestion = require("../quiz_question/quizQuestionModel");

const quizAttemptService = {
  //* Add new quiz attempt
  addNew: async (userId, attempts) => {
    let correctCount = 0;
    let wrongCount = 0;
    const totalQuestions = attempts.length;

    // Validate each question and compare answers
    for (const attempt of attempts) {
      const question = await QuizQuestion.findById(attempt.question);
      if (question) {
        if (question.answer === attempt.answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    }

    // Calculate the percentage score
    const scorePercentage =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100 * 100) / 100
        : 0;

    // Store attempt result
    const quizAttempt = new userQuizAttemptModel({
      user: userId,
      attempts: attempts, // Array of attempted questions with user-selected answers
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      obtainedMarks: correctCount,
      accuracyPercentage: scorePercentage,
    });

    await quizAttempt.save();
    return quizAttempt;
  },

  //* Get all quiz attempts (with optional pagination)
  getAll: async (user, page = 1, limit = 10) => {
    let query = { user };

    const data = await userQuizAttemptModel
      .find(query)
      .populate("attempts.question")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await userQuizAttemptModel.countDocuments(query);

    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: parseInt(page),
      data,
    };
  },

  //* Get one quiz attempt by ID
  getOne: async (id) => {
    return await userQuizAttemptModel
      .findOne({ _id: id })
      .populate("attempts.question");
  },

  //* Update quiz attempt (if needed)
  update: async (id, attemptData) => {
    return await userQuizAttemptModel.findByIdAndUpdate(id, attemptData, {
      new: true,
    });
  },

  //* Delete quiz attempt (soft delete)
  delete: async (id) => {
    return await userQuizAttemptModel.findByIdAndDelete(id);
  },
};

module.exports = quizAttemptService;
