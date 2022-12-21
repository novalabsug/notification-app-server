import mongoose from "mongoose";

const mailSchema = mongoose.Schema({
  to: {
    type: String,
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  title: String,
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "unread",
  },
  createdOn: {
    type: String,
    default: new Date(),
  },
});

const Mail = mongoose.model("mail", mailSchema);

export default Mail;
