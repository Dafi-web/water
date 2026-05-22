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

**Option A (recommended):** deploy only the API folder

2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`

**Option B:** deploy from repository root (monorepo)

2. **Root Directory:** *(leave empty or `.`)*
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`  
   (root `package.json` runs the `backend` workspace.)
5. Environment variables (Render → **Environment**):

| Name | Value |
|------|--------|
| `MONGO_URI` | `mongodb+srv://wediabrhana_db_user:yesno%401212@cluster0.c6lfh4z.mongodb.net/?appName=Cluster0` |
| `ADMIN_KEY` | `tsegay@shire` |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://water-frontend-kappa.vercel.app` |
| `ADMIN_EMAIL` | your email (optional, for request notifications) |
| `SMTP_*` | optional Gmail/app-password settings |

**MongoDB password note:** if password is `yesno@1212`, the URI must use `yesno%401212` (not the raw `@`).

**Vercel** `VITE_API_BASE_URL`: `https://water-5zvk.onrender.com` (your Render service URL, no trailing slash).

After changing env on Render, run **Manual Deploy**.

Optional: repository root includes `render.yaml` for a Blueprint-style deploy (service `rootDir: backend`).
