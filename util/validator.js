import { getEmailRegex, getPasswordRegex, getUserNameRegex } from "./regex.js";

const verifyData = (
  data = { email: "", password: "", passConfirmed: "", username: "" },
  action
) => {
  //signup case
  if (validateData(data, action) && getUserNameRegex().test(data.username)) {
    return {
      state: true,
    };
  }

  /* recover pass case */
  if (validateData(data, action)) {
    return {
      state: true,
    };
  }

  return {
    state: false,
    message: "Invalid data, please verify.",
  };
};

const validateData = (data, action) => {
  const { email, password, passConfirmed } = data;

  switch (action) {
    case "VALIDATE_SIGNUP":
      return (
        getEmailRegex().test(email) &&
        getPasswordRegex().test(password) &&
        getPasswordRegex().test(passConfirmed) &&
        password === passConfirmed
      );
    case "VALIDATE_RECOVER":
      return (
        getPasswordRegex().test(password) &&
        getPasswordRegex().test(passConfirmed) &&
        password === passConfirmed
      );
    default:
      return false;
  }
};

export { verifyData };
