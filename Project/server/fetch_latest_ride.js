const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const Ride = mongoose.connection.collection("rides");
    const ride = await Ride.find({}).sort({createdAt: -1}).limit(1).toArray();
    console.log(JSON.stringify(ride[0], null, 2));
    process.exit(0);
});
