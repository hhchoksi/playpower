import { generateText } from "../utils/groqModel.js";
import Quiz from "../models/Quiz.js";
import crypto from "crypto";
import { setJSON } from "../controllers/redisFunctions.js";

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
  try {
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

    const result = await generateText(prompt, {});
    const quizId = createQuizId(grade, subject, difficulty, maxScore); // Corrected parameter order

    const createQuestionId = () => {
      return crypto.randomBytes(8).toString("hex");
    };
    const questions = result.map((q) => ({
      questionId: createQuestionId(), // Generate a unique questionId for each question
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));

    // Step 5: Construct quiz data object
    const quizData = {
      quizId,
      grade,
      subject,
      totalQuestions,
      maxScore,
      difficulty,
      questions, // Use the questions array with questionId
    };
    console.log(quizData);
    // Step 6: Save the quiz data to MongoDB
    const newQuiz = await Quiz.create(quizData);

    // Step 7: Save the quiz data to Redis
    await setJSON(quizId, quizData, process.env.TTL_Quiz);

    // Step 8: Return success response
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
