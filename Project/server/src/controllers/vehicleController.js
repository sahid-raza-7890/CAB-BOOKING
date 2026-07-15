const Vehicle = require('../models/Vehicle');
const VehicleService = require('../services/vehicleService');
const ResponseFormatter = require('../utils/responseFormatter');

// â”€â”€â”€ SEED DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SEED_VEHICLES = [
    {
        type: 'Basic', label: 'Mini', emoji: 'ðŸš—',
        description: 'Affordable city rides for solo or couple travel.',
        baseFare: 4.99, perKmRate: 0.80, capacity: 4, luggageCapacity: 1,
        features: ['AC', 'Music'], eta: '2-4 min', isActive: true, sortOrder: 1
    },
    {
        type: 'Basic', label: 'Sedan', emoji: 'ðŸš™',
        description: 'Comfortable everyday rides for up to 4 passengers.',
        baseFare: 7.99, perKmRate: 1.10, capacity: 4, luggageCapacity: 2,
        features: ['AC', 'Music', 'USB Charging'], eta: '3-5 min',
        isActive: true, isFeatured: true, sortOrder: 2
    },
    {
        type: 'SUV', label: 'SUV', emoji: 'ðŸš',
        description: 'Spacious rides for families and group trips.',
        baseFare: 12.99, perKmRate: 1.60, capacity: 6, luggageCapacity: 4,
        features: ['AC', 'Music', 'USB Charging', 'Extra Space'], eta: '4-6 min',
        isActive: true, sortOrder: 3
    },
    {
        type: 'Luxurious', label: 'Luxury', emoji: 'ðŸŽï¸',
        description: 'Premium vehicles for business and special occasions.',
        baseFare: 24.99, perKmRate: 2.50, capacity: 4, luggageCapacity: 3,
        features: ['AC', 'WiFi', 'Bottled Water', 'Pro Driver'], eta: '5-8 min',
        isActive: true, sortOrder: 4
    },
    {
        type: 'Moto', label: 'Moto', emoji: 'ðŸï¸',
        description: 'Beat traffic fast with a motorcycle for solo riders.',
        baseFare: 2.49, perKmRate: 0.50, capacity: 1, luggageCapacity: 0,
        features: ['Helmet Provided', 'Fastest Route'], eta: '1-2 min',
        isActive: true, sortOrder: 5
    },
    {
        type: 'Auto', label: 'Auto', emoji: 'ðŸ›º',
        description: 'Budget-friendly auto-rickshaw for short city hops.',
        baseFare: 1.99, perKmRate: 0.40, capacity: 3, luggageCapacity: 1,
        features: ['Open Air', 'Budget Friendly'], eta: '2-3 min',
        isActive: true, sortOrder: 6
    },
    {
        type: 'EV', label: 'Electric', emoji: 'âš¡',
        description: 'Zero emissions, whisper-quiet electric vehicle rides.',
        baseFare: 8.99, perKmRate: 1.00, capacity: 4, luggageCapacity: 2,
        features: ['AC', 'WiFi', 'Silent', 'Eco-Friendly'], eta: '4-7 min',
        isActive: true, sortOrder: 7
    },
    {
        type: 'BookLater', label: 'Schedule', emoji: 'ðŸ“…',
        description: 'Pre-book your ride up to 7 days in advance.',
        baseFare: 9.99, perKmRate: 1.20, capacity: 4, luggageCapacity: 2,
        features: ['Guaranteed Pickup', 'Flexible Cancel', 'Reminder Alert'], eta: 'Scheduled',
        isActive: true, sortOrder: 8
    },
    {
        type: 'Rental', label: 'Rental', emoji: 'ðŸ”‘',
        description: 'Hire a car and driver for hours or the full day.',
        baseFare: 29.99, perKmRate: 0, capacity: 4, luggageCapacity: 3,
        features: ['4-Hour Package', '8-Hour Package', 'Multiple Stops'], eta: 'On Demand',
        isActive: true, sortOrder: 9
    },
];

async function seedVehiclesIfEmpty() {
    const count = await Vehicle.countDocuments();
    if (count === 0) {
        await Vehicle.insertMany(SEED_VEHICLES);
    }
}
seedVehiclesIfEmpty();

class VehicleController {
    static async getAllVehicles(req, res) {
        const vehicles = await VehicleService.getActiveVehicles();
        return res.json(vehicles); // Using standard json to preserve existing API contract
    }

    static async getVehicle(req, res) {
        const vehicle = await VehicleService.getVehicleById(req.params.id);
        if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
        return res.json(vehicle);
    }
}

module.exports = VehicleController;
