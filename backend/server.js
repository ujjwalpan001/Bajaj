/**
 * @file server.js
 * @description Main Express application entry point.
 * Configures middleware, CORS, routes, and starts the HTTP server.
 */

import express from "express";
import cors from "cors";
import bfhlRouter from "./routes/bfhl.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allows requests from any origin (dev + prod). Tighten in production if needed.
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (lightweight) ───────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/bfhl", bfhlRouter);

// ── Root health check ─────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "OK", message: "BFHL API Server is running." });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Global Error]", err.stack);
  res.status(500).json({ error: "Unexpected server error." });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  BFHL API running on http://localhost:${PORT}`);
});

export default app;
