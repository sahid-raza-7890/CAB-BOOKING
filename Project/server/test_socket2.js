const io = require('socket.io-client');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();
const token = jwt.sign({ userId: '6a524021ec564d7fb597b85c', role: 'Driver' }, process.env.JWT_SECRET || 'ucab_secret_key', { expiresIn: '8h' });
const socket = io('http://localhost:5000/driver', { auth: { token, userId: '6a524021ec564d7fb597b85c', role: 'Driver' } });
socket.on('connect', async () => {
  console.log('Connected! Sending test HTTP request...');
  try {
    await axios.post('http://localhost:5000/api/driver/rides/test-dispatch', {}, { headers: { Authorization: `Bearer ${token}` } });
  } catch (err) { console.error(err.message); }
});
socket.on('rideRequest', (payload) => { console.log('Received:', payload); process.exit(0); });
setTimeout(() => { console.log('Timeout'); process.exit(1); }, 5000);
