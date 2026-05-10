# ⚡ TaskFlow — Premium Team Task Manager

> A world-class, production-ready Team Task Manager SaaS built with Next.js 15, Framer Motion, Zustand, and a stunning dark luxury UI inspired by Linear, Vercel, and Raycast.

![TaskFlow](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)
![Framer](https://img.shields.io/badge/Framer_Motion-11-pink?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

### 🔐 Authentication
- Split-screen login/signup with animated left panel
- Testimonial carousel with auto-rotate
- Demo account quick-login (Admin & Member)
- Password show/hide toggle
- Form validation & loading states

### 📊 Dashboard
- KPI cards with animated counters (Total, Completed, In Progress, Overdue)
- Area chart — Task velocity (Created vs Completed over 7 days)
- Bar chart — Daily team velocity score
- Animated productivity ring (SVG)
- Active project progress bars
- Team productivity mini-cards

### 📁 Projects
- Card grid with per-project color accents
- Animated progress bars
- Status filter pills (Active, On Hold, Completed, Archived)
- Real-time search
- Create / update status / delete modals
- Admin-only controls

### ✅ Tasks — Kanban + List
- **Drag-and-drop Kanban** across 4 columns (Todo → In Progress → Review → Done)
- **List view** with sortable columns
- Priority indicators with color-coded left stripe
- Create / Edit / Delete with full modal
- Overdue detection with red badge
- Assignee avatar display

### 👥 Team Management
- Member cards with online indicator
- Productivity bar per member
- Task stats (Total / Done / Active)
- Role toggle (Admin ↔ Member) — Admin only
- Avatar gradients per member

### 🔔 Notifications
- Bell with unread badge count
- Mark individual / all as read
- Relative timestamps (2h ago, just now)

### ⌘ Command Menu (⌘K / Ctrl+K)
- Instant search across tasks & projects
- Quick navigation shortcuts
- Keyboard-driven (ESC to close)

### 🎨 Design System
- Dark luxury aesthetic (#02040A base)
- Glassmorphism panels (backdrop-blur)
- Mesh gradient backgrounds
- CSS grid overlay texture
- Noise texture overlay
- Framer Motion page animations
- Smooth card hover lifts
- Animated gradient text
- Custom scrollbar

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| State | Zustand |
| Charts | Recharts |
| Toasts | Sonner |
| Icons/Emoji | Custom emoji system |
| Database | Supabase (optional — ships with mock data) |
| Deployment | Railway / Vercel |

---

## 🚀 Local Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
npm install
```

### 2. Environment variables (optional — app runs without Supabase)

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## 🎯 Demo Accounts

The app ships with full built-in mock data — **no Supabase required**.

| Role | Email | Access |
|------|-------|--------|
| **Admin** | alex@taskflow.io | Full access — create/delete/manage |
| **Member** | sam@taskflow.io | View + update tasks only |

Click the **"Admin Demo"** or **"Member Demo"** buttons on the login page for instant access.

---

## ☁️ Deploy on Railway (Recommended)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: TaskFlow v2 — premium team task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2 — Deploy

1. Go to [railway.app](https://railway.app) → **New Project**
2. Click **"Deploy from GitHub Repo"** → select your repo
3. Railway auto-detects Next.js ✓
4. Go to **Variables** tab → add:
   ```
   NEXT_PUBLIC_SITE_URL=https://your-app.up.railway.app
   ```
5. Click **Deploy** → live in ~2 minutes ✅

### Alternative — Vercel

```bash
npx vercel --prod
```

---

## 🗄 Supabase Setup (Production Persistence)

### Step 1 — Create project
Go to [supabase.com](https://supabase.com) → New Project → copy **URL** and **Anon Key**

### Step 2 — Run schema
Open **SQL Editor** in Supabase dashboard → paste & run `supabase-schema.sql`

### Step 3 — Enable auth
**Authentication → Providers → Email** → Enable email login

### Step 4 — Set env vars
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 5 — Make yourself admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📂 Project Structure

```
taskflow/
├── app/
│   ├── auth/
│   │   └── page.tsx          # Split-screen login/signup
│   ├── dashboard/
│   │   ├── layout.tsx        # Sidebar + topbar + CMD menu
│   │   ├── page.tsx          # Analytics dashboard
│   │   ├── projects/
│   │   │   └── page.tsx      # Project cards grid
│   │   ├── tasks/
│   │   │   └── page.tsx      # Kanban + list view
│   │   └── team/
│   │       └── page.tsx      # Team members + roles
│   ├── not-found/
│   │   └── page.tsx          # 404 page
│   ├── layout.tsx            # Root layout + Sonner
│   ├── page.tsx              # Redirect handler
│   └── globals.css           # Full design system
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Helpers + chart data
├── store/
│   └── index.ts              # Zustand store + mock data
├── types/
│   └── index.ts              # TypeScript interfaces
├── supabase-schema.sql       # Full DB schema + RLS
├── .env.local.example        # Environment template
└── README.md
```

---

## 🎯 Role Capabilities

| Feature | Admin | Member |
|---------|-------|--------|
| View dashboard | ✅ | ✅ |
| View projects | ✅ | ✅ |
| Create projects | ✅ | ❌ |
| Delete projects | ✅ | ❌ |
| Update project status | ✅ | ❌ |
| View tasks | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| Edit all tasks | ✅ | Own only |
| Delete tasks | ✅ | ❌ |
| Drag tasks (kanban) | ✅ | ✅ |
| View team | ✅ | ✅ |
| Change member roles | ✅ | ❌ |

---

## 🎨 Design Tokens

```css
--bg-base:      #02040A   /* Deepest background */
--bg-surface:   #070B14   /* Sidebar */
--bg-elevated:  #0C1220   /* Cards */
--bg-overlay:   #111827   /* Modals */
--accent:       #6366F1   /* Indigo primary */
--accent-light: #818CF8   /* Indigo light */
--emerald:      #10B981   /* Success / Done */
--amber:        #F59E0B   /* Warning / Review */
--rose:         #F43F5E   /* Danger / Critical */
--sky:          #0EA5E9   /* Info / Low priority */
```

---

## 📹 Demo Video Script (2–5 min)

1. **Auth page** — show split-screen, testimonial carousel, click "Admin Demo"
2. **Dashboard** — KPI cards, area chart, productivity ring, team overview
3. **Projects** — filter by status, create new project, watch progress bar animate
4. **Tasks (Kanban)** — drag a task between columns, create new task with all fields
5. **Tasks (List)** — toggle to list view, edit a task, delete a task
6. **Team** — show productivity bars, click "Make Admin" to change a role
7. **⌘K Command menu** — press Cmd+K, search "auth", navigate
8. **Notifications** — click bell, show unread count, mark all read
9. **Mobile** — resize browser to show responsive sidebar drawer
10. **Logout** → login as Member → show restricted permissions

---

## 🏆 Interview Talking Points

**Architecture**
- App Router with server + client components separation
- Zustand for predictable global state with optimistic updates
- Mock data layer that seamlessly swaps with Supabase

**Performance**
- Static generation for all pages
- Framer Motion layout animations (no layout thrash)
- CSS variables for zero-JS theming

**Security**
- Supabase Row Level Security on all tables
- Role-based UI rendering (admin vs member)
- Protected routes via layout-level auth check

**UX**
- Drag-and-drop Kanban with HTML5 drag API
- ⌘K command palette (keyboard-first navigation)
- Animated counters, progress bars, and chart entrance animations

---

## 📄 License

MIT — Built for internship/assignment submission.
