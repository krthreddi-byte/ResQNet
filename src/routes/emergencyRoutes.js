import express from 'express';
import { createEmergency, getEmergencies, updateEmergencyStatus } from '../controllers/emergencyController.js';

const router = express.Router();
router.post('/', createEmergency);
router.get('/', getEmergencies);
router.patch('/:id/status', updateEmergencyStatus);

export default router;