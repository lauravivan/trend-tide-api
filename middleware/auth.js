import HttpError from "../model/http-error.js";
import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new Error("Authentication failed");
    }

    const decodedToken = jwt.verify(token, "supersecret_dont_share");
    req.userData = { userId: decodedToken.userId };
    next();
  } catch {
    const error = new HttpError("Authentication failed", 401);
    next(error);
  }
};

export default auth;
