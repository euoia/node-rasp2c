const fs = require('fs');
const debug = require('debug')('rasp2c');

var lastGoodTemperature = null;

exports.readTemperature = temperatureDevice => {
  return new Promise((resolve, reject) => {
    fs.readFile(temperatureDevice, function (err, buffer) {
      if (err) {
        debug('Error reading from temperature device.');
        return reject (new Error(err));
      }

      // Read data from file (using fast node ASCII encoding).
      // The format is roughly (for 21.123°C):
      // DATA temp=21123
      var data = buffer.toString('ascii').split(" "); // Split by space.

      // Extract temperature from string and divide by 1000 to give celsius.
      var temperature = parseFloat(data[data.length - 1].split("=")[1]) / 1000.0;

      // Round to one decimal place.
      var rounded_temperature = Math.round(temperature * 10) / 10;

      var has_error = false;
      if (rounded_temperature === -0.1) {
        debug('Probably an erroneous reading! Temperature sensor said -0.1. Ignoring this record.');
        has_error = true;
      }

      if (rounded_temperature < -20 || rounded_temperature > 100) {
        debug('Probably an erroneous reading! Temperature sensor said ' + rounded_temperature + '. Ignoring this record.');
        has_error = true;
      }

      if (has_error) {
        debug('Returning last good temperature (' + lastGoodTemperature+ ').');
        temperature = lastGoodTemperature;
      }

      // Execute call back with data.
      return resolve(temperature);
    });
  });
};

// Get the last good reading. Can be retrieved by the client code.
exports.getLastGoodTemperature = () => {
  return lastGoodTemperature
};
