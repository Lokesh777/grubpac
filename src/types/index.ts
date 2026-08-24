export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ColumnId = 'backlog' | 'in-progress' | 'review' | 'done';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
  refreshToken: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  assigneeAvatar: string;
  dueDate: string;
  columnId: ColumnId;
  order: number;
  comments: Comment[];
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
  sprintId: number;
}

export interface Board {
  columns: Record<ColumnId, { id: ColumnId; title: string; taskIds: number[] }>;
  tasks: Record<number, Task>;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
