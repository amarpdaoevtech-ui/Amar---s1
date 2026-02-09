/**
 * Standard utility for consistent API responses
 */

/**
 * Success Response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

/**
 * Error Response
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
