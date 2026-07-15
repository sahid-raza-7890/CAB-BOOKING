require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use environment variables for sensitive credentials
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@<cluster>/<database>';

mongoose.connect(mongoUri)
.then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('password123', 10);
  
  const driversResult = await db.collection('drivers').updateOne(
    { email: 'driver@ucab.com' },
    { $set: { password: hash, role: 'Driver', name: 'Test Driver' } },
    { upsert: true }
  );
  
  console.log('Driver password reset in drivers:', driversResult);
  process.exit(0);
});
