const express = require('express');
const router = express.Router();

// â”€â”€â”€ SERVICE REGISTRY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Single source of truth for all 19 platform features.
// Frontend fetches this to render the categorized Services page dynamically.

const SERVICE_REGISTRY = {
    coreRides: {
        label: 'Core Rides',
        icon: 'ðŸš–',
        description: 'Our full fleet of vehicles, ready for any journey.',
        color: '#28a745',
        items: [
            {
                id: 'basic',
                name: 'Basic',
                emoji: 'ðŸš—',
                desc: 'Affordable, compact city rides for solo or couple travel.',
                badge: null,
                route: '/book-ride'
            },
            {
                id: 'suv',
                name: 'SUV',
                emoji: 'ðŸš',
                desc: 'Spacious SUVs for families, group trips, and extra luggage.',
                badge: null,
                route: '/book-ride'
            },
            {
                id: 'luxurious',
                name: 'Luxury',
                emoji: 'ðŸŽï¸',
                desc: 'Premium vehicles with professional drivers for VIP experiences.',
                badge: 'Premium',
                route: '/book-ride'
            },
            {
                id: 'moto',
                name: 'Moto',
                emoji: 'ðŸï¸',
                desc: 'Beat city traffic on a motorcycle. Fastest route, solo only.',
                badge: 'Fastest',
                route: '/book-ride'
            },
            {
                id: 'auto',
                name: 'Auto / Tuk-Tuk',
                emoji: 'ðŸ›º',
                desc: 'Classic auto-rickshaw for affordable, breezy short-hop rides.',
                badge: 'Budget',
                route: '/book-ride'
            },
            {
                id: 'ev',
                name: 'Electric (EV)',
                emoji: 'âš¡',
                desc: 'Zero-emission electric rides â€” silent, eco-friendly, and modern.',
                badge: 'Eco',
                route: '/book-ride'
            },
        ]
    },
    bookingModels: {
        label: 'Booking Models',
        icon: 'ðŸ“‹',
        description: 'Flexible ways to plan and book your perfect ride.',
        color: '#6366f1',
        items: [
            {
                id: 'book-later',
                name: 'Book for Later',
                emoji: 'ðŸ“…',
                desc: 'Schedule a ride up to 7 days in advance. Never miss an appointment.',
                badge: 'Smart',
                route: '/book-ride'
            },
            {
                id: 'rentals',
                name: 'Rentals',
                emoji: 'ðŸ”‘',
                desc: 'Hire a car and driver for 1â€“12 hours with unlimited stops.',
                badge: 'Flexible',
                route: '/book-ride'
            },
        ]
    },
    mappingTools: {
        label: 'Mapping & Navigation',
        icon: 'ðŸ—ºï¸',
        description: 'Intelligent location tools that make booking seamless.',
        color: '#f59e0b',
        items: [
            {
                id: 'autocomplete',
                name: 'Smart Autocomplete',
                emoji: 'ðŸ”',
                desc: 'Powered by Google Places API â€” finds your address as you type.',
                badge: 'AI-Powered',
                route: '/book-ride'
            },
            {
                id: 'pin-drop',
                name: 'Map Pin Drop',
                emoji: 'ðŸ“Œ',
                desc: 'Can\'t find your address? Drop a pin directly on the live map.',
                badge: 'Interactive',
                route: '/book-ride'
            },
            {
                id: 'smart-meetup',
                name: 'Smart Meet-Up Points',
                emoji: 'ðŸš',
                desc: 'Automatically snaps your pickup to the nearest legal loading zone.',
                badge: 'Geofenced',
                route: '/book-ride'
            },
            {
                id: 'indoor-wayfinding',
                name: 'Indoor Venue Wayfinding',
                emoji: 'ðŸ¢',
                desc: 'View simplified floor plans for complex venues like airports.',
                badge: 'Precision',
                route: '/book-ride'
            }
        ]
    }
};

// GET /api/services/registry â€” Full categorized service list (public)
router.get('/registry', (req, res) => {
    res.json(SERVICE_REGISTRY);
});

// GET /api/services/registry/:categoryId â€” Single category
router.get('/registry/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    const category = SERVICE_REGISTRY[categoryId];
    if (!category) {
        return res.status(404).json({ error: `Category "${categoryId}" not found.` });
    }
    res.json(category);
});

module.exports = router;
