# Deploying (Firebase Hosting + Render)

The app has two parts that deploy separately:

- **Backend** (FastAPI + scikit-learn + SHAP) → **Render** (free web service)
- **Frontend** (React/Vite static build) → **Firebase Hosting**

You deploy the backend first (to get its URL), then build the frontend pointing at that URL, then deploy the frontend.

---

## 1. Backend → Render

1. Push this repo to GitHub (already done if you're on the PR branch).
2. Go to <https://render.com> → **New** → **Blueprint**.
3. Connect this repository and pick the branch. Render reads [`render.yaml`](render.yaml) and provisions a free web service named `steel-property-api`.
4. Click **Apply** and wait for the first build/deploy (a few minutes — `shap`/`scikit-learn` are large).
5. When it's live, copy the service URL, e.g. `https://steel-property-api.onrender.com`.
6. Sanity-check it: open `https://<your-service>.onrender.com/health` — you should see `"status": "ok"`.

Notes:
- The free tier sleeps after ~15 min idle; the first request after sleeping takes ~30–60s to wake. That's normal.
- CORS is open (`ALLOWED_ORIGINS=*`) so any frontend can call it. To lock it to your Firebase site, change that env var in the Render dashboard to your Firebase URL (e.g. `https://your-project.web.app`) and redeploy.

---

## 2. Frontend → Firebase Hosting

Prereqs: `npm i -g firebase-tools` and a Firebase project (create one at <https://console.firebase.google.com>).

1. Create `frontend/.env.production` from the template and set your Render URL
   (this file is gitignored — it holds your own deployment URL):
   ```bash
   cp frontend/.env.production.example frontend/.env.production
   # then edit it:
   # VITE_API_BASE_URL=https://steel-property-api.onrender.com
   ```
2. Create `.firebaserc` from the template and set your Firebase **project ID**:
   ```bash
   cp .firebaserc.example .firebaserc
   # replace YOUR_FIREBASE_PROJECT_ID with your project id
   ```
3. Build the frontend with the production API URL baked in:
   ```bash
   cd frontend
   npm install
   npm run build      # outputs frontend/dist/
   cd ..
   ```
4. Log in and deploy (run from the project root, where `firebase.json` lives):
   ```bash
   firebase login
   firebase deploy --only hosting
   ```
5. Firebase prints your live URL, e.g. `https://your-project.web.app`. Open it.

---

## Updating later

- **Backend code change:** push to GitHub — Render auto-redeploys.
- **Frontend change:** `cd frontend && npm run build && cd .. && firebase deploy --only hosting`.

## Troubleshooting

- **Frontend loads but predictions fail / CORS error:** confirm `VITE_API_BASE_URL` in `.env.production` matches the Render URL exactly (no trailing slash), and that you rebuilt *after* setting it (the URL is baked in at build time).
- **First request is very slow:** the Render free service was asleep; it wakes on the first hit.
- **Render build fails on dependencies:** ensure `PYTHON_VERSION` in `render.yaml` is a version Render supports (3.13.x).
