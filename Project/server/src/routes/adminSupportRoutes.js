const express = require('express');
const router = express.Router();
const AdminSupportController = require('../controllers/adminSupportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Admin'));

router.get('/', AdminSupportController.getTickets);
router.get('/analytics', AdminSupportController.supportAnalytics);
router.get('/:id', AdminSupportController.getTicket);
router.put('/:id/assign', AdminSupportController.assignTicket);
router.post('/:id/reply', AdminSupportController.replyTicket);
router.put('/:id/close', AdminSupportController.closeTicket);
router.put('/:id/reopen', AdminSupportController.reopenTicket);

// â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/kb/faqs', AdminSupportController.createFAQ);
router.post('/kb/articles', AdminSupportController.createHelpArticle);

module.exports = router;
