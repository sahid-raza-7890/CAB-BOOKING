require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Ride = require('./src/models/Ride');

async function listRides() {
    try {
        await connectDB();
        const rides = await Ride.find().select('type status schedule.scheduled schedule.scheduledStatus userId driver');
        console.log(JSON.stringify(rides, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listRides();
