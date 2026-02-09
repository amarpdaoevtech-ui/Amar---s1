const express = require('express');
const alertController = require('../controllers/alert.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// List all active alerts (Authenticated users)
router.get('/', authenticate, (req, res) => alertController.listActiveAlerts(req, res));

// Get alert statistics for monitoring (Authenticated users)
router.get('/stats/monitoring', authenticate, (req, res) => alertController.getAlertStats(req, res));

// Get alert details by ID (Authenticated users)
router.get('/:id', authenticate, (req, res) => alertController.getAlert(req, res));

// Acknowledge alert (Admin only)
router.post('/:id/acknowledge', authenticate, authorize(['admin']), (req, res) => alertController.acknowledge(req, res));

module.exports = router;
