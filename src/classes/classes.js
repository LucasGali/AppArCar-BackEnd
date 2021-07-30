const CryptoJS = require('crypto-js');
class KeyGen {
  constructor(key) {
        this.key = key;
    }

    cypher(str) {
      return CryptoJS.AES.encrypt(str, this.key).toString();
    }

    decypher(enc) {
      let bytes = CryptoJS.AES.decrypt(enc, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    }
}
class UserClass {
  constructor(name, surname, email, vehicleType, vehiclePlate) {
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.vehicleType = vehicleType;
    this.vehiclePlate = vehiclePlate;
  }
};
class ParkingLotClass {
  constructor(name, address, latitude, longitude, business_hours, price) {
    this.name = name;
    this.address = address;
    this.latitude = latitude;
    this.longitude = longitude;
    this.business_hours = business_hours;
    this.price = {...price};
  }
};

module.exports = {
  UserClass,
  ParkingLotClass,
  KeyGen
};
