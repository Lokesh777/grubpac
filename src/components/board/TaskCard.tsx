import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { cn } from '@/utils/cn';
import { formatDate, isOverdue } from '@/utils/date';

const priorityStyles = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard = memo(function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        'cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-indigo-500'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityStyles[task.priority])}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-400">#{task.id}</span>
      </div>
      <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{task.title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={task.assigneeAvatar}
            alt={task.assignee}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignee.split(' ')[0]}</span>
        </div>
        <span className={cn(
          'text-xs',
          isOverdue(task.dueDate) && task.columnId !== 'done' ? 'text-red-500' : 'text-gray-400'
        )}>
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
});
