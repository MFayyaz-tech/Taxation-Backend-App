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
