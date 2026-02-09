const express = require('express');
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Vehicle registration (Admin only)
router.post('/', authenticate, authorize(['admin']), (req, res) => vehicleController.registerVehicle(req, res));

// List all vehicles (Authenticated users)
router.get('/', authenticate, (req, res) => vehicleController.listVehicles(req, res));

// Get vehicle details by ID (Authenticated users)
router.get('/:id', authenticate, (req, res) => vehicleController.getVehicle(req, res));

// Delete vehicle by ID (Admin only)
router.delete('/:id', authenticate, authorize(['admin']), (req, res) => vehicleController.deleteVehicle(req, res));

module.exports = router;
