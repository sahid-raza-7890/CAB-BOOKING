const express = require('express');
const router = express.Router();
const DriverSupportController = require('../controllers/driverSupportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');

router.use(authMiddleware);
router.use(requireRole('Driver'));

router.get('/', asyncWrapper(DriverSupportController.getTickets));
router.get('/:id', asyncWrapper(DriverSupportController.getTicket));
router.post('/', asyncWrapper(DriverSupportController.createTicket));
router.post('/:id/reply', asyncWrapper(DriverSupportController.replyToTicket));
router.put('/:id/close', asyncWrapper(DriverSupportController.closeTicket));

// â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SupportController = require('../controllers/supportController');
router.get('/kb/faqs', asyncWrapper(SupportController.getFAQs));
router.get('/kb/articles', asyncWrapper(SupportController.getHelpArticles));
router.get('/kb/articles/:id', asyncWrapper(SupportController.readHelpArticle));

module.exports = router;
