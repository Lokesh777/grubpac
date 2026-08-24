import type { Task, ColumnId, Comment } from '@/types';
import mockData from '@/data/mock-data.json';

interface MockUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface MockTask {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId: number;
  dueDate: string;
  sprintId: number;
  order: number;
  createdAt: string;
  completedAt: string | null;
  updatedAt: string;
}

interface MockComment {
  id: number;
  taskId: number;
  authorId: number;
  message: string;
  createdAt: string;
}

const users: MockUser[] = mockData.users;
const rawTasks: MockTask[] = mockData.tasks;
const rawComments: MockComment[] = mockData.comments;

function lookupUser(userId: number): { name: string; avatar: string } {
  const user = users.find((u) => u.id === userId);
  return user
    ? { name: user.name, avatar: user.avatar }
    : { name: 'Unknown', avatar: '' };
}

function lookupCommentAuthor(authorId: number): string {
  const user = users.find((u) => u.id === authorId);
  return user ? user.name : 'Unknown';
}

function statusToColumnId(status: string): ColumnId {
  const mapping: Record<string, ColumnId> = {
    'backlog': 'backlog',
    'in-progress': 'in-progress',
    'review': 'review',
    'done': 'done',
  };
  return mapping[status] || 'backlog';
}

function isValidPriority(p: string): p is 'low' | 'medium' | 'high' | 'critical' {
  return ['low', 'medium', 'high', 'critical'].includes(p);
}

function buildCommentsForTask(taskId: number): Comment[] {
  return rawComments
    .filter((c) => c.taskId === taskId)
    .map((c) => ({
      id: c.id,
      userId: c.authorId,
      userName: lookupCommentAuthor(c.authorId),
      text: c.message,
      createdAt: c.createdAt,
    }));
}

function transformTask(raw: MockTask): Task {
  const { name: assigneeName, avatar: assigneeAvatar } = lookupUser(raw.assigneeId);
  const priority = isValidPriority(raw.priority) ? raw.priority : 'medium';

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    priority,
    assignee: assigneeName,
    assigneeAvatar,
    dueDate: raw.dueDate,
    columnId: statusToColumnId(raw.status),
    order: raw.order,
    comments: buildCommentsForTask(raw.id),
    createdAt: raw.createdAt,
    completedAt: raw.completedAt,
    updatedAt: raw.updatedAt,
    sprintId: raw.sprintId,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return rawTasks.map(transformTask);
}

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'updatedAt' | 'comments'>
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const maxId = Math.max(...rawTasks.map((t) => t.id), 0);
  return {
    ...task,
    id: maxId + 1,
    createdAt: new Date().toISOString(),
    completedAt: null,
    updatedAt: new Date().toISOString(),
    comments: [],
  };
}

export async function updateTask(
  taskId: number,
  updates: Partial<Task>
): Promise<Task> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const existing = rawTasks.find((t) => t.id === taskId);
  if (!existing) throw new Error('Task not found');
  const transformed = transformTask(existing);
  return { ...transformed, ...updates, updatedAt: new Date().toISOString() };
}

export async function deleteTaskRequest(_taskId: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export function getInitialBoardState(): Record<ColumnId, number[]> {
  const columns: Record<ColumnId, number[]> = {
    'backlog': [],
    'in-progress': [],
    'review': [],
    'done': [],
  };

  const allTasks = rawTasks.map(transformTask);
  allTasks
    .sort((a, b) => a.order - b.order)
    .forEach((task) => {
      columns[task.columnId].push(task.id);
    });

  return columns;
}

export function getMockUsers(): { id: number; name: string; avatar: string }[] {
  return users.map((u) => ({ id: u.id, name: u.name, avatar: u.avatar }));
}

export function getMockSprints(): { id: number; name: string; startDate: string; endDate: string }[] {
  return mockData.sprints.map((s) => ({
    id: s.id,
    name: s.name,
    startDate: s.startDate,
    endDate: s.endDate,
  }));
}
