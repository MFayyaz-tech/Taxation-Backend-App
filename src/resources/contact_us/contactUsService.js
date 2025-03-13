const ContactUs = require("./contactUsModel");

const contactService = {
  addNew: async (data) => {
    const contact = new ContactUs(data);
    await contact.save();
    return contact;
  },
  getAll: async (user, page = 1, limit = 10) => {
    let query = {};
    if (user) {
      query.user = user;
    }
    const data = await ContactUs.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await ContactUs.countDocuments(query);
    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },
  getOne: async (id) => {
    return await ContactUs.findById(id);
  },
  update: async (id, data) => {
    return await ContactUs.findByIdAndUpdate(id, data, { new: true });
  },
  delete: async (id) => {
    return await ContactUs.findByIdAndDelete(id);
  },
};

module.exports = contactService;
