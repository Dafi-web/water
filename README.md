# Tsegay Brhane WWC — Website

Monorepo layout for easy deployment:

| Folder | Role | Deploy to |
|--------|------|-----------|
| `frontend/` | React (Vite) | **Vercel** |
| `backend/` | Express + MongoDB API | **Render** |

## Local development

From repository root:

```bash
npm install
```

Terminal 1 — API (port 5000):

```bash
npm run dev:backend
```

Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `ADMIN_KEY`, and optional SMTP / `ALLOWED_ORIGINS`.

Terminal 2 — UI:

```bash
npm run dev:frontend
```

Copy `frontend/.env.example` to `frontend/.env`. For local dev leave `VITE_API_BASE_URL` empty so Vite proxies `/api` to `http://localhost:5000`.

- Site: http://localhost:5173/#/
- Admin: http://localhost:5173/#/admin  
- Admin key: `tsegay@shire` (or value of `ADMIN_KEY` in `backend/.env`)

## Vercel (frontend)

1. New Project → import this repo.
2. **Root Directory:** `frontend`
3. Build: `npm run build` (default)
4. Output: `dist` (default for Vite)
5. Environment variables: set `VITE_API_BASE_URL` to your **Render** backend URL, e.g. `https://your-service.onrender.com` (no trailing slash).

## Render (backend)

1. New **Web Service** → connect repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Environment: paste variables from `backend/.env.example` (`MONGO_URI`, `ADMIN_KEY`, `ALLOWED_ORIGINS` including your Vercel URL, SMTP if you use email).

After deploy, add the Render URL to `ALLOWED_ORIGINS` so the browser is allowed to call the API from your Vercel domain.

Optional: repository root includes `render.yaml` for a Blueprint-style deploy (service `rootDir: backend`).
