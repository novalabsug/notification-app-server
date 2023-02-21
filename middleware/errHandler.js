import { logEvent } from "./logger.js";

export const ErrorHandler = (err, req, res, next) => {
  logEvent(`${err.name}: ${err.message}`, "errLog.txt");
  res.status(500).send(err.message);
};
