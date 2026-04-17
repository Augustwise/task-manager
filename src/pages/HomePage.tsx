import classNames from "classnames";
import { useNavigate } from "react-router-dom";
import calendarIcon from "../assets/calendar.svg";
import subtasksIcon from "../assets/subtasks.svg";
import { useI18n } from "../shared/i18n/useI18n";

function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <>
      <header className="header">
        <div className="header__container">
          <h1 className="header__logo">{t("common.appName")}</h1>
          <p className="header__tagline">{t("home.tagline")}</p>
          <div className="button-group">
            <button
              className={classNames("button", "button--primary")}
              onClick={() => navigate("/login")}
            >
              {t("home.login")}
            </button>
            <button
              className={classNames("button", "button--secondary")}
              onClick={() => navigate("/signup")}
            >
              {t("home.signUp")}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h2 className="section__title">{t("home.aboutTitle")}</h2>
          <p>{t("home.aboutParagraphOne")}</p>
          <p>{t("home.aboutParagraphTwo")}</p>
        </section>

        <section className="section">
          <h2 className="section__title">{t("home.featuresTitle")}</h2>
          <div className="features">
            <div className="features__item">
              <h3 className="features__title">{t("home.taskCreationTitle")}</h3>
              <p>{t("home.taskCreationDescription")}</p>
              <img src={calendarIcon} alt={t("home.calendarAlt")} className="features__icon" />
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.subtasksTitle")}</h3>
              <p>{t("home.subtasksDescription")}</p>
              <img src={subtasksIcon} alt={t("home.subtasksAlt")} className="features__icon" />
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.priorityLevelsTitle")}</h3>
              <p>{t("home.priorityLevelsDescription")}</p>
              <div className="priority">
                <span className={classNames("priority__item", "priority__item--high")}>
                  {t("common.priorityLevels.high")}
                </span>
                <span className={classNames("priority__item", "priority__item--medium")}>
                  {t("common.priorityLevels.medium")}
                </span>
                <span className={classNames("priority__item", "priority__item--low")}>
                  {t("common.priorityLevels.low")}
                </span>
              </div>
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.progressTrackingTitle")}</h3>
              <p>{t("home.progressTrackingDescription")}</p>
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.recurringTasksTitle")}</h3>
              <p>{t("home.recurringTasksDescription")}</p>
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.secureAuthenticationTitle")}</h3>
              <p>{t("home.secureAuthenticationDescription")}</p>
            </div>
            <div className="features__item">
              <h3 className="features__title">{t("home.sortingFilteringTitle")}</h3>
              <p>{t("home.sortingFilteringDescription")}</p>
            </div>
          </div>
        </section>

        <section className={classNames("section", "section--last")}>
          <h2 className="section__title">{t("home.readyTitle")}</h2>
          <p>{t("home.readyDescription")}</p>
          <div className="button-group">
            <button
              className={classNames("button", "button--secondary")}
              onClick={() => navigate("/signup")}
            >
              {t("home.signUpNow")}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;
