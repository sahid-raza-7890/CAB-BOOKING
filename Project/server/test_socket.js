const io = require('socket.io-client');
const axios = require('axios');

async function test() {
  try {
    // 1. Login as driver
    const res = await axios.post('http://localhost:5000/login-driver', {
      email: 'driver1@example.com',
      password: 'password123'
    });
    const token = res.data.data.token;
    const user = res.data.data.user;
    console.log('Logged in as driver', user.id);

    // 2. Connect socket
    const socket = io('http://localhost:5000/driver', {
      auth: { token, userId: user.id, role: user.role }
    });

    socket.on('connect', () => {
      console.log('Socket connected with ID:', socket.id);
    });

    socket.on('rideRequest', (payload) => {
      console.log('>>> RECEIVED RIDE REQUEST <<<', payload);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err);
    });

    // 3. Login as passenger and request a ride
    console.log('Logging in as passenger...');
    const pres = await axios.post('http://localhost:5000/login', {
      email: 'john.doe@example.com',
      password: 'password123'
    });
    const ptoken = pres.data.data.token;
    
    // Set driver online
    console.log('Setting driver online...');
    await axios.post('http://localhost:5000/api/driver/status/availability', { isOnline: true }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Requesting ride...');
    const rres = await axios.post('http://localhost:5000/api/rides', {
      pickupLocation: 'Test Pickup',
      dropoffLocation: 'Test Dropoff',
      type: 'Standard'
    }, {
      headers: { Authorization: `Bearer ${ptoken}` }
    });
    console.log('Ride requested:', rres.data.data._id);

    setTimeout(() => {
      console.log('Test completed.');
      process.exit(0);
    }, 5000);

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

test();
