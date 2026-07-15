require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const AdminRole = require('../models/AdminRole');
const PlatformSetting = require('../models/PlatformSetting');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);


        // 1. Seed Super Admin Role
        let superAdminRole = await AdminRole.findOne({ name: 'Super Admin' });
        if (!superAdminRole) {
            superAdminRole = new AdminRole({
                name: 'Super Admin',
                description: 'Full access to the system',
                permissions: [
                    'manage_users', 'manage_drivers', 'manage_rides', 'manage_vehicles',
                    'manage_payments', 'manage_promotions', 'manage_roles', 'manage_settings',
                    'view_analytics', 'view_audit_logs', 'manage_backups'
                ],
                isSystem: true
            });
            await superAdminRole.save();

        }

        // 2. Seed Super Admin User
        const adminEmail = 'admin@ucab.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                phone: '+1234567890',
                role: 'Admin',
                status: 'Active',
                adminRoleId: superAdminRole._id,
                emailVerified: true,
                phoneVerified: true
            });
            await admin.save();

        }

        // 3. Seed Default Settings
        const defaultSettings = [
            { category: 'Branding', key: 'PLATFORM_NAME', value: 'UCAB Enterprise', description: 'Name of the platform' },
            { category: 'General', key: 'MAINTENANCE_MODE', value: 'false', description: 'Enable maintenance mode' },
            { category: 'Ride', key: 'MAX_SCHEDULE_DAYS', value: '7', description: 'Max days in advance to schedule a ride' },
            { category: 'Finance', key: 'PLATFORM_FEE_PERCENTAGE', value: '15', description: 'Platform fee percentage' }
        ];

        for (const setting of defaultSettings) {
            const existing = await PlatformSetting.findOne({ key: setting.key });
            if (!existing) {
                await PlatformSetting.create(setting);
            }
        }



        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
