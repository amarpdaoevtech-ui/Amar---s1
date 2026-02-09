const broadcaster = require('../websocket/broadcaster');

/**
 * Service to manage real-time logic like status tracking and broadcasting triggers
 */
class RealtimeService {
  constructor() {
    // Map<vehicle_id, last_seen_timestamp>
    this.vehicleLastSeen = new Map();
    // Map<vehicle_id, status>
    this.vehicleStatus = new Map();
    
    this.OFFLINE_THRESHOLD_MS = 10000; // 10 seconds

    // Periodically check for offline vehicles
    setInterval(() => this.checkVehicleStatus(), 5000);
  }

  /**
   * Process incoming telemetry for real-time features
   */
  handleIncomingTelemetry(vehicleId, telemetry) {
    const now = Date.now();
    
    // 1. Update status to online if it was offline or new
    const previousStatus = this.vehicleStatus.get(vehicleId);
    if (previousStatus !== 'online') {
      this.vehicleStatus.set(vehicleId, 'online');
      broadcaster.broadcastStatus(vehicleId, 'online');
    }

    // 2. Update last seen timestamp
    this.vehicleLastSeen.set(vehicleId, now);

    // 3. Trigger telemetry broadcast (with throttling internal to broadcaster)
    broadcaster.broadcastTelemetry(vehicleId, telemetry);
  }

  /**
   * Check for vehicles that haven't sent data recently
   */
  checkVehicleStatus() {
    const now = Date.now();
    for (const [vehicleId, lastSeen] of this.vehicleLastSeen.entries()) {
      if (now - lastSeen > this.OFFLINE_THRESHOLD_MS) {
        if (this.vehicleStatus.get(vehicleId) === 'online') {
          this.vehicleStatus.set(vehicleId, 'offline');
          broadcaster.broadcastStatus(vehicleId, 'offline');
          console.log(`Vehicle ${vehicleId} is now offline (Inactivity)`);
        }
      }
    }
  }
}

module.exports = new RealtimeService();
