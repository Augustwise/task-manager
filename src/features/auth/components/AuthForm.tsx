import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Link,
  TextField,
} from "@mui/material";
import { useState, type SubmitEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { AuthFormMode, AuthFormProps } from "../types";
import {
  getAuthMessages,
  getPasswordRules,
  validateAuthCredentials,
} from "../utils/authValidation";

function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const { t } = useI18n();
  const authMessages = getAuthMessages();
  const passwordRules = getPasswordRules();
  const shouldShowPasswordRules = mode === "signup";
  const copyByMode: Record<
    AuthFormMode,
    {
      errorTitle: string;
      footerLinkLabel: string;
      footerLinkTo: string;
      footerPrompt: string;
      networkErrorMessage: string;
      passwordPlaceholder: string;
      submitLabel: string;
      title: string;
    }
  > = {
    login: {
      title: t("auth.loginTitle"),
      submitLabel: t("auth.loginSubmit"),
      passwordPlaceholder: t("auth.loginPasswordPlaceholder"),
      footerPrompt: t("auth.loginFooterPrompt"),
      footerLinkLabel: t("auth.loginFooterLink"),
      footerLinkTo: "/signup",
      errorTitle: t("auth.loginErrorTitle"),
      networkErrorMessage: authMessages.loginNetworkError,
    },
    signup: {
      title: t("auth.signupTitle"),
      submitLabel: t("auth.signupSubmit"),
      passwordPlaceholder: t("auth.signupPasswordPlaceholder"),
      footerPrompt: t("auth.signupFooterPrompt"),
      footerLinkLabel: t("auth.signupFooterLink"),
      footerLinkTo: "/login",
      errorTitle: t("auth.signupErrorTitle"),
      networkErrorMessage: authMessages.signupNetworkError,
    },
  };
  const copy = copyByMode[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validation = validateAuthCredentials(email, password);
  const isPasswordValid = shouldShowPasswordRules ? validation.isPasswordValid : Boolean(password);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setServerError("");

    if (!validation.isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({ email, password });
    } catch (error) {
      setServerError(
        error instanceof Error && error.message ? error.message : copy.networkErrorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  }

  const emailError = touched.email && !validation.isEmailValid;
  const passwordError = touched.password && !isPasswordValid;
  const passwordHelperText =
    passwordError && !password
      ? authMessages.passwordRequired
      : passwordError && shouldShowPasswordRules
        ? t("auth.passwordHelper")
        : " ";

  return (
    <>
      <div className="auth-page">
        <Button
          className="auth-page__back-link"
          component={RouterLink}
          disabled={isLoading}
          to="/"
          variant="text"
        >
          {t("auth.backToHome")}
        </Button>

        <Card className="auth-page__card" elevation={8}>
          <CardContent className="auth-page__card-content">
            <form className="auth-page__form" noValidate onSubmit={handleSubmit}>
              <div className="auth-page__intro">
                <h1 className="auth-page__title">{copy.title}</h1>
                <p className="auth-page__subtitle">{t("auth.subtitle")}</p>
              </div>

              <TextField
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                error={emailError}
                fullWidth
                helperText={emailError ? authMessages.emailInvalid : " "}
                id="email"
                label={t("common.email")}
                placeholder="example@gmail.com"
                type="email"
                value={email}
                onBlur={() => setTouched((currentTouched) => ({ ...currentTouched, email: true }))}
                onChange={(event) => setEmail(event.target.value)}
              />

              <div className="auth-page__password-group">
                <TextField
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  disabled={isLoading}
                  error={passwordError}
                  fullWidth
                  helperText={passwordHelperText}
                  id="password"
                  label={t("common.password")}
                  placeholder={copy.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onBlur={() =>
                    setTouched((currentTouched) => ({ ...currentTouched, password: true }))
                  }
                  onChange={(event) => setPassword(event.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            disabled={isLoading}
                            size="small"
                            type="button"
                            onClick={() => setShowPassword((currentValue) => !currentValue)}
                          >
                            {showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {shouldShowPasswordRules && (
                  <div className="auth-page__password-rules">
                    <Chip
                      color={validation.hasMinLength ? "success" : "default"}
                      label={passwordRules.minLength}
                      size="small"
                      variant={validation.hasMinLength ? "filled" : "outlined"}
                    />
                    <Chip
                      color={validation.hasSpecialCharacter ? "success" : "default"}
                      label={passwordRules.specialCharacter}
                      size="small"
                      variant={validation.hasSpecialCharacter ? "filled" : "outlined"}
                    />
                  </div>
                )}
              </div>

              <Button disabled={isLoading} size="large" type="submit" variant="contained">
                {isLoading ? t("common.loading") : copy.submitLabel}
              </Button>

              <p className="auth-page__footer">
                {copy.footerPrompt}{" "}
                <Link
                  className="auth-page__footer-link"
                  component={RouterLink}
                  to={copy.footerLinkTo}
                  underline="hover"
                >
                  {copy.footerLinkLabel}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog
        aria-labelledby="auth-error-title"
        fullWidth
        maxWidth="xs"
        open={Boolean(serverError)}
        slotProps={{ paper: { className: "app-dialog" } }}
        onClose={() => setServerError("")}
      >
        <DialogTitle className="app-dialog__title" id="auth-error-title">
          {copy.errorTitle}
        </DialogTitle>
        <DialogContent className="app-dialog__content">
          <p className="app-dialog__subdued-text">{serverError}</p>
        </DialogContent>
        <DialogActions className="app-dialog__actions">
          <Button type="button" variant="contained" onClick={() => setServerError("")}>
            {t("auth.tryAgain")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AuthForm;
