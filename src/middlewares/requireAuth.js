const jwt = require('jsonwebtoken')
const Users = require('../models/users.js');

require('dotenv').config();

module.exports = (req, res, next) => {
  const { authorization } = req.headers

  if(!authorization) {
    return res.status(401).send({error: 'You must be logged in.'})
  }

  const token = authorization.replace('Bearer ', '')
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if(err) {
      return res.status(401). send({error: 'You must be logged in.'})
    }

    const {userId} = payload
    const user = await Users.findById(userId)
    req.user = user
    next()
  })
}
