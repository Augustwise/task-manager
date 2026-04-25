const authConfig = require("../../shared/auth.json");

const emailRegex = new RegExp(authConfig.emailPattern);
const passwordSpecialCharacterRegex = new RegExp(
  authConfig.passwordSpecialCharacterPattern,
);

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email) {
  return emailRegex.test(email);
}

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= authConfig.passwordMinLength &&
    passwordSpecialCharacterRegex.test(password)
  );
}

function getCredentialsFromRequest(req) {
  return {
    email: normalizeEmail(req.body?.email),
    password: typeof req.body?.password === "string" ? req.body.password : "",
  };
}

function hasValidCredentials(email, password) {
  return Boolean(email && password) && isValidEmail(email) && isValidPassword(password);
}

function hasValidLoginCredentials(email, password) {
  return Boolean(email && password) && isValidEmail(email);
}

module.exports = {
  AUTH_MESSAGES: authConfig.messages,
  getCredentialsFromRequest,
  hasValidCredentials,
  hasValidLoginCredentials,
  isValidEmail,
  isValidPassword,
};
