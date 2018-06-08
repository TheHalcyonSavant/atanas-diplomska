var Marker = require('../models/Marker');

exports.index = async function(req, res) {
  res.render('map', {
    title: 'Map',
    google_map_api_key: process.env.GOOGLE_MAP_API_KEY
  });
};

exports.getMarkers = async function(req, res) {
  res.json({
    markers: await Marker.find().exec()
  })
};

exports.saveMarker = async function(req, res) {
  await new Marker(req.body).save();
  res.sendStatus(200);
};

exports.deleteMarker = async function(req, res) {
  await Marker.findOneAndRemove({ _id: req.body.id });
  res.sendStatus(200);
};

exports.getTable = function(req, res) {
  res.render('table', {
    title: 'Table'
  });
};