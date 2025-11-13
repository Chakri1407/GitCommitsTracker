#!/usr/bin/env node

/**
 * GitHub Developer Contribution Tracker for SoluLab
 * Tracks lines of code committed by each developer with leaderboards and reports
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
     * Get all commits in a date range
     */
    async getCommitsInRange(since, until) {
        const commits = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            try {
                const response = await axios.get(`${this.baseUrl}/commits`, {
                    headers: this.headers,
                    params: {
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
                console.error(`Error fetching commits: ${error.message}`);
                if (error.response) {
                    console.error(`Status: ${error.response.status}`);
                    console.error(`Data:`, error.response.data);
                }
                break;
            }
        }

        return commits;
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
            const response = await axios.get(`${this.baseUrl}/contributors`, {
                headers: this.headers
            });

            return response.data.map(c => c.login);
        } catch (error) {
            console.error(`Error fetching contributors: ${error.message}`);
            return [];
        }
    }

    /**
     * Analyze commits and return statistics per developer
     */
    async analyzeCommits(since, until) {
        console.log(`Fetching commits from ${since.toISOString().split('T')[0]} to ${until.toISOString().split('T')[0]}...`);
        
        const commits = await this.getCommitsInRange(since, until);
        console.log(`Found ${commits.length} commits. Analyzing...`);

        const devStats = {};

        for (let idx = 0; idx < commits.length; idx++) {
            if (idx % 10 === 0) {
                console.log(`Processing commit ${idx + 1}/${commits.length}...`);
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
     * Create leaderboard sorted by net lines of code
     */
    createLeaderboard(stats, topN = 10) {
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

        // Sort by net lines (descending)
        leaderboard.sort((a, b) => b.netLines - a.netLines);

        return leaderboard.slice(0, topN);
    }

    /**
     * Get list of developers who haven't committed on given day
     */
    async getInactiveDevs(date = null) {
        const allContributors = await this.getAllContributors();
        const dailyStats = await this.getDailyReport(date);
        const activeDevs = new Set(Object.keys(dailyStats));

        return allContributors.filter(dev => !activeDevs.has(dev));
    }

    /**
     * Print formatted report
     */
    printReport(period, stats, date = null) {
        if (!date) {
            date = new Date();
        }

        console.log('\n' + '='.repeat(80));
        console.log('SoluLab GitHub Contribution Report'.padStart(50));
        
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

        if (Object.keys(stats).length === 0) {
            console.log('No commits found for this period.\n');
            return;
        }

        // Create leaderboard
        const leaderboard = this.createLeaderboard(stats, 10);

        // Create table
        const table = new Table({
            head: ['Rank', 'Username', 'Name', 'Commits', 'Additions', 'Deletions', 'Net Lines'],
            colWidths: [6, 20, 25, 10, 12, 12, 12]
        });

        leaderboard.forEach((dev, index) => {
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

        console.log(table.toString());

        // Summary statistics
        const totalCommits = Object.values(stats).reduce((sum, data) => sum + data.commits, 0);
        const totalAdditions = Object.values(stats).reduce((sum, data) => sum + data.additions, 0);
        const totalDeletions = Object.values(stats).reduce((sum, data) => sum + data.deletions, 0);
        const totalNet = totalAdditions - totalDeletions;

        console.log(`\n${'SUMMARY'.padStart(45)}`);
        console.log('-'.repeat(80));
        console.log(`Total Developers Active: ${Object.keys(stats).length}`);
        console.log(`Total Commits: ${totalCommits}`);
        console.log(`Total Lines Added: +${totalAdditions}`);
        console.log(`Total Lines Deleted: -${totalDeletions}`);
        console.log(`Net Lines Changed: ${totalNet}`);
        console.log('-'.repeat(80) + '\n');
    }

    /**
     * Print report of inactive developers
     */
    async printInactiveReport(date = null) {
        if (!date) {
            date = new Date();
        }

        const inactive = await this.getInactiveDevs(date);

        console.log('\n' + '='.repeat(80));
        console.log('INACTIVE DEVELOPERS REPORT'.padStart(50));
        console.log(`Date: ${date.toISOString().split('T')[0]}`);
        console.log('='.repeat(80) + '\n');

        if (inactive.length === 0) {
            console.log('✓ All contributors have made commits today!\n');
        } else {
            console.log(`The following ${inactive.length} developer(s) have NOT committed today:\n`);
            inactive.forEach(dev => {
                console.log(`  • ${dev}`);
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
        .description('Track GitHub developer contributions for SoluLab repositories')
        .requiredOption('--org <organization>', 'GitHub organization name (e.g., SoluLab)')
        .requiredOption('--repo <repository>', 'Repository name')
        .requiredOption('--token <token>', 'GitHub personal access token')
        .option('--period <type>', 'Report period: daily, weekly, monthly, or all', 'all')
        .option('--date <date>', 'Date for report (YYYY-MM-DD), defaults to today')
        .option('--inactive', 'Show inactive developers report')
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
            tracker.printReport('daily', dailyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    dailyStats,
                    `daily_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        if (options.period === 'weekly' || options.period === 'all') {
            const weeklyStats = await tracker.getWeeklyReport(reportDate);
            tracker.printReport('weekly', weeklyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    weeklyStats,
                    `weekly_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        if (options.period === 'monthly' || options.period === 'all') {
            const monthlyStats = await tracker.getMonthlyReport(reportDate);
            tracker.printReport('monthly', monthlyStats, reportDate);
            if (options.export) {
                await tracker.exportToJson(
                    monthlyStats,
                    `monthly_report_${reportDate.toISOString().split('T')[0]}.json`
                );
            }
        }

        // Inactive developers report
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