import express from "express";
import { signup, signin, recoverPass } from "../controllers/user.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.patch("/recover-pass", recoverPass);

export default userRouter;
