#!/usr/bin/env node

/**
 * Multi-Repository GitHub Dev Tracker for SoluLab
 * Tracks contributions across ALL repositories in an organization
 */

const GitHubDevTracker = require('./GithubDevTracker.js');
const Table = require('cli-table3');
const fs = require('fs').promises;
const { Command } = require('commander');

class MultiRepoTracker {
    constructor(orgName, githubToken, repositories = null) {
        this.orgName = orgName;
        this.githubToken = githubToken;
        this.repositories = repositories; // null = all repos, or array of specific repos
        this.headers = {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        };
    }

    /**
     * Get all repositories in the organization
     */
    async getAllRepositories() {
        const axios = require('axios');
        const repos = [];
        let page = 1;
        const perPage = 100;

        console.log(`📋 Fetching repositories for organization: ${this.orgName}...`);

        while (true) {
            try {
                const response = await axios.get(
                    `https://api.github.com/orgs/${this.orgName}/repos`,
                    {
                        headers: this.headers,
                        params: {
                            per_page: perPage,
                            page: page,
                            type: 'all' // public, private, or all
                        }
                    }
                );

                const pageRepos = response.data;
                if (!pageRepos || pageRepos.length === 0) {
                    break;
                }

                repos.push(...pageRepos.map(r => r.name));
                page++;

                if (pageRepos.length < perPage) {
                    break;
                }
            } catch (error) {
                console.error(`Error fetching repositories: ${error.message}`);
                break;
            }
        }

        console.log(`✅ Found ${repos.length} repositories\n`);
        return repos;
    }

    /**
     * Aggregate statistics across all repositories
     */
    async aggregateStats(period, date = null) {
        // Get list of repositories to track
        const reposToTrack = this.repositories || await this.getAllRepositories();

        if (reposToTrack.length === 0) {
            console.log('No repositories found.');
            return { aggregated: {}, byRepo: {} };
        }

        console.log(`🔍 Analyzing ${reposToTrack.length} repositories...`);
        console.log(`   Repositories: ${reposToTrack.join(', ')}\n`);

        const aggregatedStats = {};
        const statsByRepo = {};

        // Track progress
        let completed = 0;

        for (const repo of reposToTrack) {
            completed++;
            console.log(`\n[${completed}/${reposToTrack.length}] Processing: ${repo}...`);

            try {
                const tracker = new GitHubDevTracker(this.orgName, repo, this.githubToken);

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
                    default:
                        stats = await tracker.getDailyReport(date);
                }

                // Store stats by repository
                statsByRepo[repo] = stats;

                // Aggregate stats by developer
                for (const [dev, data] of Object.entries(stats)) {
                    if (!aggregatedStats[dev]) {
                        aggregatedStats[dev] = {
                            commits: 0,
                            additions: 0,
                            deletions: 0,
                            netLines: 0,
                            repositories: [],
                            email: data.email,
                            name: data.name
                        };
                    }

                    aggregatedStats[dev].commits += data.commits;
                    aggregatedStats[dev].additions += data.additions;
                    aggregatedStats[dev].deletions += data.deletions;
                    aggregatedStats[dev].netLines += data.netLines;
                    
                    if (!aggregatedStats[dev].repositories.includes(repo)) {
                        aggregatedStats[dev].repositories.push(repo);
                    }
                }

                console.log(`   ✅ ${repo}: ${Object.keys(stats).length} developers, ${Object.values(stats).reduce((sum, s) => sum + s.commits, 0)} commits`);
            } catch (error) {
                console.error(`   ❌ Error processing ${repo}: ${error.message}`);
                statsByRepo[repo] = {};
            }
        }

        return { aggregated: aggregatedStats, byRepo: statsByRepo };
    }

    /**
     * Create leaderboard from aggregated stats
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
                netLines: data.netLines,
                repoCount: data.repositories.length,
                repositories: data.repositories
            });
        }

        // Sort by net lines (descending)
        leaderboard.sort((a, b) => b.netLines - a.netLines);

        return leaderboard.slice(0, topN);
    }

    /**
     * Print aggregated report
     */
    printAggregatedReport(period, stats, date = null) {
        if (!date) {
            date = new Date();
        }

        console.log('\n' + '='.repeat(90));
        console.log('SoluLab Multi-Repository Contribution Report'.padStart(55));
        
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
        
        console.log('='.repeat(90) + '\n');

        if (Object.keys(stats).length === 0) {
            console.log('No commits found for this period.\n');
            return;
        }

        // Create leaderboard
        const leaderboard = this.createLeaderboard(stats, 20);

        // Create table
        const table = new Table({
            head: ['Rank', 'Username', 'Name', 'Repos', 'Commits', 'Additions', 'Deletions', 'Net Lines'],
            colWidths: [6, 18, 22, 8, 10, 12, 12, 12]
        });

        leaderboard.forEach((dev, index) => {
            table.push([
                index + 1,
                dev.username,
                dev.name,
                dev.repoCount,
                dev.commits,
                `+${dev.additions}`,
                `-${dev.deletions}`,
                dev.netLines
            ]);
        });

        console.log(table.toString());

        // Show top contributor details
        if (leaderboard.length > 0) {
            console.log(`\n🏆 Top Contributor: ${leaderboard[0].username}`);
            console.log(`   Repositories: ${leaderboard[0].repositories.join(', ')}`);
        }

        // Summary statistics
        const totalDevs = Object.keys(stats).length;
        const totalCommits = Object.values(stats).reduce((sum, data) => sum + data.commits, 0);
        const totalAdditions = Object.values(stats).reduce((sum, data) => sum + data.additions, 0);
        const totalDeletions = Object.values(stats).reduce((sum, data) => sum + data.deletions, 0);
        const totalNet = totalAdditions - totalDeletions;

        // Count unique repos with activity
        const activeRepos = new Set();
        Object.values(stats).forEach(data => {
            data.repositories.forEach(repo => activeRepos.add(repo));
        });

        console.log(`\n${'SUMMARY'.padStart(45)}`);
        console.log('-'.repeat(90));
        console.log(`Total Repositories with Activity: ${activeRepos.size}`);
        console.log(`Total Developers Active: ${totalDevs}`);
        console.log(`Total Commits: ${totalCommits}`);
        console.log(`Total Lines Added: +${totalAdditions}`);
        console.log(`Total Lines Deleted: -${totalDeletions}`);
        console.log(`Net Lines Changed: ${totalNet}`);
        console.log('-'.repeat(90) + '\n');
    }

    /**
     * Print repository breakdown
     */
    printRepositoryBreakdown(statsByRepo) {
        console.log('\n' + '='.repeat(90));
        console.log('Repository Breakdown'.padStart(50));
        console.log('='.repeat(90) + '\n');

        const repoTable = new Table({
            head: ['Repository', 'Developers', 'Commits', 'Additions', 'Deletions', 'Net Lines'],
            colWidths: [30, 12, 10, 12, 12, 12]
        });

        const repoSummary = [];

        for (const [repo, stats] of Object.entries(statsByRepo)) {
            const devCount = Object.keys(stats).length;
            const commits = Object.values(stats).reduce((sum, s) => sum + s.commits, 0);
            const additions = Object.values(stats).reduce((sum, s) => sum + s.additions, 0);
            const deletions = Object.values(stats).reduce((sum, s) => sum + s.deletions, 0);
            const netLines = additions - deletions;

            repoSummary.push({
                repo,
                devCount,
                commits,
                additions,
                deletions,
                netLines
            });
        }

        // Sort by commits
        repoSummary.sort((a, b) => b.commits - a.commits);

        repoSummary.forEach(r => {
            repoTable.push([
                r.repo,
                r.devCount,
                r.commits,
                `+${r.additions}`,
                `-${r.deletions}`,
                r.netLines
            ]);
        });

        console.log(repoTable.toString());
        console.log();
    }

    /**
     * Export to JSON
     */
    async exportToJson(aggregated, byRepo, filename) {
        const data = {
            aggregated,
            byRepo,
            generatedAt: new Date().toISOString()
        };

        await fs.writeFile(filename, JSON.stringify(data, null, 2));
        console.log(`📄 Report exported to ${filename}`);
    }
}

async function main() {
    const program = new Command();

    program
        .name('multi-repo-tracker')
        .description('Track GitHub developer contributions across multiple repositories')
        .requiredOption('--org <organization>', 'GitHub organization name')
        .requiredOption('--token <token>', 'GitHub personal access token')
        .option('--repos <repositories>', 'Comma-separated list of repositories (leave empty for all repos)')
        .option('--period <type>', 'Report period: daily, weekly, or monthly', 'daily')
        .option('--date <date>', 'Date for report (YYYY-MM-DD), defaults to today')
        .option('--export', 'Export to JSON file')
        .option('--breakdown', 'Show repository breakdown');

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

    // Parse repositories
    const repositories = options.repos ? options.repos.split(',').map(r => r.trim()) : null;

    // Initialize tracker
    const tracker = new MultiRepoTracker(options.org, options.token, repositories);

    try {
        console.log('═══════════════════════════════════════════════════════════════════════════════');
        console.log(`                   SoluLab Multi-Repository Tracker`);
        console.log(`                   Organization: ${options.org}`);
        if (repositories) {
            console.log(`                   Repositories: ${repositories.length} selected`);
        } else {
            console.log(`                   Repositories: ALL`);
        }
        console.log('═══════════════════════════════════════════════════════════════════════════════\n');

        // Get aggregated stats
        const { aggregated, byRepo } = await tracker.aggregateStats(options.period, reportDate);

        // Print aggregated report
        tracker.printAggregatedReport(options.period, aggregated, reportDate);

        // Print repository breakdown if requested
        if (options.breakdown) {
            tracker.printRepositoryBreakdown(byRepo);
        }

        // Export if requested
        if (options.export) {
            const dateStr = reportDate.toISOString().split('T')[0];
            const filename = `multi_repo_${options.period}_report_${dateStr}.json`;
            await tracker.exportToJson(aggregated, byRepo, filename);
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

module.exports = MultiRepoTracker; 