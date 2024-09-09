import QuizSubmission from '../models/submissionSchema.js';
import Quiz from '../models/quizSchema.js';
import { getJSON, setJSON } from './redisController.js';

const CACHE_EXPIRE_TIME = 3600; // Cache expiration time in seconds

export const getQuizHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { grade, subject, minScore, maxScore, from, to } = req.query;

        let query = { user: userId };
        let quizQuery = {};

        // Handle grade filter
        if (grade) {
            const parsedGrade = parseInt(grade);
            if (isNaN(parsedGrade)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid grade parameter'
                });
            }
            quizQuery.grade = parsedGrade;
        }

        // Handle subject filter
        if (subject) {
            if (typeof subject !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subject parameter'
                });
            }
            quizQuery.subject = subject;
        }

        // Handle date range filter
        if (from || to) {
            query.createdAt = {};
            if (from) {
                const fromDate = new Date(from);
                if (isNaN(fromDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid from date parameter'
                    });
                }
                query.createdAt.$gte = fromDate;
            }
            if (to) {
                const toDate = new Date(to);
                if (isNaN(toDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid to date parameter'
                    });
                }
                query.createdAt.$lte = toDate;
            }
        }

        // Handle score filters
        if (minScore) {
            const parsedMinScore = parseInt(minScore);
            if (isNaN(parsedMinScore)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid minScore parameter'
                });
            }
            query.score = { $gte: parsedMinScore };
        }

        if (maxScore) {
            const parsedMaxScore = parseInt(maxScore);
            if (isNaN(parsedMaxScore)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid maxScore parameter'
                });
            }
            if (query.score) {
                query.score.$lte = parsedMaxScore;
            } else {
                query.score = { $lte: parsedMaxScore };
            }
        }

        // Create a unique cache key based on query parameters
        const cacheKey = `quizHistory:${userId}:${JSON.stringify(req.query)}`;

        // Attempt to get cached data
        const cachedData = await getJSON(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                message: 'Quiz history retrieved from cache',
                data: cachedData
            });
        }

        // Query the database for quizzes based on the quizQuery criteria
        const quizzes = await Quiz.find(quizQuery).select('quizId');
        const quizIds = quizzes.map(quiz => quiz.quizId);
        query.quizId = { $in: quizIds };

        // Query the database for quiz submissions based on the query criteria
        const submissions = await QuizSubmission.find(query).sort({ createdAt: -1 });

        if (submissions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No quiz submissions found'
            });
        }

        // Optionally populate quiz details if needed
        const populatedSubmissions = await Promise.all(submissions.map(async (submission) => {
            try {
                const quiz = await Quiz.findOne({ quizId: submission.quizId });
                return {
                    ...submission.toObject(),
                    quiz: quiz ? quiz.toObject() : null
                };
            } catch (quizError) {
                console.error('Error retrieving quiz data:', quizError);
                return null;
            }
        })).then(results => results.filter(result => result !== null));

        // Store result in cache
        await setJSON(cacheKey, populatedSubmissions, CACHE_EXPIRE_TIME);

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
