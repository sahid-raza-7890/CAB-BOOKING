require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('test1234', salt);

    // Create Test Passenger
    let pass = await User.findOne({ email: 'test_passenger@ucab.com' });
    if (!pass) {
        pass = new User({ name: 'Test Passenger', email: 'test_passenger@ucab.com', phone: '+1000000001', password, role: 'Passenger' });
        await pass.save();
    } else {
        pass.password = password;
        await pass.save();
    }

    // Create Test Driver
    let driver = await Driver.findOne({ email: 'test_driver@ucab.com' });
    if (!driver) {
        driver = new Driver({ name: 'Test Driver', email: 'test_driver@ucab.com', phone: '+1000000002', vehicleNumber: 'TEST1234', password, role: 'Driver', status: 'Active' });
        await driver.save();
    } else {
        driver.password = password;
        await driver.save();
    }

    console.log("Test accounts created!");
    process.exit(0);
}
run();
