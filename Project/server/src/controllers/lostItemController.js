const asyncHandler = require('../utils/asyncWrapper');
const supportService = require('../services/supportService');
const ResponseFormatter = require('../utils/responseFormatter');

/**
 * @desc    Report a lost item (creates a support ticket)
 * @route   POST /api/lost-items
 * @access  Private (User/Driver)
 */
exports.reportLostItem = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const userType = req.user.role;
  const userModel = req.user.role === 'Passenger' ? 'User' : 'Driver';

  const data = {
    ...req.body,
    category: 'Lost Item',
    subject: req.body.subject || 'Lost Item Report'
  };

  const ticket = await supportService.createTicket(userId, userType, userModel, data, req.io);
  res.status(201).json(ResponseFormatter.success(ticket, 'Lost item reported successfully'));
});

/**
 * @desc    Get user's lost items
 * @route   GET /api/lost-items
 * @access  Private (User/Driver)
 */
exports.getLostItems = asyncHandler(async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const tickets = await supportService.getTickets(userId);
  const lostItems = tickets.filter(t => t.category === 'Lost Item');
  res.status(200).json(ResponseFormatter.success(lostItems));
});
