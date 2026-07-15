const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Driver = require('./src/models/Driver');
const DriverVehicle = require('./src/models/DriverVehicle');
const DriverDocument = require('./src/models/DriverDocument');
const Wallet = require('./src/models/Wallet');
require('dotenv').config();

const seedDriver = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to MongoDB');

        const email = 'driver@ucab.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: 'John Doe',
                email,
                password: hashedPassword,
                role: 'Driver',
                phone: '+1 555-0100',
                status: 'Active'
            });
            await user.save();
            console.log('Created User record for driver');
        } else {
            user.password = hashedPassword;
            user.role = 'Driver';
            await user.save();
            console.log('Updated existing User record for driver');
        }

        let driver = await Driver.findOne({ email });
        if (!driver) {
            driver = new Driver({
                name: 'John Doe',
                email: email,
                password: hashedPassword,
                phone: '+1 555-0100',
                vehicleNumber: 'ABC-1234',
                rating: 4.9,
                totalTrips: 150,
                status: 'Active',
                isOnline: false,
                currentLocation: {
                    type: 'Point',
                    coordinates: [77.5946, 12.9716]
                }
            });
            await driver.save();
            console.log('Created Driver record');
        }

        let vehicle = await DriverVehicle.findOne({ driverId: driver._id });
        if (!vehicle) {
            vehicle = new DriverVehicle({
                driverId: driver._id,
                make: 'Toyota',
                model: 'Camry',
                year: 2022,
                licensePlate: 'ABC-1234',
                color: 'Black',
                isActive: true,
                status: 'Approved'
            });
            await vehicle.save();
            console.log('Created DriverVehicle record');
        }

        let doc = await DriverDocument.findOne({ driverId: driver._id });
        if (!doc) {
            doc = new DriverDocument({
                driverId: driver._id,
                documentType: 'License',
                documentUrl: 'https://example.com/license.pdf',
                status: 'Approved',
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
            });
            await doc.save();
            console.log('Created DriverDocument record');
        }

        let wallet = await Wallet.findOne({ userId: driver._id, userType: 'Driver' });
        if (!wallet) {
            wallet = new Wallet({
                userId: driver._id,
                userType: 'Driver',
                balance: 50.00,
                currency: 'INR'
            });
            await wallet.save();
            console.log('Created Wallet record');
        }

        console.log('\n=======================================');
        console.log('Driver seeded successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('=======================================\n');

    } catch (err) {
        console.error('Error seeding driver:', err);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

seedDriver();
