#!/bin/bash
# Check for legacy imports from src to worker
# search for ../../worker/ or ../../../worker/

FOUND=$(grep -r "from.*worker/" apps/foundry-dashboard/src | grep "\.\./\.\.")
if [ -n "$FOUND" ]; then
  echo "❌ Found legacy imports in apps/foundry-dashboard/src:"
  echo "$FOUND"
  exit 1
fi

echo "✅ No legacy imports found in apps/foundry-dashboard/src"
exit 0