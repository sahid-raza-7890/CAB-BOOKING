const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const userId = "6a55235c0b21fc6ec6decc44";
    const RideService = require("./src/services/rideService");
    const result = await RideService.getMyRides(userId, { status: "Active" });
    console.log("Active Rides Count:", result.rides.length);
    console.log("Rides statuses:", result.rides.map(r => r.status));
    process.exit(0);
});
