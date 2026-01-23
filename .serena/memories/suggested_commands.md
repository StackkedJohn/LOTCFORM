# Suggested Commands for LOTCFORM

## Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
# Starts server with nodemon for auto-reload on http://localhost:3000
```

### Start Production-Like Server
```bash
npm start
# Starts server with node (no auto-reload) on http://localhost:3000
```

### Change Port
```bash
PORT=8080 npm start
# Override default port 3000
```

## Testing Commands

### Manual Form Testing
1. Start server: `npm start`
2. Open browser: http://localhost:3000/index.html
3. Fill form and submit
4. Check `submissions/` directory for JSON files

### Check Server Health
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","message":"Server is running"}
```

### Test Form Submission (API)
```bash
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"relationship":"Caregiver","caregiverFirstName":"Test",...}'
```

## Git Commands

### Check Status
```bash
git status
```

### Commit Changes
```bash
git add .
git commit -m "Description of changes"
```

### Push to Remote
```bash
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

## Deployment Commands (Vercel)

### Deploy to Vercel
```bash
vercel deploy
# Or for production:
vercel --prod
```

### Check Deployment Logs
```bash
vercel logs
```

## File Management Commands

### View Submissions
```bash
ls -lh submissions/
# List all submission JSON files
```

### View Latest Submission
```bash
ls -t submissions/ | head -1 | xargs -I {} cat submissions/{}
# Show contents of most recent submission
```

### Clean Submissions Directory
```bash
rm submissions/submission_*.json
# Remove all submission files (use with caution)
```

## Debugging Commands

### View Server Logs
```bash
# Server logs are output to console when running npm start or npm run dev
# Check terminal where server is running
```

### Check Environment Variables
```bash
cat .env
# View configured environment variables
```

### Verify Node/npm Versions
```bash
node --version
npm --version
```

## Neon CRM Testing

### Test Neon Configuration
```bash
# Check if NEON_ORG_ID and NEON_API_KEY are set in .env
grep NEON .env
```

### View Neon Submission in Console
```bash
# Watch server output when submitting form
# Look for: "Successfully submitted to Neon CRM:" or error messages
npm run dev
```

## Utility Commands (macOS/Darwin)

### Find Files
```bash
find . -name "*.js" -type f
# Find all JavaScript files
```

### Search in Files
```bash
grep -r "searchAccountByEmail" .
# Search for text in all files
```

### View File Contents
```bash
cat index.html | head -50
# Show first 50 lines
```

### Directory Navigation
```bash
cd /Users/johnlohr/StackkedDev/LOTCFORM
pwd
ls -la
```

## Troubleshooting Commands

### Port Already in Use
```bash
lsof -ti:3000 | xargs kill -9
# Kill process on port 3000
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check for Node Processes
```bash
ps aux | grep node
# List all running Node processes
```
