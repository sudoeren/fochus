<div align="center">
  <img src="public/logo.svg" alt="Fochus Logo" width="120">
  <h1>Fochus</h1>
  <p>Manage Your Productivity and Focus Time</p>
</div>

<p align="center">
  <strong>Fochus</strong> is a modern, all-in-one personal productivity suite designed to help you stay organized and focused. It combines task management, note-taking, and a Pomodoro timer into a single, sleek, and intuitive interface.
</p>

<p align="center">
  <strong>Developer:</strong> Eren Çakar
</p>

<div align="center">

[Features](#features) •
[Installation](#installation) •
[FAQ](#faq) •
[License](#license)

</div>

---

## App Preview

Fochus comes with an eye-friendly dark mode and a spacious light mode. You can use the system theme or select manually according to your preference.

### Light and Dark Mode

<div align="center">
  <img src="screenshot_dark.png" alt="Fochus Dark Mode" width="100%" style="border-radius: 10px; margin-bottom: 20px;">
  <br>
  <em>Stylish and focus-enhancing Dark Mode</em>
  <br><br>
  <img src="screenshot_light.png" alt="Fochus Light Mode" width="100%" style="border-radius: 10px;">
  <br>
  <em>Clean and spacious Light Mode</em>
</div>

---

## Installation

You can use **Docker** (recommended) or manual installation methods to run the project.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/)

### Option 1: Quick Setup with Docker (Recommended)

```bash
# 1. Clone
git clone https://github.com/sudoeren/fochus.git
cd fochus

# 2. Start — no .env needed, everything works out of the box
docker-compose up -d --build
```

Open **http://localhost:3000** — that's it.

> `JWT_SECRET` is auto-generated on first run. To set a custom secret or override ports, copy `.env.example` to `.env` and edit.

### Option 2: Manual Installation (Development)

> Requires [Node.js](https://nodejs.org/) (v18+) and a running PostgreSQL instance.

#### Backend Setup

```bash
cd backend
cp .env.example .env   # edit DATABASE_URL to point to your PostgreSQL
npm install
npx prisma migrate dev
npm run dev
```

#### Frontend Setup

```bash
# New terminal, project root
npm install
npm run dev
```

Open **http://localhost:5173** (Vite dev server). The frontend proxies API calls to `http://localhost:3001`.

---

## Spotlight: Everything at Your Fingertips

Don't get lost in the app! Access your notes, tasks, and settings in seconds with the **Spotlight** feature (`/` key).

<div align="center">
  <img src="spotlight.png" alt="Spotlight Search Feature" width="80%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
</div>

---

## Features

Fochus is developed with user experience and efficiency in mind.

### Smart Notes

- **Rich Text Editor:** Format and detail your notes.
- **Pinning & Organization:** Keep important notes at the top.
- **Trash System:** Safely restore deleted notes or delete them permanently.
- **Task Integration:** Link your notes directly with your tasks.

### Advanced Task Management

- **Custom Lists:** Separate tasks into project-based lists and use color codes.
- **Recurring Tasks:** Create daily, weekly, or monthly routines.
- **Drag & Drop:** Easily sort tasks with `@hello-pangea/dnd`.
- **Subtasks:** Break down complex jobs into manageable small parts.
- **Smart Statuses:** Track Pending, Completed, or Deferred jobs.

### Integrated Pomodoro Timer

- **Focus Modes:** Built-in timer for Work, Short Break, and Long Break.
- **Session Tracking:** Automatically save sessions to track your productivity history.
- **Distraction-Free Interface:** Simplified view to help you stay in the flow.

---

## FAQ

**Q: What are the main keyboard shortcuts?**  
A: You can open the **Spotlight** with the `/` key to quickly access all features and search your data.

**Q: Where is my data stored?**  
A: Your data is stored securely in a local PostgreSQL database when using Docker or manual setup. Fochus also supports manual data backup and restore via the Settings page.

**Q: Can I customize the Pomodoro timer?**  
A: Yes! You can switch between Work, Short Break, and Long Break modes. Future updates will include custom duration settings.

**Q: Is there a mobile version?**  
A: Fochus is currently optimized for desktop use, but the interface is responsive. A dedicated mobile view is in our roadmap.

---

## License

Distributed under the MIT License. See `LICENSE` file for more information.

---

<div align="center">
  <p>Developed by <strong>Eren Çakar</strong></p>
</div>
