const mongoose = require("mongoose");
require("dotenv").config();


mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    try {
        const RideService = require('./src/services/rideService');
        const driverRideLifecycleService = require('./src/services/driverRideLifecycleService');
        
        const passengerId = "6a55235c0b21fc6ec6decc44";
        const driverId = "6a5373a4c6e25e3f069837af";
        
        console.log("Creating ride...");
        const ride = await RideService.createRide(passengerId, "Test Passenger", {
            pickupLocation: "Test A",
            dropoffLocation: "Test B",
            vehicleType: "Basic",
            distanceKm: 5,
            paymentMethod: "Cash"
        });
        
        console.log("Accepting ride...");
        await RideService.assignDriver(ride._id, driverId, null);
        
        console.log("Arriving at pickup...");
        await driverRideLifecycleService.arriveAtPickup(ride._id, driverId, null);
        
        // Refresh ride to get OTP
        const Ride = mongoose.connection.collection('rides');
        const updatedRide = await Ride.findOne({ _id: ride._id });
        
        console.log("Verifying OTP:", updatedRide.otp);
        await driverRideLifecycleService.verifyOTP(ride._id, driverId, updatedRide.otp, null);
        
        console.log("Starting ride...");
        await driverRideLifecycleService.startRide(ride._id, driverId, undefined, null);
        
        console.log("Completing ride...");
        await driverRideLifecycleService.completeRide(ride._id, driverId, null);
        
        console.log("RIDE COMPLETION SUCCESSFUL!");
    } catch (err) {
        console.error("ERROR DURING RIDE LIFECYCLE:", err);
    }
    
    process.exit(0);
});
