import Router from 'express';
import { generateQuiz } from '../controllers/Quiz.js';
import { Submission } from '../controllers/Submission.js';
import { getQuizHistory } from '../controllers/History.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/generatequiz', generateQuiz);
router.post('/submit/:userId', Submission);
router.get('/history/:userId', getQuizHistory);

export default router;