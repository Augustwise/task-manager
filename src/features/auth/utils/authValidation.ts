import authConfig from "../../../../shared/auth.json";
import { t } from "../../../shared/i18n";

const emailRegex = new RegExp(authConfig.emailPattern);
const passwordSpecialCharacterRegex = new RegExp(
  authConfig.passwordSpecialCharacterPattern,
);

export function getAuthMessages() {
  return {
    emailInvalid: t("auth.messages.emailInvalid"),
    passwordRequired: t("auth.messages.passwordRequired"),
    passwordMinLength: t("auth.messages.passwordMinLength", {
      count: authConfig.passwordMinLength,
    }),
    passwordSpecialCharacter: t("auth.messages.passwordSpecialCharacter"),
    missingFields: t("auth.messages.missingFields"),
    invalidFormat: t("auth.messages.invalidFormat"),
    emailAlreadyExists: t("auth.messages.emailAlreadyExists"),
    invalidCredentials: t("auth.messages.invalidCredentials"),
    unauthorized: t("auth.messages.unauthorized"),
    serverError: t("auth.messages.serverError"),
    sessionExpired: t("auth.messages.sessionExpired"),
    sessionRestoreFailed: t("auth.messages.sessionRestoreFailed"),
    loginNetworkError: t("auth.messages.loginNetworkError"),
    signupNetworkError: t("auth.messages.signupNetworkError"),
  };
}

export function getPasswordRules() {
  const messages = getAuthMessages();

  return {
    minLength: messages.passwordMinLength,
    specialCharacter: messages.passwordSpecialCharacter,
  };
}

export function getPasswordValidation(password: string) {
  const normalizedPassword = typeof password === "string" ? password : "";
  const hasMinLength = normalizedPassword.length >= authConfig.passwordMinLength;
  const hasSpecialCharacter = passwordSpecialCharacterRegex.test(normalizedPassword);

  return {
    hasMinLength,
    hasSpecialCharacter,
    isValid: hasMinLength && hasSpecialCharacter,
  };
}

export function isValidEmail(email: string) {
  return emailRegex.test(email.trim());
}

export function validateAuthCredentials(email: string, password: string) {
  const passwordValidation = getPasswordValidation(password);

  return {
    isEmailValid: isValidEmail(email),
    isPasswordValid: passwordValidation.isValid,
    ...passwordValidation,
  };
}
