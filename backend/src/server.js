require('dotenv').config();
const http = require('http');
const app = require('./app');
const initWebSocket = require('./websocket');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
