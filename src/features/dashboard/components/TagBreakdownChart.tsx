import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { TaskDto } from "../../../shared/types";

interface TagBreakdownChartProps {
  readonly tasks: readonly TaskDto[];
}

function CustomTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (active && payload?.length) {
    const { value, total } = payload[0].payload as { value: number; total: number };
    return (
      <div className="dashboard-chart__tooltip">
        <p>{label}</p>
        <p>{`${value} / ${total} completed`}</p>
      </div>
    );
  }
  return null;
}

function TagBreakdownChart({ tasks }: TagBreakdownChartProps) {
  const { t } = useI18n();

  const data = useMemo(() => {
    const tagCounts = tasks.reduce((acc, task) => {
      const tag = task.tag || t("tasks.dashboard.noTags") || "No tags";
      if (!acc[tag]) {
        acc[tag] = { name: tag, value: 0, total: 0 };
      }
      acc[tag].total += 1;
      if (task.completed) {
        acc[tag].value += 1;
      }
      return acc;
    }, {} as Record<string, { name: string; value: number; total: number }>);

    /**
     * Recharts expects `value` for mapping standard charts easily, 
     * but we want to show both completed and total.
     */
    return Object.values(tagCounts)
      .map((item) => ({
        ...item,
        remaining: item.total - item.value,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // top 5 tags
  }, [tasks, t]);

  if (tasks.length === 0) {
    return <div className="chart-empty">{t("tasks.list.empty")}</div>;
  }



  return (
    <div className="dashboard-chart dashboard-chart--tags">
      <h3 className="dashboard-chart__title">{t("tasks.dashboard.tagBreakdown")}</h3>
      <div className="dashboard-chart__container">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            barSize={20}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 14 }}
              width={100}
            />
            <Tooltip content={CustomTooltip} cursor={{ fill: "var(--bg-hover)", opacity: 0.4 }} />
            <Bar dataKey="value" stackId="a" fill="var(--color-primary)" radius={[0, 0, 0, 0]} barSize={20} />
            <Bar dataKey="remaining" stackId="a" fill="var(--bg-secondary)" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TagBreakdownChart;
