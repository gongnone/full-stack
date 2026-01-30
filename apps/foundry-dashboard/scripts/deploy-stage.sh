#!/bin/bash
set -euo pipefail

# Deploy foundry-dashboard to STAGE environment
# Usage: ./scripts/deploy-stage.sh

echo "🔨 Building frontend (vite)..."
npm run build

echo ""
echo "🚀 Deploying to stage (foundry-dashboard-stage)..."
npx wrangler deploy -e stage

echo ""
echo "✅ Stage deploy complete!"
echo "   URL: https://foundry-stage.williamjshaw.ca"
