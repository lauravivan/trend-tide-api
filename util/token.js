import jwt from "jsonwebtoken";

const getToken = (data) => {
  const token = jwt.sign(data, "supersecret_dont_share", {
    expiresIn: "1h",
  });

  return token;
};

export default getToken;
