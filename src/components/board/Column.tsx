import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import type { Task, ColumnId } from '@/types';

interface ColumnProps {
  id: ColumnId;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const columnColors: Record<ColumnId, string> = {
  'backlog': 'border-t-gray-400',
  'in-progress': 'border-t-blue-500',
  'review': 'border-t-yellow-500',
  'done': 'border-t-green-500',
};

export function Column({ id, title, tasks, onTaskClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-[280px] flex-1 flex-col rounded-lg bg-gray-100 dark:bg-gray-800/50 border-t-4 ${columnColors[id]} ${isOver ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
