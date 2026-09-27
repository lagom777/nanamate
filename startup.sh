#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
python3 -m http.server 8080 --bind 0.0.0.0 --directory public/learn >>/tmp/app-startup.log 2>&1 &
