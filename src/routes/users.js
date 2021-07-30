const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/users.js');
const requireAuth = require('../middlewares/requireAuth');
const sanitize = require('mongo-sanitize');
const { UserClass, KeyGen } = require('../classes/classes.js');
const bcrypt = require('bcrypt')

const CIPHER_ALGORITHM = process.env.CYPHER_KEY;
const kg = new KeyGen(CIPHER_ALGORITHM);

const returnDataStructure = (data, token = undefined) => {
  const aux = new UserClass(
    data.name,
    data.surname,
    data.email,
    data.vehicleType,
    data.vehiclePlate
  );

  return token
    ? {
        token,
        name: aux.name,
        surname: aux.surname,
        email: aux.email,
        vehicleType: aux.vehicleType,
        vehiclePlate: aux.vehiclePlate
      }
    : {
        name: aux.name,
        surname: aux.surname,
        email: aux.email,
        vehicleType: aux.vehicleType,
        vehiclePlate: aux.vehiclePlate
      };
}

// Welcome endpoint
router.get('/', (req, res) => {
  res.status(200).send('Hi! This is the AppArCar API');
});

// Gets ALL the users in the DB
router.get('/users', requireAuth, async (req, res) => {
  try {
    return res.status(200).send(await Users.find());
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Login as a User
router.post('/signin', async (req, res) => {
  const { password } = req.body;
  const cleanEmail = sanitize(req.body.email);

  if (!cleanEmail || !password) {
    return res.status(404).send({ error: 'Must provide email and password' });
  }

  try {
    const user = await Users.findOne({ email: cleanEmail });
    try {
      await user.comparePassword(password);
      const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY);
      return res.status(200).send(returnDataStructure(user, token));
    } catch (err) {
      return res.status(404).send({ error: 'Invalid password or email' });
    }
  } catch (err) {
    return res.status(404).send({ error: 'Invalid password or email' });
  }
})

// Creates a new User
router.post('/signup', async (req, res) => {
  const { name, surname, email, password, vehicleType, vehiclePlate } = req.body

  const cleanName = sanitize(name);
  const cleanSurname = sanitize(surname);
  const cleanEmail = sanitize(email);
  const cleanPassword = sanitize(password);
  const cleanVehicleType = sanitize(vehicleType);
  const cleanVehiclePlate = sanitize(vehiclePlate);

  const user = new Users({
    name: cleanName,
    surname: cleanSurname,
    email: cleanEmail,
    password: cleanPassword,
    vehicleType: cleanVehicleType,
    vehiclePlate: cleanVehiclePlate,
  });

  try {
    await user.save()
    const token = jwt.sign({userId: user._id}, process.env.JWT_KEY)
    return res.status(201).send(returnDataStructure(user, token));
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Gets profile data for user
router.post('/profile',requireAuth, async (req, res) => {
  const email = req.body.email;

  try {
    let user = await Users.findOne({ email }).lean();
    if (user.card) {
      let newFormat = returnDataStructure(user);
      newFormat.number = kg.decypher(user.card.number);
      newFormat.brand = kg.decypher(user.card.brand);
      newFormat.expiry = kg.decypher(user.card.expiry);
      return res.status(200).send(newFormat);
    }
    return res.status(200).send(returnDataStructure(user));
  } catch (err) {
    return res.status(400).send(err);
  }
});


//Update User
router.patch('/update_users', requireAuth, async (req, res) => {
  const { email, newEmail, name, surname, password } = req.body;
  const cleanEmail = sanitize(email);
  const cleanNewEmail = sanitize(newEmail);
  const cleanName = sanitize(name);
  const cleanSurname = sanitize(surname);
  const cleanPassword = sanitize(password);
  try {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(cleanPassword, salt, async (err, hash) => {

        const response = await Users.updateOne(
          { email: cleanEmail },
          {
            email: cleanNewEmail,
            name: cleanName,
            surname: cleanSurname,
            password: hash,
          },
        );
        if (response.nModified != 0) {
          return res.status(200).send({ report: 'Changes Saved' });
        }
        return res
          .status(400)
          .send({ report: 'There was an error, no changes saved' });
     });
    });
  } catch (err) {
    return res.status(400).send(err);
  }
});


//Update Vehicle
router.patch('/vehicle', requireAuth, async (req, res) => {
  const { email, vehicleType, vehiclePlate } = req.body;

  const cleanEmail = sanitize(email);
  const cleanVehicleType = sanitize(vehicleType);
  const cleanVehiclePlate = sanitize(vehiclePlate);
  try {
    const response = await Users.updateOne(
      { email: cleanEmail },
      {
        vehicleType: cleanVehicleType,
        vehiclePlate: cleanVehiclePlate,
      },
    );
    if (response.nModified != 0) {
      return res.status(200).send({ report: 'Changes Saved' });
    }
    return res
      .status(400)
      .send({ report: 'There was an error, no changes saved' });
  } catch (err) {
    return res.status(400).send(err);
  }
});

//Add credit card to user
router.patch('/card_registration', requireAuth, async (req, res) => {
  const { email, cardInfo } = req.body;

  const cleanEmail = sanitize(email);
  const cleanNumber = sanitize(cardInfo.number);
  const cleanName = sanitize(cardInfo.name);
  const cleanExpiry = sanitize(cardInfo.expiry);
  const cleanCvc = sanitize(cardInfo.cvc);
  const cleanBrand = sanitize(cardInfo.brand);

  try {
    const response = await Users.updateOne(
      { email: cleanEmail },
      {
        card: {
          cvc: kg.cypher(cleanCvc),
          expiry: kg.cypher(cleanExpiry),
          name: kg.cypher(cleanName),
          number: kg.cypher(cleanNumber),
          brand: kg.cypher(cleanBrand),
        },
      },
    );

    if (response.nModified != 0) {
      return res.status(200).send(cleanNumber);
    }
    return res
      .status(400)
      .send({ report: 'There was an error, no changes saved' });
  } catch (err) {
    return res.status(400).send(err);
  }
});



// Delete User
router.post('/delete', requireAuth, async (req, res) => {
  const cleanEmail = sanitize(req.body.email);

  try {
    return res.status(200).send(await Users.deleteOne({ email: cleanEmail }));
  } catch (err) {
    return res.status(400).send(err);
  }
});

module.exports = router
