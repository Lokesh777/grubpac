# SprintDesk

Sprint management dashboard for software teams: auth, Kanban, analytics, and simulated real-time notifications.

## Submission links

| Item | URL |
|------|-----|
| GitHub | https://github.com/Lokesh777/grubpac |
| Live app | https://grubpac-beta.vercel.app/ |
| Demo video | https://www.youtube.com/watch?v=4yAL1iukRbg |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| API spec | [docs/openapi.yaml](./docs/openapi.yaml) |

## Tech stack

React 19, TypeScript (strict), Vite, TanStack Query v5, Zustand, Tailwind CSS v4, React Router, Recharts, @dnd-kit, Vitest + Testing Library.

## Setup

**Requirements:** Node.js 18+, npm 9+.

```bash
git clone https://github.com/Lokesh777/grubpac.git
cd grubpac
npm install
npm run dev
```

App runs at `http://localhost:5173`. No environment variables are required.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Unit tests |
| `npm run lint` | Oxlint |

### Demo login (DummyJSON)

- Username: `emilys`
- Password: `emilyspass`

## Features

### Auth
- DummyJSON `POST /auth/login` (`expiresInMins: 1` so refresh is exercised)
- Access token in memory only
- Refresh token in `sessionStorage`, or `localStorage` for 30 days when Remember Me is on
- Silent refresh + retry on 401
- Protected routes, login redirect, full-screen session check
- Logout clears memory and storage

### Board
- First 30 tasks from `src/data/mock-data.json` via `src/api/tasks.ts`
- Zustand board with localStorage persist
- @dnd-kit drag within and across Backlog / In Progress / Review / Done
- Drawer edit + comments, create, delete with confirm
- Filters, undo last move, keyboard DnD (bonus)

### Analytics
- Sprint velocity, status, priority breakdown, completion trend from live board data
- Responsive charts, date filter (bonus), PNG export (bonus)

### UI kit
Button, Input, Select, Modal, Toast, DataTable (Dashboard), Skeleton.

### Notifications
- Poll `https://jsonplaceholder.typicode.com/posts?_limit=5`
- Unread badge, 20 per page, mark read / mark all
- Persist Zustand + localStorage
- Pause polling when the tab is hidden
- Toast only when the panel is closed

## Tests

`npm run test` covers:

- `useToast`
- Board store add / move / delete
- Auth interceptor refresh + retry

## Known limitations

- Task writes stay in Zustand; they are not written back to `mock-data.json`.
- JSONPlaceholder always returns the same 5 posts, so after the first seed, new-notification toasts only appear if new post IDs show up.
- Lighthouse scores should be captured from the live URL (Performance ≥ 88, Accessibility ≥ 92).
- Chart PNG export is best-effort SVG rasterization of Recharts.
- No Storybook / axe-core (optional bonuses).
