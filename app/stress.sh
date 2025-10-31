#!/bin/bash
# stress.sh - run CPU load for N seconds (default 60)
DURATION=${1:-60}
end=$((SECONDS+DURATION))
echo "Starting CPU stress for $DURATION seconds..."
while [ $SECONDS -lt $end ]; do
  openssl prime -generate -bits 1024 >/dev/null 2>&1 || true
done
echo "Done."
