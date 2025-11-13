# Quick Start Guide

Get started with GitHub Developer Contribution Tracker in 5 minutes!

---

## ⚡ Super Quick Start (TL;DR)

```bash
# 1. Install
npm install

# 2. Setup
copy .env.example .env
notepad .env
# Add your GitHub token

# 3. Run
npm start
```

Done! 🎉

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies (30 seconds)

```bash
cd C:\CN-Pro\SoluLab\Projects\GithubCommitScript
npm install
```

**What this does:** Installs required packages (axios, cli-table3, commander)

---

### Step 2: Get GitHub Token (2 minutes)

1. **Visit:** https://github.com/settings/tokens

2. **Click:** "Generate new token (classic)"

3. **Fill in:**
   - Name: `SoluLab Dev Tracker`
   - Expiration: 90 days (or No expiration)
   - Select scope: ✅ **repo** (Full control of private repositories)

4. **Generate and Copy** the token (starts with `ghp_`)

⚠️ **Important:** Copy it now! You won't see it again!

---

### Step 3: Create Environment File (1 minute)

```bash
# Copy example environment file
copy .env.example .env

# Open in editor
notepad .env
```

**Update these values:**

```env
# GitHub Organization (case-sensitive)
GITHUB_ORG=SoluLab

# Single repository for single-repo reports
GITHUB_REPO=rentzi-admin

# GitHub Personal Access Token (paste your token here)
GITHUB_TOKEN=ghp_paste_your_token_here

# Report settings
DEFAULT_PERIOD=all
LEADERBOARD_SIZE=10
EXPORT_JSON=true
SHOW_INACTIVE=true
SHOW_BREAKDOWN=true
```

**Save and close** the file.

**Security Note:** The `.env` file is automatically excluded from git (in `.gitignore`), so your token stays private! 🔒

---

### Step 4: Run Your First Report (30 seconds)

```bash
npm start
```

**You should see:**
```
📋 Auto-discovering repositories you have access to...
✅ Found 13 repositories in SoluLab

🔍 Analyzing 13 repositories...
```

**If you get an error:** See [Troubleshooting](#troubleshooting) below.

---

## 🎯 What You Can Do Now

### Daily Quick Check
```bash
npm start
```
Shows today's activity across all repos

### Weekly Team Review
```bash
npm run report:weekly
```
Shows last 7 days of activity

### Monthly Reports
```bash
npm run report:monthly
```
Shows last 30 days with repository breakdown

### Everything at Once
```bash
npm run report:all
```
Generates daily + weekly + monthly reports

---

## 📊 Understanding the Output

### Leaderboard
```
┌──────┬──────────────┬───────┬──────────┬───────────┐
│ Rank │ Username     │ Repos │ Commits  │ Net Lines │
├──────┼──────────────┼───────┼──────────┼───────────┤
│ 1    │ john-doe     │ 5     │ 28       │ 1,560     │
│ 2    │ jane-smith   │ 3     │ 18       │ 870       │
└──────┴──────────────┴───────┴──────────┴───────────┘
```

- **Rank:** Position in leaderboard (by net lines)
- **Username:** GitHub username
- **Repos:** Number of repositories contributed to
- **Commits:** Total number of commits
- **Net Lines:** Lines added minus lines deleted

### Repository Breakdown
```
┌────────────────────────────┬────────────┬──────────┐
│ Repository                 │ Developers │ Commits  │
├────────────────────────────┼────────────┼──────────┤
│ rentzy-be-user             │ 8          │ 45       │
│ EcoYield-energy-be         │ 6          │ 32       │
└────────────────────────────┴────────────┴──────────┘
```

Shows activity breakdown by repository

### Reports Location
```
reports/
├── daily/
│   └── multi_repo_daily_report_2025-11-13.json
├── weekly/
│   └── multi_repo_weekly_report_2025-11-13.json
└── monthly/
    └── multi_repo_monthly_report_2025-11-13.json
```

---

## 🎨 Quick Configuration Tips

### Track All SoluLab Repos (Default - Recommended)
Your `.env` file is already set up for this! Just leave it as is.

### Track All Repos (All Organizations)
```env
# In .env file
GITHUB_ORG=
# Leave GITHUB_ORG empty to discover repos from all organizations
```

### Track Specific Repos Only
```env
# In .env file
GITHUB_REPOS=rentzy-be-user,rentzi-admin,EcoYield-energy-be
# Comma-separated list of specific repositories
```

### Change Default Command
```env
# In .env file
DEFAULT_PERIOD=weekly
# Now 'npm start' will run weekly reports
```

---

## 🚀 Common Commands

```bash
# Most common
npm start                      # Daily report (default)

# Time periods
npm run report:daily           # Today only
npm run report:weekly          # Last 7 days
npm run report:monthly         # Last 30 days
npm run report:all             # All three reports

# Single repository
npm run report:single:daily    # One repo only
npm run report:single:weekly
npm run report:single:monthly
```

---

## 🐛 Troubleshooting

### Issue: "401 Bad credentials"

**Error message:**
```
Error fetching commits: Request failed with status code 401
```

**Fix:**
1. Your token is wrong, expired, or missing
2. Generate a new token: https://github.com/settings/tokens
3. Update `config/Config.js` with new token
4. Make sure you selected `repo` scope when creating token

---

### Issue: "Found 0 repositories"

**Error message:**
```
✅ Found 0 repositories in SoluLab
```

**Fix:**
1. Check organization name spelling: `SoluLab` (case-sensitive)
2. Verify you have access to SoluLab repositories
3. Try `organization: null` to see all repos you have access to
4. Ensure token has `repo` scope

---

### Issue: "Cannot find module"

**Error message:**
```
Error: Cannot find module 'axios'
```

**Fix:**
```bash
npm install
```

---

### Issue: "GITHUB_TOKEN not found"

**Error message:**
```
⚠️  ERROR: GITHUB_TOKEN not found in environment variables!
```

**Fix:**
1. Make sure `.env` file exists in root directory
2. Check that it contains: `GITHUB_TOKEN=ghp_your_token_here`
3. Make sure there are no spaces around `=`
4. Run `npm start` again

---

### Issue: "Config.js not found"

**Error message:**
```
Error: Cannot find module '../config/Config'
```

**Fix:**
1. Make sure you have `config/Config.js` file
2. This file should read from `.env` automatically
3. Run `npm install dotenv` to ensure dotenv is installed

---

### Issue: Token not working

**Test your token manually:**

```powershell
# Open PowerShell
$token = "ghp_your_token_here"
$headers = @{ Authorization = "token $token" }
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

**If this returns your info:** Token is valid, check config file  
**If this fails:** Token is invalid, generate a new one

---

## 💡 Pro Tips

### Tip 1: Use Auto-Discovery
Set `repositories: null` and let the tool find all your repos automatically!

### Tip 2: Check Reports Folder
All reports are saved in `reports/` folder organized by type.

### Tip 3: Daily Quick Checks
Just type `npm start` every morning for a quick activity overview.

### Tip 4: Weekly Reviews
Use `npm run report:weekly` for sprint reviews and team meetings.

### Tip 5: Track All Branches
The tool automatically tracks commits from ALL branches, not just main!

---

## 📚 Next Steps

### For Regular Use

**Morning standup:**
```bash
npm start
```

**Weekly sprint review:**
```bash
npm run report:weekly
```

**Monthly performance review:**
```bash
npm run report:all
```

### For Advanced Setup

1. **Read full documentation:** See `docs/README.md`
2. **Set up automation:** Schedule reports with Task Scheduler
3. **Secure your token:** Use environment variables
4. **Customize:** Adjust leaderboard size, export options

---

## ✅ Checklist

- [ ] Node.js installed (v14+)
- [ ] Dependencies installed (`npm install`)
- [ ] GitHub token generated (with `repo` scope)
- [ ] `.env` file created from `.env.example`
- [ ] `.env` file updated with your GitHub token
- [ ] First report runs successfully (`npm start`)
- [ ] Reports appear in `reports/` folder

---

## 🎯 Quick Reference Card

```
Commands:
  npm start              → Daily report (all repos)
  npm run report:weekly  → Weekly report
  npm run report:monthly → Monthly report
  npm run report:all     → All reports

Reports saved in:
  reports/daily/         → Daily reports
  reports/weekly/        → Weekly reports
  reports/monthly/       → Monthly reports

Configuration:
  .env                   → Your settings & token
  .env.example           → Template (safe to commit)

Token setup:
  github.com/settings/tokens → Get token
  Select: ✅ repo scope
  Update .env with token
```

---

## 🆘 Need Help?

### Quick Fixes
1. **401 error?** → Generate new token
2. **0 repos found?** → Check organization name
3. **Module not found?** → Run `npm install`
4. **Slow?** → Use specific repo list instead of auto-discover

### Documentation
- **Full Guide:** `docs/README.md`
- **API Docs:** https://docs.github.com/en/rest
- **Token Help:** https://github.com/settings/tokens

---

## 🎉 You're All Set!

Now just run:
```bash
npm start
```

And enjoy tracking your team's contributions! 📊

---

**Questions?** Check the full `README.md` in the docs folder! 