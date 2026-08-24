import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useBoardStore } from '@/stores/boardStore';
import { useToast } from '@/hooks/useToast';
import { getMockUsers } from '@/api/tasks';
import type { Priority, ColumnId } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const columnOptions = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

const mockUsers = getMockUsers();

const assigneeOptions = mockUsers.map((u) => ({
  value: u.name,
  label: u.name,
}));

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [columnId, setColumnId] = useState<ColumnId>('backlog');
  const [assigneeName, setAssigneeName] = useState(mockUsers[0]?.name || '');
  const [dueDate, setDueDate] = useState('');
  const addTask = useBoardStore((s) => s.addTask);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = mockUsers.find((u) => u.name === assigneeName);
    const avatar = matchedUser?.avatar || '';
    addTask({
      id: Date.now(),
      title,
      description,
      priority,
      assignee: assigneeName,
      assigneeAvatar: avatar,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      columnId,
      order: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      updatedAt: new Date().toISOString(),
      sprintId: 3,
    });
    toast.success('Task created');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setColumnId('backlog');
    setAssigneeName(mockUsers[0]?.name || '');
    setDueDate('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter task title"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            rows={3}
            placeholder="Enter task description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          />
          <Select
            label="Column"
            options={columnOptions}
            value={columnId}
            onChange={(e) => setColumnId(e.target.value as ColumnId)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={assigneeName}
            onChange={(e) => setAssigneeName(e.target.value)}
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
