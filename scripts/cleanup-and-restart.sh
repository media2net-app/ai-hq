#!/bin/bash

echo "🧹 Uitvoeren van cleanup..."
echo ""

# Kill oude Node processen
cd "$(dirname "$0")/.."
node scripts/kill-node-processes.js

# Herstart Finder
echo ""
echo "🔄 Herstarten Finder..."
killall Finder

# Clear system cache (vereist admin)
echo ""
echo "💾 Clearing system cache (vereist wachtwoord)..."
sudo purge

echo ""
echo "✅ Cleanup voltooid!"
echo ""
echo "🔄 Laptop wordt nu herstart..."
echo "   (Je hebt 10 seconden om te annuleren met Ctrl+C)"
sleep 10

# Herstart Mac
sudo shutdown -r now
