# GitHub Developer Contribution Tracker

A powerful Node.js tool to track developer contributions across GitHub repositories with beautiful reports, leaderboards, and analytics.

---

## 🌟 Features

- ✅ **Auto-Discovery** - Automatically finds all repositories you have access to
- ✅ **Multi-Repository Tracking** - Track contributions across multiple repos simultaneously
- ✅ **Daily/Weekly/Monthly Reports** - Flexible time period reporting
- ✅ **Top 10 Leaderboards** - Identify top contributors
- ✅ **Repository Breakdown** - See activity per repository
- ✅ **Branch Support** - Includes commits from all branches (merged or not)
- ✅ **JSON Export** - Export reports for further analysis
- ✅ **Simple NPM Commands** - Easy to use with `npm start`
- ✅ **Production Ready** - Secure configuration with environment variables

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Commands Reference](#-commands-reference)
- [Report Types](#-report-types)
- [Output Examples](#-output-examples)
- [Configuration Options](#-configuration-options)
- [Security Best Practices](#-security-best-practices)
- [Troubleshooting](#-troubleshooting)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

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

### 4. Run Your First Report
```bash
npm start
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

6. **Test installation**
   ```bash
   npm start
   ```

---

## ⚙️ Configuration

### Environment Variables (Recommended)

All configuration is now managed through the `.env` file for better security.

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

#### Option 2: All Organizations
```env
GITHUB_ORG=
# Leave empty to discover repos from all organizations
```

#### Option 3: Specific Repositories
```env
GITHUB_ORG=SoluLab
GITHUB_REPOS=rentzy-be-user,rentzy-be-propertyowner,rentzi-admin
# Comma-separated list of specific repos
```

---

## 🎯 Usage

### Simple Commands

```bash
# Default: Multi-repo daily report
npm start

# Multi-repository reports
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

### Direct Commands (Alternative)

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

| Command | Description | Reports On |
|---------|-------------|------------|
| `npm start` | Default daily report | All repos (auto-discover) |
| `npm run report:daily` | Daily activity | All repos |
| `npm run report:weekly` | Last 7 days | All repos |
| `npm run report:monthly` | Last 30 days | All repos |
| `npm run report:all` | All three reports | All repos |
| `npm run report:single:daily` | Daily activity | Single repo |
| `npm run report:single:weekly` | Last 7 days | Single repo |
| `npm run report:single:monthly` | Last 30 days | Single repo |

---

## 📊 Report Types

### Daily Report
- **Time Period:** Today only (00:00 - 23:59)
- **Best For:** Daily standup meetings, quick activity check
- **Command:** `npm run report:daily`

### Weekly Report
- **Time Period:** Last 7 days from today
- **Best For:** Sprint reviews, weekly team meetings
- **Command:** `npm run report:weekly`

### Monthly Report
- **Time Period:** Last 30 days from today
- **Best For:** Performance reviews, monthly reports
- **Command:** `npm run report:monthly`

### All Reports
- **Generates:** Daily + Weekly + Monthly
- **Best For:** Comprehensive analysis
- **Command:** `npm run report:all`

---

## 📈 Output Examples

### Multi-Repository Report

```
═══════════════════════════════════════════════════════════════════════════════
            SoluLab Multi-Repository Contribution Report
DAILY REPORT - 2025-11-13
═══════════════════════════════════════════════════════════════════════════════

📋 Auto-discovering repositories you have access to...
✅ Found 13 repositories in SoluLab

┌──────┬──────────────┬───────┬──────────┬────────────┬────────────┬───────────┐
│ Rank │ Username     │ Repos │ Commits  │ Additions  │ Deletions  │ Net Lines │
├──────┼──────────────┼───────┼──────────┼────────────┼────────────┼───────────┤
│ 1    │ john-doe     │ 5     │ 28       │ +2,450     │ -890       │ 1,560     │
│ 2    │ jane-smith   │ 3     │ 18       │ +1,320     │ -450       │ 870       │
│ 3    │ dev-kumar    │ 4     │ 15       │ +980       │ -320       │ 660       │
└──────┴──────────────┴───────┴──────────┴────────────┴────────────┴───────────┘

🏆 Top Contributor: john-doe
   Repositories: rentzy-be-user, rentzi-admin, EcoYield-energy-be, ...

                                   SUMMARY
--------------------------------------------------------------------------------
Total Repositories with Activity: 8
Total Developers Active: 15
Total Commits: 127
Total Lines Added: +15,680
Total Lines Deleted: -4,230
Net Lines Changed: 11,450
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
│ rentzy-be-user             │ 8          │ 45       │ +5,230     │ 3,780     │
│ EcoYield-energy-be         │ 6          │ 32       │ +4,120     │ 3,140     │
│ rentzy-be-propertyowner    │ 5          │ 25       │ +3,450     │ 2,560     │
│ rentzi-admin               │ 4          │ 15       │ +1,880     │ 1,320     │
└────────────────────────────┴────────────┴──────────┴────────────┴───────────┘
```

---

## 🔧 Configuration Options

### Report Settings

Edit your `.env` file:

```env
# Default period when running 'npm start'
DEFAULT_PERIOD=all              # Options: daily, weekly, monthly, all

# Number of top contributors to show
LEADERBOARD_SIZE=10             # Range: 1-100

# Export reports to JSON files
EXPORT_JSON=true                # Options: true, false

# Show inactive developers report (single repo only)
SHOW_INACTIVE=true              # Options: true, false

# Show breakdown by repository (multi repo only)
SHOW_BREAKDOWN=true             # Options: true, false
```

### GitHub Settings

```env
# Organization to filter (or leave empty for all)
GITHUB_ORG=SoluLab

# Single repository for RunReport.js
GITHUB_REPO=rentzi-admin

# Multiple repositories (comma-separated) or leave empty for auto-discover
GITHUB_REPOS=

# GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_token_here
```

---

## 🔒 Security Best Practices

### Using Environment Variables (Recommended)

The project now uses `.env` files for all configuration, which keeps your token secure.

**Setup:**

1. **Create `.env` file:**
   ```bash
   copy .env.example .env
   ```

2. **Add your token:**
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Verify `.gitignore`:**
   Make sure `.env` is listed (it already is by default):
   ```
   .env
   .env.local
   .env.production
   ```

### What Gets Committed to Git

✅ **Safe to commit:**
- `.env.example` - Template with no real secrets
- `config/Config.js` - Reads from environment variables
- `config/Config.example.js` - Configuration template

❌ **NEVER commit:**
- `.env` - Contains your actual token
- Any file with real tokens or secrets

### Token Best Practices

- ✅ Use tokens with minimum required permissions (`repo` scope only)
- ✅ Set expiration date (90 days recommended)
- ✅ Rotate tokens regularly
- ✅ Store in `.env` file (never hardcode)
- ✅ Keep `.env` in `.gitignore`
- ❌ Don't share tokens in Slack/email
- ❌ Don't use tokens without expiration
- ❌ Don't commit `.env` to git

### Environment Variables Reference

```env
# Required
GITHUB_TOKEN=ghp_xxxxx          # Your GitHub Personal Access Token

# Organization settings
GITHUB_ORG=SoluLab              # Filter by organization (or leave empty)
GITHUB_REPO=rentzi-admin        # Default repo for single-repo reports
GITHUB_REPOS=                   # Specific repos (comma-separated) or empty for auto-discover

# Report settings
DEFAULT_PERIOD=all              # daily, weekly, monthly, or all
LEADERBOARD_SIZE=10             # Number of top developers to show
EXPORT_JSON=true                # Export to JSON files
SHOW_INACTIVE=true              # Show inactive developers
SHOW_BREAKDOWN=true             # Show repository breakdown
```

---

## 🐛 Troubleshooting

### Issue: 401 Bad Credentials

**Error:**
```
Error fetching commits: Request failed with status code 401
Status: 401
Data: { message: 'Bad credentials' }
```

**Causes:**
1. Token is invalid or expired
2. Token missing from config
3. Token doesn't have `repo` scope

**Solution:**
1. Generate new token: https://github.com/settings/tokens
2. Select `repo` scope
3. Update `config/Config.js` with new token
4. Test: `npm start`

---

### Issue: 404 Not Found

**Error:**
```
Error fetching commits: Request failed with status code 404
```

**Causes:**
1. Repository name is wrong
2. You don't have access to the repository
3. Organization name is wrong

**Solution:**
1. Check spelling of organization and repository names (case-sensitive)
2. Verify you have access to the repositories
3. Test with auto-discovery: `repositories: null`

---

### Issue: No Repositories Found

**Error:**
```
✅ Found 0 repositories
```

**Causes:**
1. Token doesn't have access to any repositories
2. Organization name filter excludes all repos
3. Token scope is incorrect

**Solution:**
1. Verify token has `repo` scope
2. Check organization name spelling
3. Try `organization: null` to see all accessible repos
4. Ensure you're a member of the organization

---

### Issue: Script is Slow

**Symptom:** Takes several minutes to complete

**Causes:**
1. Processing many repositories
2. Many commits to analyze
3. Network latency

**Solutions:**
1. Use specific repository list instead of auto-discover
2. Run during off-peak hours
3. Process fewer repositories at a time
4. Consider caching results

---

### Issue: API Rate Limit

**Error:**
```
Error: API rate limit exceeded
```

**Solution:**
1. Wait 1 hour for rate limit to reset
2. Use authenticated requests (token)
3. Reduce number of repositories processed
4. Run less frequently

---

## 📁 Project Structure

```
GithubCommitScript/
├── src/                                # Source code
│   ├── GitHubDevTracker.js            # Core single-repo tracker
│   ├── MultiRepoTracker.js            # Core multi-repo tracker
│   ├── RunReport.js                   # Single repo runner
│   └── RunMultiRepoReport.js          # Multi repo runner
│
├── config/                             # Configuration
│   ├── Config.js                      # Reads from .env
│   └── Config.example.js              # Config template (optional)
│
├── reports/                            # Generated reports
│   ├── daily/                         # Daily reports
│   ├── weekly/                        # Weekly reports
│   └── monthly/                       # Monthly reports
│
├── logs/                               # Log files (if used)
│
├── docs/                               # Documentation
│   ├── README.md                      # This file
│   ├── Quickstart.md                  # Quick start guide
│   └── TROUBLESHOOTING.md             # Problem solving guide
│
├── .env                                # Your secrets (NOT committed)
├── .env.example                        # Template (safe to commit)
├── .gitignore                          # Git ignore rules
├── package.json                        # Node.js configuration
└── package-lock.json                   # Dependency lock file
```

---

## 🔑 GitHub Token Scopes

### Required Scope

- ✅ **`repo`** - Full control of private repositories

This includes:
- `repo:status` - Access commit status
- `repo_deployment` - Access deployment status
- `public_repo` - Access public repositories
- `repo:invite` - Access repository invitations
- `security_events` - Read security events

### Getting a Token

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `SoluLab Dev Tracker`
4. Expiration: 90 days (recommended)
5. Select: ✅ **repo** (check all sub-boxes)
6. Click "Generate token"
7. Copy token immediately

---

## 🎨 Customization

### Change Leaderboard Size

```env
# In .env file
LEADERBOARD_SIZE=20  # Show top 20 instead of 10
```

### Disable JSON Export

```env
# In .env file
EXPORT_JSON=false
```

### Change Default Period

```env
# In .env file
DEFAULT_PERIOD=weekly  # npm start will run weekly report
```

### Track Specific Repositories Only

```env
# In .env file
GITHUB_ORG=SoluLab
GITHUB_REPOS=rentzy-be-user,rentzy-be-propertyowner,rentzi-admin
```

### Track All Organizations

```env
# In .env file
GITHUB_ORG=
# Leave empty to track repos from all organizations you have access to
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
   - Arguments: `C:\path\to\src\RunMultiRepoReport.js daily`
   - Start in: `C:\path\to\project`

### Automation with Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add daily report at 6 PM
0 18 * * * cd /path/to/project && npm run report:daily
```

---

## 💡 Tips & Tricks

### Tip 1: Auto-Discovery
Set `repositories: null` to automatically track all repos without manual listing.

### Tip 2: Organization Filter
Set `organization: 'SoluLab'` to only track work repositories.

### Tip 3: Regular Reports
Use `npm start` for daily quick checks.

### Tip 4: Comprehensive Analysis
Use `npm run report:all` for complete monthly reviews.

### Tip 5: Branch Tracking
The tool tracks commits from ALL branches, not just main/master.

---

## 📞 Support

### Common Issues
See [Troubleshooting](#-troubleshooting) section above.

### GitHub API Documentation
https://docs.github.com/en/rest

### Token Management
https://github.com/settings/tokens

---

## 📄 License

MIT License - Feel free to modify and use for your organization.

---

## 🙏 Acknowledgments

Built for SoluLab development team to track and celebrate developer contributions.

---

**Happy Tracking! 📊** 