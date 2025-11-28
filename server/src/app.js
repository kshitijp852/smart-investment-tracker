
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const prefRoutes = require('./routes/preferences');
const recRoutes = require('./routes/recommendations');
const dataRoutes = require('./routes/data');
const alphaRoutes = require('./routes/alpha');
const portfolioRoutes = require('./routes/portfolio');
const healthRoutes = require('./routes/health');
const bucketRoutes = require('./routes/buckets-multi');
const mfapiRoutes = require('./routes/mfapi');
const benchmarkRoutes = require('./routes/benchmark');
const navRoutes = require('./routes/nav');
const portfolioReturnsRoutes = require('./routes/portfolioReturns');
const hybridRoutes = require('./routes/hybrid');
const navSyncJob = require('./jobs/navSyncJob');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/preferences', prefRoutes);
app.use('/api/recommendations', recRoutes);
app.use('/api/buckets', bucketRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/alpha', alphaRoutes);
app.use('/api/portfolio', portfolioReturnsRoutes);
app.use('/api/mfapi', mfapiRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/nav', navRoutes);
app.use('/api/hybrid', hybridRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start NAV sync job (runs daily)
  if (process.env.ENABLE_NAV_SYNC !== 'false') {
    navSyncJob.start(24); // Run every 24 hours
  }
});
