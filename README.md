<div align="center">
  <img src="public/logo.svg" alt="Fochus Logo" width="120">
  <h1>Fochus</h1>
  <p>Manage Your Productivity and Focus Time</p>
</div>

<p align="center">
  <strong>Fochus</strong> is a modern, all-in-one personal productivity suite designed to help you stay organized and focused. It combines task management, note-taking, and a Pomodoro timer into a single, sleek, and intuitive interface.
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

## One-Line Install (Linux)

Any Linux machine with Docker — one command, zero configuration:

```bash
curl -sSL https://github.com/sudoeren/fochus/raw/main/install.sh | bash
```

Or if you prefer to review first:

```bash
git clone https://github.com/sudoeren/fochus.git
cd fochus
bash install.sh
```

The script will:
- Clone the repository
- Build a single Docker image (backend + frontend + SQLite)
- Start the container with auto-restart
- Open port `3000` in the firewall (if using `ufw`)
- Show your local and network access URLs

> **External access:** The app binds to `0.0.0.0:3000`. Access from anywhere on your network via `http://<server-ip>:3000`. For internet access, set up a reverse proxy (nginx, Caddy) or a tunnel (ngrok, Cloudflare Tunnel).

### Uninstall

```bash
bash <(curl -sSL https://github.com/sudoeren/fochus/raw/main/uninstall.sh)
```

Or from a local clone:

```bash
bash uninstall.sh
```

This stops the container, removes it, deletes the data volume and Docker image.

---

### Other Setup Methods

#### Node.js (Direct, No Docker)

```bash
git clone https://github.com/sudoeren/fochus.git
cd fochus
npm run setup    # installs deps, creates SQLite DB, generates Prisma
npm start        # runs backend + frontend simultaneously
```

Open **http://localhost:5173**.

#### Docker Compose

```bash
git clone https://github.com/sudoeren/fochus.git
cd fochus
docker-compose up -d --build
```

Open **http://localhost:3000**.

#### Development

```bash
# Terminal 1: Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run dev      # http://localhost:3001

# Terminal 2: Frontend
npm install
npm run dev      # http://localhost:5173
```

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
A: With the self-hosted Docker setup, data is stored in a SQLite database inside the `fochus_data` Docker volume. You can back up and restore via the Settings page.

**Q: Can I customize the Pomodoro timer?**  
A: Yes! You can customize work, short break, and long break durations, enable auto-start for breaks or work sessions, and set the long break interval — all from the settings panel inside the timer.

**Q: Is there a mobile version?**  
A: Fochus is intentionally desktop-first. A dedicated mobile experience is not planned for now.

**Q: How do I run tests?**  
A: Run `npm test` in the root for frontend tests or `cd backend && npm test` for backend tests. Both use Vitest.

---

## License

Distributed under the [MIT License](./LICENSE).

---


