# Troubleshooting Guide

Common issues and their solutions.

---

## 🔴 Authentication Errors

### Error: 401 Bad Credentials

**Full Error:**
```
Error fetching commits: Request failed with status code 401
Status: 401
Data: { message: 'Bad credentials', documentation_url: '...' }
```

**Causes:**
1. Token is invalid, expired, or revoked
2. Token is not in config file
3. Token has typos or extra spaces
4. Token doesn't have required scope

**Solutions:**

#### Step 1: Verify Token Exists in Config
```bash
# Check if token is in config
Select-String -Path config\Config.js -Pattern "token:"
```

Should show:
```javascript
token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

#### Step 2: Generate New Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `SoluLab Dev Tracker`
4. Expiration: 90 days or No expiration
5. **Select scope:** ✅ **repo** (Full control of private repositories)
6. Click "Generate token"
7. **Copy immediately**

#### Step 3: Update Config
```javascript
// config/Config.js
token: 'ghp_NEW_TOKEN_YOU_JUST_COPIED'
```

#### Step 4: Test
```bash
npm start
```

---

### Error: 403 Forbidden

**Full Error:**
```
Error fetching commits: Request failed with status code 403
Status: 403
Data: { message: 'Resource not accessible by integration' }
```

**Causes:**
1. Token doesn't have `repo` scope
2. Rate limit exceeded
3. Token doesn't have access to the repository

**Solutions:**

#### Check Token Scope
1. Go to: https://github.com/settings/tokens
2. Find your token
3. Ensure it has: ✅ **repo** scope
4. If not, regenerate token with correct scope

#### Check Rate Limit
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }
$rate = Invoke-RestMethod -Uri "https://api.github.com/rate_limit" -Headers $headers
$rate.rate
```

If `remaining` is 0, wait 1 hour or until `reset` time.

---

## 🔴 Repository Errors

### Error: 404 Not Found

**Full Error:**
```
Error fetching commits: Request failed with status code 404
```

**Causes:**
1. Repository name is misspelled
2. You don't have access to the repository
3. Organization name is wrong
4. Repository was deleted

**Solutions:**

#### Verify Repository Name
Repository names are **case-sensitive**:
```javascript
// ✅ Correct
repository: 'rentzi-admin'

// ❌ Wrong
repository: 'Rentzi-Admin'
repository: 'rentzi_admin'
```

#### Test Access Manually
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }
Invoke-RestMethod -Uri "https://api.github.com/repos/SoluLab/rentzi-admin" -Headers $headers
```

**If 404:** You don't have access or name is wrong  
**If successful:** Shows repo details - config issue

#### List All Accessible Repos
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }
$repos = Invoke-RestMethod -Uri "https://api.github.com/user/repos?per_page=100" -Headers $headers
$repos | Select-Object full_name
```

This shows all repos you have access to.

---

### Error: Found 0 Repositories

**Output:**
```
📋 Auto-discovering repositories you have access to...
✅ Found 0 repositories in SoluLab
```

**Causes:**
1. Organization name is misspelled
2. You're not a member of the organization
3. Organization has no repositories you can access

**Solutions:**

#### Check Organization Name
Organization names are **case-sensitive**:
```javascript
// ✅ Correct
organization: 'SoluLab'

// ❌ Wrong
organization: 'solulab'
organization: 'Solu-Lab'
```

#### Try Without Organization Filter
```javascript
// Temporarily remove filter
organization: null,
repositories: null,
```

Run `npm start` to see all accessible repos.

#### Verify Organization Membership
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }
$orgs = Invoke-RestMethod -Uri "https://api.github.com/user/orgs" -Headers $headers
$orgs | Select-Object login
```

Check if `SoluLab` is in the list.

---

## 🔴 Installation Errors

### Error: Cannot Find Module

**Full Error:**
```
Error: Cannot find module 'axios'
Error: Cannot find module 'cli-table3'
Error: Cannot find module 'commander'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
```

---

### Error: Node Not Found

**Full Error:**
```
'node' is not recognized as an internal or external command
```

**Cause:** Node.js not installed or not in PATH

**Solution:**
1. Download Node.js from: https://nodejs.org/
2. Install Node.js (v14+)
3. Restart terminal
4. Test: `node --version`

---

### Error: NPM Not Found

**Full Error:**
```
'npm' is not recognized as an internal or external command
```

**Cause:** npm not installed (comes with Node.js)

**Solution:**
1. Reinstall Node.js from: https://nodejs.org/
2. During installation, ensure npm is selected
3. Restart terminal
4. Test: `npm --version`

---

## 🔴 Configuration Errors

### Error: Config.js Not Found

**Full Error:**
```
Error: Config.js not found!
Please copy Config.example.js to Config.js
```

**Cause:** Config file doesn't exist

**Solution:**
```bash
copy config\Config.example.js config\Config.js
notepad config\Config.js
# Add your token and save
```

---

### Error: Invalid Token Format

**Symptom:** Token doesn't work even though it's valid

**Causes:**
1. Extra spaces in token
2. Extra quotes around token
3. Newlines in token

**Check your config:**
```javascript
// ❌ Wrong
token: 'ghp_xxx xxx xxx'          // Has spaces
token: '"ghp_xxxxxxxxxxx"'        // Extra quotes
token: 'ghp_xxxxx
       xxxxxxxxxxx'               // Newlines

// ✅ Correct
token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

---

## 🔴 Runtime Errors

### Error: Script Runs But Shows No Data

**Output:**
```
No commits found for this period.
```

**Causes:**
1. No commits in the time period
2. Wrong repository
3. Authentication issue

**Solutions:**

#### Verify There Are Commits
Check the repository on GitHub to confirm commits exist in the time period.

#### Test Different Time Period
```bash
# Try monthly instead of daily
npm run report:monthly
```

#### Check Repository in Config
```javascript
// For single repo
repository: 'rentzi-admin'  // Verify this is correct

// For multi repo
repositories: null  // Or verify list is correct
```

---

### Error: Script is Very Slow

**Symptom:** Takes 5+ minutes to complete

**Causes:**
1. Processing many repositories
2. Many commits to analyze
3. Network latency
4. API rate limiting

**Solutions:**

#### Use Specific Repository List
```javascript
// Instead of auto-discover (slow)
repositories: null,

// Use specific list (faster)
repositories: [
    'rentzy-be-user',
    'rentzi-admin'
],
```

#### Process Fewer Repos at Once
Split into multiple runs:
```javascript
// Run 1: Rentzy repos
repositories: ['rentzy-be-user', 'rentzy-be-propertyowner', 'rentzi-admin'],

// Run 2: EcoYield repos
repositories: ['EcoYield-energy-be', 'ecoyield-cms-be'],
```

#### Check Network Connection
```powershell
# Test GitHub API speed
Measure-Command {
    $headers = @{ Authorization = "token $token" }
    Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
}
```

Should complete in < 1 second.

---

### Error: API Rate Limit Exceeded

**Full Error:**
```
Error: API rate limit exceeded
```

**Cause:** Made too many API requests (5,000/hour limit)

**Solutions:**

#### Check Rate Limit Status
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }
$rate = Invoke-RestMethod -Uri "https://api.github.com/rate_limit" -Headers $headers
$rate.rate | Format-List
```

Shows:
- `limit`: 5000
- `remaining`: How many left
- `reset`: When limit resets (Unix timestamp)

#### Wait for Reset
Convert reset time to readable format:
```powershell
$resetTime = [DateTimeOffset]::FromUnixTimeSeconds($rate.rate.reset).LocalDateTime
Write-Host "Rate limit resets at: $resetTime"
```

#### Reduce Repository Count
Process fewer repositories or run less frequently.

---

## 🔴 Report Errors

### Error: Reports Not Appearing in Folder

**Symptom:** Script completes but no JSON files in reports folder

**Causes:**
1. `exportToJson` is false
2. Reports folder doesn't exist
3. Permission issues

**Solutions:**

#### Enable JSON Export
```javascript
reports: {
    exportToJson: true  // ← Make sure this is true
}
```

#### Create Reports Folder
```bash
mkdir reports\daily
mkdir reports\weekly
mkdir reports\monthly
```

#### Check File Permissions
Ensure you have write permission to the reports folder.

---

### Error: Reports in Wrong Location

**Symptom:** JSON files appear in root instead of reports/ folder

**Cause:** Using old version of scripts

**Solution:** Replace `src/RunReport.js` and `src/RunMultiRepoReport.js` with updated versions.

---

## 🔴 Windows-Specific Issues

### Error: Execution Policy

**Full Error:**
```
.\automate.ps1 : File cannot be loaded because running scripts is disabled
```

**Cause:** PowerShell script execution is disabled

**Solution:**
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Error: Path Too Long

**Full Error:**
```
Error: ENAMETOOLONG: name too long
```

**Cause:** Windows path length limit (260 characters)

**Solution:** Move project closer to root:
```
C:\Projects\GithubCommitScript  # ✅ Short path
C:\CN-Pro\SoluLab\Projects\GithubCommitScript  # ❌ Long path
```

---

## 🔴 Git/GitHub Issues

### Error: Repository Was Moved

**Full Error:**
```
Moved Permanently
```

**Cause:** Repository was renamed or moved

**Solution:** Update repository name in config:
```javascript
// Old name
repository: 'old-repo-name',

// New name
repository: 'new-repo-name',
```

---

### Error: Organization Requires SSO

**Full Error:**
```
Resource protected by organization SAML enforcement
```

**Cause:** Organization requires SSO authentication

**Solution:**
1. Go to: https://github.com/settings/tokens
2. Find your token
3. Click "Configure SSO"
4. Authorize for SoluLab organization

---

## 🛠️ Debug Mode

### Enable Debug Output

Add debug logging to see what's happening:

**Edit `src/MultiRepoTracker.js`, add after line 8:**
```javascript
constructor(orgName, githubToken, repositories = null) {
    console.log('DEBUG - Organization:', orgName);
    console.log('DEBUG - Token exists:', !!githubToken);
    console.log('DEBUG - Token starts with:', githubToken ? githubToken.substring(0, 10) : 'MISSING');
    console.log('DEBUG - Repositories:', repositories || 'AUTO-DISCOVER');
    // ... rest of constructor
}
```

Run `npm start` to see debug info.

---

## 📊 Diagnostic Commands

### Check Configuration
```powershell
# View config
Get-Content config\Config.js

# Check for syntax errors
node -c config\Config.js
```

### Test Token
```powershell
$token = "ghp_your_token"
$headers = @{ Authorization = "token $token" }

# Test authentication
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers

# Check rate limit
Invoke-RestMethod -Uri "https://api.github.com/rate_limit" -Headers $headers

# List accessible repos
Invoke-RestMethod -Uri "https://api.github.com/user/repos?per_page=10" -Headers $headers
```

### Verify Dependencies
```powershell
# Check Node.js version
node --version  # Should be v14+

# Check npm version
npm --version

# List installed packages
npm list --depth=0
```

---

## ✅ Quick Diagnosis Checklist

Run through this checklist to identify issues:

- [ ] Node.js installed? (`node --version`)
- [ ] Dependencies installed? (`npm list axios`)
- [ ] Config file exists? (`Test-Path config\Config.js`)
- [ ] Token in config? (`Select-String -Path config\Config.js -Pattern "token:"`)
- [ ] Token is valid? (Test with PowerShell command)
- [ ] Token has `repo` scope? (Check on GitHub)
- [ ] Organization name correct? (Case-sensitive: `SoluLab`)
- [ ] Repository name correct? (Case-sensitive)
- [ ] You have access to repos? (Check on GitHub)
- [ ] Internet connection working? (Test `ping github.com`)

---

## 🆘 Still Having Issues?

### Collect Diagnostic Information

```powershell
# Save to file
@"
Node Version: $(node --version)
NPM Version: $(npm --version)
Config Exists: $(Test-Path config\Config.js)
Organization: $(Select-String -Path config\Config.js -Pattern "organization:" -Raw)
Error Message: [paste error here]
"@ | Out-File -FilePath diagnostic-info.txt
```

### Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| 401 Error | Generate new token |
| 404 Error | Check repo name spelling |
| 0 repos found | Check org name spelling |
| Module not found | Run `npm install` |
| Config not found | Copy Config.example.js to Config.js |
| Slow performance | Use specific repo list |
| Rate limit | Wait 1 hour |
| No reports | Set `exportToJson: true` |

---

**Most issues are solved by generating a fresh token and updating Config.js!** 🔑 