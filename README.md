# AIO Tracker — Monorepo

A full-stack TypeScript monorepo containing the **API** and **Dashboard** for AIO Tracker, managed with npm workspaces.

---

## 📁 Project Structure

```
geo-project/
├── apps/
│   ├── aio-tracker-api/          # Express + MongoDB API
│   └── aio-tracker-dashboard/    # Vite frontend
├── package.json                  # Root workspace config
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v8+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/geo-project.git
cd geo-project

# Install all dependencies from root
npm install
```

### Environment Variables

Create a `.env` file inside `apps/aio-tracker-api/`:

```env
PORT=4000
NODE_DEV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>
DB_NAME=your_database_name
SERPAPI_KEY=your_serpapi_key
PLAYWRIGHT_HEADLESS=true
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/116.0.0.0 Safari/537.36
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file inside `apps/aio-tracker-dashboard/`:

```env
VITE_API_URL=http://localhost:4000/analyze
```

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## 🧑‍💻 Development

Run both apps concurrently from the root:

```bash
npm run dev
```

| App       | URL                    |
|-----------|------------------------|
| API       | http://localhost:4000  |
| Dashboard | http://localhost:5173  |

Run apps individually:

```bash
# API only
npm run dev -w apps/aio-tracker-api

# Dashboard only
npm run dev -w apps/aio-tracker-dashboard
```

---

## 🏗️ Build

```bash
# Build all apps
npm run build

# Build a specific app
npm run build -w apps/aio-tracker-api
npm run build -w apps/aio-tracker-dashboard
```

---

## 📦 Apps

### `apps/aio-tracker-api`

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB Atlas via Mongoose
- **Language:** TypeScript + ts-node / nodemon

### `apps/aio-tracker-dashboard`

- **Framework:** Vite
- **Language:** TypeScript

---

## 🛠️ Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Language  | TypeScript                    |
| API       | Express, Mongoose             |
| Frontend  | Vite                          |
| Database  | MongoDB Atlas                 |
| Monorepo  | npm workspaces + concurrently |
