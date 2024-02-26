import HttpError from "../model/http-error.js";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: { type: Object, default: "" },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  editDate: {
    type: Date,
    default: Date.now,
  },
  usersWhoLiked: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export default mongoose.model("Post", postSchema);
