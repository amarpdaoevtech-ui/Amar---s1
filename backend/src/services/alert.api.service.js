const db = require('../db');

/**
 * Service to handle alert-related API data retrieval
 */
class AlertApiService {
  /**
   * Fetch all active (unresolved) alerts
   */
  async getActiveAlerts() {
    const query = `
      SELECT * FROM alerts
      WHERE resolved_at IS NULL
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  }

  /**
   * Fetch a specific alert by ID
   */
  async getAlertById(alertId) {
    const query = 'SELECT * FROM alerts WHERE alert_id = $1';
    const { rows } = await db.query(query, [alertId]);
    return rows[0];
  }

  /**
   * Mark an alert as acknowledged
   */
  async acknowledgeAlert(alertId) {
    const query = `
      UPDATE alerts
      SET acknowledged_at = NOW()
      WHERE alert_id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [alertId]);
    return rows[0];
  }

  /**
   * Get alert statistics for monitoring
   * Returns counts for the last minute, 5 minutes, and total active
   */
  async getAlertStats() {
    const queries = {
      // Active (unresolved) alerts
      active: `SELECT COUNT(*) as count FROM alerts WHERE resolved_at IS NULL`,

      // Alerts created in last minute
      lastMinute: `
        SELECT COUNT(*) as count FROM alerts
        WHERE created_at >= NOW() - INTERVAL '1 minute'
      `,

      // Alerts created in last 5 minutes
      last5Minutes: `
        SELECT COUNT(*) as count FROM alerts
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
      `,

      // Alerts by severity (active)
      bySeverity: `
        SELECT severity, COUNT(*) as count
        FROM alerts
        WHERE resolved_at IS NULL
        GROUP BY severity
      `,

      // Alerts by type (last 5 minutes)
      byType: `
        SELECT alert_type, COUNT(*) as count
        FROM alerts
        WHERE created_at >= NOW() - INTERVAL '5 minutes'
        GROUP BY alert_type
      `,

      // Total alerts created today
      today: `
        SELECT COUNT(*) as count FROM alerts
        WHERE created_at >= CURRENT_DATE
      `
    };

    const results = await Promise.all([
      db.query(queries.active),
      db.query(queries.lastMinute),
      db.query(queries.last5Minutes),
      db.query(queries.bySeverity),
      db.query(queries.byType),
      db.query(queries.today)
    ]);

    return {
      active: parseInt(results[0].rows[0].count),
      lastMinute: parseInt(results[1].rows[0].count),
      last5Minutes: parseInt(results[2].rows[0].count),
      bySeverity: results[3].rows,
      byType: results[4].rows,
      today: parseInt(results[5].rows[0].count)
    };
  }
}

module.exports = new AlertApiService();
