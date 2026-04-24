/**
 * @file routes/bfhl.js
 * @description Express router for /bfhl endpoints.
 */

import { Router } from "express";
import { processBFHL } from "../controllers/bfhlController.js";

const router = Router();

/**
 * POST /bfhl
 * Processes hierarchical node string relationships.
 */
router.post("/", processBFHL);

/**
 * GET /bfhl
 * Health check & API info endpoint.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message: "BFHL Hierarchical Node Processor API",
    version: "1.0.0",
    endpoints: {
      "POST /bfhl": "Process hierarchical node relationships",
      "GET /bfhl": "API health check",
    },
  });
});

export default router;
