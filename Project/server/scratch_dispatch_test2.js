const mongoose = require('mongoose');
require('./src/models/Driver');
require('./src/models/User');
const DispatchService = require('./src/services/dispatchService');
const Ride = require('./src/models/Ride');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/ucab');
  const ride = new Ride({ type: 'Immediate' });
  const drivers = await DispatchService.findNearbyDrivers(ride, [0,0], 10000);
  console.log('Found drivers:', drivers.length);
  for (const d of drivers) console.log(d.driverId._id || d.driverId);
  process.exit(0);
}
test();
