const bcrypt = require('bcrypt')
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    surname: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: String,
    vehicleType: String,
    vehiclePlate: String,
    card: {
      cvc: String,
      expiry: String,
      name: String,
      number: String,
      brand: String
    },
  },
  // Specifies the collection
  { collection: 'Users' },
);

// Hashing & Salting
userSchema.pre('save', function(next) {
  const user = this

  // If the password is already hashed skip this
  if(!user.isModified('password')) {
    return next()
  }

  // Salts the password for extra security
  bcrypt.genSalt(10, (err, salt) => {
    if(err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if(err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword) {
  const user = this

  // Checks if the hash is corrects, compares the incoming hashed with the hashed in the db
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if(err) {
        return reject(err)
      }

      if(!isMatch) {
        return reject(false)
      }

      resolve(true)
    })
  })
}

module.exports = mongoose.model('Users', userSchema)
