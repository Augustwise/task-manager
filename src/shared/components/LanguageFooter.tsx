import { MenuItem, TextField, type TextFieldProps } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/model/useAuth";
import { useI18n } from "../i18n/useI18n";
import { isSupportedLanguage, type SupportedLanguage } from "../i18n";

const LANGUAGE_OPTIONS: ReadonlyArray<{
  labelKey: string;
  value: SupportedLanguage;
}> = [
  {
    value: "en",
    labelKey: "footer.english",
  },
  {
    value: "ru",
    labelKey: "footer.russian",
  },
  {
    value: "uk",
    labelKey: "footer.ukrainian",
  },
];

const LANGUAGE_SELECT_ID = "footer-language-select";

function LanguageFooter() {
  const { language, setLanguage, t } = useI18n();
  const { status, logout } = useAuth();
  const { pathname } = useLocation();

  const handleLanguageChange: NonNullable<TextFieldProps["onChange"]> = (event) => {
    const { value } = event.target;

    if (isSupportedLanguage(value)) {
      setLanguage(value);
    }
  };

  return (
    <footer className="language-footer">
      <div className="language-footer__content">
        {status === "authenticated" && pathname !== "/" && (
          <button className="language-footer__logout-btn" onClick={logout} type="button">
            {t("tasks.logout")}
          </button>
        )}
        <div className="language-footer__lang">
          <label className="language-footer__label" htmlFor={LANGUAGE_SELECT_ID}>
            {t("footer.label")}
          </label>
          <div className="language-footer__switcher">
            <TextField
              select
              size="small"
              id={LANGUAGE_SELECT_ID}
              className="language-footer__field"
              value={language}
              variant="outlined"
              aria-label={t("footer.switcherAriaLabel")}
              onChange={handleLanguageChange}
            >
              {LANGUAGE_OPTIONS.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </MenuItem>
                );
              })}
            </TextField>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LanguageFooter;
