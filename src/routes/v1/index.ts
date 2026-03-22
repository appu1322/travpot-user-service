import { Router } from 'express';
import { clientRouter } from './client';

const router = Router();

router.use('/', clientRouter);

export const v1Routers = router;
