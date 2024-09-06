import QuizSubmission from "../models/QuizSubmission.js";
import Quiz from "../models/Quiz.js";

export const Submission = async (req, res) => {
    const { quizId, responses } = req.body;
    const { userId } = req.params;

    try {
        const quiz = await Quiz.findOne({ quizId });

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        let score = 0;
        const feedback = [];
        for (const response of responses) {
            const question = quiz.questions.find(q => q.questionId === response.questionId);
            if (question && question.correctAnswer === response.userResponse) {
                score++;
            }

            feedback.push({
                question: question.question,  
                userResponse: response.userResponse,
                correctAnswer: question.correctAnswer,
                isCorrect: question.correctAnswer === response.userResponse
            });
        }

        const submission = await QuizSubmission.create({
            quizId: quizId,
            user: userId,
            responses: feedback,
            score: score
        });

        return res.status(201).json({
            success: true,
            message: 'Quiz submitted successfully',
            submission: submission
        });
    } 
    catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
            message: 'Failed to submit quiz'
        });
    }
};
