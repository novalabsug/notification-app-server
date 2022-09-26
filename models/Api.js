import mongoose from "mongoose";

const apiKeysSchema = mongoose.Schema({
  apiKey: {
    type: [String],
    required: true,
    unique: true,
  },
  company: {
    type: String,
    required: true,
  },
  createdOn: {
    type: String,
    default: new Date(),
  },
});

const ApiKeys = mongoose.model("apiKeys", apiKeysSchema);

export default ApiKeys;
