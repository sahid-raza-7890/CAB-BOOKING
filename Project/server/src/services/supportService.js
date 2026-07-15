const Ticket = require('../models/Ticket');

class SupportService {
    
    static async createTicket(userId, userType, userModel, data, io) {
        const newTicket = new Ticket({
            userId,
            userType,
            userModel,
            subject: data.subject,
            category: data.category || 'Other',
            priority: data.priority || 'Normal',
            description: data.description,
            status: 'Open'
        });

        await newTicket.save();

        if (io) {
            const payload = { event: 'ticketCreated', data: newTicket };
            io.emit(`support_${userId}`, payload);
            io.emit('support_admin', payload);
        }

        return newTicket;
    }

    static async updateTicket(ticketId, userId, data, io) {
        const ticket = await Ticket.findOne({ _id: ticketId, userId });
        if (!ticket) throw new Error("Ticket not found or unauthorized");

        if (data.subject) ticket.subject = data.subject;
        if (data.category) ticket.category = data.category;
        if (data.priority) ticket.priority = data.priority;
        if (data.description) ticket.description = data.description;
        
        await ticket.save();

        if (io) {
            const payload = { event: 'ticketUpdated', data: ticket };
            io.emit(`support_${userId}`, payload);
            io.emit('support_admin', payload);
        }

        return ticket;
    }

    static async replyTicket(ticketId, senderId, senderModel, message, io) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error("Ticket not found");

        // Validate ownership if sender is a User/Passenger/Driver
        if (senderModel !== 'Admin' && ticket.userId.toString() !== senderId.toString()) {
            throw new Error("Unauthorized to reply to this ticket");
        }

        const reply = { senderId, senderModel, message, createdAt: new Date() };
        ticket.replies.push(reply);
        ticket.status = 'InProgress'; // Auto update status on reply
        await ticket.save();

        if (io) {
            const payload = { event: 'ticketReply', data: { ticketId, reply, status: ticket.status } };
            io.emit(`support_${ticket.userId}`, payload);
            io.emit('support_admin', payload);
        }

        return ticket;
    }

    static async closeTicket(ticketId, userId, io) {
        const ticket = await Ticket.findOne({ _id: ticketId, userId });
        if (!ticket) throw new Error("Ticket not found or unauthorized");

        ticket.status = 'Closed';
        await ticket.save();

        if (io) {
            const payload = { event: 'ticketUpdated', data: ticket };
            io.emit(`support_${userId}`, payload);
            io.emit('support_admin', payload);
        }

        return ticket;
    }

    static async getTickets(userId) {
        return await Ticket.find({ userId }).sort({ createdAt: -1 });
    }

    static async getTicket(ticketId, userId) {
        const ticket = await Ticket.findOne({ _id: ticketId, userId });
        if (!ticket) throw new Error("Ticket not found or unauthorized");
        return ticket;
    }

    // --- Admin Dashboard Aggregations ---
    static async getAdminRecentTickets() {
        const tickets = await Ticket.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return tickets.map(t => {
            const now = Date.now();
            const created = new Date(t.createdAt).getTime();
            const diffMin = Math.floor((now - created) / 60000);
            
            return {
                id: `#TK${t._id.toString().substring(19, 24).toUpperCase()}`, // mock short ID
                title: t.subject || 'Support Request',
                priority: t.priority || 'Normal',
                ago: diffMin < 60 ? `${diffMin} min ago` : `${Math.floor(diffMin/60)} hr ago`
            };
        });
    }

    // â”€â”€â”€ ADMIN SUPPORT OPERATIONS (Sprint 28) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetTickets() {
        return await Ticket.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();
    }

    static async adminGetTicket(ticketId) {
        const ticket = await Ticket.findById(ticketId)
            .populate('userId', 'name email phone')
            .lean();
        if (!ticket) throw new Error('Support ticket not found');
        return ticket;
    }

    static async adminAssignTicket(ticketId, adminId, ipAddress, io) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const previousStatus = ticket.status;
        ticket.status = 'InProgress';
        ticket.replies.push({
            senderId: adminId,
            senderModel: 'Admin',
            message: `Ticket has been assigned to Admin support handler.`,
            createdAt: new Date()
        });
        await ticket.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'ASSIGN_SUPPORT_TICKET',
            targetType: 'Ticket',
            targetId: ticket._id,
            details: { previousStatus, newStatus: 'InProgress', assignedTo: adminId },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('supportTicketUpdated', ticket);
        }

        return ticket;
    }

    static async adminReplyTicket(ticketId, adminId, message, ipAddress, io) {
        const ticket = await this.replyTicket(ticketId, adminId, 'Admin', message, io);

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REPLY_SUPPORT_TICKET',
            targetType: 'Ticket',
            targetId: ticket._id,
            details: { messageSnippet: message.substring(0, 60) },
            ipAddress
        });

        return ticket;
    }

    static async adminCloseTicket(ticketId, adminId, ipAddress, io) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const previousStatus = ticket.status;
        ticket.status = 'Closed';
        await ticket.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CLOSE_SUPPORT_TICKET',
            targetType: 'Ticket',
            targetId: ticket._id,
            details: { previousStatus, newStatus: 'Closed' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('supportTicketUpdated', ticket);
            io.emit(`support_${ticket.userId}`, { event: 'ticketUpdated', data: ticket });
        }

        return ticket;
    }

    static async adminReopenTicket(ticketId, adminId, ipAddress, io) {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');

        const previousStatus = ticket.status;
        ticket.status = 'Open';
        await ticket.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REOPEN_SUPPORT_TICKET',
            targetType: 'Ticket',
            targetId: ticket._id,
            details: { previousStatus, newStatus: 'Open' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('supportTicketUpdated', ticket);
            io.emit(`support_${ticket.userId}`, { event: 'ticketUpdated', data: ticket });
        }

        return ticket;
    }

    static async adminSupportAnalytics() {
        const [categoriesAgg, prioritiesAgg, statusesAgg, totalTickets] = await Promise.all([
            Ticket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
            Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
            Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
            Ticket.countDocuments()
        ]);

        return {
            totalTickets,
            categories: categoriesAgg.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
            priorities: prioritiesAgg.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {}),
            statuses: statusesAgg.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {})
        };
    }

    // â”€â”€â”€ SPRINT 39: KNOWLEDGE BASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getFAQs(targetAudience = 'All') {
        const FAQ = require('../models/FAQ');
        const query = { isActive: true };
        if (targetAudience !== 'All') {
            query.targetAudience = { $in: ['All', targetAudience] };
        }
        return await FAQ.find(query).sort({ category: 1, createdAt: -1 }).lean();
    }

    static async adminCreateFAQ(data, adminId, ipAddress) {
        const FAQ = require('../models/FAQ');
        const faq = new FAQ({ ...data, createdBy: adminId });
        await faq.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_FAQ',
            targetType: 'FAQ',
            targetId: faq._id,
            details: { question: faq.question },
            ipAddress
        });
        return faq;
    }

    static async getHelpArticles(targetAudience = 'All') {
        const HelpArticle = require('../models/HelpArticle');
        const query = { isActive: true };
        if (targetAudience !== 'All') {
            query.targetAudience = { $in: ['All', targetAudience] };
        }
        return await HelpArticle.find(query).sort({ category: 1, createdAt: -1 }).lean();
    }

    static async adminCreateHelpArticle(data, adminId, ipAddress) {
        const HelpArticle = require('../models/HelpArticle');
        const article = new HelpArticle({ ...data, createdBy: adminId });
        await article.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_HELP_ARTICLE',
            targetType: 'HelpArticle',
            targetId: article._id,
            details: { title: article.title },
            ipAddress
        });
        return article;
    }

    static async readHelpArticle(articleId) {
        const HelpArticle = require('../models/HelpArticle');
        const article = await HelpArticle.findByIdAndUpdate(articleId, { $inc: { viewCount: 1 } }, { new: true });
        if (!article) throw new Error("Article not found");
        return article;
    }
}

module.exports = SupportService;
