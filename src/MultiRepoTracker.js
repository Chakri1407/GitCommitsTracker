#!/usr/bin/env node

/**
 * Multi-Repository GitHub Dev Tracker for SoluLab
 * Tracks contributions across ALL repositories in an organization
 * INDEPENDENT VERSION - Does NOT use GitHubDevTracker
 * Fetches commits from DEFAULT BRANCH ONLY (faster for multi-repo)
 * Ranks by COMMITS (primary), NET LINES (tiebreaker)
 */

const axios = require('axios');
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
     * Get all repositories accessible to the user
     * Tries organization endpoint first, falls back to user repos
     */
    async getAllRepositories() {
        const repos = [];
        let page = 1;
        const perPage = 100;
        let totalFetched = 0;

        console.log(`📋 Auto-discovering repositories you have access to...`);

        // Method 1: Try organization endpoint first (works if you're a member)
        if (this.orgName) {
            console.log(`   Attempting to fetch from organization: ${this.orgName}...`);
            
            try {
                while (true) {
                    const response = await axios.get(
                        `https://api.github.com/orgs/${this.orgName}/repos`,
                        {
                            headers: this.headers,
                            params: {
                                per_page: perPage,
                                page: page,
                                type: 'all',
                                sort: 'updated',
                                direction: 'desc'
                            }
                        }
                    );

                    const pageRepos = response.data;
                    
                    if (!pageRepos || pageRepos.length === 0) {
                        break;
                    }
                    
                    totalFetched += pageRepos.length;
                    console.log(`   Page ${page}: Found ${pageRepos.length} repositories (Total: ${totalFetched})`);
                    
                    repos.push(...pageRepos.map(r => r.name));
                    page++;

                    if (pageRepos.length < perPage) {
                        console.log(`   Reached end of organization repositories`);
                        break;
                    }
                }
                
                if (repos.length > 0) {
                    console.log(`✅ Found ${repos.length} repositories in ${this.orgName} organization\n`);
                    return repos;
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log(`   Organization endpoint not accessible (404)`);
                } else {
                    console.log(`   Organization endpoint error: ${error.message}`);
                }
                console.log(`   Falling back to user repositories endpoint...\n`);
            }
        }

        // Method 2: Fallback to user repos endpoint
        page = 1;
        totalFetched = 0;
        repos.length = 0; // Clear any partial results

        while (true) {
            try {
                console.log(`   Fetching page ${page}...`);
                
                const response = await axios.get(
                    'https://api.github.com/user/repos',
                    {
                        headers: this.headers,
                        params: {
                            per_page: perPage,
                            page: page,
                            affiliation: 'owner,collaborator,organization_member',
                            sort: 'updated',
                            direction: 'desc'
                        }
                    }
                );

                const pageRepos = response.data;
                
                if (!pageRepos || pageRepos.length === 0) {
                    console.log(`   No more repositories found.`);
                    break;
                }
                
                totalFetched += pageRepos.length;
                console.log(`   Found ${pageRepos.length} repositories on page ${page} (Total so far: ${totalFetched})`);

                // Filter by organization if specified
                const filteredRepos = this.orgName
                    ? pageRepos.filter(r => {
                        // Case-insensitive comparison
                        return r.owner.login.toLowerCase() === this.orgName.toLowerCase();
                    })
                    : pageRepos;

                const filteredCount = filteredRepos.length;
                if (this.orgName) {
                    console.log(`   After filtering by "${this.orgName}": ${filteredCount} repositories match`);
                }

                repos.push(...filteredRepos.map(r => r.name));
                page++;

                // If we got less than perPage, we're done
                if (pageRepos.length < perPage) {
                    console.log(`   Reached end of repositories (got ${pageRepos.length} < ${perPage})`);
                    break;
                }
            } catch (error) {
                console.error(`   Error fetching repositories page ${page}: ${error.message}`);
                if (error.response) {
                    console.error(`   Status: ${error.response.status}`);
                    if (error.response.status === 401) {
                        console.error(`   ⚠️  Token may be invalid or expired`);
                    }
                }
                break;
            }
        }

        console.log(`✅ Found ${repos.length} repositories${this.orgName ? ` in ${this.orgName}` : ''}\n`);
        
        if (repos.length === 0) {
            console.warn(`⚠️  WARNING: No repositories found! Check:`);
            console.warn(`   1. Token has 'repo' scope`);
            console.warn(`   2. Organization name is correct: "${this.orgName}" (case-sensitive)`);
            console.warn(`   3. You have access to repositories in this organization`);
            console.warn(`   4. Try checking: https://github.com/orgs/${this.orgName}/repositories\n`);
        } else if (repos.length < 20 && this.orgName) {
            console.warn(`⚠️  Note: Found only ${repos.length} repositories.`);
            console.warn(`   If you expect more, verify organization name spelling (case matters!)\n`);
        }
        
        return repos;
    }

    /**
     * Get all contributors from all repositories (including inactive ones)
     */
    async getAllContributors() {
        const allContributors = new Set();
        
        const reposToTrack = this.repositories || await this.getAllRepositories();
        
        console.log(`👥 Fetching all contributors from ${reposToTrack.length} repositories...`);
        
        let repoCount = 0;
        for (const repo of reposToTrack) {
            repoCount++;
            try {
                let page = 1;
                const perPage = 100;
                let repoContributors = 0;
                
                // Paginate through all contributors for this repo
                while (true) {
                    const response = await axios.get(
                        `https://api.github.com/repos/${this.orgName}/${repo}/contributors`,
                        {
                            headers: this.headers,
                            params: {
                                per_page: perPage,
                                page: page,
                                anon: 'false'
                            }
                        }
                    );
                    
                    const contributors = response.data;
                    
                    if (!contributors || contributors.length === 0) {
                        break;
                    }
                    
                    contributors.forEach(contributor => {
                        if (!allContributors.has(contributor.login)) {
                            allContributors.add(contributor.login);
                            repoContributors++;
                        }
                    });
                    
                    page++;
                    
                    // If we got less than perPage, we're done with this repo
                    if (contributors.length < perPage) {
                        break;
                    }
                }
                
                if (repoCount % 5 === 0) {
                    console.log(`   Processed ${repoCount}/${reposToTrack.length} repositories... (${allContributors.size} unique contributors found)`);
                }
            } catch (error) {
                // Repo might be empty or inaccessible, skip it
                if (error.response && error.response.status === 404) {
                    // Repository not found or no access
                    continue;
                } else {
                    console.error(`   Error fetching contributors from ${repo}: ${error.message}`);
                }
                continue;
            }
        }
        
        console.log(`✅ Found ${allContributors.size} unique team members across all repositories\n`);
        
        return Array.from(allContributors);
    }

    /**
     * Get commits from DEFAULT BRANCH ONLY in a date range for a specific repository
     */
    async getCommitsInRange(repo, since, until) {
        const commits = [];
        let page = 1;
        const perPage = 100;
        const baseUrl = `https://api.github.com/repos/${this.orgName}/${repo}`;

        while (true) {
            try {
                const response = await axios.get(`${baseUrl}/commits`, {
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
                // Repository might be empty or inaccessible
                if (error.response && error.response.status === 409) {
                    // Empty repository
                    break;
                }
                break;
            }
        }

        return commits;
    }

    /**
     * Get additions and deletions for a specific commit
     */
    async getCommitStats(repo, commitSha) {
        const baseUrl = `https://api.github.com/repos/${this.orgName}/${repo}`;
        
        try {
            const response = await axios.get(`${baseUrl}/commits/${commitSha}`, {
                headers: this.headers
            });

            const stats = response.data.stats || {};
            return {
                additions: stats.additions || 0,
                deletions: stats.deletions || 0
            };
        } catch (error) {
            return { additions: 0, deletions: 0 };
        }
    }

    /**
     * Analyze commits for a single repository and return statistics per developer
     */
    async analyzeRepoCommits(repo, since, until) {
        const commits = await this.getCommitsInRange(repo, since, until);
        
        if (commits.length === 0) {
            return {};
        }

        const devStats = {};

        for (let idx = 0; idx < commits.length; idx++) {
            if (idx % 10 === 0 && idx > 0) {
                // Silent processing for multi-repo
            }

            const commit = commits[idx];
            const author = commit.commit.author;
            const authorName = author.name || 'Unknown';
            const authorEmail = author.email || 'unknown@email.com';

            // Use GitHub login if available, otherwise use name
            const authorId = commit.author ? commit.author.login : authorName;

            const commitSha = commit.sha;
            const stats = await this.getCommitStats(repo, commitSha);

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
     * Aggregate statistics across all repositories
     */
    async aggregateStats(period, date = null) {
        if (!date) {
            date = new Date();
        }

        // Calculate date range based on period
        let startDate, endDate;
        
        if (period === 'daily') {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
        } else if (period === 'weekly') {
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'monthly') {
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            startDate = new Date(date);
            startDate.setDate(startDate.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Default to daily
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
        }

        // Get list of repositories to track
        const reposToTrack = this.repositories || await this.getAllRepositories();

        if (reposToTrack.length === 0) {
            console.log('No repositories found.');
            return { aggregated: {}, byRepo: {}, allContributors: [] };
        }

        console.log(`🔍 Analyzing ${reposToTrack.length} repositories (DEFAULT BRANCH ONLY)...`);
        console.log(`📅 Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
        
        // Show repository list (limit to first 10 if too many)
        if (reposToTrack.length <= 10) {
            console.log(`   Repositories: ${reposToTrack.join(', ')}\n`);
        } else {
            console.log(`   First 10 repositories: ${reposToTrack.slice(0, 10).join(', ')}`);
            console.log(`   ... and ${reposToTrack.length - 10} more\n`);
        }

        // Get all contributors from all repositories
        const allContributors = await this.getAllContributors();

        const aggregatedStats = {};
        const statsByRepo = {};

        // Initialize all contributors with 0 stats
        for (const contributor of allContributors) {
            aggregatedStats[contributor] = {
                commits: 0,
                additions: 0,
                deletions: 0,
                netLines: 0,
                repositories: [],
                email: '',
                name: contributor
            };
        }

        // Track progress
        let completed = 0;

        for (const repo of reposToTrack) {
            completed++;
            console.log(`[${completed}/${reposToTrack.length}] Processing: ${repo}...`);

            try {
                const stats = await this.analyzeRepoCommits(repo, startDate, endDate);

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
                    aggregatedStats[dev].email = data.email || aggregatedStats[dev].email;
                    aggregatedStats[dev].name = data.name || aggregatedStats[dev].name;
                    
                    if (!aggregatedStats[dev].repositories.includes(repo)) {
                        aggregatedStats[dev].repositories.push(repo);
                    }
                }

                const commitCount = Object.values(stats).reduce((sum, s) => sum + s.commits, 0);
                console.log(`   ✅ ${repo}: ${Object.keys(stats).length} developers, ${commitCount} commits`);
            } catch (error) {
                console.error(`   ❌ Error processing ${repo}: ${error.message}`);
                statsByRepo[repo] = {};
            }
        }

        return { aggregated: aggregatedStats, byRepo: statsByRepo, allContributors };
    }

    /**
     * Create leaderboard from aggregated stats
     * Sorted by commits (primary), then net lines (tiebreaker)
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
                netLines: data.netLines,
                repoCount: data.repositories.length,
                repositories: data.repositories
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
     * Print aggregated report
     */
    printAggregatedReport(period, stats, date = null) {
        if (!date) {
            date = new Date();
        }

        console.log('\n' + '='.repeat(90));
        console.log('SoluLab Multi-Repository Contribution Report'.padStart(55));
        console.log('(DEFAULT BRANCH ONLY)'.padStart(50));
        
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
            console.log('No team members found.\n');
            return;
        }

        // Create leaderboard - Show ALL contributors (including inactive)
        const leaderboard = this.createLeaderboard(stats, null);

        // Separate active and inactive contributors
        const activeContributors = leaderboard.filter(dev => dev.commits > 0);
        const inactiveContributors = leaderboard.filter(dev => dev.commits === 0);

        // Create table with Repositories column
        const table = new Table({
            head: ['Rank', 'Username', 'Name', 'Repositories', 'Commits', 'Additions', 'Deletions', 'Net Lines'],
            colWidths: [6, 18, 22, 35, 10, 12, 12, 12],
            wordWrap: true
        });

        // Add active contributors first
        activeContributors.forEach((dev, index) => {
            // Format repositories list
            let repoDisplay;
            if (dev.repositories.length === 0) {
                repoDisplay = 'No Activity';
            } else if (dev.repositories.length <= 2) {
                repoDisplay = dev.repositories.join(', ');
            } else {
                repoDisplay = `${dev.repositories.slice(0, 2).join(', ')} (+${dev.repositories.length - 2} more)`;
            }

            table.push([
                index + 1,
                dev.username,
                dev.name,
                repoDisplay,
                dev.commits,
                `+${dev.additions}`,
                `-${dev.deletions}`,
                dev.netLines
            ]);
        });

        // Add separator if there are inactive contributors
        if (inactiveContributors.length > 0) {
            table.push([
                { colSpan: 8, content: '--- Inactive Team Members (No commits in this period) ---', hAlign: 'center' }
            ]);

            // Add inactive contributors
            inactiveContributors.forEach((dev) => {
                table.push([
                    '-',
                    dev.username,
                    dev.name,
                    'No Activity',
                    0,
                    '+0',
                    '-0',
                    0
                ]);
            });
        }

        console.log(table.toString());

        // Show top contributor details (if any active contributors)
        if (activeContributors.length > 0) {
            console.log(`\n🏆 Top Contributor: ${activeContributors[0].username}`);
            console.log(`   Total Commits: ${activeContributors[0].commits}`);
            console.log(`   Total Repositories: ${activeContributors[0].repoCount}`);
            console.log(`   Repositories: ${activeContributors[0].repositories.join(', ')}`);
        }

        // Summary statistics
        const totalDevs = Object.keys(stats).length;
        const activeDevs = activeContributors.length;
        const inactiveDevs = inactiveContributors.length;
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
        console.log(`Total Team Members: ${totalDevs}`);
        console.log(`Active Developers: ${activeDevs}`);
        console.log(`Inactive Developers: ${inactiveDevs}`);
        console.log(`Total Repositories with Activity: ${activeRepos.size}`);
        console.log(`Total Commits: ${totalCommits} (default branch only)`);
        console.log(`Total Lines Added: +${totalAdditions}`);
        console.log(`Total Lines Deleted: -${totalDeletions}`);
        console.log(`Net Lines Changed: ${totalNet}`);
        console.log(`Ranking: By Commits (primary), Net Lines (tiebreaker)`);
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

        // Sort by commits (active repos first)
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
        .description('Track GitHub developer contributions across multiple repositories (DEFAULT BRANCH ONLY)')
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