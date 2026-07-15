const mongoose = require('mongoose');
require('dotenv').config();

const DriverEarningService = require('./src/services/driverEarningService');
const Wallet = require('./src/models/Wallet');
const DriverEarning = require('./src/models/DriverEarning');

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const mockDriverId = new mongoose.Types.ObjectId();
        const mockRideId = new mongoose.Types.ObjectId();

        console.log("Mock Driver ID:", mockDriverId);

        // 1. Process ride completion
        const earning = await DriverEarningService.processRideEarning(
            mockDriverId.toString(),
            mockRideId.toString(),
            200, // gross fare
            0,   // tip
            'City', // ride type
            'Wallet' // payment method
        );

        console.log("Processed Earning:", earning);

        // 2. Verify Wallet Balance
        const wallet = await Wallet.findOne({ userId: mockDriverId, userType: 'Driver' });
        console.log("Driver Wallet Balance:", wallet.balance);

        if (wallet.balance === earning.netEarning) {
            console.log("✅ Verification Passed: Wallet balance matches net earning.");
        } else {
            console.log("❌ Verification Failed: Balance mismatch.");
        }

        // Cleanup
        await DriverEarning.deleteOne({ _id: earning._id });
        await Wallet.deleteOne({ _id: wallet._id });

        process.exit(0);
    } catch (error) {
        console.error("Test Failed:", error);
        process.exit(1);
    }
}

runTest();
