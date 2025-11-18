# 📊 GitHub SoluLab Analytics

A powerful Node.js tool to track developer contributions across GitHub repositories with a beautiful web dashboard, reports, leaderboards, and analytics.

---

## 🌟 Features

- ✅ **Web Dashboard** - Beautiful real-time analytics dashboard
- ✅ **Auto-Discovery** - Automatically finds all repositories you have access to
- ✅ **Multi-Repository Tracking** - Track contributions across multiple repos simultaneously
- ✅ **Daily/Weekly/Monthly Reports** - Flexible time period reporting
- ✅ **Top & Bottom Contributors** - Identify top performers and those needing support
- ✅ **Inactive Users Tracking** - See who has zero commits
- ✅ **Individual Developer Stats** - Search and view any developer's contributions
- ✅ **Smart Caching** - 3-level caching (Memory → File → API) for fast performance
- ✅ **Repository Breakdown** - See activity per repository
- ✅ **Branch Support** - Includes commits from all branches (merged or not)
- ✅ **JSON Export** - Export reports for further analysis
- ✅ **CLI Commands** - Command-line reports with `npm run report:*`
- ✅ **Production Ready** - Secure configuration with environment variables

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Web Dashboard](#-web-dashboard)
- [Dashboard Features](#-dashboard-features)
- [CLI Usage](#-cli-usage)
- [Commands Reference](#-commands-reference)
- [Caching System](#-caching-system)
- [API Endpoints](#-api-endpoints)
- [Report Types](#-report-types)
- [Output Examples](#-output-examples)
- [Security Best Practices](#-security-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy example environment file
copy .env.example .env

# Edit with your details
notepad .env
```

### 3. Add Your GitHub Token
Get your token from: https://github.com/settings/tokens

Update `.env`:
```env
GITHUB_TOKEN=ghp_your_github_token_here
```

### 4. Start the Dashboard
```bash
npm run dashboard
```

### 5. Open in Browser
```
http://localhost:3000
```

That's it! 🎉

---

## 📦 Installation

### Prerequisites
- **Node.js** 14.0.0 or higher
- **npm** (comes with Node.js)
- **GitHub Personal Access Token** with `repo` scope

### Steps

1. **Clone or download the project**
   ```bash
   cd C:\CN-Pro\SoluLab\Projects\GithubCommitScript
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   copy .env.example .env
   ```

4. **Get GitHub Token**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `SoluLab Dev Tracker`
   - Select scope: ✅ **repo** (Full control of private repositories)
   - Click "Generate token"
   - Copy the token

5. **Update environment file**
   Edit `.env`:
   ```env
   GITHUB_ORG=SoluLab
   GITHUB_REPO=your-main-repo
   GITHUB_TOKEN=ghp_your_token_here
   DEFAULT_PERIOD=all
   LEADERBOARD_SIZE=10
   EXPORT_JSON=true
   SHOW_INACTIVE=true
   SHOW_BREAKDOWN=true
   ```

6. **Start the dashboard**
   ```bash
   npm run dashboard
   ```

---

## ⚙️ Configuration

### Environment Variables

All configuration is managed through the `.env` file for better security.

**.env file:**
```env
# ============================================================================
# GitHub Configuration
# ============================================================================

# GitHub Organization Name (case-sensitive)
GITHUB_ORG=SoluLab

# Single Repository (for single-repo reports)
GITHUB_REPO=rentzi-admin

# Multiple Repositories (for multi-repo reports)
# Leave empty to auto-discover, or provide comma-separated list
# GITHUB_REPOS=repo1,repo2,repo3

# GitHub Personal Access Token (REQUIRED)
GITHUB_TOKEN=ghp_your_token_here

# ============================================================================
# Report Configuration
# ============================================================================

# Default report period: daily, weekly, monthly, or all
DEFAULT_PERIOD=all

# Number of top developers to show (1-100)
LEADERBOARD_SIZE=10

# Export reports to JSON files
EXPORT_JSON=true

# Show inactive developers (single repo only)
SHOW_INACTIVE=true

# Show repository breakdown (multi repo only)
SHOW_BREAKDOWN=true
```

### Repository Options

#### Option 1: Auto-Discover (Default - Recommended)
```env
GITHUB_ORG=SoluLab
# Don't set GITHUB_REPOS - it will auto-discover all SoluLab repos
```

#### Option 2: Specific Repositories
```env
GITHUB_ORG=SoluLab
GITHUB_REPOS=rentzy-be-user,rentzy-be-propertyowner,rentzi-admin
```

---

## 🖥️ Web Dashboard

### Starting the Dashboard

```bash
npm run dashboard
```

This command:
1. Checks for existing report files
2. Generates missing reports (daily, weekly, monthly) in parallel
3. Starts the web server on port 3000
4. Dashboard available at `http://localhost:3000`

### Expected Output

```
🔍 Checking for missing reports...
  ✅ daily: Using existing report (5 min old)
  ✅ weekly: Using existing report (10 min old)
  ✅ monthly: Using existing report (15 min old)
✅ All reports are up to date!

══════════════════════════════════════════════════════════════════════
🚀 GitHub Dashboard with Smart File Caching
══════════════════════════════════════════════════════════════════════
📊 Dashboard: http://localhost:3000
🔌 API:       http://localhost:3000/api
──────────────────────────────────────────────────────────────────────
💾 Caching: Memory (5min) → File (1hr) → API
📁 Reports:  C:\...\GithubCommitScript\reports
──────────────────────────────────────────────────────────────────────
🏢 Org: SoluLab
🔑 Token: ✅
══════════════════════════════════════════════════════════════════════
```

---

## 🎯 Dashboard Features

### Control Panel

| Control | Description |
|---------|-------------|
| **Time Period** | Select Daily, Weekly, or Monthly |
| **Date** | Pick any date to view historical data |
| **Get Cached Data** | Fetch data using cached files (fast) |
| **Generate Latest Data** | Force fetch fresh data from GitHub API |
| **Clear All Cache** | Delete all cached files and memory |

### Time Periods Explained

| Period | Date Range | Use Case |
|--------|------------|----------|
| Daily | Last 24 hours | Daily standup |
| Weekly | Last 7 days | Sprint reviews |
| Monthly | Last 30 days | Monthly reports |

### Dashboard Sections

#### 🏆 Top 10 Contributors
- Shows users with most commits
- Gold/Silver/Bronze medals for top 3
- Displays repositories worked on
- Only active users (1+ commits)

#### 📉 Bottom 10 Active Contributors
- Shows users with least commits
- Helps identify who may need support
- Only active users (1+ commits)

#### ⚠️ Inactive Users (0 Commits)
- Lists all users with zero commits
- Warning banner with count
- Sorted alphabetically

#### 🔍 Individual Developer Stats
- Search by username or name
- Auto-suggestions as you type
- View Daily/Weekly/Monthly stats
- See additions, deletions, and repos

### Buttons Explained

| Button | Action | When to Use |
|--------|--------|-------------|
| **📊 Get Cached Data** | Uses cache (Memory → File → API) | Regular viewing |
| **🔄 Generate Latest Data** | Skips cache, fetches from API | After new commits |
| **🗑️ Clear All Cache** | Deletes all cached data | After token change |

---

## 💾 Caching System

The dashboard uses a 3-level caching system:

### Level 1: Memory Cache (5 minutes)
- Fastest access
- Stores recent API responses
- Clears on server restart

### Level 2: File Cache (1 hour)
- JSON files in `reports/` folder
- Generated on startup
- Persists across restarts

### Level 3: GitHub API
- Always current data
- Slowest (30-60 seconds)
- Used when caches miss

### Cache Flow

```
Request → Memory (5min) → File (1hr) → GitHub API
```

### Cache File Locations

```
reports/
├── daily/
│   └── multi_repo_daily_report_2025-11-18.json
├── weekly/
│   └── multi_repo_weekly_report_2025-11-18.json
└── monthly/
    └── multi_repo_monthly_report_2025-11-18.json
```

---

## 💻 CLI Usage

### Simple Commands

```bash
# Start web dashboard
npm run dashboard

# Multi-repository reports (CLI)
npm run report:daily          # Today's activity
npm run report:weekly         # Last 7 days
npm run report:monthly        # Last 30 days
npm run report:all            # Daily + Weekly + Monthly

# Single repository reports
npm run report:single:daily
npm run report:single:weekly
npm run report:single:monthly
npm run report:single:all
```

### Direct Commands

```bash
# Multi-repo
node src/RunMultiRepoReport.js daily
node src/RunMultiRepoReport.js weekly
node src/RunMultiRepoReport.js monthly

# Single repo
node src/RunReport.js daily
node src/RunReport.js weekly
node src/RunReport.js monthly
```

---

## 📚 Commands Reference

| Command | Description | Output |
|---------|-------------|--------|
| `npm run dashboard` | Start web dashboard | http://localhost:3000 |
| `npm run report:daily` | Daily CLI report | All repos |
| `npm run report:weekly` | Weekly CLI report | All repos |
| `npm run report:monthly` | Monthly CLI report | All repos |
| `npm run report:all` | All three reports | All repos |
| `npm run report:single:daily` | Daily single repo | One repo |
| `npm run report:single:weekly` | Weekly single repo | One repo |
| `npm run report:single:monthly` | Monthly single repo | One repo |

---

## 🔌 API Endpoints

The dashboard server provides these REST API endpoints:

### Reports

```
GET /api/report/multi/:period
GET /api/report/single/:period
```

**Parameters:**
- `period`: `daily`, `weekly`, or `monthly`
- `date`: YYYY-MM-DD format (optional)
- `forceRefresh`: `true` to skip cache (optional)

**Example:**
```
GET /api/report/multi/monthly?date=2025-11-18
GET /api/report/multi/weekly?forceRefresh=true
```

### User Stats

```
GET /api/user/:username
```

**Parameters:**
- `username`: GitHub username
- `date`: YYYY-MM-DD format (optional)
- `period`: `all`, `daily`, `weekly`, or `monthly` (optional)

**Example:**
```
GET /api/user/Tushar-ba?date=2025-11-18&period=all
```

### Cache Management

```
GET /api/cache/status      # View cache status
GET /api/cache/clear       # Clear memory cache
GET /api/cache/clear-all   # Clear all caches + files
```

### Health Check

```
GET /api/health
```

---

## 📊 Report Types

### Daily Report
- **Time Period:** Last 24 hours
- **Best For:** Daily standup meetings
- **Command:** `npm run report:daily`

### Weekly Report
- **Time Period:** Last 7 days
- **Best For:** Sprint reviews
- **Command:** `npm run report:weekly`

### Monthly Report
- **Time Period:** Last 30 days
- **Best For:** Performance reviews
- **Command:** `npm run report:monthly`

---

## 📈 Output Examples

### Multi-Repository Report

```
═══════════════════════════════════════════════════════════════════════════════
            SoluLab Multi-Repository Contribution Report
DAILY REPORT - 2025-11-18
═══════════════════════════════════════════════════════════════════════════════

📋 Auto-discovering repositories you have access to...
✅ Found 42 repositories in SoluLab

┌──────┬──────────────┬───────┬──────────┬────────────┬────────────┬───────────┐
│ Rank │ Username     │ Repos │ Commits  │ Additions  │ Deletions  │ Net Lines │
├──────┼──────────────┼───────┼──────────┼────────────┼────────────┼───────────┤
│ 1    │ Tushar-ba    │ 1     │ 52       │ +70,490    │ -11,018    │ 59,472    │
│ 2    │ abhishek     │ 3     │ 25       │ +20,532    │ -1,234     │ 19,298    │
│ 3    │ SagarPrajapti│ 1     │ 24       │ +12,901    │ -4,065     │ 8,836     │
└──────┴──────────────┴───────┴──────────┴────────────┴────────────┴───────────┘

🏆 Top Contributor: Tushar-ba
   Total Commits: 52
   Repositories: nft-wallet-ecosystem-be

                                   SUMMARY
--------------------------------------------------------------------------------
Total Repositories with Activity: 4
Total Developers Active: 8
Inactive Developers: 98
Total Commits: 115
Total Lines Added: +110,992
Total Lines Deleted: -16,811
Net Lines Changed: 94,181
--------------------------------------------------------------------------------
```

### Repository Breakdown

```
═══════════════════════════════════════════════════════════════════════════════
                          Repository Breakdown
═══════════════════════════════════════════════════════════════════════════════

┌────────────────────────────┬────────────┬──────────┬────────────┬───────────┐
│ Repository                 │ Developers │ Commits  │ Additions  │ Net Lines │
├────────────────────────────┼────────────┼──────────┼────────────┼───────────┤
│ nft-wallet-ecosystem-be    │ 1          │ 52       │ +70,490    │ 59,472    │
│ carbon-credit-backend      │ 4          │ 28       │ +24,362    │ 23,573    │
│ NFT-wallet-ecosystem-fe    │ 2          │ 26       │ +15,452    │ 10,922    │
│ CARBON-CREDIT-INVESTOR-FE  │ 5          │ 9        │ +688       │ 214       │
└────────────────────────────┴────────────┴──────────┴────────────┴───────────┘
```

---

## 🔒 Security Best Practices

### Using Environment Variables

1. **Create `.env` file:**
   ```bash
   copy .env.example .env
   ```

2. **Add your token:**
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Verify `.gitignore` includes:**
   ```
   .env
   .env.local
   .env.production
   ```

### What Gets Committed

✅ **Safe to commit:**
- `.env.example` - Template without secrets
- `config/Config.js` - Reads from environment

❌ **NEVER commit:**
- `.env` - Contains your actual token

### Token Best Practices

- ✅ Use minimum required permissions (`repo` scope)
- ✅ Set expiration date (90 days recommended)
- ✅ Rotate tokens regularly
- ✅ Store in `.env` file only
- ❌ Don't share tokens in Slack/email
- ❌ Don't commit `.env` to git

---

## 🐛 Troubleshooting

### Issue: 401 Bad Credentials

**Solution:**
1. Generate new token: https://github.com/settings/tokens
2. Select `repo` scope
3. Update `.env` with new token
4. Click "Clear All Cache" in dashboard
5. Click "Generate Latest Data"

### Issue: Old Data After Token Change

**Solution:**
1. Click "🗑️ Clear All Cache" button
2. Click "🔄 Generate Latest Data"

### Issue: Slow Loading for Past Dates

**Explanation:** Past dates don't have cached files.

**Solution:** Wait for API fetch (30-60 seconds). This is expected.

### Issue: "User not found"

**Solution:**
1. Check exact GitHub username (case-sensitive)
2. Ensure user has commits in selected period
3. Try username, not display name

### Issue: API Rate Limit

**Solution:**
1. Wait 1 hour for reset
2. Use cached data when possible
3. Reduce "Generate Latest Data" clicks

### Issue: No Repositories Found

**Solution:**
1. Verify token has `repo` scope
2. Check organization name spelling
3. Ensure you're a member of the organization

---

## 📁 Project Structure

```
GithubCommitScript/
├── src/                                # Source code
│   ├── GitHubDevTracker.js            # Core single-repo tracker
│   ├── MultiRepoTracker.js            # Core multi-repo tracker
│   ├── server.js                      # Express server + API
│   ├── RunReport.js                   # Single repo CLI runner
│   └── RunMultiRepoReport.js          # Multi repo CLI runner
│
├── public/                             # Web dashboard
│   └── dashboard.html                 # Dashboard UI
│
├── config/                             # Configuration
│   ├── Config.js                      # Reads from .env
│   └── Config.example.js              # Config template
│
├── reports/                            # Generated reports
│   ├── daily/                         # Daily report files
│   ├── weekly/                        # Weekly report files
│   └── monthly/                       # Monthly report files
│
├── .env                                # Your secrets (NOT committed)
├── .env.example                        # Template (safe to commit)
├── .gitignore                          # Git ignore rules
├── package.json                        # Dependencies & scripts
├── README.md                           # This file
└── SETUP.md                            # Detailed setup guide
```

---

## 🔑 GitHub Token Scopes

### Required Scope

- ✅ **`repo`** - Full control of private repositories

### Getting a Token

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `SoluLab Dev Tracker`
4. Expiration: 90 days (recommended)
5. Select: ✅ **repo**
6. Click "Generate token"
7. Copy token immediately

---

## 🎨 Customization

### Change Leaderboard Size

```env
LEADERBOARD_SIZE=20  # Show top 20
```

### Disable JSON Export

```env
EXPORT_JSON=false
```

### Change Default Period

```env
DEFAULT_PERIOD=weekly
```

### Track Specific Repositories

```env
GITHUB_REPOS=rentzy-be-user,rentzy-be-propertyowner,rentzi-admin
```

---

## 🚀 Advanced Usage

### Automation with Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "GitHub Daily Report"
4. Trigger: Daily at 6:00 PM
5. Action: Start a program
   - Program: `node`
   - Arguments: `src\RunMultiRepoReport.js daily`
   - Start in: `C:\path\to\GithubCommitScript`

### Automation with Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add daily report at 6 PM
0 18 * * * cd /path/to/project && npm run report:daily
```

---

## 💡 Tips & Tricks

1. **Daily use:** Click "Get Cached Data" for fast results
2. **After commits:** Click "Generate Latest Data" for fresh data
3. **After token change:** Click "Clear All Cache" then "Generate Latest Data"
4. **Monthly reviews:** Use "Monthly" period for comprehensive reports
5. **Team meetings:** Use "Weekly" period for sprint reviews
6. **Individual reviews:** Use the search feature for specific developers

---

## 📞 Support

### Common Issues
See [Troubleshooting](#-troubleshooting) section above.

### Documentation
- `README.md` - This file
- `SETUP.md` - Detailed setup guide

### GitHub API Documentation
https://docs.github.com/en/rest

---

## 📄 License

Proprietary - SoluLab Internal Use

---

## 🙏 Acknowledgments

Built for SoluLab development team to track and celebrate developer contributions.

---

**Version:** 2.0.0  
**Last Updated:** November 2025  
**Author:** SoluLab Development Team

---

**Happy Tracking! 📊** 