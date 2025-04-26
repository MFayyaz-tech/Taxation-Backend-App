const { resetPassword } = require("../auth/authController");
const userModel = require("./userModel");
const bcrypt = require("bcrypt");
const userService = {
  create: async (body) => {
    const salt = await bcrypt.genSalt(10);
    body.password = await bcrypt.hash(body.password, salt);
    const object = new userModel(body);
    return await object.save();
  },
  validatePassword: async (password, realPassword) => {
    const valid = await bcrypt.compare(password, realPassword);
    return valid;
  },

  update: async (_id, body) => {
    return await userModel.findOneAndUpdate({ _id }, body, { new: true });
  },
  updateFcm: async (email, fcmToken, country, device_id) => {
    return await userModel
      .findOneAndUpdate(
        { email },
        { fcmToken, country, is_login: true, device_id },
        { new: true }
      )
      .lean();
  },
  getCount: async () => {
    return await userModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);
  },
  getUserStatusByMonth: async (year) => {
    // const result = await userModel.aggregate([
    //   // Match users with role 'user' and the required year
    //   {
    //     $match: {
    //       role: "user",
    //       status: { $in: ["active", "blocked"] },
    //       // You can add more filters if needed, such as country or other fields
    //     },
    //   },
    //   // Add a field that extracts the year and month from the createdAt timestamp
    //   {
    //     $addFields: {
    //       yearMonth: {
    //         $dateToString: {
    //           format: "%m", // Extracts the year and month as "YYYY-MM"
    //           date: "$updatedAt",
    //         },
    //       },
    //     },
    //   },
    //   // Group by the 'yearMonth' field, and count active and blocked users
    //   {
    //     $group: {
    //       _id: "$yearMonth",
    //       activeCount: {
    //         $sum: {
    //           $cond: [{ $eq: ["$status", "active"] }, 1, 0],
    //         },
    //       },
    //       blockedCount: {
    //         $sum: {
    //           $cond: [{ $eq: ["$status", "blocked"] }, 1, 0],
    //         },
    //       },
    //     },
    //   },
    //   // Sort by yearMonth in descending order (latest month first)
    //   {
    //     $sort: { _id: -1 },
    //   },
    // ]);

    const monthsOfYear = Array.from(
      { length: 12 },
      (_, i) => `${year}-${(i + 1).toString().padStart(2, "0")}`
    );

    // Perform the aggregation to count active and blocked users by month
    const result = await userModel.aggregate([
      // Match users with role 'user' and status 'active' or 'blocked'
      {
        $match: {
          role: "user",
          status: { $in: ["active", "blocked"] },
        },
      },
      // Add a field that extracts the year and month from the createdAt timestamp
      {
        $addFields: {
          yearMonth: {
            $dateToString: {
              format: "%Y-%m", // Extracts the year and month as "YYYY-MM"
              date: "$createdAt",
            },
          },
        },
      },
      // Group by yearMonth and count active and blocked users
      {
        $group: {
          _id: "$yearMonth",
          activeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
          blockedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "blocked"] }, 1, 0],
            },
          },
        },
      },
      // Sort by the yearMonth field in ascending order
      {
        $sort: { _id: 1 },
      },
    ]);

    // Map the result to ensure all months of the year are included, even with zero counts
    const filledResult = monthsOfYear.map((month) => {
      const monthData = result.find((item) => item._id === month);
      return {
        _id: month,
        activeCount: monthData ? monthData.activeCount : 0,
        blockedCount: monthData ? monthData.blockedCount : 0,
      };
    });
    return filledResult;
  },

  getAll: async (page = 1, limit = 10, search) => {
    let query = { role: "user" };

    const data = await userModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await userModel.countDocuments(query);
    return {
      total, // Total records
      totalPages: limit ? Math.ceil(total / limit) : 1, // Total pages
      currentPage: page ? parseInt(page) : null,
      data: data,
    };
  },

  requestOtp: async (email, otp, type) => {
    const otpExpiry = new Date(new Date().getTime() + 5 * 60 * 1000);
    return await userModel.findOneAndUpdate(
      { email },
      { otp: otp, otpExpiry: otpExpiry, otp_type: type },
      { new: true }
    );
  },
  get: async () => {
    return await userModel.find({}).sort({ createdAt: -1 });
  },

  otpExpiryValidation: async (email) => {
    const result = await userModel.findOne({
      email,
      otpExpiry: { $gte: new Date() }, // Make sure this matches your field name
    });
    return result;
  },
  isValidOtp: async (otp, email) => {
    const result = await userModel.findOneAndUpdate(
      { email: email, otp: otp },
      { otp: null, otp_type: null }
    );
    return result;
  },

  isExist: async (email) => {
    return await userModel.findOne({ email: email, deleted: false });
  },

  isExistAdmin: async () => {
    return await userModel.findOne({ role: "admin" });
  },

  resetPassword: async (_id, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return await userModel.findOneAndUpdate({ _id }, { password });
  },
  forgotPassword: async (email, password) => {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return await userModel.findOneAndUpdate({ email }, { password });
  },

  getOne: async (_id) => {
    return await userModel.findOne({ _id });
  },
  getByEmail: async (email) => {
    return await userModel.findOne({ email, deleted: false }).lean();
  },

  delete: async (_id) => {
    return await userModel.deleteOne({ _id });
  },
};

module.exports = userService;
