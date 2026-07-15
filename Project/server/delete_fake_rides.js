const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const Ride = mongoose.connection.collection("rides");
    const result = await Ride.deleteMany({ pickupLocation: { $in: ["A", "Test A", "Test"] } });
    console.log("Deleted fake rides:", result.deletedCount);
    process.exit(0);
});
