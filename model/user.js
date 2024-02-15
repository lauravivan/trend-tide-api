import mongoose from "mongoose";
import Post from "./post.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import HttpError from "../model/http-error.js";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return /^(?=(?:.*[a-z]){3})[\w\d\S]{5,15}$/i.test(v);
      },
      message: (props) => `${props.value} is not a valid username.`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => {
        return /^(\w+)@(\w+)\.([a-z]{2,8})([\.a-z]{2,8})?$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email.`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  posts: [
    {
      type: ObjectId,
      ref: "Post",
    },
  ],
  favoritePosts: [
    {
      type: ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.pre("save", async function (next) {
  const userExists = await this.constructor.findOne({
    username: this.username,
  });

  if (userExists) {
    const error = new HttpError(
      "This username is already taken. Please try another one.",
      409
    );
    return next(error);
  }

  const emailExists = await this.constructor.findOne({
    email: this.email,
  });

  if (emailExists) {
    const error = new HttpError(
      "A user with this email already exists. Please try another one.",
      409
    );
    return next(error);
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{9,40}$/.test(this.password)) {
    const error = new HttpError(
      "This password is not valid. Please, try another one.",
      409
    );
    return next(error);
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
});

export default mongoose.model("User", userSchema);
