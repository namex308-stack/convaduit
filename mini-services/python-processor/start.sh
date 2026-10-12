#!/bin/bash
# Start the Convaduit Python processor service.
# Uses setsid + nohup to fully detach from the parent shell so the
# service survives shell exits. Restarts automatically if it crashes.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="/tmp/python-processor.log"
PID_FILE="/tmp/python-processor.pid"

# If an existing instance is running, leave it alone
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Python processor already running (PID $(cat "$PID_FILE"))"
  exit 0
fi

# Start uvicorn fully detached
setsid nohup python3 -m uvicorn main:app \
  --host 127.0.0.1 \
  --port 3030 \
  > "$LOG_FILE" 2>&1 < /dev/null &

PID=$!
echo "$PID" > "$PID_FILE"
disown

# Wait for the service to be ready
for i in {1..15}; do
  if curl -s http://127.0.0.1:3030/health > /dev/null 2>&1; then
    echo "Python processor ready on port 3030 (PID $PID)"
    exit 0
  fi
  sleep 1
done

echo "ERROR: Python processor failed to start. See $LOG_FILE"
exit 1
