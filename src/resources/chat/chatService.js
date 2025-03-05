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

  newMessage: async (room, message, sender, receiver) => {
    const data = new chatModel({ room, sender, receiver, message });
    return await data.save();
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
      .populate({ path: "user1", select: "firstName lastName" })
      .populate({ path: "user2", select: "firstName lastName" })
      .lean();
    return result;
  },
};
module.exports = chatServices;
