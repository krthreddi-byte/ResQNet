import express from 'express';
import {
  getResources,
  getNearbyResources,
  createResource
} from '../controllers/resourceController.js';

const router = express.Router();

router.get('/nearby', getNearbyResources);
router.get('/', getResources);
router.post('/', createResource);

export default router;
