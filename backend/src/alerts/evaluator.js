const ALERT_RULES = require('./rules');
const alertService = require('./alert.service');

/**
 * Engine to evaluate alert rules against incoming telemetry
 */
class AlertEvaluator {
  /**
   * Evaluate all rules for a given telemetry packet
   */
  async evaluate(telemetry) {
    const { vehicle_id, data } = telemetry;

    for (const rule of ALERT_RULES) {
      const isViolation = rule.condition(data);

      if (isViolation) {
        // 1. Check for de-duplication
        const existingAlert = await alertService.getExistingAlert(vehicle_id, rule.type);
        
        if (!existingAlert) {
          // 2. Create and broadcast new alert
          await alertService.createAlert(vehicle_id, rule, data);
          console.log(`Alert Generated: ${rule.type} for ${vehicle_id}`);
        }
      } else {
        // 3. Auto-resolve if condition is no longer met
        await alertService.resolveAlert(vehicle_id, rule.type);
      }
    }
  }
}

module.exports = new AlertEvaluator();
