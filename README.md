<h1 align="center">TaskFlow</h1>

<p align="center">
  <strong>Real-Time Collaborative Task Management Platform</strong><br/>
  <em>Inspired by Trello & Jira — Built with Next.js 16, Socket.io & Prisma</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📸 Overview

TaskFlow is a production-grade, real-time task management application that enables teams to collaborate seamlessly on projects with instant live updates. Featuring a drag-and-drop Kanban board, team-based project organization, a comprehensive admin dashboard, and WebSocket-powered real-time synchronization — every change is reflected instantly across all connected clients.

---

## 🚀 Demo Accounts

Log in immediately using these pre-configured accounts:

| Account | Email | Password | Role | Team | Description |
|---------|-------|----------|------|------|-------------|
| **Admin** | `admin@taskflow.com` | `admin123` | 🔴 Admin | — | Full admin dashboard access — manage all users, teams, projects & tasks |
| **Ahmed** | `ahmed@test.com` | `password123` | Member | Engineering Team | Standard user — has a team, project ("Website Redesign"), and sample tasks |
| **Sara** | `sara@test.com` | `password123` | Member | *(none)* | New user — no team yet, can create or join one |

> **💡 Tip:** Open two browser tabs with different accounts to see real-time updates in action. When Ahmed moves a task on the Kanban board, other team members viewing the same project will see it update instantly.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Register with name, email, password, and optional team name
- Login with email and password
- JWT-based authentication with 7-day token expiry
- Role-based access control (`admin` / `member`)
- Session persistence across page reloads via localStorage
- Protected routes — unauthenticated users see only the login page

### 🏢 Teams System
- Create a team during registration or from the sidebar
- Join existing teams via team ID
- All team members share the same projects
- Team member avatars displayed in the sidebar
- Users without a team are prompted to create or join one with a visual hint
- Project creation is locked until the user belongs to a team

### 📁 Projects
- Create projects with name and description
- Project dashboard with stats cards (total projects, tasks, team members, status)
- Click any project card to open the Kanban board
- Delete projects with confirmation dialog

### ✅ Tasks — Kanban Board with Drag & Drop
- Three status columns: **To Do**, **In Progress**, **Done**
- Drag and drop tasks between columns (powered by `@dnd-kit`)
- Create tasks with title, description, status, and assignee
- Assign tasks to any team member
- View and edit task details in a modal
- Delete tasks with confirmation
- Optimistic UI updates for instant feedback

### ⚡ Real-Time Updates (Socket.io)
- All task changes are broadcast instantly to other users in the same project
- Socket.io rooms per project — only users viewing the same project receive updates
- Automatic reconnection with pending room queue
- Real-time events:
  - `task:create` — new task appears instantly
  - `task:update` — task edits propagate immediately
  - `task:move` — drag-and-drop status changes sync live
  - `task:delete` — removed tasks disappear for everyone
  - `activity:new` — activity feed updates in real-time

### 📋 Activity Feed
- Toggle the activity panel from the project board header
- Chronological log of all actions with user attribution
- Timestamps displayed as relative time ("2 minutes ago")
- Real-time updates when new activities are logged

### 🛡️ Admin Dashboard
- **Full administrative control** over the entire platform
- Global stats overview: total users, teams, projects, tasks, and task status breakdown
- **Users Management** — View all users, change roles (admin/member), delete users
- **Teams Management** — View all teams with member/project counts, delete teams (cascade)
- **Projects Management** — View all projects across teams, delete any project
- **Tasks Management** — View and edit all tasks, change status, reassign, delete
- **Activity Feed** — Global activity log across all projects
- Only accessible to users with the `admin` role
- All admin API endpoints are protected with server-side role verification

### 🌙 Dark / Light Mode
- Toggle between light and dark themes from the header
- System preference detection on first visit
- Theme preference is persisted in localStorage
- Full dark mode support across all components including the admin dashboard

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (Turbopack) | Full-stack React framework with App Router |
| **UI** | React 19 + TypeScript 5 | Type-safe component architecture |
| **Styling** | Tailwind CSS 4 + shadcn/ui | Utility-first CSS + accessible component library |
| **State** | Zustand | Lightweight client-side state management |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable | Accessible drag-and-drop for Kanban board |
| **Backend** | Next.js API Routes | Serverless-style API endpoints |
| **Database** | Prisma ORM + SQLite | Type-safe database access with zero-config storage |
| **Real-Time** | Socket.io | WebSocket-based live updates (separate service on port 3003) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Secure token-based authentication with password hashing |
| **Gateway** | Caddy | Reverse proxy with automatic XTransformPort routing |

---

## 📂 Project Structure

```
taskflow/
├── prisma/
│   └── schema.prisma                    # Database models (User, Team, Project, Task, Activity)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts    # POST /api/auth/register
│   │   │   │   ├── login/route.ts       # POST /api/auth/login
│   │   │   │   └── me/route.ts          # GET  /api/auth/me
│   │   │   ├── admin/
│   │   │   │   ├── stats/route.ts       # GET  /api/admin/stats
│   │   │   │   ├── users/route.ts       # GET/PATCH/DELETE /api/admin/users
│   │   │   │   ├── teams/route.ts       # GET/DELETE /api/admin/teams
│   │   │   │   ├── projects/route.ts    # GET/DELETE /api/admin/projects
│   │   │   │   └── tasks/route.ts       # GET/PATCH/DELETE /api/admin/tasks
│   │   │   ├── teams/
│   │   │   │   ├── route.ts             # GET/POST /api/teams
│   │   │   │   └── [id]/route.ts        # POST /api/teams/:id (join)
│   │   │   ├── projects/
│   │   │   │   ├── route.ts             # GET/POST /api/projects
│   │   │   │   └── [id]/route.ts        # GET/DELETE /api/projects/:id
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts             # GET/POST /api/tasks
│   │   │   │   └── [id]/route.ts        # PATCH/DELETE /api/tasks/:id
│   │   │   └── activities/
│   │   │       └── route.ts             # GET /api/activities
│   │   ├── layout.tsx                   # Root layout with ThemeProvider + Toaster
│   │   ├── page.tsx                     # Main SPA entry (client-side view routing)
│   │   └── globals.css                  # Tailwind + CSS variables (light/dark)
│   ├── components/
│   │   ├── admin/
│   │   │   └── admin-dashboard.tsx      # Full admin dashboard with tabbed interface
│   │   ├── auth/
│   │   │   ├── login-form.tsx           # Login form with validation
│   │   │   └── register-form.tsx        # Registration form with team creation
│   │   ├── layout/
│   │   │   ├── app-header.tsx           # Header with theme toggle + user menu
│   │   │   └── app-sidebar.tsx          # Sidebar with team, admin nav, projects
│   │   ├── projects/
│   │   │   └── dashboard.tsx            # Dashboard with stats + project cards
│   │   ├── tasks/
│   │   │   └── kanban-board.tsx         # Kanban board with drag-and-drop columns
│   │   ├── activity/
│   │   │   └── activity-feed.tsx        # Real-time activity feed panel
│   │   ├── providers/
│   │   │   └── theme-provider.tsx       # next-themes provider wrapper
│   │   └── ui/                          # shadcn/ui components (40+ components)
│   ├── lib/
│   │   ├── api.ts                       # API client (all endpoint methods)
│   │   ├── auth.ts                      # JWT + bcrypt + requireAdmin utilities
│   │   ├── socket.ts                    # Socket.io client with room management
│   │   ├── db.ts                        # Prisma client singleton
│   │   └── utils.ts                     # Tailwind merge utility (cn)
│   ├── stores/
│   │   ├── auth-store.ts                # Zustand: user, token, isAuthenticated
│   │   └── ui-store.ts                  # Zustand: currentView, selectedProjectId, sidebar
│   └── hooks/
│       ├── use-toast.ts                 # Toast notification hook
│       └── use-mobile.ts                # Mobile breakpoint detection hook
├── mini-services/
│   └── task-socket/
│       ├── index.ts                     # Socket.io server (port 3003)
│       └── package.json                 # Socket.io dependencies
├── db/
│   └── custom.db                        # SQLite database file
├── public/
│   ├── logo.svg                         # App logo
│   └── robots.txt                       # SEO robots
├── .env                                 # Environment variables (DATABASE_URL)
├── Caddyfile                            # Reverse proxy configuration
├── package.json                         # Dependencies and scripts
├── tailwind.config.ts                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── next.config.ts                       # Next.js configuration
```

---

## 🗄️ Database Schema

### User
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | — | Display name |
| `email` | String | Unique | Login email |
| `password` | String | — | bcrypt hashed password |
| `role` | String | Default: `"member"` | `"admin"` or `"member"` |
| `teamId` | String? | FK → Team | Team membership (optional) |
| `createdAt` | DateTime | Auto | Account creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

### Team
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | — | Team name |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

### Project
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `name` | String | — | Project name |
| `description` | String | Default: `""` | Project description |
| `teamId` | String | FK → Team | Owning team |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

### Task
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `title` | String | — | Task title |
| `description` | String | Default: `""` | Task details |
| `status` | String | Default: `"todo"` | `"todo"`, `"in_progress"`, or `"done"` |
| `projectId` | String | FK → Project (cascade) | Parent project |
| `assignedTo` | String? | FK → User | Assigned team member |
| `createdAt` | DateTime | Auto | Creation timestamp |
| `updatedAt` | DateTime | Auto | Last update timestamp |

### Activity
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | String | PK, cuid | Unique identifier |
| `message` | String | — | Human-readable action description |
| `projectId` | String | FK → Project (cascade) | Related project |
| `userId` | String? | FK → User | User who performed the action |
| `createdAt` | DateTime | Auto | When the action occurred |

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user (optionally with team) |
| `POST` | `/api/auth/login` | — | Login and receive JWT token |
| `GET` | `/api/auth/me` | 🔑 JWT | Get current user profile with team info |

### Teams
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/teams` | 🔑 JWT | Get current user's team |
| `POST` | `/api/teams` | 🔑 JWT | Create a new team |
| `POST` | `/api/teams/:id` | 🔑 JWT | Join an existing team |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects` | 🔑 JWT | List projects for user's team |
| `POST` | `/api/projects` | 🔑 JWT | Create a new project |
| `GET` | `/api/projects/:id` | 🔑 JWT | Get project with tasks and members |
| `DELETE` | `/api/projects/:id` | 🔑 JWT | Delete a project |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tasks?projectId=` | 🔑 JWT | List tasks for a project |
| `POST` | `/api/tasks` | 🔑 JWT | Create a new task |
| `PATCH` | `/api/tasks/:id` | 🔑 JWT | Update task (title, status, assignee) |
| `DELETE` | `/api/tasks/:id` | 🔑 JWT | Delete a task |

### Activities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/activities?projectId=` | 🔑 JWT | Get activity feed for a project |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | 🔴 Admin | Global platform statistics |
| `GET` | `/api/admin/users` | 🔴 Admin | List all users with team/task info |
| `PATCH` | `/api/admin/users` | 🔴 Admin | Change user role (`admin`/`member`) |
| `DELETE` | `/api/admin/users` | 🔴 Admin | Delete a user (cannot delete self) |
| `GET` | `/api/admin/teams` | 🔴 Admin | List all teams with member/project counts |
| `DELETE` | `/api/admin/teams` | 🔴 Admin | Delete a team (cascades) |
| `GET` | `/api/admin/projects` | 🔴 Admin | List all projects across all teams |
| `DELETE` | `/api/admin/projects` | 🔴 Admin | Delete any project |
| `GET` | `/api/admin/tasks` | 🔴 Admin | List all tasks across all projects |
| `PATCH` | `/api/admin/tasks` | 🔴 Admin | Update any task |
| `DELETE` | `/api/admin/tasks` | 🔴 Admin | Delete any task |

> 🔑 JWT = requires authentication token · 🔴 Admin = requires `role: "admin"`

---

## ⚡ Socket.io Events

All real-time events use **project-based rooms** (`project:{projectId}`). Only users actively viewing a project receive its updates.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join:project` | Client → Server | `projectId` | Subscribe to a project's room |
| `leave:project` | Client → Server | `projectId` | Unsubscribe from a project's room |
| `task:create` | Bidirectional | `{ task, projectId }` | New task created in the project |
| `task:update` | Bidirectional | `{ task, projectId }` | Task fields updated |
| `task:move` | Bidirectional | `{ task, projectId, fromStatus, toStatus }` | Task moved between columns |
| `task:delete` | Bidirectional | `{ taskId, projectId }` | Task deleted from the project |
| `activity:new` | Bidirectional | `{ activity, projectId }` | New activity logged |
| `user:joined` | Server → Client | `{ socketId }` | Another user opened the project |
| `user:left` | Server → Client | `{ socketId }` | Another user left the project |

---

## 🧪 Testing Real-Time Collaboration

1. Open the app in **Browser Tab A** and log in as **Ahmed** (`ahmed@test.com`)
2. Open the app in **Browser Tab B** (incognito/private) and log in as **Admin** (`admin@taskflow.com`)
3. Both navigate to the same project (e.g., "Website Redesign")
4. Ahmed creates a task → Admin sees it appear instantly
5. Ahmed drags the task to "In Progress" → Admin's board updates live
6. Admin changes a task status from the Admin Dashboard → Ahmed sees the change
7. Click "Activity" toggle → both see actions in real-time

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** 18+ or **Bun** runtime
- **npm**, **yarn**, or **bun** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Shehabcf/Task-Managment
cd Task-Managment

# Install dependencies
npm install
# or: bun install

# Set up the database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database with demo data
npx prisma db seed
```

### Running the Development Server

```bash
# Start Next.js dev server (port 3000)
npm run dev

# Start Socket.io real-time service (port 3003)
cd mini-services/task-socket
bun install
bun run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=file:./db/custom.db
JWT_SECRET=your-secret-key-here
```

> **⚠️ Important:** Change `JWT_SECRET` to a strong, random string in production.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / Client                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  React   │  │ Zustand  │  │Socket.io │  │  API    │ │
│  │Components│◄─►│  Stores  │  │ Client   │  │ Client  │ │
│  └──────────┘  └──────────┘  └────┬─────┘  └────┬────┘ │
└──────────────────────────────────────┼────────────┼──────┘
                                       │            │
                              WebSocket│    HTTP    │
                                       │            │
┌──────────────────────────────────────┼────────────┼──────┐
│              Caddy Gateway (:81)     │            │      │
│         XTransformPort Routing       │            │      │
└──────────────────────────────────────┼────────────┼──────┘
                                       │            │
                    ┌──────────────────┼────────────┼───┐
                    │  Socket.io (:3003)            │   │
                    │  Project Rooms                │   │
                    │  Real-time Event Broadcasting │   │
                    └───────────────────────────────┘   │
                                                       │
                    ┌───────────────────────────────────┘
                    │  Next.js (:3000)
                    │  ┌─────────────┐  ┌──────────────┐
                    │  │  API Routes │  │  React SSR   │
                    │  │  /api/*     │  │  Pages       │
                    │  └──────┬──────┘  └──────────────┘
                    │         │
                    │  ┌──────┴──────┐
                    │  │   Prisma    │
                    │  │   ORM       │
                    │  └──────┬──────┘
                    │         │
                    │  ┌──────┴──────┐
                    │  │   SQLite    │
                    │  │  Database   │
                    │  └─────────────┘
                    └─────────────────────────────────
```

---

## 🔒 Security

- **Password Hashing** — All passwords are hashed with bcrypt (12 salt rounds)
- **JWT Authentication** — Tokens expire after 7 days; verified on every API request
- **Admin Authorization** — All admin endpoints verify the user's role from the database (not just the token)
- **SQL Injection Protection** — Prisma ORM parameterizes all queries
- **XSS Protection** — React's built-in escaping + Next.js security headers
- **Cascade Deletion** — Deleting a project removes all its tasks and activities; deleting a team unassigns all members

---

## 📜 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ using <strong>Next.js 16</strong> · <strong>Socket.io</strong> · <strong>Prisma</strong>
</p>