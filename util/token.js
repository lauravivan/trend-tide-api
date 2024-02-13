import jwt from "jsonwebtoken";

const getToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_KEY, {
    expiresIn: "1h",
  });

  return token;
};

export default getToken;
