import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { hash, compare } = bcrypt;

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  gender: String,
  password: {
    type: String,
    required: true,
  },
  createdOn: {
    type: String,
    default: new Date(),
  },
});

// hash password
userSchema.pre("save", async function (next) {
  this.password = await hash(this.password, 10);
  next();
});

// static function to login
userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username });

  if (user) {
    const auth = await compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect username");
};

const User = mongoose.model("user", userSchema);

export default User;
