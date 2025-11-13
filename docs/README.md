# GitHub Developer Contribution Tracker (Node.js)

A comprehensive Node.js script to track developer contributions in your GitHub repositories with daily statistics, leaderboards, and inactive developer reports.

## Features

✅ **Daily Commit Tracking** - Track lines of code committed by each developer on a daily basis  
✅ **Leaderboards** - Top 10 developers by daily, weekly, and monthly contributions  
✅ **Inactive Developer Reports** - Identify developers who haven't committed on a given day  
✅ **Detailed Statistics** - Lines added, deleted, net changes, and commit counts  
✅ **JSON Export** - Export reports for further analysis  
✅ **Multiple Time Periods** - Daily, weekly, monthly, or all at once  
✅ **Beautiful CLI Tables** - Formatted output with CLI tables  

## Prerequisites

1. **Node.js 14.0.0 or higher**
2. **npm** (comes with Node.js)
3. **GitHub Personal Access Token** with `repo` scope

### Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Dev Tracker")
4. Select scopes: `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

## Installation

1. Clone or download the script files

2. Install dependencies:
```bash
npm install
```

This will install:
- `axios` - HTTP client for GitHub API
- `cli-table3` - Beautiful CLI tables
- `commander` - Command-line interface

3. Make the script executable (optional, Unix/Linux/Mac):
```bash
chmod +x github-dev-tracker.js
```

## Usage

### Basic Usage

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo your-repo-name \
  --token your_github_token_here
```

### Daily Report Only

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period daily
```

### Weekly Report Only

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period weekly
```

### Monthly Report Only

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period monthly
```

### All Reports (Daily + Weekly + Monthly)

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period all
```

### Inactive Developers Report

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --inactive
```

### Specific Date

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --date 2024-11-10 \
  --period daily
```

### Export to JSON

```bash
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period daily \
  --export
```

### Combined Example (Recommended)

```bash
# Get all reports + inactive devs + export for today
node github-dev-tracker.js \
  --org SoluLab \
  --repo rentzi-backend \
  --token ghp_xxxxxxxxxxxxxxxxxxxx \
  --period all \
  --inactive \
  --export
```

## Command Line Arguments

| Argument | Required | Description | Example |
|----------|----------|-------------|---------|
| `--org` | Yes | GitHub organization name | `SoluLab` |
| `--repo` | Yes | Repository name | `rentzi-backend` |
| `--token` | Yes | GitHub personal access token | `ghp_xxxxx` |
| `--period` | No | Report period (default: all) | `daily`, `weekly`, `monthly`, `all` |
| `--date` | No | Specific date (default: today) | `2024-11-10` |
| `--inactive` | No | Show inactive developers | Flag (no value) |
| `--export` | No | Export to JSON files | Flag (no value) |

## Example Output

### Daily Leaderboard
```
================================================================================
                  SoluLab GitHub Contribution Report
DAILY REPORT - 2024-11-13
================================================================================

┌──────┬────────────────────┬─────────────────────────┬──────────┬────────────┬────────────┬────────────┐
│ Rank │ Username           │ Name                    │ Commits  │ Additions  │ Deletions  │ Net Lines  │
├──────┼────────────────────┼─────────────────────────┼──────────┼────────────┼────────────┼────────────┤
│ 1    │ john-doe           │ John Doe                │ 12       │ +1250      │ -450       │ 800        │
├──────┼────────────────────┼─────────────────────────┼──────────┼────────────┼────────────┼────────────┤
│ 2    │ jane-smith         │ Jane Smith              │ 8        │ +890       │ -320       │ 570        │
├──────┼────────────────────┼─────────────────────────┼──────────┼────────────┼────────────┼────────────┤
│ 3    │ dev-kumar          │ Kumar Singh             │ 6        │ +650       │ -200       │ 450        │
└──────┴────────────────────┴─────────────────────────┴──────────┴────────────┴────────────┴────────────┘

                                   SUMMARY
--------------------------------------------------------------------------------
Total Developers Active: 15
Total Commits: 87
Total Lines Added: +12,450
Total Lines Deleted: -3,200
Net Lines Changed: 9,250
--------------------------------------------------------------------------------
```

### Inactive Developers Report
```
================================================================================
                      INACTIVE DEVELOPERS REPORT
Date: 2024-11-13
================================================================================

The following 5 developer(s) have NOT committed today:

  • developer-1
  • developer-2
  • developer-3
  • developer-4
  • developer-5
```

## Exported JSON Format

When using `--export`, JSON files are created with the following structure:

```json
{
  "john-doe": {
    "commits": 12,
    "additions": 1250,
    "deletions": 450,
    "netLines": 800,
    "commitShas": ["abc123...", "def456..."],
    "email": "john@solulab.com",
    "name": "John Doe"
  },
  "jane-smith": {
    "commits": 8,
    "additions": 890,
    "deletions": 320,
    "netLines": 570,
    "commitShas": ["ghi789...", "jkl012..."],
    "email": "jane@solulab.com",
    "name": "Jane Smith"
  }
}
```

## Environment Variables (Alternative to CLI arguments)

You can also set environment variables instead of passing arguments every time:

```bash
# Linux/Mac
export GITHUB_ORG="SoluLab"
export GITHUB_REPO="rentzi-backend"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# Windows (Command Prompt)
set GITHUB_ORG=SoluLab
set GITHUB_REPO=rentzi-backend
set GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Windows (PowerShell)
$env:GITHUB_ORG="SoluLab"
$env:GITHUB_REPO="rentzi-backend"
$env:GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
```

Then modify the script to read from environment variables if arguments aren't provided.

## Automation with Cron Jobs

### Linux/Mac - Daily Report at 6 PM
```bash
# Edit crontab
crontab -e

# Add this line (adjust paths)
0 18 * * * cd /path/to/script && node github-dev-tracker.js --org SoluLab --repo rentzi-backend --token YOUR_TOKEN --period daily --inactive > /path/to/logs/report-$(date +\%Y-\%m-\%d).txt 2>&1
```

### Windows - Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 6 PM)
4. Action: Start a program
5. Program: `node`
6. Arguments: `C:\path\to\github-dev-tracker.js --org SoluLab --repo rentzi-backend --token YOUR_TOKEN --period daily --inactive`

## Use as a Module

You can also import and use this as a module in your own Node.js scripts:

```javascript
const GitHubDevTracker = require('./github-dev-tracker');

async function customReport() {
    const tracker = new GitHubDevTracker('SoluLab', 'rentzi-backend', 'your_token');
    
    // Get daily stats
    const dailyStats = await tracker.getDailyReport();
    
    // Create custom leaderboard
    const top5 = tracker.createLeaderboard(dailyStats, 5);
    
    // Your custom logic here
    console.log('Top 5 developers:', top5);
    
    // Export
    await tracker.exportToJson(dailyStats, 'custom-report.json');
}

customReport();
```

## Troubleshooting

### Issue: "Error: Cannot find module 'axios'"
**Solution:** Run `npm install` to install dependencies

### Issue: "Error fetching commits: 401"
**Solution:** Your GitHub token is invalid or expired. Generate a new one

### Issue: "Error fetching commits: 403"
**Solution:** Rate limit exceeded. Wait an hour or use a different token

### Issue: "Error fetching commits: 404"
**Solution:** Check that the organization and repository names are correct and that your token has access to the repository

### Issue: Script is slow
**Solution:** This is normal for repositories with many commits. The script needs to fetch detailed stats for each commit. Consider:
- Running reports during off-hours
- Reducing the date range
- Caching results

## API Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests per hour
- Each commit requires 2 API calls (list + details)
- For large repositories, consider running during off-peak hours

## Security Best Practices

1. **Never commit your GitHub token** to version control
2. Use environment variables or a `.env` file (add to `.gitignore`)
3. Rotate tokens regularly
4. Use tokens with minimum required permissions
5. Consider using GitHub Apps for production use

## Extending the Script

### Add Slack Notifications
```javascript
// Add at the end of printReport method
const axios = require('axios');

async function sendToSlack(message) {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: message
    });
}
```

### Add Email Reports
```javascript
const nodemailer = require('nodemailer');

async function emailReport(stats) {
    // Configure nodemailer and send email
}
```

### Add Database Storage
```javascript
const mongoose = require('mongoose');

async function saveToDB(stats) {
    // Save to MongoDB or your preferred database
}
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub API documentation: https://docs.github.com/en/rest
3. Contact your team lead

## License

MIT License - Feel free to modify and use for your organization's needs.

---

**Made with ❤️ for SoluLab Development Team** 