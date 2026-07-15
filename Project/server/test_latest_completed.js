const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const Ride = mongoose.connection.collection('rides');
    
    // Find the most recently completed ride
    const latestCompletedRide = await Ride.find({ status: 'Completed' }).sort({ createdAt: -1 }).limit(1).toArray();
    
    if (latestCompletedRide.length > 0) {
        console.log("Most recently completed ride:", latestCompletedRide[0]);
        console.log("Passenger ID:", latestCompletedRide[0].userId);
        
        // Let's test RideService.getMyRides directly
        const RideService = require('./src/services/rideService');
        const user = await mongoose.connection.collection("users").findOne({ _id: latestCompletedRide[0].userId }); console.log("Passenger User:", user); const rides = await RideService.getMyRides(latestCompletedRide[0].userId, { status: 'Completed', days: 'All', vehicleType: 'All', sort: 'newest', page: '1', limit: '10' });
        console.log("Rides returned by getMyRides for Completed:", JSON.stringify(rides, null, 2));
    } else {
        console.log("No completed rides found in the database.");
    }

    process.exit(0);
});
