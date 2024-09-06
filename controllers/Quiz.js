import { generateText } from "../utils/groqModel.js";
import Quiz from "../models/Quiz.js";
import * as crypto from 'crypto';

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
        const result = await generateText(prompt, {});
        console.log("AI Output:", result);

        const quizData = {
            quizId: crypto.randomBytes(32).toString("hex"),
            grade,
            subject,
            totalQuestions,
            maxScore,
            difficulty,
            questions: result.map(q => ({
                questionId: crypto.randomBytes(32).toString("hex"),
                ... q
            }))
        };

        const newQuiz = await Quiz.create(quizData);

        return res.status(201).json({
            success: true,
            message: 'Quiz generated successfully',
            quiz: newQuiz
        });
    } 
    catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Failed to generate quiz'
        });
    }
    
};