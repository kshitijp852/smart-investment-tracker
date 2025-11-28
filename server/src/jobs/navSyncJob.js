const { syncNAVData } = require('../services/amfiService');
const { syncCuratedFundsWithNAV } = require('../services/hybridFundService');

/**
 * NAV Sync Job - Runs daily to update NAV data from AMFI
 */
class NAVSyncJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.lastResult = null;
    this.intervalId = null;
  }

  /**
   * Start the scheduled job
   * @param {number} intervalHours - Interval in hours (default: 24)
   */
  start(intervalHours = 24) {
    console.log(`🕐 Starting NAV sync job (runs every ${intervalHours} hours)`);
    
    // Run immediately on start
    this.runSync();
    
    // Schedule recurring job
    const intervalMs = intervalHours * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.runSync();
    }, intervalMs);
    
    console.log('✅ NAV sync job scheduled');
  }

  /**
   * Stop the scheduled job
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ NAV sync job stopped');
    }
  }

  /**
   * Run sync manually
   */
  async runSync() {
    if (this.isRunning) {
      console.log('⚠️ NAV sync already running, skipping...');
      return { skipped: true, reason: 'Already running' };
    }

    try {
      this.isRunning = true;
      console.log('🚀 Running NAV sync job...');
      
      // Step 1: Sync all NAV data from AMFI
      const navResult = await syncNAVData();
      
      // Step 2: Update curated funds with latest NAV
      console.log('🔄 Syncing curated funds with NAV data...');
      const curatedResult = await syncCuratedFundsWithNAV();
      
      this.lastRun = new Date();
      this.lastResult = {
        success: true,
        navSync: navResult,
        curatedSync: curatedResult,
        timestamp: this.lastRun
      };
      
      console.log('✅ NAV sync job completed successfully');
      console.log(`   - NAV records: ${navResult.total}`);
      console.log(`   - Curated funds updated: ${curatedResult.updated}`);
      
      return this.lastResult;
    } catch (error) {
      console.error('❌ NAV sync job failed:', error.message);
      
      this.lastRun = new Date();
      this.lastResult = {
        success: false,
        error: error.message,
        timestamp: this.lastRun
      };
      
      return this.lastResult;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastResult: this.lastResult,
      isScheduled: this.intervalId !== null
    };
  }
}

// Singleton instance
const navSyncJob = new NAVSyncJob();

module.exports = navSyncJob;
