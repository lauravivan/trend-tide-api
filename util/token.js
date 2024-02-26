import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const getToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_KEY, {
    expiresIn: "1h",
  });

  return token;
};

export default getToken;
