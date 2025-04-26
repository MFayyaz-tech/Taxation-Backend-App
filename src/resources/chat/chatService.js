const chatModel = require("./chatModel");
const chatServices = {
  getChat: async (sender, receiver, room) => {
    let isNew = false;
    const result = await chatModel.findOne({ room }).lean();
    if (result) {
      return { chat: result, isNew };
    } else {
      await chatModel.create({ room, sender, receiver });
      isNew = true;
      const result = await chatModel.findOne({ room }).lean();
      return { chat: result, isNew };
    }
  },
  chatCount: async () => {
    return await chatModel.countDocuments();
  },

  newMessage: async (room, message, sender, receiver) => {
    const data = new chatModel({ room, sender, receiver, message });
    const result = await data.save();
    if (result) {
      return await chatModel
        .findOne({ room })
        .populate({ path: "sender", select: "name" })
        .populate({ path: "receiver", select: "name" })
        .lean();
    }
    return false;
  },

  acceptRequest: async (_id, user2) => {
    const result = await chatModel.findOneAndUpdate(
      { _id, user2 },
      { status: "accepted" },
      { new: true }
    );
    return result;
  },

  rejectRequest: async (_id, user2) => {
    const result = await chatModel.findOneAndDelete({ _id, user2 });
    return result;
  },
  roomChats: async (room) => {
    const result = await chatModel
      .find({ room })
      .populate({ path: "sender", select: "name" })
      .populate({ path: "receiver", select: "name" })
      .lean();
    return result;
  },

  userChats: async (userId) => {
    const result = await chatModel
      .find({ $or: [{ sender: userId }, { receiver: userId }] })
      .populate({ path: "sender", select: "name" })
      .populate({ path: "receiver", select: "name" })
      .lean();
    return result;
  },
  getChats: async () => {
    const chatList = await chatModel.aggregate([
      {
        $sort: { updatedAt: -1 }, // Sort messages by latest first
      },
      {
        $group: {
          _id: "$room",
          message: { $first: "$message" },
          updatedAt: { $first: "$updatedAt" },
          sender: { $first: "$sender" },
          receiver: { $first: "$receiver" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverDetails",
        },
      },
      {
        $unwind: { path: "$senderDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$receiverDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          room: "$_id",
          message: 1,
          updatedAt: 1,
          sender: {
            _id: "$senderDetails._id",
            name: "$senderDetails.name",
            email: "$senderDetails.email",
            country: "$senderDetails.country",
          },
          receiver: {
            _id: "$receiverDetails._id",
            name: "$receiverDetails.name",
            email: "$receiverDetails.email",
            country: "$receiverDetails.country",
          },
        },
      },
      {
        $sort: { updatedAt: -1 }, // Sort by latest updated rooms first
      },
    ]);

    return chatList;
  },
};
module.exports = chatServices;
