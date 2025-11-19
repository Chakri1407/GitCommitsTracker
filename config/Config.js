// Load environment variables from .env file
require('dotenv').config();

/**
 * Configuration for GitHub Developer Contribution Tracker
 * Uses environment variables from .env file for security
 */

module.exports = {
    github: {
        // GitHub Organization (from .env)
        organization: process.env.GITHUB_ORG || 'SoluLab',
        
        // Single repository for RunReport.js (from .env)
        repository: process.env.GITHUB_REPO || 'rentzi-admin',
        
        // Multiple repositories for RunMultiRepoReport.js
        // null = auto-discover all repos in the organization
        // or provide comma-separated list in .env: GITHUB_REPOS=repo1,repo2,repo3
        repositories: process.env.GITHUB_REPOS 
            ? process.env.GITHUB_REPOS.split(',').map(r => r.trim())
            : null,
        
        // GitHub Personal Access Token (from .env)
        token: process.env.GITHUB_TOKEN || ''
    },
    
    reports: {
        // Default report period when running 'npm start'
        defaultPeriod: process.env.DEFAULT_PERIOD || 'all',
        
        // Number of top developers to show in leaderboard
        leaderboardSize: parseInt(process.env.LEADERBOARD_SIZE || '10'),
        
        // Export reports to JSON files
        exportToJson: process.env.EXPORT_JSON !== 'false',
        
        // Show inactive developers (single repo only)
        showInactive: process.env.SHOW_INACTIVE !== 'false',
        
        // Show repository breakdown (multi repo only)
        showRepositoryBreakdown: process.env.SHOW_BREAKDOWN !== 'false'
    }
};

// Validate that token exists
if (!process.env.GITHUB_TOKEN) {
    console.error('\n⚠️  ERROR: GITHUB_TOKEN not found in environment variables!');
    console.error('Please create a .env file with your GitHub token.');
    console.error('See .env.example for the template.\n');
    process.exit(1);
} 