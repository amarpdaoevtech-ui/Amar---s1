const subscriptionManager = require('./subscriptions');

/**
 * Broadcaster for WebSocket Events with Throttling logic
 */
class Broadcaster {
  constructor() {
    this.io = null;
    // Map<vehicle_id, last_broadcast_timestamp> for throttling
    this.lastBroadcastTimes = new Map();
    this.THROTTLE_MS = 500; // 2 updates per second
  }

  /**
   * Initialize with socket.io instance
   */
  init(io) {
    this.io = io;
  }

  /**
   * Broadcast telemetry update to subscribed clients with throttling
   */
  broadcastTelemetry(vehicleId, telemetry) {
    if (!this.io) return;

    const now = Date.now();
    const lastTime = this.lastBroadcastTimes.get(vehicleId) || 0;

    // Throttling logic: Max 2 updates/sec per vehicle
    if (now - lastTime < this.THROTTLE_MS) {
      return;
    }

    const subscribers = subscriptionManager.getSubscribers(vehicleId);
    if (subscribers.length === 0) return;

    const payload = {
      event: 'telemetry_update',
      vehicle_id: vehicleId,
      data: telemetry.data,
      timestamp: telemetry.timestamp
    };

    subscribers.forEach(socketId => {
      this.io.to(socketId).emit('telemetry_update', payload);
    });

    this.lastBroadcastTimes.set(vehicleId, now);
  }

  /**
   * Broadcast vehicle status changes (online/offline) - No throttling for status
   */
  broadcastStatus(vehicleId, status) {
    if (!this.io) return;

    const subscribers = subscriptionManager.getSubscribers(vehicleId);
    if (subscribers.length === 0) return;

    const payload = {
      event: 'vehicle_status',
      vehicle_id: vehicleId,
      status: status
    };

    subscribers.forEach(socketId => {
      this.io.to(socketId).emit('vehicle_status', payload);
    });
  }
}

module.exports = new Broadcaster();
