import User from "../models/User.js";

const handleErrors = (err) => {
  let errors = {
    username: "",
    password: "",
    verificationError: "",
  };

  if (err.message === "Incorrect username") {
    errors.username = "User not found";
  }

  if (err.message === "Incorrect password") {
    errors.password = "Password is incorrect";
  }

  if (err.code === 11000) {
    errors.username = "Username already exists";
    return errors;
  }

  // handling user errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

export const createUserPost = async (req, res) => {
  try {
    const users = await User.find();

    const userReq = req.body;

    let hasAccount = false;
    let userFound = "";

    // check if user has an account ID created
    users.forEach(async (user) => {
      if (userReq.username !== user.username) {
        hasAccount = false;
      } else {
        hasAccount = true;
        userFound = user;
        return;
      }
    });

    if (!hasAccount) {
      res.status(200).json({ error: "Account not found" });
    } else {
      const updatedUser = await User.findByIdAndUpdate(userFound._id, userReq, {
        new: true,
      });

      res.status(200).json({ user: updatedUser });
    }
  } catch (error) {
    console.log(error);
  }
};

export const signinUserPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.login(username, password);

    res.status(200).json({ user });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};
