#!/bin/bash

echo "🔄 Mac wordt herstart..."
echo ""
echo "Je hebt 5 seconden om te annuleren (Ctrl+C)"
sleep 5

# Herstart Mac (vereist admin wachtwoord)
sudo shutdown -r now
