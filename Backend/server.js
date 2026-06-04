require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// --- Initialize Express App ---
const app = express();

// --- Connect to MongoDB ---
connectDB();

// ============================================================
// Core Middleware
// ============================================================

// Security headers
app.use(helmet());

// CORS — allow frontend origin in production via env var
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// HTTP request logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse incoming JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============================================================
// Routes
// ============================================================

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Placeholder route stubs — wire in real routers as you build them:
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks",    require("./routes/tasks"));
app.use("/api/chat",     require("./routes/chat"));
// ============================================================
// 404 Handler
// ============================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ============================================================
// Global Error Handler
// ============================================================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: "Validation failed", errors: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================================
// Start Server
// ============================================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown on unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(` Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;