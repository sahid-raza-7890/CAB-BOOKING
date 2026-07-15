const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/supportController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Secure all endpoints to Passenger only
router.use(authMiddleware);
router.use(requireRole('Passenger'));

router.get('/', asyncWrapper(SupportController.getTickets));
router.get('/:id', asyncWrapper(SupportController.getTicket));
router.post('/', asyncWrapper(SupportController.createTicket));
router.put('/:id', asyncWrapper(SupportController.updateTicket));
router.post('/:id/reply', asyncWrapper(SupportController.replyTicket));
router.put('/:id/close', asyncWrapper(SupportController.closeTicket));

// â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/kb/faqs', asyncWrapper(SupportController.getFAQs));
router.get('/kb/articles', asyncWrapper(SupportController.getHelpArticles));
router.get('/kb/articles/:id', asyncWrapper(SupportController.readHelpArticle));

module.exports = router;
