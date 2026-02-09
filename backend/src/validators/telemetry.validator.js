/**
 * Utility for manual telemetry validation
 */
class TelemetryValidator {
  /**
   * Validate incoming telemetry payload against business rules
   */
  validate(payload) {
    const errors = [];
    const { vehicle_id, timestamp, data } = payload;

    // Root level validation
    if (!vehicle_id) errors.push({ field: 'vehicle_id', message: 'vehicle_id is mandatory' });
    if (!timestamp) errors.push({ field: 'timestamp', message: 'timestamp is mandatory' });
    if (!data) errors.push({ field: 'data', message: 'data object is mandatory' });

    if (errors.length > 0) return { isValid: false, errors };

    // Timestamp validation: within ±5 minutes of server time
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (timestamp > now) {
      errors.push({ field: 'timestamp', message: 'timestamp cannot be in the future' });
    } else if (Math.abs(now - timestamp) > fiveMinutesMs) {
      errors.push({ field: 'timestamp', message: 'timestamp is too far from server time (max ±5 mins)' });
    }

    // Data metrics validation
    const rules = [
      { key: 'speed', min: 0, max: 120, unit: 'km/h' },
      { key: 'battery_voltage', min: 40, max: 85, unit: 'V' },
      { key: 'battery_current', min: -200, max: 200, unit: 'A' },
      { key: 'soc', min: 0, max: 100, unit: '%' },
      { key: 'motor_temp', min: 0, max: 150, unit: '°C' },
      { key: 'battery_temp', min: 0, max: 150, unit: '°C' }
    ];

    rules.forEach(rule => {
      const value = data[rule.key];
      if (value === undefined || value === null) {
        errors.push({ field: `data.${rule.key}`, message: `${rule.key} is mandatory` });
      } else if (typeof value !== 'number') {
        errors.push({ field: `data.${rule.key}`, message: `${rule.key} must be a number` });
      } else if (value < rule.min || value > rule.max) {
        errors.push({ 
          field: `data.${rule.key}`, 
          message: `Value ${value}${rule.unit} is outside allowed range (${rule.min} to ${rule.max}${rule.unit})` 
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new TelemetryValidator();
