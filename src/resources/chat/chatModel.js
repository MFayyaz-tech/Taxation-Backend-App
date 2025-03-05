const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const setDefaultSort = function (next) {
  this.setOptions({
    sort: { updatedAt: -1 },
  });
  next();
};

const chatSchema = new Schema(
  {
    room: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z0-9]+$/.test(v); // example validation
        },
        message: (props) => `${props.value} is not a valid room name!`,
      },
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

chatSchema.pre(["find", "findOne"], setDefaultSort);

chatSchema.index({ room: 1, sender: 1, receiver: 1 });

const chatModel = mongoose.model("Chat", chatSchema);

module.exports = chatModel;
