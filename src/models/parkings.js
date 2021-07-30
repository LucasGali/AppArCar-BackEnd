const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
    business_hours: String,
    capacity: Number,
    occupied: Number,
    price: {
      type: Object,
      required: true,
    }
  },
  // Specifies the collection
  { collection: 'ParkingLot' },
);

module.exports = mongoose.model('Parkings', userSchema)
