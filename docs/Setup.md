# 📊 GitHub SoluLab Analytics - Setup & User Guide

A comprehensive dashboard for tracking GitHub developer contributions across multiple repositories. This tool provides real-time analytics on commits, additions, deletions, and helps identify top performers and inactive team members.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Dashboard Overview](#dashboard-overview)
6. [Understanding Time Periods](#understanding-time-periods)
7. [Date Selection](#date-selection)
8. [Data Fetching Buttons](#data-fetching-buttons)
9. [Caching System](#caching-system)
10. [Dashboard Sections](#dashboard-sections)
11. [Individual Developer Stats](#individual-developer-stats)
12. [CLI Commands](#cli-commands)
13. [API Endpoints](#api-endpoints)
14. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **GitHub Personal Access Token** with the following permissions:
  - `repo` - Full control of private repositories
  - `read:org` - Read organization membership

### Creating a GitHub Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`
4. Copy the generated token (you won't see it again!)

---

## 📦 Project Setup

### 1. Clone/Download the Project

```bash
cd C:\CN-Pro\SoluLab\Projects\GithubCommitScript
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 4. Project Structure

```
GithubCommitScript/
├── config/
│   └── Config.js           # Configuration settings
├── public/
│   └── dashboard.html      # Web dashboard UI
├── reports/
│   ├── daily/              # Daily report files
│   ├── weekly/             # Weekly report files
│   └── monthly/            # Monthly report files
├── src/
│   ├── GitHubDevTracker.js # Single repo tracker
│   ├── MultiRepoTracker.js # Multi-repo aggregator
│   └── server.js           # Express server
├── .env                    # Environment variables
└── package.json            # Project dependencies
```

---

## ⚙️ Configuration

### config/Config.js

Update this file with your organization details:

```javascript
module.exports = {
    github: {
        organization: 'SoluLab',           // Your GitHub organization name
        token: process.env.GITHUB_TOKEN,   // Token from .env file
        repositories: []                    // Leave empty to auto-discover all repos
    }
};
```

### Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `organization` | GitHub organization name | `'SoluLab'` |
| `token` | GitHub personal access token | From `.env` file |
| `repositories` | Specific repos to track (empty = all) | `['repo1', 'repo2']` or `[]` |

---

## 🚀 Running the Application

### Start the Dashboard

```bash
npm run dashboard
```

This command:
1. Checks for existing report files
2. Generates missing reports (daily, weekly, monthly) in parallel
3. Starts the web server on port 3000
4. Opens the dashboard at `http://localhost:3000`

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

## 🖥️ Dashboard Overview

The dashboard provides a visual interface to view contribution analytics:

```
┌─────────────────────────────────────────────────┐
│     📊 GitHub SoluLab Analytics                │
│     Real-time Developer Contribution Analytics  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Time Period    Date         [Buttons]          │
│ [Daily/Weekly/Monthly]  [Date Picker]          │
│                                                 │
│ [Get Cached Data] [Generate Latest] [Clear]    │
└─────────────────────────────────────────────────┘

┌───────────────────┐  ┌───────────────────┐
│ 🏆 Top 10         │  │ 📉 Bottom 10      │
│ Contributors      │  │ Active Contributors│
└───────────────────┘  └───────────────────┘

┌─────────────────────────────────────────────────┐
│ ⚠️ Inactive Users (0 Commits)                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 🔍 Individual Developer Stats                  │
└─────────────────────────────────────────────────┘
```

---

## 📅 Understanding Time Periods

### Daily
- **Range:** Last 24 hours from selected date
- **Use case:** Track today's activity
- **Example:** Date: Nov 18 → Shows commits from Nov 18 only

### Weekly
- **Range:** Last 7 days from selected date
- **Use case:** Weekly progress review
- **Example:** Date: Nov 18 → Shows commits from Nov 12-18

### Monthly
- **Range:** Last 30 days from selected date
- **Use case:** Monthly performance reports
- **Example:** Date: Nov 18 → Shows commits from Oct 19 - Nov 18

### How Period Affects Data

| Period | Date Selected | Data Range |
|--------|---------------|------------|
| Daily | Nov 18, 2025 | Nov 18 only |
| Weekly | Nov 18, 2025 | Nov 12-18 |
| Monthly | Nov 18, 2025 | Oct 19 - Nov 18 |

---

## 📆 Date Selection

### Using the Date Picker

1. Click on the date input field
2. Select your desired date
3. Click "Get Cached Data" or "Generate Latest Data"

### Important Notes

- **Today's date:** Uses pre-generated cached files (instant)
- **Past dates:** May need to fetch from GitHub API (slower, 30-60 seconds)
- **Default:** Today's date is selected when dashboard loads

### Date + Period Combinations

When you select a date, the period determines the date range:

```
Selected: Nov 15, 2025 + Daily   → Nov 15 only
Selected: Nov 15, 2025 + Weekly  → Nov 9-15
Selected: Nov 15, 2025 + Monthly → Oct 16 - Nov 15
```

---

## 🔘 Data Fetching Buttons

### 📊 Get Cached Data

**Purpose:** Fetch data using the fastest available source

**Behavior:**
1. Checks memory cache (5 minutes)
2. Checks file cache (1 hour)
3. Falls back to GitHub API if no cache

**When to use:**
- Regular data viewing
- When you want fast results
- For today's date (uses pre-generated files)

**Speed:** Instant to 60 seconds (depends on cache availability)

---

### 🔄 Generate Latest Data

**Purpose:** Force fetch fresh data from GitHub API

**Behavior:**
1. Skips all caches
2. Fetches directly from GitHub API
3. Updates caches with new data

**When to use:**
- After new commits are pushed
- When you need real-time accuracy
- After changing GitHub token

**Speed:** 30-60 seconds (always fetches from API)

---

### 🗑️ Clear All Cache

**Purpose:** Delete all cached data (memory + files)

**Behavior:**
1. Clears memory cache
2. Deletes all report files in `reports/` folder
3. Resets dashboard display

**When to use:**
- After changing GitHub token in `.env`
- When cached data seems incorrect
- To force complete refresh

**⚠️ Warning:** After clearing, you must click "Generate Latest Data" to reload

---

## 💾 Caching System

The dashboard uses a 3-level caching system for optimal performance:

### Level 1: Memory Cache (5 minutes)
- Fastest access
- Stores recent API responses
- Clears when server restarts

### Level 2: File Cache (1 hour)
- JSON files in `reports/` folder
- Persists across server restarts
- Generated on startup

### Level 3: GitHub API
- Slowest but always current
- Used when caches miss or expired
- Rate limited by GitHub

### Cache Flow

```
Request → Memory Cache (5min)
              ↓ miss
         File Cache (1hr)
              ↓ miss
         GitHub API
              ↓
         Save to caches
```

### File Cache Location

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

## 📊 Dashboard Sections

### 🏆 Top 10 Contributors

**Shows:** Users with the most commits (highest to lowest)

**Data displayed:**
- Rank (🥇🥈🥉 for top 3)
- Developer name
- GitHub username
- Repositories worked on
- Total commits

**Filtering:**
- Only shows users with 1+ commits
- Sorted by commit count (descending)

---

### 📉 Bottom 10 Active Contributors

**Shows:** Users with the least commits (but still active)

**Data displayed:**
- Rank (#1, #2, etc.)
- Developer name
- GitHub username
- Repositories worked on
- Total commits

**Filtering:**
- Only shows users with 1+ commits
- Sorted by commit count (ascending)

**Purpose:** Identify team members who may need support or are less active

---

### ⚠️ Inactive Users (0 Commits)

**Shows:** Users with zero commits in the selected period

**Data displayed:**
- Count of inactive users
- List of all inactive usernames
- Warning indicator

**Styling:**
- Yellow warning banner
- Red rank badges
- Sorted alphabetically

**Purpose:** Identify completely inactive team members

---

## 🔍 Individual Developer Stats

### Search Functionality

1. Type username or name in search box
2. Suggestions appear as you type
3. Press Enter or click suggestion to search

### Show Period Dropdown

Select which data to display for the searched user:

| Option | Shows |
|--------|-------|
| All Periods | Daily, Weekly, and Monthly commits |
| Daily Only | Only daily commits |
| Weekly Only | Only weekly commits |
| Monthly Only | Only monthly commits |

### Auto-Fetch Feature

When you change the "Show Period" dropdown:
- Automatically fetches data for the currently searched user
- No need to search again!

### Stats Displayed

For each period, you see:
- **Commits:** Total number of commits
- **Additions:** Lines of code added
- **Deletions:** Lines of code deleted
- **Repositories:** Which repos the user worked on

### Repository Breakdown

Shows all repositories the user contributed to (for monthly data).

---

## 💻 CLI Commands

### Available npm Scripts

```bash
# Start web dashboard
npm run dashboard

# Generate daily report (CLI only)
npm run report:daily

# Generate weekly report (CLI only)
npm run report:weekly

# Generate monthly report (CLI only)
npm run report:monthly
```

### CLI Report Output

Reports are saved as:
- **Text file:** Human-readable table format
- **JSON file:** Machine-readable data

Location: `reports/{period}/`

---

## 🔌 API Endpoints

The dashboard runs an Express server with these API endpoints:

### GET /api/report/multi/:period
Get aggregated report for all repositories.

**Parameters:**
- `period`: `daily`, `weekly`, or `monthly`
- `date`: Date in YYYY-MM-DD format (optional)
- `forceRefresh`: `true` to skip cache (optional)

**Example:**
```
GET /api/report/multi/monthly?date=2025-11-18
```

### GET /api/user/:username
Get individual user statistics.

**Parameters:**
- `username`: GitHub username
- `date`: Date in YYYY-MM-DD format (optional)
- `period`: `all`, `daily`, `weekly`, or `monthly` (optional)

**Example:**
```
GET /api/user/Tushar-ba?date=2025-11-18&period=all
```

### GET /api/cache/clear-all
Clear all caches (memory + files).

### GET /api/health
Check server health status.

---

## 🔧 Troubleshooting

### Problem: "Token not configured"

**Solution:**
1. Check `.env` file exists in project root
2. Ensure `GITHUB_TOKEN=your_token` is set
3. Restart the server

### Problem: Old data showing after token change

**Solution:**
1. Click "🗑️ Clear All Cache" button
2. Click "🔄 Generate Latest Data"

### Problem: Slow loading for past dates

**Explanation:** Past dates don't have cached files, so data is fetched from GitHub API.

**Solution:** This is expected behavior. Wait for the fetch to complete (30-60 seconds).

### Problem: "User not found" error

**Solution:**
1. Check the exact GitHub username (case-sensitive)
2. Ensure the user has commits in the selected period
3. Try searching by username, not display name

### Problem: Rate limit errors

**Explanation:** GitHub API has rate limits (5000 requests/hour).

**Solution:**
1. Wait for rate limit to reset
2. Use cached data when possible
3. Reduce frequency of "Generate Latest Data" clicks

### Problem: Reports folder empty

**Solution:**
1. Run `npm run dashboard` to auto-generate reports
2. Or manually run `npm run report:monthly`

---

## 📝 Quick Start Checklist

- [ ] Install Node.js
- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Create `.env` with GitHub token
- [ ] Update `config/Config.js` with organization name
- [ ] Run `npm run dashboard`
- [ ] Open `http://localhost:3000`
- [ ] Select period and date
- [ ] Click "Get Cached Data"
- [ ] View top/bottom contributors
- [ ] Search individual developers

---

## 🎯 Best Practices

1. **Daily use:** Click "Get Cached Data" for fast results
2. **After commits:** Click "Generate Latest Data" for fresh data
3. **After token change:** Click "Clear All Cache" then "Generate Latest Data"
4. **Monthly reviews:** Use "Monthly" period for comprehensive reports
5. **Team meetings:** Use "Weekly" period for sprint reviews

---

## 📞 Support

If you encounter issues:

1. Check the terminal/console for error messages
2. Verify GitHub token permissions
3. Ensure correct organization name in config
4. Check network connectivity to GitHub

---

## 📄 License

This project is proprietary to SoluLab.

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Author:** SoluLab Development Team 