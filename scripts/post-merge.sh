#!/bin/bash
set -euo pipefail

stop_port_listener() {
  local port="$1"
  local label="$2"
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -nP -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  elif command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "${port}/tcp" 2>/dev/null || true)"
  elif command -v ss >/dev/null 2>&1; then
    pids="$(ss -ltnp "sport = :$port" 2>/dev/null | sed -n 's/.*pid=\([0-9][0-9]*\).*/\1/p' | sort -u || true)"
  fi

  if [ -z "$pids" ]; then
    echo "No running ${label} listener found on port ${port}."
    return
  fi

  echo "Stopping ${label} listener on port ${port} so Replit reloads it from the checked-out branch."
  kill $pids 2>/dev/null || true
}

pnpm install --frozen-lockfile
pnpm --filter db push
stop_port_listener 21524 "CatStays frontend"
