import QuizSubmission from "../models/QuizSubmission.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import { generateText } from "../utils/groqModel.js";

export const Submission = async (req, res) => {
    const { quizId, responses } = req.body;
    const { userId } = req.params;

    try {
        const quiz = await Quiz.findOne({ quizId });
        const user = await User.findById(userId);
        console.log(user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        let score = 0;
        const feedback = [];
        const incorrectQuestions = [];
        for (const response of responses) {
            const question = quiz.questions.find(q => q.questionId === response.questionId);
            if (question && question.correctAnswer === response.userResponse) {
                score++;
            }
            else {
                incorrectQuestions.push(question.question);
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

        // Generate suggestions
        const suggestions = await generateSuggestions(quiz.subject, incorrectQuestions);

        // Prepare email content
        const emailSubject = `Your ${quiz.subject} Quiz Results`;
        const emailMessage = `
            Hi ${user.username},

            You have completed the ${quiz.subject} quiz. Here are your results:

            Score: ${score}/${quiz.totalQuestions}

            Here are two suggestions to help you improve:
            1. ${suggestions[0]}
            2. ${suggestions[1]}

            Keep up the good work!

            Best regards,
            The Quiz Team
        `;

        // Send email
        await mailSender(user.email, emailSubject, emailMessage);

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

async function generateSuggestions(quizSubject, incorrectQuestions) {
    const prompt = `Based on a ${quizSubject} quiz, the student answered the following questions incorrectly:
    ${incorrectQuestions.map(q => `- ${q}`).join('\n')}
    
    Please provide two specific suggestions to help the student improve their skills in these areas. Each suggestion should be concise and actionable.`;

    try {
        const suggestions = await generateText(prompt);
        return suggestions.split('\n').filter(s => s.trim() !== '').slice(0, 2);
    } catch (error) {
        console.error('Error generating suggestions:', error);
        return ['Focus on reviewing the topics you found challenging.', 'Practice similar questions to reinforce your understanding.'];
    }
}