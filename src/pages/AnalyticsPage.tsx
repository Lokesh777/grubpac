import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { useBoardStore } from '@/stores/boardStore';
import { useThemeStore } from '@/stores/themeStore';
import { useTasksQuery } from '@/hooks/useTasksQuery';
import { getMockSprints } from '@/api/tasks';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Task } from '@/types';

function useChartColors() {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  return useMemo(() => ({
    indigo: isDark ? '#818cf8' : '#6366f1',
    blue: isDark ? '#60a5fa' : '#3b82f6',
    yellow: isDark ? '#fbbf24' : '#f59e0b',
    green: isDark ? '#4ade80' : '#22c55e',
    gray: isDark ? '#6b7280' : '#9ca3af',
    red: isDark ? '#f87171' : '#ef4444',
    grid: isDark ? '#374151' : '#e5e7eb',
    tooltipBg: isDark ? '#1f2937' : '#ffffff',
    tooltipText: isDark ? '#f3f4f6' : '#374151',
    tooltipBorder: isDark ? '#4b5563' : '#e5e7eb',
    legendText: isDark ? '#9ca3af' : '#6b7280',
    axisText: isDark ? '#9ca3af' : '#6b7280',
  }), [isDark]);
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-lg"
      style={{
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        color: colors.tooltipText,
      }}
    >
      {label && <p className="mb-1 text-sm font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function computeAnalytics(tasks: Task[]) {
  const statusData = [
    { name: 'Backlog', value: tasks.filter((t) => t.columnId === 'backlog').length },
    { name: 'In Progress', value: tasks.filter((t) => t.columnId === 'in-progress').length },
    { name: 'Review', value: tasks.filter((t) => t.columnId === 'review').length },
    { name: 'Done', value: tasks.filter((t) => t.columnId === 'done').length },
  ];

  const priorityData = ['backlog', 'in-progress', 'review', 'done'].map((col) => {
    const colTasks = tasks.filter((t) => t.columnId === col);
    return {
      column: col === 'in-progress' ? 'In Progress' : col.charAt(0).toUpperCase() + col.slice(1),
      low: colTasks.filter((t) => t.priority === 'low').length,
      medium: colTasks.filter((t) => t.priority === 'medium').length,
      high: colTasks.filter((t) => t.priority === 'high').length,
      critical: colTasks.filter((t) => t.priority === 'critical').length,
    };
  });

  const sprints = getMockSprints();
  const sprintVelocity = sprints.map((sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const completed = sprintTasks.filter((t) => t.status === 'done' || t.columnId === 'done');
    return {
      name: sprint.name,
      completed: completed.length,
      total: sprintTasks.length,
    };
  });

  const completedTasks = tasks.filter((t) => t.completedAt);
  const weeklyCompletion: Record<string, number> = {};
  completedTasks.forEach((task) => {
    const date = new Date(task.completedAt!);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = `Week ${Math.ceil((weekStart.getTime() - new Date('2026-07-20').getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
    weeklyCompletion[weekKey] = (weeklyCompletion[weekKey] || 0) + 1;
  });

  const completionTrend = Object.entries(weeklyCompletion)
    .map(([name, tasks]) => ({ name, tasks }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (completionTrend.length === 0) {
    const totalDone = tasks.filter((t) => t.columnId === 'done').length;
    const perWeek = Math.ceil(totalDone / 4);
    completionTrend.push(
      { name: 'Week 1', tasks: perWeek },
      { name: 'Week 2', tasks: perWeek * 2 },
      { name: 'Week 3', tasks: perWeek * 3 },
      { name: 'Week 4', tasks: totalDone },
    );
  }

  return { statusData, priorityData, sprintVelocity, completionTrend };
}

export function AnalyticsPage() {
  const board = useBoardStore((s) => s.board);
  const colors = useChartColors();

  const { isLoading } = useTasksQuery();

  const tasks = useMemo(
    () => Object.values(board.tasks),
    [board.tasks]
  );

  const analytics = useMemo(() => computeAnalytics(tasks), [tasks]);

  const pieColors = [colors.indigo, colors.blue, colors.yellow, colors.green];

  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="mb-4 h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Sprint Velocity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.sprintVelocity}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.axisText }} />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Legend wrapperStyle={{ color: colors.legendText }} />
              <Bar dataKey="completed" fill={colors.indigo} name="Completed" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
              <Bar dataKey="total" fill={colors.gray} name="Total" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                isAnimationActive
                animationDuration={800}
              >
                {analytics.statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip colors={colors} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Priority Breakdown by Column</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="column" tick={{ fontSize: 12, fill: colors.axisText }} />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Legend wrapperStyle={{ color: colors.legendText }} />
              <Bar dataKey="low" stackId="a" fill={colors.gray} name="Low" isAnimationActive animationDuration={800} />
              <Bar dataKey="medium" stackId="a" fill={colors.blue} name="Medium" isAnimationActive animationDuration={800} />
              <Bar dataKey="high" stackId="a" fill={colors.yellow} name="High" isAnimationActive animationDuration={800} />
              <Bar dataKey="critical" stackId="a" fill={colors.red} name="Critical" isAnimationActive animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: colors.axisText }} />
              <YAxis tick={{ fontSize: 12, fill: colors.axisText }} />
              <Tooltip content={<CustomTooltip colors={colors} />} />
              <Line type="monotone" dataKey="tasks" stroke={colors.indigo} strokeWidth={2} dot={{ r: 4, fill: colors.indigo }} name="Tasks Completed" isAnimationActive animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
