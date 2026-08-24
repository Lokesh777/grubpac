import { Link } from 'react-router-dom';
import { useBoardStore } from '@/stores/boardStore';
import { useTasksQuery } from '@/hooks/useTasksQuery';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/DataTable';
import type { Task } from '@/types';

const COLUMN_NAMES: Record<string, string> = {
  'backlog': 'Backlog',
  'in-progress': 'In Progress',
  'review': 'Review',
  'done': 'Done',
};

export function DashboardPage() {
  const board = useBoardStore((s) => s.board);
  const { isLoading } = useTasksQuery();

  const totalTasks = Object.keys(board.tasks).length;
  const doneTasks = board.columns['done'].taskIds.length;
  const inProgressTasks = board.columns['in-progress'].taskIds.length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{inProgressTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{doneTasks}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="mt-1 text-3xl font-bold text-indigo-600">{completionRate}%</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Board Overview</h3>
        <Link to="/board" className="text-sm text-indigo-600 hover:text-indigo-500">
          View Board &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(board.columns).map(([colId, col]) => (
          <div key={colId} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {COLUMN_NAMES[colId] || colId}
              </h4>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {col.taskIds.length}
              </span>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <TaskCardSkeleton />
                  <TaskCardSkeleton />
                </>
              ) : col.taskIds.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">No tasks</p>
              ) : (
                col.taskIds.slice(0, 3).map((taskId) => {
                  const task = board.tasks[taskId];
                  if (!task) return null;
                  return (
                    <div key={task.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{task.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <img src={task.assigneeAvatar} alt="" width={16} height={16} loading="lazy" decoding="async" className="h-4 w-4 rounded-full" />
                        <span className="text-[10px] text-gray-400">{task.assignee.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })
              )}
              {!isLoading && col.taskIds.length > 3 && (
                <Link to="/board" className="block text-center text-xs text-indigo-600 hover:text-indigo-500 py-1">
                  +{col.taskIds.length - 3} more
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Tasks</h3>
        </div>
        {isLoading ? (
          <div className="p-5">
            <TaskCardSkeleton />
          </div>
        ) : (
          <DataTable<Task>
            columns={[
              { key: 'title', header: 'Title', sortable: true },
              {
                key: 'columnId',
                header: 'Status',
                sortable: true,
                render: (task) => COLUMN_NAMES[task.columnId] ?? task.columnId,
              },
              { key: 'priority', header: 'Priority', sortable: true },
              { key: 'assignee', header: 'Assignee', sortable: true },
              { key: 'dueDate', header: 'Due Date', sortable: true },
            ]}
            data={Object.values(board.tasks)}
            pageSize={8}
            keyExtractor={(task) => task.id}
          />
        )}
      </div>
    </div>
  );
}
