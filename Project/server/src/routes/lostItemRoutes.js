const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { reportLostItem, getLostItems } = require('../controllers/lostItemController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', reportLostItem);
router.get('/', getLostItems);

module.exports = router;
