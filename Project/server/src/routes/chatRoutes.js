const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  markAsRead
} = require('../controllers/chatController');

const router = express.Router();

router.use(authMiddleware);

router.post('/rides/:rideId/messages', sendMessage);
router.get('/rides/:rideId/messages', getMessages);
router.put('/rides/:rideId/read', markAsRead);

module.exports = router;
