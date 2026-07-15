require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://danish0007:I7zWfH0a15K0vO6j@cluster0.p7839.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
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
