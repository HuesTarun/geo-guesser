# GeoGuesser Challenge

A modern, full-stack GeoGuesser game built with React, Hono, tRPC, Drizzle ORM, and Socket.io. Play singleplayer challenge games, create multiplayer lobbies with friends, and chat in real-time.

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### 2. Environment Setup
Create a `.env` file in the root directory and copy the contents from `.env.example`:
```ini
APP_ID=geotag-challenge
APP_SECRET=your_jwt_secret_key
DATABASE_URL=your_supabase_connection_string
OWNER_UNION_ID=owner123
```

> [!NOTE]
> * For **local development**, you can use the direct connection string (port `5432`).
> * For **production/Render deployment**, you must use the Supabase Connection Pooler connection string (port `6543`) to support IPv4 networks and serverless environments.

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Servers
Start both the Vite frontend and Hono backend servers:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start playing!

---

## 🛠️ Build & Production

To build the client and package the server for production:
```bash
npm run build
npm run start
```

## 🗃️ Database Commands

* **Generate migrations:** `npm run db:generate`
* **Push schema directly:** `npm run db:push`
* **Run migrations:** `npm run db:migrate`
