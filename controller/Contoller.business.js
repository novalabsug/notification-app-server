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

  // if (err.message === "Incorrect username") {
  //   errors.username = "Company not found";
  // }

  if (err.code === 11000) {
    errors.username = "Username already exists";
    return errors;
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

export const signinPost = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username == "")
      return res.status(200).json({
        result: {
          error: { username: "username is required", password: "" },
          responseStatus: "Error",
        },
      });

    if (password == "")
      return res.status(200).json({
        result: {
          error: { username: "", password: "password is required" },
          responseStatus: "Error",
        },
      });

    const company = await Company.login(username, password);

    if (company) {
      const token = createToken(company._id);

      res.cookie("notification_app_JWT_secret", token, {
        maxAge: maxAge * 1000,
        secure: true,
      });

      res.status(200).json({
        result: {
          id: company._id,
          clientName: company.clientName,
          position: company.position,
          responseStatus: "success",
        },
        token,
      });
    }
  } catch (err) {
    console.log(err);
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const registerPost = async (req, res) => {
  try {
    const {
      companyName,
      country,
      phone,
      address,
      position,
      clientName,
      password,
    } = req.body;

    // check if company name exists
    let companyExists = false;
    const Companies = await Company.find();

    Companies.forEach((company) => {
      if (company.companyName == companyName) {
        return (companyExists = true);
      }
    });

    if (companyExists)
      return res.status(200).json({ error: "Company name already exists" });

    // generate username for company
    let usernameArr = [];
    companyName
      .toString()
      .split("")
      .forEach((char) => {
        if (char == " ") return usernameArr.push("-");

        usernameArr.push(char.toLowerCase());
      });

    let username = usernameArr.join("");

    // create new user
    const company = await Company.create({
      companyName: companyName.toLowerCase(),
      companyUsername: "@" + username,
      companyPhone: phone,
      companyAddress: address,
      country,
      clientName,
      clientPosition: position,
      password,
    });

    // generate api key and store the key
    let apiKey = await generateApiKey(companyName);

    const newApiKey = new ApiKeys({ apiKey, company: company._id });
    await newApiKey.save();

    res.json({ responseStatus: "success", apiKey });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const fetchProfilePost = async (req, res) => {
  try {
    const { id } = req.body;

    const companyData = await Company.findOne({ _id: id });

    const Profile = {
      name: "",
      username: "",
      phone: "",
      country: "",
    };

    if (companyData) {
      Profile.name = companyData.companyName;
      Profile.username = companyData.companyUsername;
      Profile.phone = companyData.companyPhone;
      Profile.country = companyData.country;
    }

    res.status(200).json({ Profile, status: "Success" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const fetchApiKeys = async (req, res) => {
  try {
    const { id } = req.body;

    const apikeyData = await ApiKeys.findOne({ company: id });

    if (apikeyData) {
      res.status(200).json({ Apikeys: apikeyData.apiKey, status: "Success" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};

export const createApikeyPost = async (req, res) => {
  try {
    const { id } = req.body;

    const ApikeysData = await ApiKeys.findOne({ company: id });

    const companyData = await Company.findOne({ _id: id });

    // generate api key and store the key
    let apiKey = await generateApiKey(companyData.companyName);

    // check if an apikey exists, create new one if no add new one if there is
    if (ApikeysData) {
      ApikeysData.apiKey.push(apiKey);

      const ApikeysUpdateData = await ApiKeys.updateOne(
        { _id: ApikeysData._id },
        { apiKey: ApikeysData.apiKey }
      );

      const apikeyData = await ApiKeys.findOne({ company: id });

      return res
        .status(200)
        .json({ Apikeys: apikeyData.apiKey, status: "Success" });
    }

    const newApiKey = new ApiKeys({
      apiKey,
      company: companyData._id,
    });
    await newApiKey.save();

    res.status(200).json({ Apikeys: newApiKey.apiKey, status: "Success" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(200).json({ error });
  }
};
