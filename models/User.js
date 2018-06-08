var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  google: String,
  tokens: Array
});

module.exports = mongoose.model('User', userSchema);
