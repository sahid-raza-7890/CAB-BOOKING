const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const ErrorResponse = require('../utils/errorResponse');

class AuthService {
    static async registerUser(name, email, password) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ErrorResponse('Email is already registered', 400);
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role }, 
            process.env.JWT_SECRET,             
            { expiresIn: '2h' }                 
        );

        return { user: newUser, token };
    }

    static async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        // Restrict passenger portal login for Admins
        if (user.role === 'Admin') {
            throw new ErrorResponse('Admins must log in via the Admin Portal', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET,             
            { expiresIn: '2h' }                 
        );

        return { user, token };
    }

    static async loginAdmin(email, password) {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        // Restrict admin portal login for non-Admins
        if (user.role !== 'Admin') {
            throw new ErrorResponse('Access denied. Administrator credentials required.', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET,             
            { expiresIn: '2h' }                 
        );

        return { user, token };
    }

    static async registerDriver(data) {
        const { name, email, password, phone, cabType, vehicleNumber } = data;
        
        const existingDriver = await Driver.findOne({ email });
        if (existingDriver) {
            throw new ErrorResponse('Driver email already registered', 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDriver = new Driver({ 
            name, email, password: hashedPassword, phone, cabType, vehicleNumber 
        });
        await newDriver.save();

        return newDriver;
    }

    static async loginDriver(email, password) {
        const driver = await Driver.findOne({ email });
        if (!driver || !driver.password) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            throw new ErrorResponse('Invalid email or password', 401);
        }

        const token = jwt.sign(
            { userId: driver._id, role: driver.role }, 
            process.env.JWT_SECRET,             
            { expiresIn: '8h' } 
        );

        return { driver, token };
    }
    static async changePassword(userId, role, oldPassword, newPassword) {
        const Model = role === 'Driver' ? Driver : User;
        const user = await Model.findById(userId);
        if (!user) throw new ErrorResponse('User not found', 404);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new ErrorResponse('Incorrect current password', 401);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return true;
    }

    static async changeEmail(userId, role, newEmail) {
        const Model = role === 'Driver' ? Driver : User;
        const existing = await Model.findOne({ email: newEmail });
        if (existing) throw new ErrorResponse('Email is already in use', 400);

        const user = await Model.findById(userId);
        if (!user) throw new ErrorResponse('User not found', 404);

        user.email = newEmail;
        // In a real app, you'd send verification email and mark as unverified
        await user.save();
        return true;
    }

    static async forgotPassword(email, role = 'Passenger') {
        const Model = role === 'Driver' ? Driver : User;
        const user = await Model.findOne({ email });
        if (!user) return true; // Don't leak user existence

        // Here we'd normally generate a reset token and email it.
        // For the sake of the RC, we simulate success.
        return true;
    }

    static async resetPassword(email, token, newPassword, role = 'Passenger') {
        // Mock verification of token for now
        if (!token) throw new ErrorResponse('Invalid token', 400);
        
        const Model = role === 'Driver' ? Driver : User;
        const user = await Model.findOne({ email });
        if (!user) throw new ErrorResponse('User not found', 404);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return true;
    }

    static async softDeleteAccount(userId, role) {
        const Model = role === 'Driver' ? Driver : User;
        const user = await Model.findById(userId);
        if (!user) throw new ErrorResponse('User not found', 404);
        
        user.status = 'Inactive';
        // Randomize personal data to adhere to GDPR soft-delete
        user.name = 'Deleted User';
        user.email = `deleted_${Date.now()}@example.com`;
        user.phone = '';
        await user.save();
        return true;
    }
}

module.exports = AuthService;
