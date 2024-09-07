import QuizSubmission from '../models/QuizSubmission.js';
import Quiz from '../models/Quiz.js';

export const getQuizHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { grade, subject, minScore, maxScore, from, to } = req.query;

        let query = { user: userId };
        let quizQuery = {};

        if (grade) quizQuery.grade = parseInt(grade);
        if (subject) quizQuery.subject = subject;

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        if (minScore) query.score = { $gte: parseInt(minScore) };
        if (maxScore) {
            if (query.score) {
                query.score.$lte = parseInt(maxScore);
            } else {
                query.score = { $lte: parseInt(maxScore) };
            }
        }

        const quizzes = await Quiz.find(quizQuery).select('quizId');
        const quizIds = quizzes.map(quiz => quiz.quizId);
        query.quizId = { $in: quizIds };

        const submissions = await QuizSubmission.find(query).sort({ createdAt: -1 });

        const populatedSubmissions = await Promise.all(submissions.map(async (submission) => {
            const quiz = await Quiz.findOne({ quizId: submission.quizId });
            return {
                ...submission.toObject(),
                quiz: quiz ? quiz.toObject() : null
            };
        }));

        res.status(200).json({
            success: true,
            message: 'Quiz history retrieved successfully',
            data: populatedSubmissions
        });
    } catch (error) {
        console.error('Error in getQuizHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quiz history',
            error: error.message
        });
    }
};