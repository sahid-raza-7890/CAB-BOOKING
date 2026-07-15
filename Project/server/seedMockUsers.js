const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');

mongoose.connect('mongodb://localhost:27017/ucab').then(async () => {
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 5 Passengers
    const passengers = [];
    for (let i = 1; i <= 5; i++) {
        passengers.push({
            name: `Passenger Test ${i}`,
            email: `passenger${i}@ucab.com`,
            password: hashedPassword,
            phone: `987654320${i}`,
            role: 'Passenger'
        });
    }

    // 5 Drivers
    const drivers = [];
    for (let i = 1; i <= 5; i++) {
        drivers.push({
            name: `Driver Test ${i}`,
            email: `driver${i}@ucab.com`,
            password: hashedPassword,
            phone: `876543210${i}`,
            role: 'Driver',
            status: 'Active',
            isVerified: true,
            cabType: 'Sedan',
            vehicleNumber: `KA01AB100${i}`
        });
    }

    await User.insertMany(passengers);
    console.log('5 Passengers created');

    await Driver.insertMany(drivers);
    console.log('5 Drivers created');

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
