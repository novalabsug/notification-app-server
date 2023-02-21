import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { hash, compare } = bcrypt;

const companySchema = mongoose.Schema({
  companyName: {
    type: String,
    required: [true, "Company name is required"],
  },
  companyUsername: {
    type: String,
    required: true,
    unique: true,
  },
  companyPhone: String,
  companyAddress: String,
  country: String,
  clientName: {
    type: String,
    required: [true, "Client name is required"],
  },
  clientPosition: {
    type: String,
    required: [true, "Position is required"],
  },
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
companySchema.pre("save", async function (next) {
  this.password = await hash(this.password, 10);
  next();
});

// static function to login
companySchema.statics.login = async function (username, password) {
  const company = await this.findOne({ companyUsername: username });

  if (company) {
    const auth = await compare(password, company.password);
    if (auth) {
      return company;
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect username");
};

const Company = mongoose.model("company", companySchema);

export default Company;
