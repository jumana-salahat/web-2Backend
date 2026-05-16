/**
 * Custom API error type
 * Allows throwing errors with specific HTTP status codes
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all unhandled application errors
 */
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";

  /**
   * Handle custom API errors
   */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error("Unhandled error:", err);

  return res.status(statusCode).json({
    success: false,
    message,
    /**
     * Show detailed errors only in development mode
     */
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

/**
 * Handle undefined routes
 */
export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};