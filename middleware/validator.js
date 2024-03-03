import User from "../model/user.js";
import HttpError from "../model/http-error.js";

const validateData = (req, res, next) => {
  if ("username" in req.body) {
    const username = req.body.username;

    if (!/^(?=(?:.*[a-z]){3})[\w\d\S]{5,15}$/i.test(username)) {
      const error = new HttpError(
        `Must have at least 5 characters and 3 non-capital letters. ${
          username ? `${username} is not a valid username.` : ""
        }`,
        409
      );
      return next(error);
    }
  }

  if ("email" in req.body) {
    const email = req.body.email;

    if (!/^(\w+)@(\w+)\.([a-z]{2,8})([\.a-z]{2,8})?$/.test(email)) {
      const error = new HttpError(
        `Example: bear@example.com. ${
          email ? `${email} is not a valid email.` : ""
        }`,
        409
      );
      return next(error);
    }
  }

  if ("password" in req.body) {
    const password = req.body.password;

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{9,40}$/.test(password)) {
      const error = new HttpError(
        "Must have at least one symbol, one capital letter, one non-capital letter and one digit.",
        409
      );
      return next(error);
    }
  }

  next();
};

const verifyPasswordEquality = (req, res, next) => {
  if (req.body.password !== req.body.confirmedPassword) {
    const error = new HttpError("Passwords don't match. Please, verify.", 409);
    return next(error);
  }

  next();
};

const verifyDuplicity = async (req, res, next) => {
  if ("username" in req.body) {
    try {
      const userExists = await User.findOne({
        username: req.body.username,
      });

      if (userExists) {
        const error = new HttpError(
          "This username is already taken. Please try another one.",
          409
        );
        return next(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  if ("email" in req.body) {
    try {
      const emailExists = await User.findOne({
        email: req.body.email,
      });

      if (emailExists) {
        const error = new HttpError(
          "A user with this email already exists. Please try another one.",
          409
        );
        return next(error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  next();
};

const verifyUserByEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new HttpError(
        "User doesn't exist. Please verify data.",
        404
      );
      return next(error);
    }
  } catch (error) {
    console.log(error);
  }

  next();
};

export {
  validateData,
  verifyPasswordEquality,
  verifyDuplicity,
  verifyUserByEmail,
};
