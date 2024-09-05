import Router from 'express';

import { signUp } from '../controllers/Auth';

const router = Router();

router.post('/signup', signUp);
// router.post('/login', login);

export default router;