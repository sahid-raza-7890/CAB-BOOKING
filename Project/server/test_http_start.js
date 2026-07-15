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
        
        const ride = await RideService.createRide(passengerId, "Test", {
            pickupLocation: "A", dropoffLocation: "B", vehicleType: "Basic"
        });
        
        await RideService.assignDriver(ride._id, driverId, null);
        await driverRideLifecycleService.arriveAtPickup(ride._id, driverId, null);
        
        const Ride = mongoose.connection.collection('rides');
        const updatedRide = await Ride.findOne({ _id: ride._id });
        
        await driverRideLifecycleService.verifyOTP(ride._id, driverId, updatedRide.otp, null);
        
        // Mock token logic for driver
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ userId: driverId, id: driverId, role: 'Driver' }, process.env.JWT_SECRET || 'secret');
        
        // Test HTTP endpoint
        
        const res = await fetch(`http://localhost:5000/api/driver/active/${ride._id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const body = await res.json();
        console.log("Status:", res.status);
        console.log("Body:", body);
        
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
});
