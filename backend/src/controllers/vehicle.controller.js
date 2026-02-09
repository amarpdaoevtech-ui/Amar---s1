const vehicleService = require('../services/vehicle.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller to handle vehicle-related HTTP requests
 */
class VehicleController {
  /**
   * Register a new vehicle
   */
  async registerVehicle(req, res) {
    try {
      const { vehicle_id, model, registration_number } = req.body;

      // Manual Validation
      if (!vehicle_id || !model || !registration_number) {
        return errorResponse(res, 'vehicle_id, model, and registration_number are mandatory', 400);
      }

      const vehicle = await vehicleService.createVehicle({
        vehicle_id,
        model,
        registration_number,
      });

      return successResponse(res, 'Vehicle registered successfully', vehicle, 201);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      console.error('Registration Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * List all vehicles
   */
  async listVehicles(req, res) {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      return successResponse(res, 'Vehicles fetched successfully', vehicles);
    } catch (error) {
      console.error('List Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);

      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      return successResponse(res, 'Vehicle fetched successfully', vehicle);
    } catch (error) {
      console.error('Get Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Delete vehicle by ID
   * NOTE: Only removes vehicle record. Telemetry history remains for audit purposes.
   */
  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.deleteVehicle(id);

      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      return successResponse(res, 'Vehicle decommissioned successfully', vehicle);
    } catch (error) {
      console.error('Delete Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }
}

module.exports = new VehicleController();
