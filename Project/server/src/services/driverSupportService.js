const Ticket = require('../models/Ticket');

class DriverSupportService {
    static async createTicket(driverId, payload, io) {
        const ticket = new Ticket({
            userId: driverId,
            userType: 'Driver',
            userModel: 'Driver',
            subject: payload.subject,
            category: payload.category || 'Other',
            priority: payload.priority || 'Normal',
            description: payload.description
        });
        await ticket.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('ticketCreated', {
                event: 'ticket:created',
                data: ticket
            });
        }
        return ticket;
    }

    static async getTickets(driverId) {
        return await Ticket.find({ userId: driverId, userModel: 'Driver' }).sort({ createdAt: -1 });
    }

    static async getTicket(ticketId, driverId) {
        const ticket = await Ticket.findOne({ _id: ticketId, userId: driverId, userModel: 'Driver' });
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
    }

    static async replyToTicket(ticketId, driverId, message, io) {
        const ticket = await Ticket.findOne({ _id: ticketId, userId: driverId, userModel: 'Driver' });
        if (!ticket) throw new Error('Ticket not found');
        
        if (ticket.status === 'Closed') {
            throw new Error('Cannot reply to a closed ticket');
        }

        ticket.replies.push({
            senderId: driverId,
            senderModel: 'Driver',
            message
        });
        ticket.status = 'Open'; // Or InProgress
        await ticket.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('ticketUpdated', {
                event: 'ticket:updated',
                data: ticket
            });
        }
        return ticket;
    }

    static async closeTicket(ticketId, driverId, io) {
        const ticket = await Ticket.findOneAndUpdate(
            { _id: ticketId, userId: driverId, userModel: 'Driver' },
            { status: 'Closed' },
            { new: true }
        );
        if (!ticket) throw new Error('Ticket not found');

        if (io) {
            io.to(`driver_${driverId}`).emit('ticketClosed', {
                event: 'ticket:closed',
                data: ticket
            });
        }
        return ticket;
    }
}

module.exports = DriverSupportService;
