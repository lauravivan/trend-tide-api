import User from "../model/user.js";
import bcrypt from "bcryptjs";
import HttpError from "../model/http-error.js";
import getToken from "../util/token.js";
import fs from "fs";
import path from "path";
import Post from "../model/post.js";
import imageKit from "../util/image-kit.js";
import {
  deleteFile,
  deleteFileFromImageKit,
  uploadImageToImageKit,
} from "../util/file.js";

const fsPromises = fs.promises;

const signup = async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 12),
    });

    const reqRes = await user.save();

    if (reqRes._id) {
      return res.status(201).json({
        message: "Account created sucessfully!",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isValidPassword) {
      const error = new HttpError(
        "That's not your password. Please verify data.",
        409
      );
      return next(error);
    }

    const token = getToken({ uid: user._id });

    if (user && isValidPassword) {
      return res.status(201).json({
        message: "Nice! Logging in...",
        token: token,
        uid: user._id,
      });
    } else {
      const error = new HttpError(
        `Something went wrong, it wasn't possible for signin in`,
        409
      );
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};

const recoverPass = async (req, res, next) => {
  try {
    const hashedPass = await bcrypt.hash(req.body.password, 12);

    const updateResult = await User.findOneAndUpdate(
      { email: req.body.email },
      {
        password: hashedPass,
      }
    );

    if (updateResult) {
      return res.status(201).json({
        message: "Password update sucessfully!",
      });
    } else {
      const error = new HttpError(
        "It wasn't possible to update the password. Verify if your email is correct.",
        409
      );
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};

const addFavoritePost = async (req, res, next) => {
  const uid = req.params.uid;
  const pid = req.params.pid;

  try {
    const user = await User.findByIdAndUpdate(uid, {
      $addToSet: {
        favoritePosts: pid,
      },
    });

    await Post.findByIdAndUpdate(pid, {
      $addToSet: {
        usersWhoLiked: uid,
      },
    });

    return res.status(201).json({
      uid: user._id,
      favoritePosts: user.favoritePosts,
    });
  } catch (error) {
    return next(error);
  }
};

const removeFavoritePost = async (req, res, next) => {
  const uid = req.params.uid;
  const pid = req.params.pid;

  try {
    const user = await User.findByIdAndUpdate(uid, {
      $pull: {
        favoritePosts: pid,
      },
    });

    await Post.findByIdAndUpdate(pid, {
      $pull: {
        usersWhoLiked: uid,
      },
    });

    return res.status(201).json({
      uid: user._id,
      favoritePosts: user.favoritePosts,
    });
  } catch (error) {
    return next(error);
  }
};

const getFavoritePosts = async (req, res, next) => {
  const uid = req.params.uid;

  try {
    const user = await User.findById(uid).populate({
      path: "favoritePosts",
      populate: { path: "author" },
    });

    if (user.favoritePosts.length > 0) {
      return res.status(201).json(user.favoritePosts);
    } else {
      return res.status(404).json({
        message:
          "You have no favorite posts yet. To favorite a post click on the heart icon on the post you wish to favorite.",
      });
    }
  } catch (error) {
    return next(error);
  }
};

const updateAccount = async (req, res, next) => {
  const dataReceived = {};
  const uid = req.params.uid;

  if ("username" in req.body) {
    dataReceived["username"] = req.body.username;
  }

  if ("email" in req.body) {
    dataReceived["email"] = req.body.email;
  }

  if ("password" in req.body) {
    dataReceived["password"] = await bcrypt.hash(req.body.password, 12);
  }

  if (req.file) {
    try {
      const user = await User.findById(uid);

      if (user.profileImage) {
        deleteFileFromImageKit(
          user.profileImage.name,
          user.profileImage.fileId
        );
      }

      const uploadRes = await uploadImageToImageKit(
        req.file,
        "/trend-tide/profile-image/"
      );

      if (uploadRes) {
        await deleteFile(req.file);
        dataReceived["profileImage"] = uploadRes;
      }
    } catch (error) {
      console.log(error);
    }
  }

  try {
    const userUpdated = await User.findOneAndUpdate({ _id: uid }, dataReceived);

    if (userUpdated._id) {
      return res.status(201).json({
        message: "User sucessfully updated!",
      });
    } else {
      const error = new HttpError("Failed to update user", 409);
      return next(error);
    }
  } catch (error) {
    console.log(error);
  }
};

const deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.uid);

    const deleteRes = await imageKit.deleteFile(user.profileImage.fileId);
    console.log(deleteRes);

    const updatedProfile = await User.findByIdAndUpdate(req.params.uid, {
      $unset: {
        profileImage: "",
      },
    });

    if (updatedProfile) {
      return res.status(201).json({
        message: "Profile image successfully removed.",
      });
    }
  } catch {
    const error = new HttpError(
      "An error ocurred and the image couldn't be deleted"
    );
    return next(error);
  }
};

const getAccountInfo = async (req, res, next) => {
  const uid = req.params.uid;

  try {
    const user = await User.findById(
      uid,
      "username email profileImage password"
    );

    if (user) {
      return res.status(201).json(user);
    } else {
      return res.status(404).json({ message: "No user found" });
    }
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const deletedAccount = await User.findByIdAndDelete(req.params.uid);

    if (deletedAccount) {
      res.status(201).json({
        message: "Account deleted successfully",
      });
    }
  } catch {
    const error = new HttpError(
      "An error ocurred. Account couldn't be deleted."
    );
    return next(error);
  }
};

export {
  signin,
  signup,
  recoverPass,
  addFavoritePost,
  removeFavoritePost,
  updateAccount,
  deleteProfileImage,
  getAccountInfo,
  deleteAccount,
  getFavoritePosts,
};
