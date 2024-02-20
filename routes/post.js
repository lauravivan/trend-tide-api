import express from "express";
import { fileUploadMiddleware } from "../middleware/middleware.js";
import {
  newPost,
  deletePost,
  updatePost,
  getPosts,
  getPostsByUser,
  getPost,
  getFavoritePostsByUser,
} from "../controllers/post.js";

const postRouter = express.Router();

postRouter.post("/new-post", fileUploadMiddleware.single("image"), newPost);
postRouter.delete("/delete/:pid", deletePost);
postRouter.patch(
  "/update/:pid",
  fileUploadMiddleware.single("image"),
  updatePost
);
postRouter.get("/posts", getPosts);
postRouter.get("/posts/:uid", getPostsByUser);
postRouter.get("/:pid", getPost);
postRouter.get("/favorite-posts/:uid", getFavoritePostsByUser);

export default postRouter;
