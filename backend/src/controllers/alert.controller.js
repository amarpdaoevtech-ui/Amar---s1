const alertApiService = require('../services/alert.api.service');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller to handle alert-related HTTP requests
 */
class AlertController {
  /**
   * List all active alerts
   */
  async listActiveAlerts(req, res) {
    try {
      const alerts = await alertApiService.getActiveAlerts();
      return successResponse(res, 'Active alerts fetched successfully', alerts);
    } catch (error) {
      console.error('List Alerts Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get alert by ID
   */
  async getAlert(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertApiService.getAlertById(id);

      if (!alert) {
        return errorResponse(res, 'Alert not found', 404);
      }

      return successResponse(res, 'Alert fetched successfully', alert);
    } catch (error) {
      console.error('Get Alert Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledge(req, res) {
    try {
      const { id } = req.params;
      const alert = await alertApiService.acknowledgeAlert(id);

      if (!alert) {
        return errorResponse(res, 'Alert not found', 404);
      }

      console.log(`Alert ${id} acknowledged successfully`);
      return successResponse(res, 'Alert acknowledged successfully', alert);
    } catch (error) {
      console.error('Acknowledge Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }

  /**
   * Get alert statistics for monitoring
   */
  async getAlertStats(req, res) {
    try {
      const stats = await alertApiService.getAlertStats();
      return successResponse(res, 'Alert statistics fetched successfully', stats);
    } catch (error) {
      console.error('Get Alert Stats Error:', error);
      return errorResponse(res, 'Internal Server Error');
    }
  }
}

module.exports = new AlertController();
