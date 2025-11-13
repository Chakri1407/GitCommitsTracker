#!/usr/bin/env node

/**
 * Multi-Repository Report Runner
 * Uses Config.js for configuration (just like RunReport.js)
 */

const MultiRepoTracker = require('./MultiRepoTracker');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
    config = require('../config/Config.js');
} catch (error) {
    console.error('Error: Config.js not found!');
    console.error('Please copy Config.example.js to Config.js and fill in your details.');
    console.error('Command: copy Config.example.js Config.js');
    process.exit(1);
}

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
const dailyDir = path.join(reportsDir, 'daily');
const weeklyDir = path.join(reportsDir, 'weekly');
const monthlyDir = path.join(reportsDir, 'monthly');

[reportsDir, dailyDir, weeklyDir, monthlyDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

async function runDailyReport() {
    console.log('🚀 Running Daily Report (All Repositories)...\n');
    
    const tracker = new MultiRepoTracker(
        config.github.organization,
        config.github.token,
        config.github.repositories || null
    );

    try {
        const today = new Date();
        const { aggregated, byRepo } = await tracker.aggregateStats('daily', today);
        
        tracker.printAggregatedReport('daily', aggregated, today);
        
        if (config.reports.showRepositoryBreakdown) {
            tracker.printRepositoryBreakdown(byRepo);
        }

        if (config.reports.exportToJson) {
            const filename = path.join(dailyDir, `multi_repo_daily_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(aggregated, byRepo, filename);
        }

        console.log('✅ Daily report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running daily report:', error.message);
        process.exit(1);
    }
}

async function runWeeklyReport() {
    console.log('🚀 Running Weekly Report (All Repositories - Last 7 Days)...\n');
    
    const tracker = new MultiRepoTracker(
        config.github.organization,
        config.github.token,
        config.github.repositories || null
    );

    try {
        const today = new Date();
        const { aggregated, byRepo } = await tracker.aggregateStats('weekly', today);
        
        tracker.printAggregatedReport('weekly', aggregated, today);
        
        if (config.reports.showRepositoryBreakdown) {
            tracker.printRepositoryBreakdown(byRepo);
        }

        if (config.reports.exportToJson) {
            const filename = path.join(weeklyDir, `multi_repo_weekly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(aggregated, byRepo, filename);
        }

        console.log('✅ Weekly report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running weekly report:', error.message);
        process.exit(1);
    }
}

async function runMonthlyReport() {
    console.log('🚀 Running Monthly Report (All Repositories - Last 30 Days)...\n');
    
    const tracker = new MultiRepoTracker(
        config.github.organization,
        config.github.token,
        config.github.repositories || null
    );

    try {
        const today = new Date();
        const { aggregated, byRepo } = await tracker.aggregateStats('monthly', today);
        
        tracker.printAggregatedReport('monthly', aggregated, today);
        
        if (config.reports.showRepositoryBreakdown) {
            tracker.printRepositoryBreakdown(byRepo);
        }

        if (config.reports.exportToJson) {
            const filename = path.join(monthlyDir, `multi_repo_monthly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(aggregated, byRepo, filename);
        }

        console.log('✅ Monthly report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running monthly report:', error.message);
        process.exit(1);
    }
}

async function runAllReports() {
    console.log('🚀 Running All Reports (Daily + Weekly + Monthly) - All Repositories...\n');
    
    await runDailyReport();
    await runWeeklyReport();
    await runMonthlyReport();
}

// Main script logic
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || config.reports.defaultPeriod;

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`                   SoluLab Multi-Repository Tracker`);
    console.log(`                   Organization: ${config.github.organization}`);
    
    if (config.github.repositories && config.github.repositories.length > 0) {
        console.log(`                   Repositories: ${config.github.repositories.length} selected`);
    } else {
        console.log(`                   Repositories: ALL (auto-discover)`);
    }
    
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    switch (command.toLowerCase()) {
        case 'daily':
            await runDailyReport();
            break;
        case 'weekly':
            await runWeeklyReport();
            break;
        case 'monthly':
            await runMonthlyReport();
            break;
        case 'all':
            await runAllReports();
            break;
        default:
            console.error(`Unknown command: ${command}`);
            console.log('\nUsage: node RunMultiRepoReport.js [daily|weekly|monthly|all]');
            console.log('Or simply: node RunMultiRepoReport.js (uses default from config)');
            process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runDailyReport, runWeeklyReport, runMonthlyReport, runAllReports }; 