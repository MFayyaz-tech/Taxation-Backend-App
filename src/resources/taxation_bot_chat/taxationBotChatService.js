const { default: axios } = require("axios");
const chatModel = require("./taxationBotChatModel");
const taxationBotChatService = {
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
  processPrompt: async (prompt, country) => {
    let language = "English";
    // let country = "Pakistan";
    let promptSetting = `Answer the following taxation-related question in ${language} for ${country}: ${prompt}.Ensure the response is in ${language} and includes relevant tax laws, regulations, and examples specific to ${country}.`;

    promptSetting = promptSetting.toLowerCase();
    console.log("promptSetting", promptSetting);

    // Prepare the options for the RapidAPI request
    const options = {
      method: "GET",
      url: "https://google-search72.p.rapidapi.com/search",
      params: {
        q: promptSetting,
        lr: "en-US",
        num: "3",
      },
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "google-search72.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    };

    // Perform the API request to get the search result
    const response = await axios.request(options);
    console.log("response", response);

    // You can customize what data you want from the API response
    let apiData = response.data; // This is the data you get back from the Google search API
    if (apiData?.status === "success") {
      const response = apiData.items.map((item) => item.snippet).join("");

      // Collect all links into a separate string for `reference`
      const reference = apiData.items.map((item) => item.link).join(", ");
      // Prepare message payload for the chat
      const msgPayload = {
        request: prompt,
        response: response, // Use API data in the message
        refrence: reference,
      };
      return msgPayload;
    } else {
      return false;
    }
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
      .populate({ path: "user1", select: "firstName lastName" })
      .populate({ path: "user2", select: "firstName lastName" })
      .lean();
    return result;
  },
};
module.exports = taxationBotChatService;
