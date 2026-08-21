import { useState } from 'react';
import type { Task } from '@/types';
import { useBoardStore } from '@/stores/boardStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/utils/date';
import { cn } from '@/utils/cn';

interface TaskDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const priorityStyles = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function TaskDrawer({ task, isOpen, onClose }: TaskDrawerProps) {
  const [newComment, setNewComment] = useState('');
  const addComment = useBoardStore((s) => s.addComment);
  const updateTask = useBoardStore((s) => s.updateTask);
  const deleteTask = useBoardStore((s) => s.deleteTask);
  const user = useAuthStore((s) => s.user);
  const toast = useToast();

  if (!isOpen || !task) return null;

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    addComment(task.id, {
      id: Date.now(),
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    });
    setNewComment('');
    toast.success('Comment added');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      onClose();
      toast.success('Task deleted');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl dark:bg-gray-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close drawer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityStyles[task.priority])}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-400">#{task.id}</span>
          </div>

          <input
            type="text"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className="mb-4 w-full text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white"
          />

          <textarea
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            className="mb-6 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            rows={3}
            placeholder="Add a description..."
          />

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Assignee</label>
              <div className="flex items-center gap-2">
                <img src={task.assigneeAvatar} alt={task.assignee} className="h-6 w-6 rounded-full" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{task.assignee}</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Due Date</label>
              <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(task.dueDate)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Comments</h3>
            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{comment.userName}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>

          <button
            onClick={handleDelete}
            className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
