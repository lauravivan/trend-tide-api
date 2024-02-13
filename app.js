// require("module-alias/register");
import bodyParser from "body-parser";
import express from "express";
import userRouter from "./routes/user.js";
import connectBD from "./connection/database.js";
import auth from "./middleware/auth.js";

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/user", userRouter);

// app.use(auth);

//error handling middleware
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "Something went wrong!" });
});

connectBD()
  .then(app.listen(3000))
  .catch((err) => console.log(err));
