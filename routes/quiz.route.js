import Router from 'express';
import { generateQuiz } from '../controllers/Quiz.js';
import { Submission } from '../controllers/Submission.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/generatequiz', generateQuiz);
router.post('/submit/:userId', Submission);

export default router;