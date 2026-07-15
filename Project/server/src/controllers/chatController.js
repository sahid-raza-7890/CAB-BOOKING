const asyncHandler = require('../utils/asyncWrapper');
const chatService = require('../services/chatService');
const ResponseFormatter = require('../utils/responseFormatter');

/**
 * @desc    Send a chat message
 * @route   POST /api/chat/rides/:rideId/messages
 * @access  Private (User/Driver)
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { content, attachments } = req.body;
  const senderModel = req.user.role === 'Driver' ? 'Driver' : 'User';
  
  const message = await chatService.sendMessage(
    req.params.rideId,
    req.user.id,
    senderModel,
    content,
    attachments
  );
  
  res.status(201).json(ResponseFormatter.success(message));
});

/**
 * @desc    Get chat messages for a ride
 * @route   GET /api/chat/rides/:rideId/messages
 * @access  Private (User/Driver)
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.params.rideId, req.user.id);
  res.status(200).json(ResponseFormatter.success(messages));
});

/**
 * @desc    Mark messages as read
 * @route   PUT /api/chat/rides/:rideId/read
 * @access  Private (User/Driver)
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const result = await chatService.markAsRead(req.params.rideId, req.user.id);
  res.status(200).json(ResponseFormatter.success(result));
});
