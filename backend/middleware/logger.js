/**
 * @file middleware/logger.js
 * @description HTTP request/response logger middleware.
 * Logs method, URL, status code, and response time for every request.
 */

/**
 * Colorises a status code string for console output (ANSI codes).
 * @param {number} status
 * @returns {string}
 */
const colorStatus = (status) => {
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // yellow
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // green
  return `\x1b[36m${status}\x1b[0m`;                    // cyan
};

/**
 * Express middleware that logs each request when the response finishes.
 * Format: [ISO timestamp] METHOD /path → STATUS (Xms)
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const icon = status >= 400 ? "❌" : "✅";

    console.log(
      `${icon} [${timestamp}] \x1b[1m${req.method}\x1b[0m ${req.originalUrl} → ${colorStatus(status)} (${duration}ms)`
    );
  });

  next();
};
