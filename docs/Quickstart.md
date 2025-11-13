# 🚀 Quick Start Guide

Get started with the GitHub Developer Tracker in 5 minutes!

## Step 1: Install Node.js

Make sure you have Node.js installed (version 14 or higher):

```bash
node --version
```

If not installed, download from: https://nodejs.org/

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Dev Tracker"
4. Select scope: ✅ **repo** (all checkboxes under repo)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

## Step 4: Configure the Script

```bash
# Copy the example config
cp config.example.js config.js

# Edit config.js with your details
nano config.js   # or use your favorite editor
```

Update these values in `config.js`:
```javascript
organization: 'SoluLab',          // Your GitHub org
repository: 'your-repo-name',     // Your repo name
token: 'ghp_xxxxx...'            // Your GitHub token
```

## Step 5: Run Your First Report

### Option A: Using the Simple Runner (Recommended)

```bash
# Run all reports (daily + weekly + monthly)
node run-report.js

# Or run specific reports
node run-report.js daily
node run-report.js weekly
node run-report.js monthly
```

### Option B: Using Command Line Arguments

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo your-repo-name \
  --token ghp_xxxxx \
  --period all \
  --inactive
```

## 🎉 That's It!

You should now see beautiful reports showing:
- ✅ Developer leaderboards (top 10)
- ✅ Lines of code added/deleted
- ✅ Commit counts
- ✅ Inactive developers
- ✅ Exported JSON files (if enabled)

## Next Steps

### Automate Daily Reports

#### On Linux/Mac:
```bash
# Edit your crontab
crontab -e

# Add this line for daily reports at 6 PM
0 18 * * * cd /path/to/tracker && node run-report.js daily >> logs/report.log 2>&1
```

#### On Windows:
Use Task Scheduler:
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 6:00 PM
4. Action: Start a program
   - Program: `node`
   - Arguments: `C:\path\to\tracker\run-report.js daily`

### View Reports in Slack

Add to `config.js`:
```javascript
notifications: {
    slack: {
        enabled: true,
        webhookUrl: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
    }
}
```

### Email Reports

Add to `config.js`:
```javascript
notifications: {
    email: {
        enabled: true,
        recipients: ['team@solulab.com']
    }
}
```

## Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "401 Error"
Your GitHub token is wrong or expired. Generate a new one.

### "404 Error"
Check your organization and repository names.

### Script is slow
This is normal for large repos. Consider:
- Running during off-hours
- Focusing on specific time periods
- Using GitHub Actions for automation

## Examples

### Yesterday's Report
```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxx \
  --date 2024-11-12 \
  --period daily
```

### Last Week's Top Performers
```bash
node run-report.js weekly
```

### Export All Data
```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxx \
  --period all \
  --export
```

## Need Help?

1. Check the full README.md
2. Review the examples above
3. Check GitHub API docs: https://docs.github.com/en/rest
4. Contact your team lead

---

**Happy Tracking! 📊** 