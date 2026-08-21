import type { Task, ColumnId } from '@/types';

const initialTasks: Task[] = [
  { id: 1, title: 'Set up project scaffolding with Vite and TypeScript', description: 'Initialize the React project with Vite, configure TypeScript strict mode, and set up Tailwind CSS.', priority: 'high', assignee: 'Emily Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=emilys', dueDate: '2026-08-15', columnId: 'done', order: 0, comments: [{ id: 1, userId: 1, userName: 'Emily Johnson', text: 'Project scaffolded successfully.', createdAt: '2026-08-12T10:30:00Z' }], createdAt: '2026-08-12T09:00:00Z', sprintId: 4 },
  { id: 2, title: 'Implement authentication flow with DummyJSON', description: 'Build login page, token management, protected routes, and session persistence.', priority: 'critical', assignee: 'Michael Williams', assigneeAvatar: 'https://i.pravatar.cc/150?u=michaelw', dueDate: '2026-08-18', columnId: 'in-progress', order: 0, comments: [{ id: 2, userId: 2, userName: 'Michael Williams', text: 'Login page done, working on token refresh.', createdAt: '2026-08-14T14:00:00Z' }], createdAt: '2026-08-12T09:15:00Z', sprintId: 4 },
  { id: 3, title: 'Design Kanban board layout and columns', description: 'Create the four-column Kanban board with Backlog, In Progress, Review, and Done columns.', priority: 'high', assignee: 'Sophia Brown', assigneeAvatar: 'https://i.pravatar.cc/150?u=sophiab', dueDate: '2026-08-19', columnId: 'in-progress', order: 1, comments: [], createdAt: '2026-08-12T09:30:00Z', sprintId: 4 },
  { id: 4, title: 'Implement drag-and-drop with dnd-kit', description: 'Add drag-and-drop functionality for task reordering within and between columns.', priority: 'high', assignee: 'James Davis', assigneeAvatar: 'https://i.pravatar.cc/150?u=jamesd', dueDate: '2026-08-20', columnId: 'backlog', order: 0, comments: [], createdAt: '2026-08-12T10:00:00Z', sprintId: 4 },
  { id: 5, title: 'Build reusable Button component', description: 'Create a composable Button component with variants, sizes, and loading states.', priority: 'medium', assignee: 'Emily Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=emilys', dueDate: '2026-08-16', columnId: 'done', order: 1, comments: [{ id: 3, userId: 1, userName: 'Emily Johnson', text: 'Button component supports all variants.', createdAt: '2026-08-13T11:00:00Z' }], createdAt: '2026-08-12T10:15:00Z', sprintId: 4 },
  { id: 6, title: 'Create Input and Select form components', description: 'Build Input and Select components with validation states, labels, and error messages.', priority: 'medium', assignee: 'Emily Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=emilys', dueDate: '2026-08-17', columnId: 'review', order: 0, comments: [], createdAt: '2026-08-12T10:30:00Z', sprintId: 4 },
  { id: 7, title: 'Build Modal and Toast notification components', description: 'Implement Modal dialog and Toast notification system with animations and accessibility.', priority: 'medium', assignee: 'Sophia Brown', assigneeAvatar: 'https://i.pravatar.cc/150?u=sophiab', dueDate: '2026-08-18', columnId: 'backlog', order: 1, comments: [], createdAt: '2026-08-12T11:00:00Z', sprintId: 4 },
  { id: 8, title: 'Implement Zustand board store', description: 'Create Zustand store for Kanban board state management with add, move, and delete operations.', priority: 'high', assignee: 'Michael Williams', assigneeAvatar: 'https://i.pravatar.cc/150?u=michaelw', dueDate: '2026-08-19', columnId: 'in-progress', order: 2, comments: [], createdAt: '2026-08-12T11:15:00Z', sprintId: 4 },
  { id: 9, title: 'Set up TanStack Query for data fetching', description: 'Configure React Query for API calls, caching, and background refetching.', priority: 'high', assignee: 'James Davis', assigneeAvatar: 'https://i.pravatar.cc/150?u=jamesd', dueDate: '2026-08-17', columnId: 'done', order: 2, comments: [], createdAt: '2026-08-12T11:30:00Z', sprintId: 4 },
  { id: 10, title: 'Build Analytics page with Recharts', description: 'Create analytics dashboard with sprint velocity, task status, priority breakdown charts.', priority: 'high', assignee: 'Sophia Brown', assigneeAvatar: 'https://i.pravatar.cc/150?u=sophiab', dueDate: '2026-08-22', columnId: 'backlog', order: 2, comments: [], createdAt: '2026-08-12T12:00:00Z', sprintId: 4 },
  { id: 11, title: 'Implement notification polling system', description: 'Set up JSONPlaceholder polling for real-time notifications with read/unread state.', priority: 'medium', assignee: 'Michael Williams', assigneeAvatar: 'https://i.pravatar.cc/150?u=michaelw', dueDate: '2026-08-21', columnId: 'backlog', order: 3, comments: [], createdAt: '2026-08-12T12:15:00Z', sprintId: 4 },
  { id: 12, title: 'Add task detail side drawer', description: 'Create a slide-out drawer for viewing and editing task details with comments.', priority: 'medium', assignee: 'Emily Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=emilys', dueDate: '2026-08-20', columnId: 'review', order: 1, comments: [], createdAt: '2026-08-12T12:30:00Z', sprintId: 4 },
  { id: 13, title: 'Implement theme toggle (light/dark)', description: 'Add theme switching functionality with Zustand persistence and Tailwind dark mode.', priority: 'low', assignee: 'James Davis', assigneeAvatar: 'https://i.pravatar.cc/150?u=jamesd', dueDate: '2026-08-18', columnId: 'done', order: 3, comments: [], createdAt: '2026-08-12T13:00:00Z', sprintId: 4 },
  { id: 14, title: 'Add DataTable component with sorting', description: 'Build a reusable DataTable with column sorting, pagination, and responsive design.', priority: 'low', assignee: 'Sophia Brown', assigneeAvatar: 'https://i.pravatar.cc/150?u=sophiab', dueDate: '2026-08-23', columnId: 'backlog', order: 4, comments: [], createdAt: '2026-08-12T13:15:00Z', sprintId: 4 },
  { id: 15, title: 'Write unit tests for Zustand stores', description: 'Create comprehensive tests for auth, board, notification, and theme stores.', priority: 'high', assignee: 'Michael Williams', assigneeAvatar: 'https://i.pravatar.cc/150?u=michaelw', dueDate: '2026-08-24', columnId: 'backlog', order: 5, comments: [], createdAt: '2026-08-12T13:30:00Z', sprintId: 4 },
  { id: 16, title: 'Set up React.lazy for code splitting', description: 'Implement route-level lazy loading with Suspense and loading fallbacks.', priority: 'medium', assignee: 'James Davis', assigneeAvatar: 'https://i.pravatar.cc/150?u=jamesd', dueDate: '2026-08-22', columnId: 'review', order: 2, comments: [], createdAt: '2026-08-12T14:00:00Z', sprintId: 4 },
  { id: 17, title: 'Build Skeleton loading component', description: 'Create animated skeleton placeholders for loading states.', priority: 'low', assignee: 'Emily Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=emilys', dueDate: '2026-08-19', columnId: 'done', order: 4, comments: [], createdAt: '2026-08-12T14:15:00Z', sprintId: 4 },
  { id: 18, title: 'Add keyboard navigation for drag-and-drop', description: 'Implement keyboard-accessible drag-and-drop with proper ARIA attributes.', priority: 'low', assignee: 'Sophia Brown', assigneeAvatar: 'https://i.pravatar.cc/150?u=sophiab', dueDate: '2026-08-25', columnId: 'backlog', order: 6, comments: [], createdAt: '2026-08-12T14:30:00Z', sprintId: 4 },
  { id: 19, title: 'Implement Lighthouse optimization', description: 'Optimize performance and accessibility to meet Lighthouse scores.', priority: 'high', assignee: 'Michael Williams', assigneeAvatar: 'https://i.pravatar.cc/150?u=michaelw', dueDate: '2026-08-25', columnId: 'backlog', order: 7, comments: [], createdAt: '2026-08-12T14:45:00Z', sprintId: 4 },
  { id: 20, title: 'Write integration tests for auth flow', description: 'Create tests for login, token refresh, protected routes, and logout.', priority: 'high', assignee: 'James Davis', assigneeAvatar: 'https://i.pravatar.cc/150?u=jamesd', dueDate: '2026-08-25', columnId: 'backlog', order: 8, comments: [], createdAt: '2026-08-12T15:00:00Z', sprintId: 4 },
];

export async function fetchTasks(): Promise<Task[]> {
  await new Promise((r) => setTimeout(r, 500));
  return [...initialTasks];
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'comments'>): Promise<Task> {
  await new Promise((r) => setTimeout(r, 300));
  const maxId = Math.max(...initialTasks.map((t) => t.id), 0);
  return { ...task, id: maxId + 1, createdAt: new Date().toISOString(), comments: [] };
}

export async function updateTask(taskId: number, updates: Partial<Task>): Promise<Task> {
  await new Promise((r) => setTimeout(r, 300));
  const task = initialTasks.find((t) => t.id === taskId);
  if (!task) throw new Error('Task not found');
  return { ...task, ...updates };
}

export async function deleteTaskRequest(_taskId: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
}

export function getInitialBoardState(): Record<ColumnId, number[]> {
  const columns: Record<ColumnId, number[]> = { 'backlog': [], 'in-progress': [], 'review': [], 'done': [] };
  [...initialTasks].sort((a, b) => a.order - b.order).forEach((task) => {
    if (columns[task.columnId]) columns[task.columnId].push(task.id);
  });
  return columns;
}
