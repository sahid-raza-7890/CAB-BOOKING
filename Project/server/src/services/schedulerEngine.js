const Ride = require('../models/Ride');

class SchedulerEngine {
    constructor(io) {
        this.io = io;
    }

    async runTick() {
        try {
            const now = new Date();

            // Find scheduled rides where the assignment window has passed, but haven't been queued yet
            const pendingDispatches = await Ride.find({
                status: 'Pending',
                'schedule.scheduled': true,
                'schedule.scheduledStatus': 'Scheduled',
                'schedule.assignmentWindow': { $lte: now }
            });

            for (const ride of pendingDispatches) {
                // Update state
                ride.schedule.scheduledStatus = 'Preparing';
                await ride.save();


                
                // Emit to Socket (Admin / Drivers)
                if (this.io) {
                    this.io.emit('newRide', { ...ride.toObject(), source: 'scheduler' });
                }
            }

            // In a full production system, we'd also handle the Reminder logic here
            // e.g. finding rides where pickupTime is 24hrs away and reminderSent is false.

        } catch (err) {
            console.error('[SchedulerEngine] Error during tick:', err);
        }
    }

    start() {

        // Run every 15 seconds to check for windows
        this.interval = setInterval(() => this.runTick(), 15000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}

module.exports = SchedulerEngine;
