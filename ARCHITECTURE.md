# SprintDesk Architecture

Live app: https://grubpac-beta.vercel.app/  
Repository: https://github.com/Lokesh777/grubpac  
Demo: https://www.youtube.com/watch?v=4yAL1iukRbg

## Overview

SprintDesk is a single-page React application for sprint task management. The UI never talks to mock JSON or third-party APIs directly. Data flows through a service layer, then TanStack Query or Zustand, then components.

```
UI (pages / components)
        ↓
Hooks / TanStack Query
        ↓
API / service layer (src/api)
        ↓
DummyJSON | mock-data.json | JSONPlaceholder
```

## Tech stack

| Concern | Choice |
|---|---|
| UI | React 19 + TypeScript (strict) |
| Build | Vite |
| Server state | TanStack Query v5 |
| Client state | Zustand |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| DnD | @dnd-kit/core |
| Charts | Recharts |
| Tests | Vitest + React Testing Library |

## Routes

| Path | Auth | Description |
|---|---|---|
| `/login` | Public (redirects if already signed in) | DummyJSON login |
| `/dashboard` | Protected | Sprint summary + DataTable |
| `/board` | Protected | Kanban board |
| `/analytics` | Protected | Charts from live board state |

Route modules are loaded with `React.lazy` + `Suspense`.

## State split

**Server state (TanStack Query)**  
Task fetch from the mock service (`useTasksQuery`), notification polling (`pollNotifications`).

**Client state (Zustand)**  
- `authStore` — user, in-memory access token mirror, loading  
- `boardStore` — columns, tasks, persist to localStorage  
- `notificationStore` — inbox + unread, persist to localStorage  
- `themeStore` — light/dark  
- `toastStore` — ephemeral toasts  

**Local UI state**  
Drawer open, filters, form fields stay in components.

## Auth flow

1. `POST https://dummyjson.com/auth/login` with `expiresInMins: 1` (short-lived access token to exercise refresh).
2. Access token lives only in memory (`src/api/client.ts`).
3. Refresh token + user (no access token) persist via `src/api/tokenStorage.ts`:
   - Remember Me off → `sessionStorage` (survives reload, dies with the tab)
   - Remember Me on → `localStorage` with a 30-day expiry
4. On boot, `SessionInit` calls `/auth/refresh`. Until that finishes, a full-screen loader is shown.
5. `apiFetch` attaches `Authorization: Bearer <access>`. On 401 it refreshes once, retries the original request, and queues concurrent callers. Failed refresh clears storage and sends the user to `/login`.

## Board data

`src/api/tasks.ts` maps `src/data/mock-data.json` into app `Task` types and returns the first 30 tasks. Board mutations stay in Zustand so the mock file can be replaced with REST later without UI changes.

## Notifications

Every 30s the app polls `https://jsonplaceholder.typicode.com/posts?_limit=5`. New post IDs become notifications. Polling pauses while the tab is hidden. Toasts fire only if the panel is closed. The panel shows 20 items per page.

## Key directories

```
src/api/          HTTP + mock adapters
src/stores/       Zustand
src/hooks/        Query + toast helpers
src/components/   UI kit, board, auth, layout
src/pages/        Route screens
src/__tests__/    Unit tests
```
