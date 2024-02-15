import express from "express";
import {
  signup,
  signin,
  recoverPass,
  getPosts,
  getFavoritePosts,
  updateAccount,
  deleteProfileImage,
  getAccountInfo,
  deleteAccount,
} from "../controllers/user.js";
import { fileUploadMiddleware } from "../middleware/middleware.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.patch("/recover-pass", recoverPass);
userRouter.get("/posts", getPosts);
userRouter.get("/favorite-posts/:uid", getFavoritePosts);
userRouter.patch(
  "/account-update/:uid",
  fileUploadMiddleware.single("image"),
  updateAccount
);
userRouter.delete("/delete-profile-pic/:uid", deleteProfileImage);
userRouter.get("/account-info/:uid", getAccountInfo);
userRouter.delete("/delete-account/:uid", deleteAccount);

export default userRouter;
