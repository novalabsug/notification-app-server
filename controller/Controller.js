import User from "../models/User.js";
import {
  fetchUnreadCompanies,
  generateApiKey,
  generateUniqueId,
} from "../custom/custom.js";
import Company from "../models/Company.js";
import ApiKeys from "../models/Api.js";

import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";
import TempAccount from "../models/TempAccount.js";
import Mail from "../models/Mail.js";
import Chat from "../models/Chat.js";

const { hash, compare } = bcrypt;

const handleErrors = (err) => {
  let errors = {
    username: "",
    password: "",
    verificationError: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyUsername: "",
    country: "",
    clientName: "",
    clientPosition: "",
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

  // handling company errors
  if (err.message.includes("company validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create tokens
const maxAge = 2 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, "rallen contractor web app token", {
    expiresIn: maxAge,
  });
};

export const registerUserPost = async (req, res) => {
  try {
    const tempAccounts = await TempAccount.find();

    const userReq = req.body;

    let hasAccount = false;
    let userFound = "";

    // check if user has an account ID created
    tempAccounts.forEach(async (tempAccount) => {
      if (userReq.accountID !== tempAccount.tempAccountId) {
        hasAccount = false;
      } else {
        if (tempAccount.validity) {
          hasAccount = true;
          userFound = tempAccount;
          return;
        }
        hasAccount = false;
      }
    });

    if (!hasAccount) {
      res.status(200).json({ error: "Invalid Account ID" });
    } else {
      const newUser = new User({
        username: "@" + userReq.username,
        companies: [userFound.company],
        password: await userReq.password,
      });
      newUser.save();

      await TempAccount.findOneAndUpdate(
        { _id: userFound._id },
        { validity: false }
      );

      if (newUser) {
        const user = newUser;
        const token = createToken(user._id);
        res.status(200).json({
          result: {
            id: user._id,
            username: user.username,
          },
          token,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export const signinUserPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.login(username, password);

    if (user) {
      const token = createToken(user._id);

      res.cookie("notification_app_JWT_secret", token, {
        maxAge: maxAge * 1000,
        secure: true,
      });

      res.status(200).json({
        result: { id: user._id, username: user.username },
        token,
      });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const createCompanyPost = async (req, res) => {
  try {
    const { name, country, phone, address, position, clientName, password } =
      req.body;

    // check if company name exists
    let companyExists = false;
    const Companies = await Company.find();

    Companies.forEach((company) => {
      if (company.companyName == name) {
        return (companyExists = true);
      }
    });

    if (companyExists)
      return res.status(200).json({ error: "Company name alreasy exists" });

    // generate username for company
    let usernameArr = [];
    name
      .toString()
      .split("")
      .forEach((char) => {
        if (char == " ") return usernameArr.push("-");

        usernameArr.push(char.toLowerCase());
      });

    let username = usernameArr.join("");

    // create new user
    const company = await Company.create({
      companyName: name,
      companyUsername: "@" + username,
      companyPhone: phone,
      companyAddress: address,
      country,
      clientName,
      clientPosition: position,
      password: await hash(password, 10),
    });

    // generate api key and store the key
    let apiKey = await generateApiKey(name);

    const newApiKey = new ApiKeys({ apiKey, company: company._id });
    await newApiKey.save();

    res.json({ company, apiKey });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

// create new user
export const createUserPost = async (req, res) => {
  try {
    let company = "";
    (await Company.find()).forEach((el) => {
      if (el.companyUsername == req.query.username) {
        company = el;
      }
    });
    // generate unique ID and check if ID doesnot exist already
    let data = await checkIdUniqueness(await TempAccount.find());

    if (!data.isUnique) return checkIdUniqueness(await TempAccount.find());

    // create tempAccount for user
    let newTempAccount = new TempAccount({
      tempAccountId: data.ID,
      company: company._id,
      validity: true,
    });

    newTempAccount.save();

    res.status(200).json({ response: newTempAccount });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const fetchCompanyPost = async (req, res) => {
  try {
    const data = req.body;

    let Companies = [];

    const CompanyUnread = await fetchUnreadCompanies(data, Company, User, Mail);

    // console.log(CompanyUnread);

    const user = await User.findOne({ _id: data.id });

    for (let i = 0; i < user.companies.length; i++) {
      let result = await Company.findOne({ _id: user.companies[i] });
      Companies = [...Companies, result];
    }

    res.status(200).json({ Companies, CompanyUnread });
  } catch (err) {
    console.log(err);
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const fetchCompanyMessagesPost = async (req, res) => {
  try {
    const { user, company } = req.body;

    let Mails = [];

    let MailsArr = await Mail.find();

    // standard for loop backwards
    for (let i = MailsArr.length - 1; i >= 0; i--) {
      if (MailsArr[i].to == user && MailsArr[i].from == company) {
        Mails.push(MailsArr[i]);
      }
    }

    if (Mails.length == 0) {
      Mails = [{ emptyMail: "Mailbox is empty" }];
    }

    let Chats = await Chat.find({ userId: user }, { companyId: company });

    if (Chats.length == 0) {
      Chats = [{ emptyChat: "Chat is empty" }];
    }

    res.status(200).json({ Mails, Chats });
  } catch (err) {
    console.log(err);
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const addCompany = async (req, res) => {
  try {
    const { userTempId, userId } = req.body;

    let isExist = false;

    let ID = "";

    const tempAccounts = await TempAccount.find();

    tempAccounts.forEach(async (account) => {
      if (account.tempAccountId == userTempId) {
        if (account.validity) {
          await TempAccount.findOneAndUpdate(
            { _id: account._id },
            { validity: false }
          );
          return (ID = account.company);
        }
      }
    });

    if (ID == "")
      return res.status(200).json({ addCompanyError: "Account ID is invalid" });

    const user = await User.findOne({ _id: userId });

    user.companies.forEach((company) => {
      if (company == ID) {
        isExist = true;
      }
    });

    if (!isExist) {
      user.companies.push(ID);
      await User.findByIdAndUpdate(userId, user, { new: true });

      res.status(200).json({ addCompany: "success" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const mailDeliveryPost = async (req, res) => {
  try {
    const { to, from, title, message, apiKey } = req.body;

    //  verify whether company is valid
    const companyVar1 = await Company.findOne({ companyUsername: from });

    if (companyVar1 === null) return res.status(400).send("Company not found");

    // verify whether company api is valid
    let apiKeyIsValid = false;
    const apiKeysObj = await ApiKeys.findOne({ company: companyVar1._id });

    if (!apiKeysObj._id) return res.status(400).send("Api Keys not found");
    apiKeysObj.apiKey.forEach((api) => {
      if (api === apiKey) {
        return (apiKeyIsValid = true);
      }
    });

    if (!apiKeyIsValid) return res.status(400).send("Api Key is invalid");

    // verify whether username exists
    const user = await User.findOne({ username: to });

    if (user === null) return res.status(400).send("Username not found");

    // insert message
    const mail = await Mail.create({
      to,
      from,
      title,
      message,
    });

    if (mail) {
      res.status(200).json({ msg: "Operation successful" });
    }
  } catch (error) {
    res.status(400).json({ error });
    console.log(error);
  }
};

export const readMailPost = async (req, res) => {
  try {
    const { ID } = req.body;

    const mail = await Mail.findOneAndUpdate({ _id: ID }, { status: "read" });

    res.status(200).json({ response: "SUCCESS" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ response: "Unexpected error occured" });
  }
};

// function to check uniqueness of ID
async function checkIdUniqueness(tempAccounts) {
  let isUnique = true;
  let ID = await generateUniqueId();

  tempAccounts.forEach((account) => {
    if (account.tempAccountId == ID) {
      isUnique = false;
    }
  });

  return { isUnique, ID };
}

// function to change validity of TempAccounts
// every temp account that is 1 Day old shall be deleted
