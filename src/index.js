import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import submissionRoutes from "./routes/submissions.js";
import authRoutes from "./routes/auth.js";
import offerRoutes from "./routes/offer.js";
import { swaggerSpec } from "./swagger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { checkExpiredSubscriptions } from "./jobs/checkExpiredSubscriptions.js";
import aiRoutes from "./routes/aiRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import userInformationRoutes from "./routes/UserInformationRoutes.js";
import firebaseAuthRoutes from "./routes/authRoutes.js";




/**
 * @entry index.js
 *
 * Responsibilities:
 *   - Load environment variables
 *   - Connect to MongoDB
 *   - Register global middleware
 *   - Register API routes
 *   - Register Swagger documentation
 *   - Schedule expired subscriptions check
 *   - Start the Express server
 */
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

/**
 * @guard MONGO_URI
 * Stops the server at startup if the database URI is missing.
 */
if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

/**
 * @database
 * Connects to MongoDB via Mongoose.
 * Exits the process if the connection fails
 * because all routes depend on the database.
 */
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });

/**
 * @middleware Global middleware
 *
 * CORS: allows requests only from the frontend origins defined in .env.
 * ALLOWED_ORIGINS in .env is a comma-separated list of allowed origins.
 * Falls back to common Vite dev ports if the variable is not set.
 * express.json: parses incoming JSON request bodies.
 */
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
    ],
    credentials: true,
  })
);

app.use(express.json());

/**
 * @routes API routes
 *
 * /api/offers      → public GET + admin CRUD (protect + adminOnly inside router)
 * /api/submissions → protected POST, admin GET
 * /api/auth        → public register + login
 */
app.use("/api/offers", offerRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/firebase-auth", firebaseAuthRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user-information", userInformationRoutes);

/**
 * @docs Swagger UI
 * Available at: http://localhost:5000/api-docs
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @health Health check endpoint
 * Used to verify the server is running before making API calls.
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

/**
 * @job Expired subscriptions check
 * Runs once on server start then repeats every 24 hours.
 * Marks expired subscriptions and sends cancellation emails.
 */
checkExpiredSubscriptions();
setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);

/**
 * @middleware 404 handler
 * Must be registered after all valid routes.
 */
app.use(notFound);

/**
 * @middleware Global error handler
 * Must be registered last in the middleware chain.
 */
app.use(errorHandler);

/**
 * @server
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});