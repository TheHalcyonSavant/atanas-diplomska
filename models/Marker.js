var mongoose = require('mongoose');

var markerSchema = new mongoose.Schema({
  owner: String,
  type: String,
  description: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Marker', markerSchema);
