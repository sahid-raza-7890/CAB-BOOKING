const PDFDocument = require('pdfkit');
const Ride = require('../models/Ride');
const User = require('../models/User');
const Driver = require('../models/Driver');
const ErrorResponse = require('../utils/errorResponse');

class ReceiptService {
  /**
   * Generate a PDF receipt for a completed ride
   */
  async generateReceipt(rideId, userId) {
    const ride = await Ride.findById(rideId).populate('passenger driver vehicle');
    if (!ride) {
      throw new ErrorResponse('Ride not found', 404);
    }
    
    if (ride.passenger._id.toString() !== userId.toString() && 
        (!ride.driver || ride.driver._id.toString() !== userId.toString())) {
      throw new ErrorResponse('Not authorized to view this receipt', 403);
    }

    if (ride.status !== 'completed') {
      throw new ErrorResponse('Receipts are only available for completed rides', 400);
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Header
    doc.fontSize(20).text('UCAB Enterprise', { align: 'center' });
    doc.fontSize(12).text('Ride Receipt', { align: 'center' });
    doc.moveDown();

    // Ride Details
    doc.fontSize(14).text('Ride Information', { underline: true });
    doc.fontSize(10).text(`Ride ID: ${ride._id}`);
    doc.text(`Date: ${new Date(ride.endTime || ride.createdAt).toLocaleString()}`);
    doc.text(`Status: ${ride.status}`);
    doc.moveDown();

    // Passenger & Driver
    doc.fontSize(14).text('Participants', { underline: true });
    doc.fontSize(10).text(`Passenger: ${ride.passenger.firstName} ${ride.passenger.lastName}`);
    doc.text(`Driver: ${ride.driver.firstName} ${ride.driver.lastName}`);
    if (ride.vehicle) {
      doc.text(`Vehicle: ${ride.vehicle.make} ${ride.vehicle.model} (${ride.vehicle.licensePlate})`);
    }
    doc.moveDown();

    // Locations
    doc.fontSize(14).text('Locations', { underline: true });
    doc.fontSize(10).text(`Pickup: ${ride.pickupLocation.address}`);
    doc.text(`Dropoff: ${ride.dropoffLocation.address}`);
    doc.text(`Distance: ${(ride.distance / 1000).toFixed(2)} km`);
    doc.text(`Duration: ${Math.round(ride.duration / 60)} mins`);
    doc.moveDown();

    // Fare Breakdown
    doc.fontSize(14).text('Fare Breakdown', { underline: true });
    doc.fontSize(10);
    
    if (ride.fareBreakdown) {
      const fb = ride.fareBreakdown;
      doc.text(`Base Fare: ₹${(fb.baseFare || 0).toFixed(2)}`);
      doc.text(`Distance Fare: ₹${(fb.distanceFare || 0).toFixed(2)}`);
      doc.text(`Time Fare: ₹${(fb.timeFare || 0).toFixed(2)}`);
      if (fb.surgeMultiplier > 1) {
        doc.text(`Surge Multiplier: x${fb.surgeMultiplier}`);
      }
      if (fb.tax > 0) doc.text(`Tax: ₹${fb.tax.toFixed(2)}`);
      if (fb.discount > 0) doc.text(`Discount: -₹${fb.discount.toFixed(2)}`);
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold').text(`Total Fare: ₹${(ride.fare || 0).toFixed(2)}`);
      doc.font('Helvetica');
    } else {
      doc.fontSize(12).font('Helvetica-Bold').text(`Total Fare: ₹${(ride.fare || 0).toFixed(2)}`);
      doc.font('Helvetica');
    }
    
    doc.moveDown();
    doc.fontSize(10).text('Thank you for riding with UCAB!', { align: 'center' });

    doc.end();

    return doc;
  }
}

module.exports = new ReceiptService();
