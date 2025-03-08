const chatServices = require("./chatService");
const { generateRoomId } = require("../../utils/generateRoomId");
const { socketListener } = require("../../utils/socketListener");
const userService = require("../user/userService");

module.exports = (socket, io) => {
  socket.on("test", async (data, callback) => {
    try {
      // socket.emit("test", JSON.stringify({ test: "test is called" }));
      socket.join("test");
      io.to("test").emit("test", { test: 56 });
      // socket.callback({ test: "56" });
    } catch (error) {
      socket.emit(socketListener.ERROR, JSON.stringify({ msg: error.message }));
    }
  });
  socket.on(socketListener.CHAT, async (data, callback) => {
    try {
      let { sender, receiver } = data;
      if (!receiver) {
        receiver = await userService.isExistAdmin();
        if (!receiver) {
          callback({ message: "Support team not available" });
          return;
        }
        receiver = receiver?._id.toString();
      }
      console.log("receiver", receiver);

      const room = generateRoomId(sender, receiver);
      // let { chat } = await chatServices.getChat(sender, receiver, room);
      if (room) {
        const chats = await chatServices.roomChats(room);
        socket.join(room);
        callback({
          success: true,
          message: "Chat",
        });
        io.to(room).emit(socketListener.PREVIOUSCHAT, JSON.stringify(chats));
      } else {
        socket.emit(
          socketListener.ERROR,
          JSON.stringify({ status: false, message: "Chat not created!" })
        );
      }
    } catch (error) {
      socket.emit(
        socketListener.ERROR,
        JSON.stringify({ status: false, message: error.message })
      );
    }
  });
  socket.on(socketListener.SENDMESSAGE, async (data, callback) => {
    try {
      let { sender, receiver, message } = data;
      if (!receiver) {
        receiver = await userService.isExistAdmin();
        if (!receiver) {
          callback({ message: "Support team not available" });
          return;
        }
        receiver = receiver?._id.toString();
      }
      console.log("receiver", receiver);
      const room = generateRoomId(sender, receiver);
      const newMessage = await chatServices.newMessage(
        room,
        message,
        sender,
        receiver
      );
      if (newMessage) {
        io.to(room).emit(socketListener.NEWMESSAGE, JSON.stringify(newMessage));
      } else {
        socket.emit(
          socketListener.ERROR,
          JSON.stringify({ status: false, message: "Try again!" })
        );
      }
    } catch (error) {
      socket.emit(
        socketListener.ERROR,
        JSON.stringify({ status: false, message: error.message })
      );
    }
  });

  socket.on(socketListener.LEAVEROOM, async (data, callback) => {
    try {
      let { sender, receiver } = data;
      if (!receiver) {
        receiver = await userService.isExistAdmin();
        if (!receiver) {
          callback({ message: "Support team not available" });
          return;
        }
        receiver = receiver?._id.toString();
      }
      const room = generateRoomId(sender, receiver);
      socket.leave(room);
    } catch (error) {
      socket.emit(
        socketListener.ERROR,
        JSON.stringify({ status: false, message: error.message })
      );
    }
  });
};
