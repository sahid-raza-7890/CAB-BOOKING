const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const rides = db.collection("rides");
    const counts = await rides.aggregate([
        { $group: { _id: { user: "$userId", status: "$status" }, count: { $sum: 1 } } }
    ]).toArray();
    console.log(JSON.stringify(counts, null, 2));
    process.exit(0);
});
