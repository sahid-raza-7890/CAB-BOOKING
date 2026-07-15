require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function run() {
    const fakeDriverId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign(
        { userId: fakeDriverId, role: 'Driver' }, 
        process.env.JWT_SECRET,
        { expiresIn: '8h' } 
    );
    
    try {
        const response = await fetch('http://localhost:5000/api/driver/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}
run();
