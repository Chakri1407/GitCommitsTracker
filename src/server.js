#!/usr/bin/env node

/**
 * Web Dashboard Server for GitHub Developer Tracker
 * Provides API endpoints and serves the dashboard UI
 * Enhanced with:
 * - Auto-generates missing reports on startup (PARALLEL)
 * - 3-level caching: Memory (5min) → File (1hour) → GitHub API
 * - Smart user lookup: checks all period caches before API
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;
require('dotenv').config();

const GitHubDevTracker = require('./GitHubDevTracker');
const MultiRepoTracker = require('./MultiRepoTracker');
const config = require('../config/Config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Cache for storing recent results
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FILE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCacheKey(type, period, date, repo = '') {
    return `${type}_${period}_${date}_${repo}`;
}

function getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

/**
 * Check if a report file exists and is recent (less than 1 hour old)
 */
async function getReportFromFile(type, period, date) {
    try {
        const dateStr = date.split('T')[0];
        const fileName = type === 'multi' 
            ? `multi_repo_${period}_report_${dateStr}.json`
            : `${period}_report_${dateStr}.json`;
        
        const filePath = path.join(__dirname, '../reports', period, fileName);
        const stats = await fs.stat(filePath);
        const fileAge = Date.now() - stats.mtimeMs;
        
        if (fileAge < FILE_CACHE_DURATION) {
            const minutes = Math.round(fileAge / 1000 / 60);
            console.log(`✅ Using cached file: ${fileName} (${minutes} min old)`);
            const fileContent = await fs.readFile(filePath, 'utf8');
            return JSON.parse(fileContent);
        } else {
            const minutes = Math.round(fileAge / 1000 / 60);
            console.log(`⏰ File too old: ${fileName} (${minutes} min old)`);
            return null;
        }
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.log(`⚠️  Error reading file: ${error.message}`);
        }
        return null;
    }
}

/**
 * Generate missing reports on startup (PARALLEL for speed)
 */
async function generateMissingReports() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const periods = ['daily', 'weekly', 'monthly'];
    
    console.log('\n🔍 Checking for missing reports...');
    
    const missingReports = [];
    
    for (const period of periods) {
        const fileName = `multi_repo_${period}_report_${dateStr}.json`;
        const filePath = path.join(__dirname, '../reports', period, fileName);
        
        try {
            const stats = await fs.stat(filePath);
            const ageMinutes = Math.round((Date.now() - stats.mtimeMs) / 60000);
            
            if (ageMinutes < 60) {
                console.log(`  ✅ ${period}: Using existing report (${ageMinutes} min old)`);
            } else {
                console.log(`  ⏰ ${period}: Report too old (${ageMinutes} min), will regenerate`);
                missingReports.push(period);
            }
        } catch {
            console.log(`  ❌ ${period}: No report found, will generate`);
            missingReports.push(period);
        }
    }
    
    if (missingReports.length === 0) {
        console.log('✅ All reports are up to date!\n');
        return;
    }
    
    console.log(`\n🚀 Generating ${missingReports.length} report(s) in parallel...`);
    const startTime = Date.now();
    
    const tracker = new MultiRepoTracker(
        config.github.organization,
        config.github.token,
        config.github.repositories
    );
    
    await Promise.all(missingReports.map(async (period) => {
        console.log(`  🔄 Starting ${period} report...`);
        
        try {
            const { aggregated, byRepo, allContributors } = await tracker.aggregateStats(period, date);
            
            const fileName = `multi_repo_${period}_report_${dateStr}.json`;
            const filePath = path.join(__dirname, '../reports', period, fileName);
            
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            
            const reportData = {
                period,
                date: dateStr,
                aggregated,
                byRepo,
                allContributors,
                totalDevelopers: Object.keys(aggregated).length,
                totalRepositories: Object.keys(byRepo).length,
                generatedAt: new Date().toISOString()
            };
            
            await fs.writeFile(filePath, JSON.stringify(reportData, null, 2));
            console.log(`  ✅ ${period} report saved!`);
        } catch (error) {
            console.error(`  ❌ ${period} report failed:`, error.message);
        }
    }));
    
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ All reports generated in ${elapsed} seconds!\n`);
}

/**
 * GET /api/report/multi/:period
 */
app.get('/api/report/multi/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const forceRefresh = req.query.forceRefresh === 'true';

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({ error: 'Invalid period. Use daily, weekly, or monthly' });
        }

        const dateStr = date.toISOString().split('T')[0];
        const cacheKey = getCacheKey('multi', period, dateStr);

        if (!forceRefresh) {
            const cached = getFromCache(cacheKey);
            if (cached) {
                console.log(`✅ Memory cache hit for multi ${period}`);
                return res.json(cached);
            }

            const fileData = await getReportFromFile('multi', period, date.toISOString());
            if (fileData) {
                setCache(cacheKey, fileData);
                return res.json(fileData);
            }
        } else {
            console.log(`🔄 Force refresh requested for ${period}`);
        }

        console.log(`🔍 Fetching multi-repo ${period} report for ${dateStr}...`);

        const tracker = new MultiRepoTracker(
            config.github.organization,
            config.github.token,
            config.github.repositories
        );

        const { aggregated, byRepo, allContributors } = await tracker.aggregateStats(period, date);

        const response = {
            period,
            date: dateStr,
            aggregated,
            byRepo,
            allContributors,
            totalDevelopers: Object.keys(aggregated).length,
            totalRepositories: Object.keys(byRepo).length,
            generatedAt: new Date().toISOString()
        };

        setCache(cacheKey, response);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/report/multi:', error);
        res.status(500).json({ error: 'Failed to generate report', message: error.message });
    }
});

/**
 * GET /api/report/single/:period
 */
app.get('/api/report/single/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const repo = req.query.repo || config.github.repository;

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({ error: 'Invalid period. Use daily, weekly, or monthly' });
        }

        const dateStr = date.toISOString().split('T')[0];
        const cacheKey = getCacheKey('single', period, dateStr, repo);

        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log(`✅ Memory cache hit for ${repo} ${period}`);
            return res.json(cached);
        }

        const fileData = await getReportFromFile('single', period, date.toISOString());
        if (fileData && fileData.repository === repo) {
            console.log(`✅ Using file cache for ${repo}`);
            setCache(cacheKey, fileData);
            return res.json(fileData);
        }

        console.log(`🔍 Fetching ${repo} ${period} report for ${dateStr}...`);

        const tracker = new GitHubDevTracker(
            config.github.organization,
            repo,
            config.github.token
        );

        let stats;
        switch (period) {
            case 'daily':
                stats = await tracker.getDailyReport(date);
                break;
            case 'weekly':
                stats = await tracker.getWeeklyReport(date);
                break;
            case 'monthly':
                stats = await tracker.getMonthlyReport(date);
                break;
        }

        const response = {
            period,
            date: dateStr,
            repository: repo,
            stats,
            totalDevelopers: Object.keys(stats).length,
            generatedAt: new Date().toISOString()
        };

        setCache(cacheKey, response);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/report/single:', error);
        res.status(500).json({ error: 'Failed to generate report', message: error.message });
    }
});

/**
 * GET /api/user/:username
 * OPTIMIZED: Checks ALL period caches before hitting API
 */
app.get('/api/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const period = req.query.period || 'all';

        const dateStr = date.toISOString().split('T')[0];
        const cacheKey = getCacheKey('user', username, dateStr, period);
        
        // Level 1: Memory cache
        const cached = getFromCache(cacheKey);
        if (cached) {
            console.log(`✅ Memory cache hit for user ${username} (${period})`);
            return res.json(cached);
        }

        // Level 2: Check ALL file caches (not just requested period)
        // This avoids hitting API when user exists in other periods
        console.log(`🔍 Looking for ${username} in ALL cached report files...`);
        
        let dailyData = null;
        let weeklyData = null;
        let monthlyData = null;
        let userExistsAnywhere = false;
        let userName = username;
        let userEmail = '';

        // Always check ALL three caches to confirm user exists
        const dailyFile = await getReportFromFile('multi', 'daily', date.toISOString());
        if (dailyFile && dailyFile.aggregated && username in dailyFile.aggregated) {
            userExistsAnywhere = true;
            dailyData = dailyFile.aggregated[username];
            userName = dailyData.name || username;
            userEmail = dailyData.email || '';
            console.log(`  ✅ Found ${username} in daily cache`);
        }

        const weeklyFile = await getReportFromFile('multi', 'weekly', date.toISOString());
        if (weeklyFile && weeklyFile.aggregated && username in weeklyFile.aggregated) {
            userExistsAnywhere = true;
            weeklyData = weeklyFile.aggregated[username];
            userName = weeklyData.name || userName;
            userEmail = weeklyData.email || userEmail;
            console.log(`  ✅ Found ${username} in weekly cache`);
        }

        const monthlyFile = await getReportFromFile('multi', 'monthly', date.toISOString());
        if (monthlyFile && monthlyFile.aggregated && username in monthlyFile.aggregated) {
            userExistsAnywhere = true;
            monthlyData = monthlyFile.aggregated[username];
            userName = monthlyData.name || userName;
            userEmail = monthlyData.email || userEmail;
            console.log(`  ✅ Found ${username} in monthly cache`);
        }

        // If user exists in ANY cache, return data from caches (no API call!)
        if (userExistsAnywhere) {
            console.log(`  ✅ User ${username} found in cache - no API call needed!`);
            
            const response = {
                username,
                name: userName,
                email: userEmail,
                date: dateStr,
                period,
                daily: dailyData?.commits || 0,
                weekly: weeklyData?.commits || 0,
                monthly: monthlyData?.commits || 0,
                dailyDetails: {
                    commits: dailyData?.commits || 0,
                    additions: dailyData?.additions || 0,
                    deletions: dailyData?.deletions || 0,
                    netLines: dailyData?.netLines || 0,
                    repositories: dailyData?.repositories || []
                },
                weeklyDetails: {
                    commits: weeklyData?.commits || 0,
                    additions: weeklyData?.additions || 0,
                    deletions: weeklyData?.deletions || 0,
                    netLines: weeklyData?.netLines || 0,
                    repositories: weeklyData?.repositories || []
                },
                monthlyDetails: {
                    commits: monthlyData?.commits || 0,
                    additions: monthlyData?.additions || 0,
                    deletions: monthlyData?.deletions || 0,
                    netLines: monthlyData?.netLines || 0,
                    repositories: monthlyData?.repositories || []
                },
                generatedAt: new Date().toISOString()
            };

            setCache(cacheKey, response);
            return res.json(response);
        }

        // Level 3: User not in any cache - must fetch from GitHub API
        console.log(`🔍 User ${username} not in cache - fetching from GitHub API...`);

        const tracker = new MultiRepoTracker(
            config.github.organization,
            config.github.token,
            config.github.repositories
        );

        let dailyResult, weeklyResult, monthlyResult;

        if (period === 'all') {
            [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
                tracker.aggregateStats('daily', date),
                tracker.aggregateStats('weekly', date),
                tracker.aggregateStats('monthly', date)
            ]);
        } else if (period === 'daily') {
            dailyResult = await tracker.aggregateStats('daily', date);
        } else if (period === 'weekly') {
            weeklyResult = await tracker.aggregateStats('weekly', date);
        } else if (period === 'monthly') {
            monthlyResult = await tracker.aggregateStats('monthly', date);
        }

        const userExistsInDaily = dailyResult?.aggregated && username in dailyResult.aggregated;
        const userExistsInWeekly = weeklyResult?.aggregated && username in weeklyResult.aggregated;
        const userExistsInMonthly = monthlyResult?.aggregated && username in monthlyResult.aggregated;

        const dailyStats = dailyResult?.aggregated?.[username];
        const weeklyStats = weeklyResult?.aggregated?.[username];
        const monthlyStats = monthlyResult?.aggregated?.[username];

        if (!userExistsInDaily && !userExistsInWeekly && !userExistsInMonthly) {
            return res.status(404).json({ 
                error: 'User not found',
                message: `No contributions found for user: ${username}`
            });
        }

        const response = {
            username,
            name: dailyStats?.name || weeklyStats?.name || monthlyStats?.name || username,
            email: dailyStats?.email || weeklyStats?.email || monthlyStats?.email || '',
            date: dateStr,
            period,
            daily: dailyStats?.commits || 0,
            weekly: weeklyStats?.commits || 0,
            monthly: monthlyStats?.commits || 0,
            dailyDetails: {
                commits: dailyStats?.commits || 0,
                additions: dailyStats?.additions || 0,
                deletions: dailyStats?.deletions || 0,
                netLines: dailyStats?.netLines || 0,
                repositories: dailyStats?.repositories || []
            },
            weeklyDetails: {
                commits: weeklyStats?.commits || 0,
                additions: weeklyStats?.additions || 0,
                deletions: weeklyStats?.deletions || 0,
                netLines: weeklyStats?.netLines || 0,
                repositories: weeklyStats?.repositories || []
            },
            monthlyDetails: {
                commits: monthlyStats?.commits || 0,
                additions: monthlyStats?.additions || 0,
                deletions: monthlyStats?.deletions || 0,
                netLines: monthlyStats?.netLines || 0,
                repositories: monthlyStats?.repositories || []
            },
            generatedAt: new Date().toISOString()
        };

        setCache(cacheKey, response);
        res.json(response);
    } catch (error) {
        console.error('Error in /api/user:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics', message: error.message });
    }
});

/**
 * GET /api/leaderboard/:period
 */
app.get('/api/leaderboard/:period', async (req, res) => {
    try {
        const { period } = req.params;
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const topN = parseInt(req.query.top) || 10;
        const bottomN = parseInt(req.query.bottom) || 10;

        if (!['daily', 'weekly', 'monthly'].includes(period)) {
            return res.status(400).json({ error: 'Invalid period. Use daily, weekly, or monthly' });
        }

        console.log(`🔍 Fetching leaderboard for ${period}...`);

        const tracker = new MultiRepoTracker(
            config.github.organization,
            config.github.token,
            config.github.repositories
        );

        const { aggregated } = await tracker.aggregateStats(period, date);
        const leaderboard = tracker.createLeaderboard(aggregated, null);

        const top = leaderboard.slice(0, topN);
        const lowestCommits = leaderboard[leaderboard.length - 1]?.commits || 0;
        const bottom = leaderboard
            .filter(user => user.commits === lowestCommits || leaderboard.indexOf(user) >= leaderboard.length - bottomN)
            .reverse();

        res.json({
            period,
            date: date.toISOString().split('T')[0],
            top,
            bottom,
            total: leaderboard.length,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in /api/leaderboard:', error);
        res.status(500).json({ error: 'Failed to generate leaderboard', message: error.message });
    }
});

/**
 * GET /api/stats
 */
app.get('/api/stats', async (req, res) => {
    try {
        console.log('🔍 Fetching overall statistics...');

        const tracker = new MultiRepoTracker(
            config.github.organization,
            config.github.token,
            config.github.repositories
        );

        const allRepos = await tracker.getAllRepositories();
        const allContributors = await tracker.getAllContributors();

        res.json({
            organization: config.github.organization,
            totalRepositories: allRepos.length,
            totalContributors: allContributors.length,
            repositories: allRepos,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in /api/stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
    }
});

/**
 * GET /api/cache/status
 */
app.get('/api/cache/status', async (req, res) => {
    try {
        const cacheStatus = {
            memoryCache: {
                entries: cache.size,
                duration: `${CACHE_DURATION / 60000} minutes`
            },
            fileCache: {
                duration: `${FILE_CACHE_DURATION / 60000} minutes`,
                available: []
            }
        };

        const periods = ['daily', 'weekly', 'monthly'];
        for (const period of periods) {
            try {
                const reportsDir = path.join(__dirname, '../reports', period);
                const files = await fs.readdir(reportsDir);
                const jsonFiles = files.filter(f => f.endsWith('.json'));
                
                for (const file of jsonFiles) {
                    const filePath = path.join(reportsDir, file);
                    const stats = await fs.stat(filePath);
                    const ageMinutes = Math.round((Date.now() - stats.mtimeMs) / 60000);
                    const isValid = ageMinutes < (FILE_CACHE_DURATION / 60000);
                    
                    cacheStatus.fileCache.available.push({
                        file,
                        period,
                        ageMinutes,
                        isValid,
                        size: `${(stats.size / 1024).toFixed(2)} KB`
                    });
                }
            } catch (error) {
                // Directory doesn't exist
            }
        }

        res.json(cacheStatus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get cache status', message: error.message });
    }
});

/**
 * GET /api/cache/clear
 */
app.get('/api/cache/clear', (req, res) => {
    const size = cache.size;
    cache.clear();
    console.log(`🗑️  Memory cache cleared (${size} entries removed)`);
    res.json({ message: 'Memory cache cleared successfully', entriesRemoved: size });
});

/**
 * GET /api/cache/clear-all
 */
app.get('/api/cache/clear-all', async (req, res) => {
    try {
        const memorySize = cache.size;
        cache.clear();
        
        let filesDeleted = 0;
        const periods = ['daily', 'weekly', 'monthly'];
        
        for (const period of periods) {
            try {
                const reportsDir = path.join(__dirname, '../reports', period);
                const files = await fs.readdir(reportsDir);
                const jsonFiles = files.filter(f => f.endsWith('.json'));
                
                for (const file of jsonFiles) {
                    const filePath = path.join(reportsDir, file);
                    await fs.unlink(filePath);
                    filesDeleted++;
                    console.log(`🗑️  Deleted: ${period}/${file}`);
                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.log(`⚠️  Error in ${period}: ${error.message}`);
                }
            }
        }
        
        console.log(`\n🗑️  Cache cleared: ${memorySize} memory entries, ${filesDeleted} files deleted\n`);
        
        res.json({ 
            message: 'All cache cleared successfully',
            memoryEntriesRemoved: memorySize,
            filesDeleted: filesDeleted
        });
    } catch (error) {
        console.error('Error clearing all cache:', error);
        res.status(500).json({ error: 'Failed to clear cache', message: error.message });
    }
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        cacheSize: cache.size,
        config: {
            organization: config.github.organization,
            hasToken: !!config.github.token
        }
    });
});

// Serve dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
});

// Start server with auto-report generation
generateMissingReports().then(() => {
    app.listen(PORT, () => {
        console.log('═'.repeat(70));
        console.log('🚀 GitHub Dashboard with Smart File Caching');
        console.log('═'.repeat(70));
        console.log(`📊 Dashboard: http://localhost:${PORT}`);
        console.log(`🔌 API:       http://localhost:${PORT}/api`);
        console.log('─'.repeat(70));
        console.log('💾 Caching: Memory (5min) → File (1hr) → API');
        console.log(`📁 Reports:  ${path.join(__dirname, '../reports')}`);
        console.log('─'.repeat(70));
        console.log(`🏢 Org: ${config.github.organization}`);
        console.log(`🔑 Token: ${config.github.token ? '✅' : '❌'}`);
        console.log('═'.repeat(70) + '\n');
    });
}).catch(error => {
    console.error('❌ Failed to generate reports:', error);
    app.listen(PORT, () => {
        console.log(`📊 Dashboard running at http://localhost:${PORT}`);
    });
});

module.exports = app;
