import { useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { useBoardStore } from '@/stores/boardStore';
import { fetchTasks } from '@/api/tasks';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Task } from '@/types';

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#22c55e'];

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

  const sprints = [
    { name: 'Sprint 1', completed: 8, total: 12 },
    { name: 'Sprint 2', completed: 10, total: 15 },
    { name: 'Sprint 3', completed: 12, total: 18 },
    { name: 'Sprint 4', completed: 3, total: 20 },
  ];

  const completionTrend = [
    { name: 'Week 1', tasks: 5 },
    { name: 'Week 2', tasks: 8 },
    { name: 'Week 3', tasks: 12 },
    { name: 'Week 4', tasks: 15 },
    { name: 'Week 5', tasks: 18 },
  ];

  return { statusData, priorityData, sprints, completionTrend };
}

export function AnalyticsPage() {
  const board = useBoardStore((s) => s.board);
  const initialized = useBoardStore((s) => s.initialized);
  const initBoard = useBoardStore((s) => s.initBoard);

  useEffect(() => {
    if (!initialized) {
      fetchTasks().then((tasks) => initBoard(tasks));
    }
  }, [initialized, initBoard]);

  const tasks = useMemo(
    () => Object.values(board.tasks),
    [board.tasks]
  );

  const analytics = useMemo(() => computeAnalytics(tasks), [tasks]);

  if (!initialized) {
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
            <BarChart data={analytics.sprints}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#e5e7eb" name="Total" radius={[4, 4, 0, 0]} />
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
              >
                {analytics.statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Priority Breakdown by Column</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="column" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="a" fill="#9ca3af" name="Low" />
              <Bar dataKey="medium" stackId="a" fill="#3b82f6" name="Medium" />
              <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
              <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Completion Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Tasks Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
