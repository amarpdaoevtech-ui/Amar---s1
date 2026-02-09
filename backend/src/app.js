const express = require('express');
const cors = require('cors');
const vehicleRoutes = require('./routes/vehicle.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const alertRoutes = require('./routes/alert.routes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

module.exports = app;
