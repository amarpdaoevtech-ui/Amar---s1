/**
 * Subscription Management for WebSocket Clients
 */
class SubscriptionManager {
  constructor() {
    // Map<socketId, Set<vehicle_id>>
    this.subscriptions = new Map();
  }

  /**
   * Initialize a new client's subscription set
   */
  addClient(socketId) {
    this.subscriptions.set(socketId, new Set());
  }

  /**
   * Remove a client and all its subscriptions
   */
  removeClient(socketId) {
    this.subscriptions.delete(socketId);
  }

  /**
   * Subscribe a client to a vehicle or 'all'
   */
  subscribe(socketId, vehicleId) {
    const clientSubs = this.subscriptions.get(socketId);
    if (clientSubs) {
      clientSubs.add(vehicleId);
    }
  }

  /**
   * Unsubscribe a client from a vehicle
   */
  unsubscribe(socketId, vehicleId) {
    const clientSubs = this.subscriptions.get(socketId);
    if (clientSubs) {
      clientSubs.delete(vehicleId);
    }
  }

  /**
   * Get all socket IDs subscribed to a specific vehicle or 'all'
   */
  getSubscribers(vehicleId) {
    const subscribers = [];
    for (const [socketId, vehicleIds] of this.subscriptions.entries()) {
      if (vehicleIds.has(vehicleId) || vehicleIds.has('all')) {
        subscribers.push(socketId);
      }
    }
    return subscribers;
  }
}

module.exports = new SubscriptionManager();
