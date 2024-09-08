import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.route.js";
import quizRoutes from "./routes/quiz.route.js";
import connectAndLogRedisStatus from "./config/redisController.js";
import connectDBandLogDB from "./config/database.js";

const app = express();
dotenv.config();

connectDBandLogDB()
  .then((client) => {
    console.log("Finding errors ");
  })
  .catch((error) => {
    console.error("An error occurred in Database Operations :" + error);
  });

connectAndLogRedisStatus()
  .then((client) => {
    console.log("Performing Redis operations...");
  })
  .catch((error) => {
    console.error(
      "An error occurred while performing Redis operations:",
      error
    );
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
