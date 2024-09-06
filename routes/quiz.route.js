import Router from 'express';
import { generateQuiz } from '../controllers/Quiz.js';

const router = Router();

router.post('/generatequiz', generateQuiz);

export default router;