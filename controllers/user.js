import User from "../model/user.js";
import { verifyData } from "../util/validator.js";
import {
  findUserByEmail,
  findUserByUserName,
  updateUser,
} from "../query/user.js";
import bcrypt from "bcryptjs";
import HttpError from "../model/http-error.js";
import getToken from "../util/token.js";

const signup = async (req, res, next) => {
  const dataReceived = {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    passConfirmed: req.body.passwordConfirmed,
  };

  const resVerifyData = verifyData(dataReceived, "VALIDATE_SIGNUP");

  if (!resVerifyData.state) {
    const error = new HttpError(resVerifyData.message, 400);
    return next(error);
  }

  const userNameReturn = await findUserByUserName(dataReceived.username);
  const emailReturn = await findUserByEmail(dataReceived.email);

  if (userNameReturn) {
    const error = new HttpError(
      "This username is already taken. Please try another one.",
      409
    );
    return next(error);
  }

  if (emailReturn) {
    const error = new HttpError(
      "A user with this email already exists. Please try another one.",
      409
    );
    return next(error);
  }

  try {
    const hashedPass = await bcrypt.hash(dataReceived.password, 12);
    const user = new User({
      username: dataReceived.username,
      email: dataReceived.email,
      password: hashedPass,
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
  const dataReceived = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    const user = await findUserByEmail(dataReceived.email);

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
      const error = new HttpError("Invalid password. Please verify data.", 409);
      return next(error);
    }

    const token = getToken({ uid: user._id });

    if (user && isValidPassword) {
      return res.status(201).json({
        message: "Nice! Logging in...",
        token: token,
        uid: user._id,
      });
    }
  } catch (error) {
    return next(error);
  }
};

const recoverPass = async (req, res, next) => {
  const receivedData = {
    email: req.body.email,
    password: req.body.password,
    passConfirmed: req.body.passwordConfirmed,
  };

  const isDataValid = verifyData(receivedData, "VALIDATE_RECOVER");

  if (!isDataValid) {
    const error = new HttpError(isDataValid.message, 400);
    return next(error);
  }

  try {
    const user = await findUserByEmail(receivedData.email);

    if (!user) {
      const error = new HttpError("Invalid email. Please verify data.");
      return next(error);
    }

    const hashedPass = await bcrypt.hash(receivedData.password, 12);

    const updateSuccesfully = await updateUser(user, {
      password: hashedPass,
    });

    if (updateSuccesfully.modifiedCount > 0) {
      return res.status(201).json({
        message: "Password update sucessfully!",
      });
    } else {
      const error = new HttpError(
        "It wasn't possible to update the password",
        409
      );
      return next(error);
    }
  } catch (error) {
    return next(error);
  }
};

export { signin, signup, recoverPass };
