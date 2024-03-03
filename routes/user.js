import express from "express";
import {
  signup,
  signin,
  recoverPass,
  addFavoritePost,
  updateAccount,
  deleteProfileImage,
  getAccountInfo,
  deleteAccount,
  removeFavoritePost,
  getFavoritePosts,
} from "../controllers/user.js";
import { fileUploadMiddleware } from "../middleware/middleware.js";
import {
  validateData,
  verifyDuplicity,
  verifyPasswordEquality,
  verifyUserByEmail,
} from "../middleware/validator.js";

const userRouter = express.Router();

userRouter.post(
  "/signup",
  validateData,
  verifyPasswordEquality,
  verifyDuplicity,
  signup
);
userRouter.post("/signin", validateData, verifyUserByEmail, signin);
userRouter.patch(
  "/recover-pass",
  validateData,
  verifyUserByEmail,
  verifyPasswordEquality,
  recoverPass
);
userRouter.patch("/add-favorite-post/:uid/:pid", addFavoritePost);
userRouter.patch("/remove-favorite-post/:uid/:pid", removeFavoritePost);
userRouter.get("/favorite-posts/:uid", getFavoritePosts);
userRouter.patch(
  "/account-update/:uid",
  fileUploadMiddleware.single("image"),
  validateData,
  verifyDuplicity,
  verifyPasswordEquality,
  updateAccount
);
userRouter.delete("/delete-profile-pic/:uid", deleteProfileImage);
userRouter.get("/account-info/:uid", getAccountInfo);
userRouter.delete("/delete-account/:uid", deleteAccount);

export default userRouter;
