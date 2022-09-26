import mongoose from "mongoose";

const tempAccountSchema = mongoose.Schema({
  tempAccountId: {
    type: String,
    required: true,
    unique: true,
  },
  company: {
    type: String,
    required: true,
  },
  validity: Boolean,
  createdOn: {
    type: String,
    default: new Date(),
  },
});

const TempAccount = mongoose.model("tempAccount", tempAccountSchema);

export default TempAccount;
