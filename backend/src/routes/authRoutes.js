const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * IN-MEMORY USERS (NO DB TABLE REQUIRED)
 * 
 * DESIGN DECISION: We keep credentials in memory or env vars to avoid
 * schema changes. This ensures the authentication is additive/optional.
 */
const USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'viewer', password: 'viewer123', role: 'viewer' }
];

/**
 * POST /api/v1/auth/login
 * Validates credentials and returns a JWT token.
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Invalid username or password' 
    });
  }

  // Sign token with user metadata
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    status: 'success',
    data: {
      token,
      role: user.role,
      username: user.username
    }
  });
});

/**
 * POST /api/v1/auth/logout
 * Handled client-side by clearing the token, but provided here for standard API compliance.
 */
router.post('/logout', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Logged out successfully' 
  });
});

module.exports = router;
