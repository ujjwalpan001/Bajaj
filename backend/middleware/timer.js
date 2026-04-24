/**
 * @file middleware/timer.js
 * @description High-resolution request timer middleware.
 * Attaches `req._startTime` (BigInt nanoseconds) for accurate execution tracking.
 */

/**
 * Attaches a high-resolution start timestamp to every incoming request.
 * Downstream handlers can call `getElapsedMs(req)` to get elapsed ms.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export const requestTimer = (req, _res, next) => {
  req._startTime = process.hrtime.bigint();
  next();
};

/**
 * Returns the elapsed time in milliseconds since `requestTimer` ran.
 *
 * @param {import('express').Request} req
 * @returns {number} Elapsed time in milliseconds (float)
 */
export const getElapsedMs = (req) => {
  const elapsed = process.hrtime.bigint() - req._startTime;
  // Convert nanoseconds → milliseconds, keep 2 decimal precision
  return Math.round(Number(elapsed / 1000n)) / 1000;
};
