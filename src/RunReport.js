#!/usr/bin/env node

/**
 * Automated GitHub Dev Tracker Runner
 * Uses config.js for easy configuration
 * Enhanced version with inactive users in main reports
 */

const GitHubDevTracker = require('./GitHubDevTracker');
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
    console.log('🚀 Running Daily Report...\n');
    
    const tracker = new GitHubDevTracker(
        config.github.organization,
        config.github.repository,
        config.github.token
    );

    try {
        const today = new Date();
        const dailyStats = await tracker.getDailyReport(today);
        await tracker.printReport('daily', dailyStats, today);

        if (config.reports.exportToJson) {
            const filename = path.join(dailyDir, `daily_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(dailyStats, filename);
        }

        // Legacy inactive report if explicitly configured
        if (config.reports.showInactive) {
            await tracker.printInactiveReport(today);
        }

        console.log('✅ Daily report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running daily report:', error.message);
        process.exit(1);
    }
}

async function runWeeklyReport() {
    console.log('🚀 Running Weekly Report...\n');
    
    const tracker = new GitHubDevTracker(
        config.github.organization,
        config.github.repository,
        config.github.token
    );

    try {
        const today = new Date();
        const weeklyStats = await tracker.getWeeklyReport(today);
        await tracker.printReport('weekly', weeklyStats, today);

        if (config.reports.exportToJson) {
            const filename = path.join(weeklyDir, `weekly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(weeklyStats, filename);
        }

        console.log('✅ Weekly report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running weekly report:', error.message);
        process.exit(1);
    }
}

async function runMonthlyReport() {
    console.log('🚀 Running Monthly Report...\n');
    
    const tracker = new GitHubDevTracker(
        config.github.organization,
        config.github.repository,
        config.github.token
    );

    try {
        const today = new Date();
        const monthlyStats = await tracker.getMonthlyReport(today);
        await tracker.printReport('monthly', monthlyStats, today);

        if (config.reports.exportToJson) {
            const filename = path.join(monthlyDir, `monthly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(monthlyStats, filename);
        }

        console.log('✅ Monthly report completed successfully!\n');
    } catch (error) {
        console.error('❌ Error running monthly report:', error.message);
        process.exit(1);
    }
}

async function runAllReports() {
    console.log('🚀 Running All Reports (Daily + Weekly + Monthly)...\n');
    console.log('═'.repeat(80));
    console.log('                    COMPREHENSIVE REPORT GENERATION');
    console.log('                    Generating: Daily, Weekly, and Monthly Reports');
    console.log('═'.repeat(80) + '\n');
    
    const tracker = new GitHubDevTracker(
        config.github.organization,
        config.github.repository,
        config.github.token
    );

    const today = new Date();
    
    try {
        // Generate and display all three reports
        console.log('\n' + '█'.repeat(80));
        console.log('█'.repeat(32) + ' DAILY REPORT ' + '█'.repeat(33));
        console.log('█'.repeat(80) + '\n');
        const dailyStats = await tracker.getDailyReport(today);
        await tracker.printReport('daily', dailyStats, today);
        if (config.reports.exportToJson) {
            const filename = path.join(dailyDir, `daily_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(dailyStats, filename);
        }
        
        console.log('\n' + '█'.repeat(80));
        console.log('█'.repeat(32) + ' WEEKLY REPORT ' + '█'.repeat(32));
        console.log('█'.repeat(80) + '\n');
        const weeklyStats = await tracker.getWeeklyReport(today);
        await tracker.printReport('weekly', weeklyStats, today);
        if (config.reports.exportToJson) {
            const filename = path.join(weeklyDir, `weekly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(weeklyStats, filename);
        }
        
        console.log('\n' + '█'.repeat(80));
        console.log('█'.repeat(31) + ' MONTHLY REPORT ' + '█'.repeat(32));
        console.log('█'.repeat(80) + '\n');
        const monthlyStats = await tracker.getMonthlyReport(today);
        await tracker.printReport('monthly', monthlyStats, today);
        if (config.reports.exportToJson) {
            const filename = path.join(monthlyDir, `monthly_report_${today.toISOString().split('T')[0]}.json`);
            await tracker.exportToJson(monthlyStats, filename);
        }

        // Legacy inactive report if explicitly configured
        if (config.reports.showInactive) {
            await tracker.printInactiveReport(today);
        }
        
        // Print summary of all three reports at the end
        console.log('\n' + '═'.repeat(80));
        console.log('═'.repeat(80));
        console.log('                           SUMMARY - ALL REPORTS');
        console.log('═'.repeat(80));
        console.log('═'.repeat(80) + '\n');
        
        // Show Daily report table again
        console.log('\n' + '▓'.repeat(80));
        console.log('▓' + ' '.repeat(32) + 'DAILY REPORT' + ' '.repeat(33) + '▓');
        console.log('▓'.repeat(80) + '\n');
        await tracker.printReport('daily', dailyStats, today);
        
        // Show Weekly report table again
        console.log('\n' + '▓'.repeat(80));
        console.log('▓' + ' '.repeat(31) + 'WEEKLY REPORT' + ' '.repeat(33) + '▓');
        console.log('▓'.repeat(80) + '\n');
        await tracker.printReport('weekly', weeklyStats, today);
        
        // Show Monthly report table again
        console.log('\n' + '▓'.repeat(80));
        console.log('▓' + ' '.repeat(30) + 'MONTHLY REPORT' + ' '.repeat(33) + '▓');
        console.log('▓'.repeat(80) + '\n');
        await tracker.printReport('monthly', monthlyStats, today);
        
        console.log('\n' + '═'.repeat(80));
        console.log('                      ALL REPORTS COMPLETED SUCCESSFULLY!');
        console.log('═'.repeat(80));
        console.log('\n📊 Reports Generated:');
        console.log('   ✓ Daily Report   - Last 24 hours');
        console.log('   ✓ Weekly Report  - Last 7 days');
        console.log('   ✓ Monthly Report - Last 30 days');
        console.log(`\n📁 All reports saved to: ${reportsDir}\n`);

    } catch (error) {
        console.error('❌ Error running reports:', error.message);
        process.exit(1);
    }
}

// Main script logic
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || config.reports.defaultPeriod;

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`                   SoluLab GitHub Contribution Tracker`);
    console.log(`                   Organization: ${config.github.organization}`);
    console.log(`                   Repository: ${config.github.repository}`);
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
            console.log('\nUsage: node RunReport.js [daily|weekly|monthly|all]');
            console.log('Or simply: node RunReport.js (uses default from config)');
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