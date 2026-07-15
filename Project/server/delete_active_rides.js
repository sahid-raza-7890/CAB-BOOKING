const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const Ride = mongoose.connection.collection('rides');
    const result = await Ride.deleteMany({ status: { $in: ['Pending', 'Searching', 'Accepted', 'InProgress'] } });
    console.log("Deleted active rides:", result.deletedCount);
    
    // Also, let's fix any broken "Completed" rides that might have been stuck during DriverEarningService crash
    // Actually the user said they completed one, but it didn't show up. Let's see how many Completed rides exist.
    const completedCount = await Ride.countDocuments({ status: 'Completed' });
    const completedRides = await Ride.find({ status: "Completed" }).toArray(); console.log("Completed userIds:", completedRides.map(r => r.userId));

    process.exit(0);
});
