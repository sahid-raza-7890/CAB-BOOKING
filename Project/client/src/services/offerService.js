export const validateCoupon = async (code, fare, rideType, vehicleType, city) => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, fare, rideType, vehicleType, city })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to validate coupon');
    }
    return await response.json();
};

export const fetchAvailableCoupons = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/coupons/available', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

export const fetchAutoOffer = async (fare, rideType, vehicleType) => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch(`http://localhost:5000/api/offers/auto?fare=${fare}&rideType=${rideType}&vehicleType=${vehicleType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

export const fetchLoyaltyStatus = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/loyalty/status', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};

export const fetchRewardHistory = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/loyalty/history', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
};
