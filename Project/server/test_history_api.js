const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
mongoose.connect("mongodb://127.0.0.1:27017/ucab");
const db = mongoose.connection;
db.once("open", async () => {
    const userId = "6a55235c0b21fc6ec6decc44";
    const token = jwt.sign({ id: userId, role: "Passenger" }, process.env.JWT_SECRET || 'ucab_secret');
    const res = await fetch("http://localhost:5000/api/history?status=Cancelled", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    process.exit(0);
});
