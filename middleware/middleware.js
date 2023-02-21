import ApiKeys from "../models/Api.js";
import Company from "../models/Company.js";
import jwt from "jsonwebtoken";

export const verifyApiKey = async (req, res, next) => {
  try {
    const arrApiKeys = await ApiKeys.find();
    const arrCompanies = await Company.find();

    let error = "";
    let success = false;

    const queryApiKey = req.query.apiKey;
    const queryCompanyUsername = req.query.username;

    let company = "";
    let companyApi = "";

    // check if company exists
    arrCompanies.forEach((el) => {
      if (el.companyUsername == queryCompanyUsername) {
        return (company = el);
      }

      error = "Company not found";
    });

    // check company has api keys
    if (company !== "") {
      arrApiKeys.forEach((apiKey) => {
        if (apiKey.company == company._id) return (companyApi = apiKey);

        error = "API KEY not found";
      });
    }

    // check if api key belong to company
    if (companyApi !== "") {
      companyApi.apiKey.forEach((el) => {
        if (el == queryApiKey) return (success = true);

        error = "API KEY not valid";
      });
    }

    if (success) return next();

    res.status(200).json({ error });
  } catch (error) {
    console.log(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const { id, token } = req.body;

    const decoded = jwt.verify(token, "rallen contractor web app token");

    if (decoded.id.toString() !== id.toString())
      return res.status(500).json({ error: "Authentication failed" });

    next();
  } catch (error) {
    return res.status(500).json({ error });
  }
};
