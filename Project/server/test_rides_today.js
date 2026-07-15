const mongoose = require("mongoose");
require("dotenv").config();
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const Ride = mongoose.connection.collection('rides');
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const ridesToday = await Ride.find({ createdAt: { $gte: today } }).toArray();
    console.log(`Found ${ridesToday.length} rides created today.`);
    
    for (const r of ridesToday) {
        console.log(`- ID: ${r._id}, Status: ${r.status}, User: ${r.userId}`);
    }

    process.exit(0);
});
