/**
 * an email must contain @ and a least one .
 * @returns {RegExp} - the regex for an email
 */
const getEmailRegex = () => {
  return /^(\w+)@(\w+)\.([a-z]{2,8})([\.a-z]{2,8})?$/;
};

/**
 * a password must contain between 9 and 40 characteres having at least one symbol, one capital letter, one digit and one non-capital letter
 * @returns {RegExp} - the regex for a password
 */
const getPasswordRegex = () => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{9,40}$/;
};

/**
 * an user name can contain symbols, digits and letters, having between 5 and 15 characters, with at least 3 non-capital letters
 * @returns {RegExp} - the regex for an user name
 */
const getUserNameRegex = () => {
  return /^(?=(?:.*[a-z]){3})[\w\d\S]{5,15}$/i;
};

export { getEmailRegex, getPasswordRegex, getUserNameRegex };
