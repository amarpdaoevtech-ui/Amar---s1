const telemetryService = require('../services/telemetry.service');
const vehicleService = require('../services/vehicle.service');
const telemetryValidator = require('../validators/telemetry.validator');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller to handle telemetry-related HTTP requests
 */
class TelemetryController {
  /**
   * Ingest telemetry data
   */
  async ingest(req, res) {
    try {
      // 1. Validate request body
      const { isValid, errors } = telemetryValidator.validate(req.body);
      if (!isValid) {
        return errorResponse(res, 'Validation failed', 400, errors);
      }

      const { vehicle_id } = req.body;

      // 2. Check if vehicle exists
      const vehicle = await vehicleService.getVehicleById(vehicle_id);
      if (!vehicle) {
        return errorResponse(res, `Vehicle with ID ${vehicle_id} not found`, 404);
      }

      // 3. Store telemetry & update last_seen
      await telemetryService.ingestTelemetry(req.body);

      return successResponse(res, 'Telemetry data received');
    } catch (error) {
      console.error('Ingestion Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get latest telemetry for a vehicle
   */
  async getCurrent(req, res) {
    try {
      const { vehicle_id } = req.params;
      const telemetry = await telemetryService.getLatestTelemetry(vehicle_id);

      if (!telemetry) {
        return errorResponse(res, 'No telemetry found for this vehicle', 404);
      }

      return successResponse(res, 'Current telemetry fetched', telemetry);
    } catch (error) {
      console.error('GetCurrent Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get telemetry history for a vehicle
   */
  async getHistory(req, res) {
    try {
      const { vehicle_id, from, to } = req.query;

      if (!vehicle_id || !from || !to) {
        return errorResponse(res, 'vehicle_id, from, and to are required query parameters', 400);
      }

      const history = await telemetryService.getTelemetryHistory(
        vehicle_id, 
        parseInt(from), 
        parseInt(to)
      );

      return successResponse(res, 'Telemetry history fetched', history);
    } catch (error) {
      console.error('GetHistory Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get telemetry stats
   */
  async getStats(req, res) {
    try {
      const stats = await telemetryService.getTelemetryStats();
      return successResponse(res, 'Telemetry statistics fetched', stats);
    } catch (error) {
      console.error('GetStats Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }
}

module.exports = new TelemetryController();
