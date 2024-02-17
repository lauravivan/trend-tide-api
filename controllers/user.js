import User from "../model/user.js";
import bcrypt from "bcryptjs";
import HttpError from "../model/http-error.js";
import getToken from "../util/token.js";
import fs from "fs";
import path from "path";
import Post from "../model/post.js";

const signup = async (req, res, next) => {
  let dataReceived;
  if (
    "email" in req.body &&
    "password" in req.body &&
    "username" in req.body &&
    "passwordConfirmed" in req.body
  ) {
    dataReceived = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
      passConfirmed: req.body.passwordConfirmed,
    };

    if (dataReceived.password !== dataReceived.passConfirmed) {
      const error = new HttpError(
        "Passwords don't match. Please, verify.",
        409
      );
      return next(error);
    }

    try {
      const user = new User({
        username: dataReceived.username,
        email: dataReceived.email,
        password: dataReceived.password,
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
  } else {
    const error = new HttpError(
      "Invalid request. Username, password, passwordConfirmed and email are required keys.",
      409
    );

    return next(error);
  }
};

const signin = async (req, res, next) => {
  let dataReceived;
  if ("email" in req.body && "password" in req.body) {
    dataReceived = {
      email: req.body.email,
      password: req.body.password,
    };

    try {
      const user = await User.findOne({ email: dataReceived.email });

      if (!user) {
        const error = new HttpError(
          "User doesn't exist. Please verify data.",
          404
        );
        return next(error);
      }

      const isValidPassword = await bcrypt.compare(
        dataReceived.password,
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
        return res.status(409).json({
          message: "Something went wrong.",
        });
      }
    } catch (error) {
      return next(error);
    }
  } else {
    const error = new HttpError(
      "Invalid request. Email and password keys required.",
      409
    );
    return next(error);
  }
};

const recoverPass = async (req, res, next) => {
  let dataReceived;
  if (
    "email" in req.body &&
    "password" in req.body &&
    "passwordConfirmed" in req.body
  ) {
    dataReceived = {
      email: req.body.email,
      password: req.body.password,
      passConfirmed: req.body.passwordConfirmed,
    };

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{9,40}$/.test(
        dataReceived.password
      )
    ) {
      const error = new HttpError("Invalid password. Please verify data", 409);
      return next(error);
    }

    if (dataReceived.password !== dataReceived.passConfirmed) {
      const error = new HttpError(
        "Passwords don't match. Please, verify.",
        409
      );
      return next(error);
    }

    try {
      const hashedPass = await bcrypt.hash(dataReceived.password, 12);

      const updateResult = await User.findOneAndUpdate(
        { email: dataReceived.email },
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
  } else {
    const error = new HttpError(
      "Invalid request. Email, password and passwordConfirmed are required keys.",
      409
    );
    return next(error);
  }
};

const getPosts = async (req, res, next) => {
  const uid = req.params.uid;

  try {
    const userPosts = await User.findById(uid, "_id posts").populate("posts");

    if (userPosts) {
      return res.status(201).json(userPosts);
    } else {
      return res.status(404).json();
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

const getFavoritePosts = async (req, res, next) => {
  const uid = req.params.uid;

  try {
    const favoritePosts = await User.findById(
      uid,
      "_id favoritePosts"
    ).populate("favoritePosts");

    if (favoritePosts) {
      return res.status(201).json(favoritePosts);
    } else {
      return res.status(401).json();
    }
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

const updateAccount = async (req, res, next) => {
  const dataReceived = {};

  if ("email" in req.body) {
    dataReceived["email"] = req.body.email;
  }

  if ("username" in req.body) {
    dataReceived["username"] = req.body.username;
  }

  if ("password" in req.body) {
    dataReceived["password"] = req.body.password;
  }

  if ("image" in req.body) {
    dataReceived["profileImage"] = req.body.image;
  }

  try {
    const userUpdated = await User.findOneAndUpdate(
      { _id: req.params.uid },
      dataReceived
    );

    if (userUpdated._id) {
      res.status(201).json({
        message: "User sucessfully updated!",
      });
    } else {
      res.status(409).json();
    }
  } catch (error) {
    return next(error.message);
  }
};

const deleteProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.uid);

    if (user) {
      fs.unlink(path.join("uploads", "images", user.profileImage), (error) =>
        console.log(error)
      );
    }

    const updatedProfile = await User.findByIdAndUpdate(req.body.uid, {
      profileImage: "",
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
      return res.status(404).json();
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
  getPosts,
  addFavoritePost,
  getFavoritePosts,
  removeFavoritePost,
  updateAccount,
  deleteProfileImage,
  getAccountInfo,
  deleteAccount,
};
