import bodyParser from "body-parser";
import express from "express";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import connectBD from "./connection/database.js";
import {
  errorHandlerMiddleware,
  headerMiddleware,
} from "./middleware/middleware.js";
// import auth from "./middleware/auth.js";

const app = express();
app.use(bodyParser.json());

app.use(headerMiddleware);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use(errorHandlerMiddleware);

connectBD()
  .then(app.listen(3000))
  .catch((err) => console.log(err));
