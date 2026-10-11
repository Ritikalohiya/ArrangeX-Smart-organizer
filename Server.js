
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import buildingRoutes from "./routes/buildingRoutes.js";
import hallRoutes from "./routes/hallRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import seatingRoutes from "./routes/seatingRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Error middleware
import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

const app = express();
const PORT = Number(process.env.PORT) || 5522;

// ======================================
// GLOBAL MIDDLEWARE
// ======================================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// ======================================
// HOME / HEALTH CHECK ROUTE
// ======================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ArrangeX Exam Seating API is running",
  });
});

// ======================================
// API ROUTES
// ======================================

app.use("/api/auth", authRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/seating", seatingRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ======================================
// 404 HANDLER
// ======================================

app.use(notFound);

// ======================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// ======================================

app.use(errorHandler);

// ======================================
// START SERVER
// ======================================

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log("\n==================================");
      console.log("      ArrangeX Backend Started");
      console.log("==================================");
      console.log(`Server:    http://localhost:${PORT}`);
      console.log(`Auth:      http://localhost:${PORT}/api/auth`);
      console.log(`Colleges:  http://localhost:${PORT}/api/colleges`);
      console.log(`Buildings: http://localhost:${PORT}/api/buildings`);
      console.log(`Halls:     http://localhost:${PORT}/api/halls`);
      console.log(`Students:  http://localhost:${PORT}/api/students`);
      console.log(`Exams:     http://localhost:${PORT}/api/exams`);
      console.log(`Seating:   http://localhost:${PORT}/api/seating`);
      console.log(`Dashboard: http://localhost:${PORT}/api/dashboard`);
      console.log("==================================\n");
    });

    server.on("error", (error) => {
      console.error("Server error:", error.message);

      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Stop the other server or change PORT in .env.`
        );
      }
    });
  } catch (error) {
    console.error("Failed to start ArrangeX backend:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();

export default app;
