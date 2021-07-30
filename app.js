const express = require('express');
const mongoose = require('mongoose');
const userRoute = require('./src/routes/users');
const parkingRoute = require('./src/routes/parkings');
const app = express();
var cors = require('cors');
require('dotenv').config();

app.use(cors());

const init = async () => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Connected to Cluster Atlas MongoDB
  const uri = `${process.env.MONGODB_URI}?retryWrites=true&w=majority`;
  try {
    await mongoose
      .connect(uri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
  }
  catch (err) {
    console.error('Error connecting to mongo', err);
  }
  // -----------------------------------  
  app.use('/', userRoute);
  app.use('/parkings', parkingRoute)
  return app
}

module.exports = init
