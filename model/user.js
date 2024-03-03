import mongoose from "mongoose";
import Post from "./post.js";
import { ObjectId } from "mongodb";

import HttpError from "../model/http-error.js";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: Object,
    default: "",
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  favoritePosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default mongoose.model("User", userSchema);
