import { format } from "date-fns";
import { v4 } from "uuid";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import fs from "fs";
import path from "path";

const newID = v4();
const fsPromises = fs.promises;

export const logEvent = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyy-MM-dd\t-\tHH:mm:ss")}`;
  const logData = `${dateTime}\t-\t${newID}\t-\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs")))
      await fsPromises.mkdir(path.join(__dirname, "logs"));

    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logData
    );
  } catch (error) {
    console.log(error);
  }
};

export const logger = (req, res, next) => {
  logEvent(
    `${req.method}\t-\t${req.headers.origin}\t-\t${req.url}`,
    "requestLogs.txt"
  );

  next();
};
