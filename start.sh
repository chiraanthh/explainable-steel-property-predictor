#!/usr/bin/env bash
# =============================================
#  Explainable Steel-Alloy Property Predictor
#  macOS / Linux launcher (counterpart to start.bat)
# =============================================
set -euo pipefail

# Always run from the project root (the directory this script lives in).
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

BACKEND_PORT=8080
FRONTEND_PORT=5173
VENV_DIR=".venv"

echo "============================================="
echo "  Explainable Steel-Alloy Property Predictor"
echo "============================================="

# --- Python virtual environment -------------------------------------------
if [ ! -d "$VENV_DIR" ]; then
  echo "Creating Python virtual environment (.venv)..."
  python3 -m venv "$VENV_DIR"
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "Installing backend dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# --- Frontend dependencies ------------------------------------------------
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies (npm install)..."
  (cd frontend && npm install)
fi

# --- Free the ports if something is already listening ---------------------
free_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "Port ${port} in use; stopping PID(s): ${pids}"
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}
free_port "$BACKEND_PORT"
free_port "$FRONTEND_PORT"

# --- Cleanup on exit (Ctrl-C stops both servers) --------------------------
BACKEND_PID=""
FRONTEND_PID=""
cleanup() {
  echo ""
  echo "Shutting down servers..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# --- Start backend (FastAPI) ----------------------------------------------
echo "Starting backend (FastAPI) on http://127.0.0.1:${BACKEND_PORT} ..."
python -m uvicorn backend.app:app --host 127.0.0.1 --port "$BACKEND_PORT" > uvicorn.run.log 2>&1 &
BACKEND_PID=$!

# Wait for the backend to answer /health (model trains on first launch).
echo -n "Waiting for backend"
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${BACKEND_PORT}/health" >/dev/null 2>&1; then
    echo " - ready."
    break
  fi
  echo -n "."
  sleep 1
done

# --- Start frontend (Vite) ------------------------------------------------
echo "Starting frontend (Vite) on http://127.0.0.1:${FRONTEND_PORT} ..."
(cd frontend && npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" > ../vite.run.log 2>&1) &
FRONTEND_PID=$!

# Wait for Vite, then open the browser.
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

URL="http://127.0.0.1:${FRONTEND_PORT}"
if command -v open >/dev/null 2>&1; then
  open "$URL"            # macOS
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"        # Linux
fi

echo ""
echo "============================================="
echo "  Both servers are running!"
echo "  Backend:  http://127.0.0.1:${BACKEND_PORT}  (docs at /docs)"
echo "  Frontend: ${URL}"
echo ""
echo "  Logs: uvicorn.run.log / vite.run.log"
echo "  Press Ctrl-C to stop both servers."
echo "============================================="

# Keep the script alive while the servers run.
wait
