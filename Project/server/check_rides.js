const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const rides = db.collection("rides");
    const counts = await rides.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
    console.log("Rides by status:", counts);
    process.exit(0);
});
