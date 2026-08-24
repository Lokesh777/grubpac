# SprintDesk — Sprint Management Dashboard

A production-oriented sprint management dashboard built with React, TypeScript, and modern frontend tooling. Designed for software development teams to manage tasks through an interactive Kanban board, track sprint analytics, and collaborate in real-time.

## Live Demo

> [Link to deployment]

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | React 18+ |
| Language | TypeScript (strict mode) |
| Build Tool | Vite |
| State Management | Zustand |
| Server State | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | Recharts |
| Routing | React Router v6 |
| Testing | Vitest + React Testing Library |
| Linting | Oxlint |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/<your-username>/sprintdesk.git
cd sprintdesk
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build

```bash
npm run build
```

### Test

```bash
npm run test
```

### Lint

```bash
npm run lint
```

### Login Credentials

Use the DummyJSON demo credentials:
- **Username:** `emilys`
- **Password:** `emilyspass`

## Architecture

```
src/
├── api/                    # API service layer
│   ├── client.ts           # Fetch wrapper with token injection + 401 refresh
│   ├── auth.ts             # DummyJSON authentication endpoints
│   ├── tasks.ts            # Task data layer (transforms mock-data.json)
│   └── notifications.ts    # JSONPlaceholder polling
├── stores/                 # Zustand global state
│   ├── authStore.ts        # Auth state, tokens, user session
│   ├── boardStore.ts       # Kanban board columns + tasks
│   ├── notificationStore.ts # Notifications with read/unread
│   ├── themeStore.ts       # Light/dark theme
│   └── toastStore.ts       # Toast notifications
├── hooks/                  # Custom React hooks
│   ├── useTasksQuery.ts    # TanStack Query hook for task fetching
│   └── useToast.ts         # Convenience hook for toast store
├── components/
│   ├── auth/               # ProtectedRoute, LoginForm
│   ├── board/              # Board, Column, TaskCard, TaskDrawer, AddTaskModal
│   ├── layout/             # AppLayout, Header, Sidebar
│   ├── notifications/      # NotificationBell
│   └── ui/                 # Button, Input, Select, Modal, Toast, DataTable, Skeleton
├── pages/                  # Route pages (lazy-loaded)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BoardPage.tsx
│   └── AnalyticsPage.tsx
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions (cn, date formatting)
└── __tests__/              # Unit tests
```

### Data Flow

```
UI Components
    ↓
Hooks (useTasksQuery — TanStack Query)
    ↓
API Layer (api/tasks.ts — transforms mock data)
    ↓
Data Source (mock-data.json, DummyJSON, JSONPlaceholder)
```

- **Server state** (tasks, notifications) is managed by TanStack Query with caching and background refetching
- **Client state** (board columns, drag positions, auth session, theme) is managed by Zustand with localStorage persistence
- **Local state** (form inputs, modal open/close) stays in component state

## Features Implemented

### Authentication
- Login with DummyJSON API
- Access token in memory, refresh token in localStorage
- API interceptor that attaches Bearer token automatically
- Silent token refresh on 401 with request retry queue
- Protected routes — unauthenticated users redirect to `/login`
- Session persistence across page refreshes
- Full-screen loading during session validation

### Kanban Sprint Board
- Four columns: Backlog, In Progress, Re iew, Done
- Drag-and-drop within and between columns (@dnd-kit)
- Task cards showing priority, assignee, due date
- Side drawer for task details with inline editing
- Comment system on tasks
- Create new tasks with title, priority, assignee, due date
- Delete tasks with confirmation
- Dynamic column task counts
- Board state persists via Zustand + localStorage

### Analytics & Data Visualization
- Sprint Velocity — completed tasks per sprint (bar chart)
- Task Status — distribution across columns (donut chart)
- Priority Breakdown — priorities per column (stacked bar)
- Completion Trend — tasks completed over time (line chart)
- All charts derived from actual board data, not hardcoded
- Charts update when board data changes
- Responsive at all viewports including 375px mobile
- Chart animations enabled

### Design System
- **Button** — 5 variants (primary, secondary, danger, ghost, outline), 3 sizes, loading state
- **Input** — Label, error state, forwardRef, auto-generated ID
- **Select** — Options array, placeholder, error, forwardRef
- **Modal** — Overlay, ESC close, 3 sizes, ARIA attributes, body scroll lock
- **Toast** — 4 types with icons, auto-dismiss (4s), manual dismiss
- **DataTable** — Generic typed columns, sorting, pagination
- **Skeleton** — Generic + TaskCardSkeleton loaders

### Notification System
- Polls JSONPlaceholder `/posts?_limit=5` every 30 seconds
- Bell icon with unread count badge
- Latest 20 notifications with read/unread state
- Mark as read, mark all as read
- Pause polling when browser tab is hidden, resume on visible
- Toast notification when new alerts arrive while panel is closed
- Persisted via Zustand + localStorage

### Performance
- Route-level code splitting (React.lazy + Suspense)
- React.memo on TaskCard and Column components
- useMemo for analytics computation and chart colors
- useCallback for drag event handlers
- TanStack Query caching with stale time

### Testing
- 23 unit tests across 4 test files:
  - `toastStore.test.ts` — add, auto-remove, manual remove, default type
  - `useToast.test.ts` — hook returns correct methods for each toast type
  - `boardStore.test.ts` — init, add, delete, move, reorder, comment, update, getTasksByColumn
  - `authInterceptor.test.ts` — token store/retrieve, Authorization header, 401 refresh+retry

## API Endpoints

### DummyJSON Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `https://dummyjson.com/auth/login` | Login with username/password |
| POST | `https://dummyjson.com/auth/refresh` | Refresh access token |

### JSONPlaceholder Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `https://jsonplaceholder.typicode.com/posts?_limit=5` | Poll for new notifications |

### Mock Data (local)
| Source | Description |
|--------|-------------|
| `mock-data.json` | Users, sprints, tasks, comments, initial notifications |

## Technical Decisions

1. **Tailwind CSS v4** — Using the new CSS-first config via `@tailwindcss/vite` plugin instead of a config file. This simplifies setup and is the recommended approach for Tailwind v4.

2. **TanStack Query for server state** — Task data fetching is wrapped in `useTasksQuery` which provides caching, loading states, and automatic refetching. This separates server state from client state cleanly.

3. **Zustand for client state** — Board columns, auth session, notifications, and theme are managed in Zustand stores with localStorage persistence where needed. Each store has a single responsibility.

4. **API abstraction layer** — `api/tasks.ts` transforms `mock-data.json` into the application's `Task[]` type. This means the data source can be swapped for a real backend without changing any UI components.

5. **Module-level token storage** — Access and refresh tokens are stored in module-level variables in `api/client.ts` (not in React state) to allow the fetch interceptor to work outside the React component tree.

6. **React.memo on list items** — `TaskCard` and `Column` are wrapped in `React.memo` to prevent unnecessary re-renders during drag operations when only one card changes position.

## Known Limitations

- Task create/update/delete operations are simulated with in-memory state — changes do not persist to a real backend
- The notification polling uses JSONPlaceholder which returns the same 5 posts on each request, so "new" notifications are limited
- No undo for drag-and-drop operations (listed as bonus, not implemented)
- No filter by priority/assignee on the board (listed as bonus, not implemented)
- No custom date-range filtering on analytics (listed as bonus, not implemented)

## License

This project was built as part of a frontend engineering evaluation.
