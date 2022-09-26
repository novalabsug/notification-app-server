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

export const generateUniqueId = () => {
  let ID = Math.floor(Math.random() * (1000000 - 10000));

  return ID;
};
