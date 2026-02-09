const { Server } = require('socket.io');
const subscriptionManager = require('./subscriptions');
const broadcaster = require('./broadcaster');

/**
 * Initialize Socket.io server and handle base events
 */
function initWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"]
    }
  });

  broadcaster.init(io);

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    subscriptionManager.addClient(socket.id);

    /**
     * Handle 'subscribe' event
     */
    socket.on('subscribe', (payload) => {
      const { vehicle_id } = payload;
      if (vehicle_id) {
        subscriptionManager.subscribe(socket.id, vehicle_id);
        console.log(`Client ${socket.id} subscribed to: ${vehicle_id}`);
      }
    });

    /**
     * Handle 'unsubscribe' event
     */
    socket.on('unsubscribe', (payload) => {
      const { vehicle_id } = payload;
      if (vehicle_id) {
        subscriptionManager.unsubscribe(socket.id, vehicle_id);
        console.log(`Client ${socket.id} unsubscribed from: ${vehicle_id}`);
      }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      subscriptionManager.removeClient(socket.id);
    });
  });

  return io;
}

module.exports = initWebSocket;
