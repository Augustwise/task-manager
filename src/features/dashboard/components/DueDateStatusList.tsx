import classNames from "classnames";
import { Link } from "react-router-dom";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { TaskDto } from "../../../shared/types";
import { calculateDueStatus } from "../model/dueDateStatus";

interface DueDateStatusListProps {
  readonly tasks: readonly TaskDto[];
}

function DueDateStatusList({ tasks }: DueDateStatusListProps) {
  const { t } = useI18n();

  const statuses = tasks.reduce(
    (acc, task) => {
      const status = calculateDueStatus(task);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { overdue: 0, dueToday: 0, thisWeek: 0, onTrack: 0 } as Record<string, number>
  );

  return (
    <div className="dashboard-chart">
      <h3 className="dashboard-chart__title">{t("tasks.dashboard.dueDateStatus")}</h3>
      <div className="due-date-list">
        <Link to="/tasks/due/overdue" className="due-date-list__item due-date-list__item--link">
          <div className="due-date-list__label-container">
            <span className={classNames("due-date-list__dot", "due-date-list__dot--overdue")} />
            <span className="due-date-list__label">{t("tasks.dashboard.overdue")}</span>
          </div>
          <span className="due-date-list__count">{statuses.overdue}</span>
        </Link>
        <Link to="/tasks/due/dueToday" className="due-date-list__item due-date-list__item--link">
          <div className="due-date-list__label-container">
            <span className={classNames("due-date-list__dot", "due-date-list__dot--today")} />
            <span className="due-date-list__label">{t("tasks.dashboard.dueToday")}</span>
          </div>
          <span className="due-date-list__count">{statuses.dueToday}</span>
        </Link>
        <Link to="/tasks/due/thisWeek" className="due-date-list__item due-date-list__item--link">
          <div className="due-date-list__label-container">
            <span className={classNames("due-date-list__dot", "due-date-list__dot--week")} />
            <span className="due-date-list__label">{t("tasks.dashboard.thisWeek")}</span>
          </div>
          <span className="due-date-list__count">{statuses.thisWeek}</span>
        </Link>
        <Link to="/tasks/due/onTrack" className="due-date-list__item due-date-list__item--link">
          <div className="due-date-list__label-container">
            <span className={classNames("due-date-list__dot", "due-date-list__dot--track")} />
            <span className="due-date-list__label">{t("tasks.dashboard.onTrack")}</span>
          </div>
          <span className="due-date-list__count">{statuses.onTrack}</span>
        </Link>
      </div>
    </div>
  );
}

export default DueDateStatusList;
