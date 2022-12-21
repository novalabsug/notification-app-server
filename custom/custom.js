import bcrypt from "bcryptjs";

const { hash, compare } = bcrypt;

export async function generateApiKey(companyName) {
  const strChar =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789qwertyuioplkjhgfdsazxcvbnm";

  const arrChar = strChar.split("");
  const intArr = [];
  let strApiKey = "";

  for (let i = 0; i < 30; i++) {
    let index = Math.floor(Math.random() * strChar.length);

    intArr.push(arrChar[index]);
  }

  let charInt = [];

  companyName.split("").forEach((char) => {
    charInt.push(char.toString().charCodeAt());
  });

  let intCompanyName = charInt.reduce(function (a, b) {
    return parseInt(a) + parseInt(b);
  });

  return intCompanyName.toString() + "-" + (strApiKey = intArr.join(""));
}

export const fetchUnreadCompanies = async (data, Company, User, Mail) => {
  const response = [];
  try {
    let UserCompanies = [];
    let UnreadMailsCompanies = [];
    let count = 0;

    const user = await User.findOne({ _id: data.id });

    const UserCompanyIds = user.companies;

    for (let i = 0; i < UserCompanyIds.length; i++) {
      let company = await Company.findOne({ _id: UserCompanyIds[i] });
      UserCompanies.push(company.companyUsername);
    }

    let MailsArr = await Mail.find();

    for (let i = 0; i < MailsArr.length; i++) {
      for (let y = 0; y < UserCompanies.length; y++) {
        if (
          MailsArr[i].to == data.username &&
          MailsArr[i].from == UserCompanies[y]
        ) {
          if (MailsArr[i].status == "unread") {
            UnreadMailsCompanies.push(UserCompanies[y]);
          }
        }
      }
    }

    UserCompanies.forEach((company) => {
      let count = 0;
      UnreadMailsCompanies.forEach((UnreadMailsCompany) => {
        if (company == UnreadMailsCompany) {
          count += 1;
        }
      });
      response.push({ company, count });
    });
  } catch (err) {
    console.log(err);
  }
  return response;
};

export const generateUniqueId = () => {
  let ID = Math.floor(Math.random() * (1000000 - 10000));

  return ID;
};
