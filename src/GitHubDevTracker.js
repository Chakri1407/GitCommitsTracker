#!/usr/bin/env node

/**
 * GitHub Developer Contribution Tracker for SoluLab
 * Tracks lines of code committed by each developer with leaderboards and reports
 * Enhanced version with ALL BRANCHES support and inactive users display
 */

const axios = require('axios');
const Table = require('cli-table3');
const fs = require('fs').promises;
const { Command } = require('commander');

class GitHubDevTracker {
    constructor(orgName, repoName, githubToken) {
        this.orgName = orgName;
        this.repoName = repoName;
        this.headers = {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        this.baseUrl = `https://api.github.com/repos/${orgName}/${repoName}`;
    }

    /**
     * Get all branches in the repository
     */
    async getAllBranches() {
        const branches = [];
        let page = 1;
        const perPage = 100;

        try {
            while (true) {
                const response = await axios.get(`${this.baseUrl}/branches`, {
                    headers: this.headers,
                    params: {
                        per_page: perPage,
                        page: page
                    }
                });

                const pageBranches = response.data;

                if (!pageBranches || pageBranches.length === 0) {
                    break;
                }

                branches.push(...pageBranches.map(b => b.name));
                page++;

                if (pageBranches.length < perPage) {
                    break;
                }
            }
        } catch (error) {
            console.error(`Error fetching branches: ${error.message}`);
        }

        return branches;
    }

    /**
     * Get all commits from a specific branch in a date range
     */
    async getCommitsFromBranch(branchName, since, until) {
        const commits = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            try {
                const response = await axios.get(`${this.baseUrl}/commits`, {
                    headers: this.headers,
                    params: {
                        sha: branchName,  // Specify branch
                        since: since.toISOString(),
                        until: until.toISOString(),
                        per_page: perPage,
                        page: page
                    }
                });

                const pageCommits = response.data;

                if (!pageCommits || pageCommits.length === 0) {
                    break;
                }

                commits.push(...pageCommits);
                page++;

                // If we got less than perPage, we're done
                if (pageCommits.length < perPage) {
                    break;
                }
            } catch (error) {
                // Branch might not exist or be accessible, skip it
                if (error.response && error.response.status === 409) {
                    // Empty repository
                    break;
                }
                console.error(`Error fetching commits from branch ${branchName}: ${error.message}`);
                break;
            }
        }

        return commits;
    }

    /**
     * Get all commits from ALL branches in a date range
     */
    async getCommitsInRange(since, until) {
        console.log(`📋 Fetching all branches...`);
        const branches = await this.getAllBranches();
        
        if (branches.length === 0) {
            console.log(`⚠️  No branches found in repository`);
            return [];
        }

        console.log(`✅ Found ${branches.length} branch(es): ${branches.slice(0, 5).join(', ')}${branches.length > 5 ? ` (+${branches.length - 5} more)` : ''}`);
        console.log(`📊 Fetching commits from all branches (${since.toISOString().split('T')[0]} to ${until.toISOString().split('T')[0]})...`);

        const allCommits = new Map(); // Use Map to deduplicate by SHA

        for (let i = 0; i < branches.length; i++) {
            const branch = branches[i];
            const branchCommits = await this.getCommitsFromBranch(branch, since, until);
            
            if (branchCommits.length > 0) {
                console.log(`   Branch "${branch}": ${branchCommits.length} commits`);
                
                // Add commits to map (automatically deduplicates by SHA)
                branchCommits.forEach(commit => {
                    if (!allCommits.has(commit.sha)) {
                        allCommits.set(commit.sha, commit);
                    }
                });
            }
        }

        const uniqueCommits = Array.from(allCommits.values());
        console.log(`✅ Total unique commits across all branches: ${uniqueCommits.length}\n`);

        return uniqueCommits;
    }

    /**
     * Get additions and deletions for a specific commit
     */
    async getCommitStats(commitSha) {
        try {
            const response = await axios.get(`${this.baseUrl}/commits/${commitSha}`, {
                headers: this.headers
            });

            const stats = response.data.stats || {};
            return {
                additions: stats.additions || 0,
                deletions: stats.deletions || 0
            };
        } catch (error) {
            console.error(`Error fetching commit stats for ${commitSha}: ${error.message}`);
            return { additions: 0, deletions: 0 };
        }
    }

    /**
     * Get list of all contributors to the repository
     */
    async getAllContributors() {
        try {
            let page = 1;
            const perPage = 100;
            const allContributors = [];

            while (true) {
                const response = await axios.get(`${this.baseUrl}/contributors`, {
                    headers: this.headers,
                    params: {
                        per_page: perPage,
                        page: page,
                        anon: 'false'
                    }
                });

                const contributors = response.data;

                if (!contributors || contributors.length === 0) {
                    break;
                }

                allContributors.push(...contributors.map(c => ({
                    login: c.login,
                    name: c.login,
                    contributions: c.contributions
                })));

                page++;

                // If we got less than perPage, we're done
                if (contributors.length < perPage) {
                    break;
                }
            }

            return allContributors;
        } catch (error) {
            console.error(`Error fetching contributors: ${error.message}`);
            return [];
        }
    }

    /**
     * Analyze commits and return statistics per developer
     */
    async analyzeCommits(since, until) {
        const commits = await this.getCommitsInRange(since, until);
        
        if (commits.length === 0) {
            console.log('No commits found in the specified period.\n');
            return {};
        }

        console.log(`🔍 Analyzing ${commits.length} commits...`);

        const devStats = {};

        for (let idx = 0; idx < commits.length; idx++) {
            if (idx % 10 === 0 && idx > 0) {
                console.log(`   Processing commit ${idx}/${commits.length}...`);
            }

            const commit = commits[idx];
            const author = commit.commit.author;
            const authorName = author.name || 'Unknown';
            const authorEmail = author.email || 'unknown@email.com';

            // Use GitHub login if available, otherwise use name
            const authorId = commit.author ? commit.author.login : authorName;

            const commitSha = commit.sha;
            const stats = await this.getCommitStats(commitSha);

            if (!devStats[authorId]) {
                devStats[authorId] = {
                    commits: 0,
                    additions: 0,
                    deletions: 0,
                    netLines: 0,
                    commitShas: [],
                    email: authorEmail,
                    name: authorName
                };
            }

            devStats[authorId].commits += 1;
            devStats[authorId].additions += stats.additions;
            devStats[authorId].deletions += stats.deletions;
            devStats[authorId].netLines += (stats.additions - stats.deletions);
            devStats[authorId].commitShas.push(commitSha);
        }

        console.log(`✅ Analysis complete!\n`);
        return devStats;
    }

    /**
     * Get report for a specific day
     */
    async getDailyReport(date = null) {
        if (!date) {
            date = new Date();
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        return await this.analyzeCommits(startOfDay, endOfDay);
    }

    /**
     * Get report for the last 7 days from today
     */
    async getWeeklyReport(date = null) {
        if (!date) {
            date = new Date();
        }

        // End date is today (end of day)
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Start date is 7 days ago (start of day)
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        return await this.analyzeCommits(startDate, endDate);
    }

    /**
     * Get report for the last 30 days from today
     */
    async getMonthlyReport(date = null) {
        if (!date) {
            date = new Date();
        }

        // End date is today (end of day)
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        // Start date is 30 days ago (start of day)
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        return await this.analyzeCommits(startDate, endDate);
    }

    /**
     * Create leaderboard sorted by number of commits
     */
    createLeaderboard(stats, topN = null) {
        const leaderboard = [];

        for (const [dev, data] of Object.entries(stats)) {
            leaderboard.push({
                username: dev,
                name: data.name,
                commits: data.commits,
                additions: data.additions,
                deletions: data.deletions,
                netLines: data.netLines
            });
        }

        // Sort by commits (descending), then by net lines if commits are equal
        leaderboard.sort((a, b) => {
            if (b.commits !== a.commits) {
                return b.commits - a.commits;
            }
            return b.netLines - a.netLines;
        });

        // Return all if topN is null, otherwise return top N
        return topN ? leaderboard.slice(0, topN) : leaderboard;
    }

    /**
     * Get list of developers who haven't committed in the given period
     */
    async getInactiveDevs(activeStats) {
        const allContributors = await this.getAllContributors();
        const activeDevs = new Set(Object.keys(activeStats));

        const inactiveDevs = allContributors
            .filter(contributor => !activeDevs.has(contributor.login))
            .map(contributor => ({
                username: contributor.login,
                name: contributor.name,
                commits: 0,
                additions: 0,
                deletions: 0,
                netLines: 0
            }));

        return inactiveDevs;
    }

    /**
     * Print formatted report with inactive users
     */
    async printReport(period, stats, date = null) {
        if (!date) {
            date = new Date();
        }

        console.log('\n' + '='.repeat(80));
        console.log('SoluLab GitHub Contribution Report'.padStart(50));
        console.log(`Repository: ${this.repoName} (ALL BRANCHES)`.padStart(50));
        
        // Show date range for weekly and monthly reports
        if (period === 'weekly') {
            const endDate = new Date(date);
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 7);
            console.log(`${period.toUpperCase()} REPORT (Last 7 Days) - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
        } else if (period === 'monthly') {
            const endDate = new Date(date);
            const startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 30);
            console.log(`${period.toUpperCase()} REPORT (Last 30 Days) - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
        } else {
            console.log(`${period.toUpperCase()} REPORT - ${date.toISOString().split('T')[0]}`);
        }
        
        console.log('='.repeat(80) + '\n');

        // Get all contributors including inactive ones
        const inactiveDevs = await this.getInactiveDevs(stats);

        // Create leaderboard - active developers
        const activeLeaderboard = this.createLeaderboard(stats, null);

        // Create table
        const table = new Table({
            head: ['Rank', 'Username', 'Name', 'Commits', 'Additions', 'Deletions', 'Net Lines'],
            colWidths: [6, 20, 25, 10, 12, 12, 12]
        });

        // Add active developers
        if (activeLeaderboard.length > 0) {
            activeLeaderboard.forEach((dev, index) => {
                table.push([
                    index + 1,
                    dev.username,
                    dev.name,
                    dev.commits,
                    `+${dev.additions}`,
                    `-${dev.deletions}`,
                    dev.netLines
                ]);
            });
        }

        // Add separator if there are inactive developers
        if (inactiveDevs.length > 0) {
            table.push([
                { colSpan: 7, content: '--- Inactive Team Members (No commits in this period) ---', hAlign: 'center' }
            ]);

            // Add inactive developers
            inactiveDevs.forEach((dev) => {
                table.push([
                    '-',
                    dev.username,
                    dev.name,
                    0,
                    '+0',
                    '-0',
                    0
                ]);
            });
        }

        // If no active or inactive developers
        if (activeLeaderboard.length === 0 && inactiveDevs.length === 0) {
            console.log('No team members found.\n');
            return;
        }

        console.log(table.toString());

        // Show top contributor (if any)
        if (activeLeaderboard.length > 0) {
            console.log(`\n🏆 Top Contributor: ${activeLeaderboard[0].username}`);
            console.log(`   Total Commits: ${activeLeaderboard[0].commits}`);
            console.log(`   Net Lines: ${activeLeaderboard[0].netLines}`);
        }

        // Summary statistics
        const totalDevs = activeLeaderboard.length + inactiveDevs.length;
        const activeDevCount = activeLeaderboard.length;
        const inactiveDevCount = inactiveDevs.length;
        const totalCommits = Object.values(stats).reduce((sum, data) => sum + data.commits, 0);
        const totalAdditions = Object.values(stats).reduce((sum, data) => sum + data.additions, 0);
        const totalDeletions = Object.values(stats).reduce((sum, data) => sum + data.deletions, 0);
        const totalNet = totalAdditions - totalDeletions;

        console.log(`\n${'SUMMARY'.padStart(45)}`);
        console.log('-'.repeat(80));
        console.log(`Total Team Members: ${totalDevs}`);
        console.log(`Active Developers: ${activeDevCount}`);
        console.log(`Inactive Developers: ${inactiveDevCount}`);
        console.log(`Total Commits: ${totalCommits} (from ALL branches)`);
        console.log(`Total Lines Added: +${totalAdditions}`);
        console.log(`Total Lines Deleted: -${totalDeletions}`);
        console.log(`Net Lines Changed: ${totalNet}`);
        console.log('-'.repeat(80) + '\n');
    }

    /**
     * Print report of inactive developers (legacy method for backward compatibility)
     */
    async printInactiveReport(date = null) {
        if (!date) {
            date = new Date();
        }

        const dailyStats = await this.getDailyReport(date);
        const inactive = await this.getInactiveDevs(dailyStats);

        console.log('\n' + '='.repeat(80));
        console.log('INACTIVE DEVELOPERS REPORT'.padStart(50));
        console.log(`Date: ${date.toISOString().split('T')[0]}`);
        console.log('='.repeat(80) + '\n');

        if (inactive.length === 0) {
            console.log('✓ All contributors have made commits today!\n');
        } else {
            console.log(`The following ${inactive.length} developer(s) have NOT committed today:\n`);
            inactive.forEach(dev => {
                console.log(`  • ${dev.username}`);
            });
            console.log();
        }
    }

    /**
     * Export statistics to JSON file
     */
    async exportToJson(stats, filename) {
        try {
            await fs.writeFile(filename, JSON.stringify(stats, null, 2));
            console.log(`Report exported to ${filename}`);
        } catch (error) {
            console.error(`Error exporting to JSON: ${error.message}`);
        }
    }
}

async function main() {
    const program = new Command();

    program
        .name('github-dev-tracker')
        .description('Track GitHub developer contributions for SoluLab repositories (ALL BRANCHES)')
        .requiredOption('--org <organization>', 'GitHub organization name (e.g., SoluLab)')
        .requiredOption('--repo <repository>', 'Repository name')
        .requiredOption('--token <token>', 'GitHub personal access token')
        .option('--period <type>', 'Report period: daily, weekly, monthly, or all', 'all')
        .option('--date <date>', 'Date for report (YYYY-MM-DD), defaults to today')
        .option('--inactive', 'Show inactive developers report (separate)')
        .option('--export', 'Export to JSON file');

    program.parse();

    const options = program.opts();

    // Parse date if provided
    let reportDate = new Date();
    if (options.date) {
        reportDate = new Date(options.date);
        if (isNaN(reportDate.getTime())) {
            console.error('Invalid date format. Use YYYY-MM-DD');
            process.exit(1);
        }
    }

    // Initialize tracker
    const tracker = new GitHubDevTracker(options.org, options.repo, options.token);

    try {
        // Generate reports based on period
        if (options.period === 'daily' || options.period === 'all') {
            const dailyStats = await tracker.getDailyReport(reportDate);
            await tracker.printReport('daily', dailyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    dailyStats,
                    `daily_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        if (options.period === 'weekly' || options.period === 'all') {
            const weeklyStats = await tracker.getWeeklyReport(reportDate);
            await tracker.printReport('weekly', weeklyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    weeklyStats,
                    `weekly_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        if (options.period === 'monthly' || options.period === 'all') {
            const monthlyStats = await tracker.getMonthlyReport(reportDate);
            await tracker.printReport('monthly', monthlyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    monthlyStats,
                    `monthly_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        // Inactive developers report (separate legacy report)
        if (options.inactive) {
            await tracker.printInactiveReport(reportDate);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = GitHubDevTracker; 
