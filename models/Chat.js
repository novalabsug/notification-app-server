import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdOn: {
    type: String,
    default: new Date(),
  },
});

const Chat = mongoose.model("chat", chatSchema);

export default Chat;
