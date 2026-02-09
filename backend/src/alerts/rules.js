/**
 * Alert rules definitions
 */
const ALERT_RULES = [
  {
    type: 'high_temperature',
    severity: 'WARNING',
    condition: (data) => data.motor_temp > 80 || data.battery_temp > 50,
    message: (data) => {
      if (data.motor_temp > 80) return `Motor temperature high: ${data.motor_temp}°C`;
      return `Battery temperature high: ${data.battery_temp}°C`;
    }
  },
  {
    type: 'critical_temperature',
    severity: 'CRITICAL',
    condition: (data) => data.motor_temp > 100 || data.battery_temp > 60,
    message: (data) => {
      if (data.motor_temp > 100) return `CRITICAL: Motor temperature high: ${data.motor_temp}°C`;
      return `CRITICAL: Battery temperature high: ${data.battery_temp}°C`;
    }
  },
  {
    type: 'low_battery',
    severity: 'WARNING',
    condition: (data) => data.soc < 20,
    message: (data) => `Low battery: ${data.soc}%`
  },
  {
    type: 'critical_battery',
    severity: 'CRITICAL',
    condition: (data) => data.soc < 10,
    message: (data) => `CRITICAL: Battery low: ${data.soc}%`
  },
  {
    type: 'abnormal_voltage',
    severity: 'WARNING',
    condition: (data) => data.battery_voltage < 48 || data.battery_voltage > 84,
    message: (data) => `Abnormal voltage: ${data.battery_voltage}V`
  },
  {
    type: 'high_current_draw',
    severity: 'WARNING',
    condition: (data) => Math.abs(data.battery_current) > 150,
    message: (data) => `High current draw: ${data.battery_current}A`
  }
];

module.exports = ALERT_RULES;
