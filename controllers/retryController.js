import Quiz from "../models/quizSchema.js";
import QuizSubmission from "../models/submissionSchema.js";
import { getJSON, setJSON } from "./redisController.js";
import moment from "moment";
import { calculateScore } from "./submissionController.js";

export const retrySubmission = async (req, res) => {
  const { quizId, responses } = req.body;
  const { userId } = req.params;

  if (
    !quizId ||
    !responses ||
    !Array.isArray(responses) ||
    responses.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input data" });
  }

  try {
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const { score, feedback } = calculateScore(quiz, responses);

    // Update or insert submission
    const submission = await QuizSubmission.create({
      quizId: quizId,
      user: userId,
      responses: feedback,
      score: score,
      completedAt: new Date(),
    });
    
    // Generate a key for Redis: 'quizId & timestamp'
    const timestamp = moment().format("YYYYMMDD_HHmmss");
    const redisKey = `${quizId}_${timestamp}`;

    // Save the quiz data to Redis with the generated key
    const ttl = process.env.TTL_Quiz || 3600; // Use default TTL if not set
    await setJSON(redisKey, quiz, ttl);

    // Return successful response with submission and Redis key
    return res.status(200).json({
      success: true,
      message: "Submission saved successfully",
      responseQuiz: quiz,
    });
  } catch (error) {
    console.error("Error in retry submission:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
