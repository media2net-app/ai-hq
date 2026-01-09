# Geheugen Optimalisatie Guide

Je geheugengebruik is momenteel **99.83%** - dit is kritiek hoog. Hier zijn praktische stappen om dit te verlagen:

## 🚨 Directe Acties (Nu Doen)

### 1. Kill Oude Node.js Processen
```bash
npm run memory:cleanup
```
Of handmatig:
```bash
node scripts/kill-node-processes.js
```

### 2. Sluit Ongebruikte Applicaties
- **Command+Q** op alle apps die je niet gebruikt
- Check Activity Monitor (Spotlight: `Activity Monitor`)
- Sluit vooral:
  - Oude terminal windows
  - Ongebruikte code editors
  - Oude browser instances

### 3. Browser Cleanup
Je hebt **36 browser processen** draaien:
- Sluit onnodige tabs in Chrome/Safari
- Herstart je browser volledig
- Gebruik een tab manager extensie

### 4. Cursor Cleanup
Cursor Helper processen gebruiken veel geheugen:
- Sluit ongebruikte Cursor windows
- Herstart Cursor
- Sluit projecten die je niet gebruikt

## 🛠️ System Commands

### Clear System Cache
```bash
sudo purge
```
(Vereist admin wachtwoord - dit geeft geheugen vrij)

### Herstart Finder
```bash
killall Finder
```

### Check Top Memory Consumers
```bash
npm run memory:analyze
```

## 📊 Monitoring

De dashboard toont nu automatisch een waarschuwing wanneer geheugengebruik > 80% is, met praktische tips.

## 🔄 Langetermijn Oplossingen

1. **Upgrade RAM** (als mogelijk)
   - Je hebt 16GB, overweeg 32GB voor development

2. **Memory Management**
   - Gebruik minder tabs tegelijk
   - Sluit apps die je niet gebruikt
   - Herstart regelmatig

3. **Development Setup**
   - Gebruik één dev server tegelijk
   - Kill oude processen regelmatig
   - Monitor met `npm run memory:analyze`

## ⚡ Quick Wins

1. **Nu doen:**
   ```bash
   npm run memory:cleanup
   ```

2. **Sluit onnodige tabs** in je browser

3. **Herstart Cursor** om oude processen te killen

4. **Clear cache:**
   ```bash
   sudo purge
   ```

5. **Als laatste redmiddel:** Herstart je Mac
