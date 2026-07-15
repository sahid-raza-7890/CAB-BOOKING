const ChatMessage = require('../models/ChatMessage');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const ErrorResponse = require('../utils/errorResponse');

class ChatService {
  /**
   * Send a message
   */
  async sendMessage(rideId, senderId, senderModel, content, attachments = []) {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ErrorResponse('Ride not found', 404);
    }

    // Verify sender is part of the ride
    if (senderModel === 'User' && ride.passenger.toString() !== senderId.toString()) {
      throw new ErrorResponse('Not authorized for this ride', 403);
    }
    if (senderModel === 'Driver' && (!ride.driver || ride.driver.toString() !== senderId.toString())) {
      throw new ErrorResponse('Not authorized for this ride', 403);
    }

    const receiverId = senderModel === 'User' ? ride.driver : ride.passenger;
    const receiverModel = senderModel === 'User' ? 'Driver' : 'User';

    if (!receiverId) {
      throw new ErrorResponse('Receiver not assigned yet', 400);
    }

    const message = await ChatMessage.create({
      ride: rideId,
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      content,
      attachments
    });

    return message;
  }

  /**
   * Get messages for a ride
   */
  async getMessages(rideId, userId) {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ErrorResponse('Ride not found', 404);
    }

    // Verify participant
    if (ride.passenger.toString() !== userId.toString() && 
        (!ride.driver || ride.driver.toString() !== userId.toString())) {
      throw new ErrorResponse('Not authorized for this ride', 403);
    }

    const messages = await ChatMessage.find({ ride: rideId }).sort({ createdAt: 1 });
    return messages;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(rideId, receiverId) {
    await ChatMessage.updateMany(
      { ride: rideId, receiver: receiverId, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: Date.now() } }
    );
    return { success: true };
  }
}

module.exports = new ChatService();
