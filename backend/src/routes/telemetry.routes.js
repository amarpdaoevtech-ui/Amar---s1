const express = require('express');
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Submit telemetry data (UNPROTECTED - for vehicles/simulator)
router.post('/', (req, res) => telemetryController.ingest(req, res));

// Get telemetry statistics (Authenticated)
router.get('/stats', authenticate, (req, res) => telemetryController.getStats(req, res));

// Get current telemetry for a specific vehicle (Authenticated)
router.get('/current/:vehicle_id', authenticate, (req, res) => telemetryController.getCurrent(req, res));

// Get historical telemetry data (Authenticated)
router.get('/history', authenticate, (req, res) => telemetryController.getHistory(req, res));

module.exports = router;
