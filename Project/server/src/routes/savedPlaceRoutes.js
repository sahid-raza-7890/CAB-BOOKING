const express = require('express');
const router = express.Router();
const SavedPlaceController = require('../controllers/savedPlaceController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(SavedPlaceController.getPlaces));
router.get('/recent', asyncWrapper(SavedPlaceController.getRecentPlaces));
router.post('/', asyncWrapper(SavedPlaceController.createPlace));
router.put('/:id', asyncWrapper(SavedPlaceController.updatePlace));
router.delete('/:id', asyncWrapper(SavedPlaceController.deletePlace));
router.put('/:id/default', asyncWrapper(SavedPlaceController.setDefault));

module.exports = router;
