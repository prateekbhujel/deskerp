#!/usr/bin/env bash

set -euo pipefail

HOST="127.0.0.1"
PORT="8000"

if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"${PORT}" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "Laravel server already running on ${HOST}:${PORT}. Reusing existing server."

    # Keep process alive so npm run dev can continue running Vite in the same terminal.
    while true; do
        sleep 3600
    done
fi

php artisan serve --host="${HOST}" --port="${PORT}"
