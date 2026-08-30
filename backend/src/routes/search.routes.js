import express from 'express';
import {
  getRecentSearches,
  saveRecentSearch,
  deleteRecentSearch,
  clearAllRecentSearches,
} from '../controllers/search.controller.js';

const router = express.Router();

router.get('/recent', getRecentSearches);
router.post('/recent', saveRecentSearch);
router.delete('/recent/:query', deleteRecentSearch);
router.delete('/recent', clearAllRecentSearches);

export default router;
