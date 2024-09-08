import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route.js";
import quizRoutes from "./routes/quiz.route.js";
import  connectAndLogRedisStatus from "./config/redisController.js"; // Import Redis connection
import  connectDBandLogDB  from "./config/database.js";  // Import DB connection

const app = express();
dotenv.config();

// Database connection
let dbClient = null;
connectDBandLogDB()
  .then((client) => {
    dbClient = client;  // Store the DB client globally
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.error("An error occurred in Database operations:", error);
  });

// Redis connection
let redisClient = null;
connectAndLogRedisStatus()
  .then((client) => {
    redisClient = client;  // Store the Redis client globally
    console.log("Redis connected successfully.");
  })
  .catch((error) => {
    console.error("An error occurred while performing Redis operations:", error);
  });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export the connected clients to be reused in other parts of the application
export { dbClient, redisClient };
