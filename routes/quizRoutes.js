import Router from 'express';
import { generateQuiz } from '../controllers/quizController.js';
import { Submission } from '../controllers/submissionController.js';
import { getQuizHistory } from '../controllers/historyController.js';
import { auth } from '../middlewares/authMiddleware.js';
import { retrySubmission } from '../controllers/retryController.js';

const router = Router();

router.post('/generatequiz', generateQuiz);
router.post('/submit/:userId', Submission);
router.get('/history/:userId', getQuizHistory);
router.post('/retry/:userId',retrySubmission);

export default router;