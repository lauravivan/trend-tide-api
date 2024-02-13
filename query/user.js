import User from "../model/user.js";

const findUserByUserName = async (userName) => {
  const userNameExists = await User.findOne({
    userName: userName,
  });

  return userNameExists;
};

const findUserByEmail = async (email) => {
  const emailExists = await User.findOne({ email: email });

  return emailExists;
};

const updateUser = async (user, dataToUpdate) => {
  const updatedUser = await User.updateOne(user, dataToUpdate);

  return updatedUser;
};

export { findUserByEmail, findUserByUserName, updateUser };
