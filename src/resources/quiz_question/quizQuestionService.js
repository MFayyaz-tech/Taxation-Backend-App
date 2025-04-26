const userQuizAttemptModel = require("../user_quiz_attempt/userQuizAttemptModel");
const quizQuestionModel = require("./quizQuestionModel");

const quizQuestionService = {
  addNew: async (data) => {
    const contacts = await quizQuestionModel.insertMany(data);
    return contacts;
  },
  getAll: async (user, page = 1, limit = 10) => {
    let query = { deleted: false };
    if (user) {
      query.user = user;
    }
    const data = await quizQuestionModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await quizQuestionModel.countDocuments(query);
    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },
  getTopics: async (user, page = 1, limit = 10) => {
    let query = { deleted: false };
    console.log("query", query);
    const skip = (page - 1) * limit;
    const data = await quizQuestionModel.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$topic", // Grouping by topic
          questions: { $push: "$$ROOT" }, // Collect all the questions in the topic
          count: { $sum: 1 },
        },
      },
      // Sort the topics (optional)
      {
        $sort: { _id: 1 }, // Sorting by topic name alphabetically
      },
      // Paginate: skip and limit
      // {
      //   $skip: skip,
      // },
      // {
      //   $limit: limit,
      // },
      {
        $project: {
          topic: "$_id",
          quesitons: "$count",
          _id: 0,
        },
      },
    ]);
    // .sort({ createdAt: -1 })
    // .skip((page - 1) * limit)
    // .limit(limit);
    const total = await quizQuestionModel.aggregate([
      {
        $group: {
          _id: "$topic", // Grouping by topic
        },
      },
    ]);
    return {
      total: total.length, // Total records
      totalPages: limit ? Math.ceil(total.length / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },
  getQuiz: async (user, topic) => {
    const lastTwoAttempts = await userQuizAttemptModel
      .find({ user })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(2);
    // Extract question IDs from the last two attempts
    const excludedQuestionIds = lastTwoAttempts?.flatMap((attempt) =>
      attempt.attempts.map((q) => q.question)
    );
    console.log("topic", topic);
    // Fetch 20 random quiz questions, excluding last two attempts' questions
    const quizQuestions = await quizQuestionModel.aggregate([
      { $match: { _id: { $nin: excludedQuestionIds }, topic: topic } }, // Exclude previous questions
      { $sample: { size: 20 } }, // Pick 20 random questions
    ]);

    return quizQuestions;
  },
  getOne: async (id) => {
    return await quizQuestionModel.findById(id);
  },
  update: async (id, data) => {
    return await quizQuestionModel.findByIdAndUpdate(id, data, { new: true });
  },
  delete: async (id) => {
    return await quizQuestionModel.findOneAndUpdate(
      { _id: id },
      { deleted: true }
    );
  },
};

module.exports = quizQuestionService;
