const db = require('../db');

/**
 * Service to handle vehicle-related business logic and DB operations
 */
class VehicleService {
  /**
   * Register a new vehicle
   */
  async createVehicle(vehicleData) {
    const { vehicle_id, model, registration_number } = vehicleData;

    // Check if vehicle_id already exists
    const existingVehicle = await this.getVehicleById(vehicle_id);
    if (existingVehicle) {
      const error = new Error('Vehicle already exists');
      error.statusCode = 409;
      throw error;
    }

    const query = `
      INSERT INTO vehicles (vehicle_id, model, registration_number)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [vehicle_id, model, registration_number];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Fetch all vehicles
   */
  async getAllVehicles() {
    const query = 'SELECT * FROM vehicles ORDER BY created_at DESC';
    const { rows } = await db.query(query);
    return rows;
  }

  /**
   * Fetch vehicle by ID
   */
  async getVehicleById(vehicleId) {
    const query = 'SELECT * FROM vehicles WHERE vehicle_id = $1';
    const { rows } = await db.query(query, [vehicleId]);
    return rows[0];
  }

  /**
   * Delete vehicle by ID
   * NOTE: This performs a hard delete. Historical telemetry data remains intact.
   */
  async deleteVehicle(vehicleId) {
    const query = 'DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING *';
    const { rows } = await db.query(query, [vehicleId]);
    return rows[0];
  }
}

module.exports = new VehicleService();
