import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./router/Routes.js";
import apiRoutes from "./api/Routes.js";
import businessRoutes from "./router/Routes.business.js";
import { logger } from "./middleware/logger.js";
import { ErrorHandler } from "./middleware/errHandler.js";

const app = express();

const PORT = process.env.PORT || 3500;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(logger);

const whitelist = ["http://localhost:3000", "http://127.0.0.1:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Access denied"));
    }
  },
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header("Access-Control-Allow-Headers", true);
//   // res.header('Access-Control-Allow-Credentials', 'Content-Type');
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   next();
// });

app.use("/", routes);
app.use("/api", apiRoutes);
app.use("/business", businessRoutes);

app.use(ErrorHandler);

const CONNECTION_URL = "mongodb://127.0.0.1:27017/notification-app";

const ATLAS_URL =
  "mongodb+srv://admin:ppTUUoOgJAhRAePA@cluster0.g9ahihb.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) =>
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
  )
  .catch((err) => console.log(err.message));
