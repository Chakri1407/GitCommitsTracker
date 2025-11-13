# #!/bin/bash

# # GitHub Dev Tracker Automation Script
# # This script makes it easy to automate reports via cron jobs

# # Colors for output
# GREEN='\033[0;32m'
# RED='\033[0;31m'
# YELLOW='\033[1;33m'
# NC='\033[0m' # No Color

# # Configuration
# SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# LOG_DIR="${SCRIPT_DIR}/logs"
# REPORT_DIR="${SCRIPT_DIR}/reports"

# # Create directories if they don't exist
# mkdir -p "$LOG_DIR"
# mkdir -p "$REPORT_DIR"

# # Function to log messages
# log() {
#     echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
# }

# error() {
#     echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
# }

# warn() {
#     echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
# }

# # Function to run report and handle errors
# run_report() {
#     local report_type=$1
#     local log_file="${LOG_DIR}/${report_type}_$(date +'%Y-%m-%d').log"
    
#     log "Starting ${report_type} report..."
    
#     cd "$SCRIPT_DIR" || exit 1
    
#     if node run-report.js "$report_type" > "$log_file" 2>&1; then
#         log "${report_type} report completed successfully"
        
#         # Move generated JSON files to reports directory
#         mv *_report_*.json "$REPORT_DIR/" 2>/dev/null
        
#         return 0
#     else
#         error "${report_type} report failed. Check log: $log_file"
#         return 1
#     fi
# }

# # Function to send notification (placeholder for future implementation)
# send_notification() {
#     local message=$1
#     # TODO: Implement Slack/Email notifications
#     log "Notification: $message"
# }

# # Function to clean old reports (keep last 30 days)
# cleanup_old_reports() {
#     log "Cleaning up reports older than 30 days..."
#     find "$REPORT_DIR" -name "*_report_*.json" -mtime +30 -delete
#     find "$LOG_DIR" -name "*.log" -mtime +30 -delete
#     log "Cleanup completed"
# }

# # Main script logic
# main() {
#     log "═══════════════════════════════════════════════════════"
#     log "GitHub Dev Tracker Automation"
#     log "═══════════════════════════════════════════════════════"
    
#     # Check if Node.js is installed
#     if ! command -v node &> /dev/null; then
#         error "Node.js is not installed. Please install Node.js first."
#         exit 1
#     fi
    
#     # Check if dependencies are installed
#     if [ ! -d "${SCRIPT_DIR}/node_modules" ]; then
#         warn "Dependencies not found. Installing..."
#         cd "$SCRIPT_DIR" && npm install
#     fi
    
#     # Check if config exists
#     if [ ! -f "${SCRIPT_DIR}/config.js" ]; then
#         error "config.js not found. Please copy config.example.js to config.js"
#         exit 1
#     fi
    
#     # Parse command line arguments
#     case "${1:-daily}" in
#         daily)
#             run_report "daily"
#             ;;
#         weekly)
#             run_report "weekly"
#             ;;
#         monthly)
#             run_report "monthly"
#             cleanup_old_reports
#             ;;
#         all)
#             run_report "daily"
#             run_report "weekly"
#             run_report "monthly"
#             ;;
#         cleanup)
#             cleanup_old_reports
#             ;;
#         *)
#             error "Unknown command: $1"
#             echo "Usage: $0 {daily|weekly|monthly|all|cleanup}"
#             exit 1
#             ;;
#     esac
    
#     log "═══════════════════════════════════════════════════════"
#     log "Automation completed"
#     log "═══════════════════════════════════════════════════════"
# }

# # Run the main function
# main "$@" 