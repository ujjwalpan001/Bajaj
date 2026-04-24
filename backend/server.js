/**
 * @file server.js
 * @description Main Express application entry point.
 * Configures middleware (CORS, body parsing, logging, timing), routes, and error handling.
 */

import express from "express";
import cors from "cors";
import bfhlRouter from "./routes/bfhl.js";
import { requestLogger } from "./middleware/logger.js";
import { requestTimer } from "./middleware/timer.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Timing (must be before routes so req._startTime is set early) ─────────────
app.use(requestTimer);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logger ───────────────────────────────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/bfhl", bfhlRouter);

// ── Root health check ─────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    message: "BFHL API Server is running.",
    version: "1.0.0",
    endpoints: { "POST /bfhl": "Process hierarchical node relationships" },
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Global Error]", err.stack);
  res.status(500).json({ error: "Unexpected server error." });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  BFHL API running  →  http://localhost:${PORT}`);
  console.log(`📋  POST /bfhl  ·  GET /bfhl\n`);
});

export default app;
