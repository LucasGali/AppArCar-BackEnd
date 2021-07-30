const express = require('express');
const router = express.Router();
const Parkings = require('../models/parkings.js');
const requireAuth = require('../middlewares/requireAuth');
const sanitize = require('mongo-sanitize');
var ObjectId = require('mongoose').Types.ObjectId;
const {ParkingLotClass} = require('../classes/classes.js');

const returnDataStructure = (data) => {  
  const aux = new ParkingLotClass(  
    data.name,
    data.address,
    data.latitude,
    data.longitude,
    data.business_hours,
    data.price,
  );

  return {
    _id: data._id,
    name: aux.name,
    address: aux.address,
    latitude: aux.latitude,
    longitude: aux.longitude,
    business_hours: aux.business_hours,
    price: aux.price,
  };
}

// Get the complite list of parkinglots
router.get('/', requireAuth, async (req, res) => {
  try {
    let plist = await Parkings.find().lean();
    return res.status(200).send(plist.map(returnDataStructure));
  } catch (error) {
    return res
      .status(404)
      .send({ error: 'We cannot find any Parkings in the DB' });
  }
});

// Reserve a specific parkinglot
router.patch('/reserve', requireAuth, async (req, res) => {
  const cleanId = sanitize(req.body.id);
  try {
    const reservedSpot = await Parkings.findOne({
      _id: ObjectId(cleanId),
    }).lean();
    if (reservedSpot && (reservedSpot.occupied < reservedSpot.capacity)) {
      try {
        await Parkings.updateOne(
          { _id: ObjectId(cleanId) },
          { occupied: reservedSpot.occupied + 1 },
        );
        return res.status(200).send({ report: 'Reservation Successful' });
      } catch (err) {
        return res
          .status(404)
          .send({ error: 'Opps!' });
      }
    } else {
      return res.status(404).send({ error: 'Parkinglot full!' });
    }
  } catch (error) {
    return res
      .status(404)
      .send({ error: 'We cannot find the selcted parkinglot in the DB' });
  }
});

// Cancel reservation of a specific parkinglot
router.patch('/cancel', requireAuth, async (req, res) => {
  const cleanId = sanitize(req.body.id);
  try {
    const reservedSpot = await Parkings.findOne({
      _id: ObjectId(cleanId),
    }).lean();
    if (reservedSpot && (reservedSpot.occupied > 0)) {
      try {
        await Parkings.updateOne(
          { _id: ObjectId(cleanId) },
          { occupied: reservedSpot.occupied - 1 },
        );
        return res.status(200).send({report: "Reservation Canceled"});
      } catch (err) {
        return res
          .status(404)
          .send({ error: 'Opps!' });
      }
    } else {
      return res.status(404).send({ error: 'There was an error with your request.' });
    }
  } catch (error) {
    return res
      .status(404)
      .send({ error: 'We cannot find the selcted parkinglot in the DB' });
  }
});

module.exports = router;

