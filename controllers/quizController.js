import { generateText } from "../utils/groqModel.js";
import Quiz from "../models/quizSchema.js";
import crypto from "crypto";
import { setJSON } from "./redisController.js";

const createQuizId = (grade, subject, difficulty, maxScore) => {
  const gradeStr = String(grade).replace(/\s/g, "");
  const subjectStr = String(subject).replace(/\s/g, "");
  const difficultyStr = String(difficulty).replace(/\s/g, "");
  const maxScoreStr = String(maxScore).replace(/\s/g, "");
  const combinedString = `${gradeStr}-${subjectStr}-${difficultyStr}-${maxScoreStr}`;
  const hash = crypto.createHash("sha256").update(combinedString).digest("hex");
  return hash.slice(0, 16);
};

export const generateQuiz = async (req, res) => {
  const { grade, subject, totalQuestions, maxScore, difficulty } = req.body;

  const prompt = `Generate a ${subject} quiz for grade ${grade} with ${totalQuestions} questions. 
        Difficulty: ${difficulty}. Maximum score: ${maxScore}. 
        Format the response as a JSON array of questions with the following structure:
        [
            {
            "question": "Question text",
            "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"],
            "correctAnswer": "A" // Just the letter of the correct option
            }
        ]`;

  try {
    const text = await generateText(prompt, {});
    let result;

    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]") + 1;

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = text.substring(jsonStart, jsonEnd);
        result = JSON.parse(jsonString);
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
    const QuizId = createQuizId(grade, subject, maxScore, difficulty);
    const quizData = {
      quizId: QuizId,
      grade,
      subject,
      totalQuestions,
      maxScore,
      difficulty,
      questions: result.map((q) => ({
        questionId: crypto.randomBytes(32).toString("hex"),
        ...q,
      })),
    };

    const newQuiz = await Quiz.create(quizData);
    await setJSON(QuizId, quizData, process.env.TTL_Quiz);

    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to generate quiz",
    });
  }
};
