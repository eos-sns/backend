const mongoose = require('mongoose');
const Role = require('../_helpers/role');

const Schema = mongoose.Schema;

const schema = new Schema({
  username: {type: String, unique: true, required: true},
  email: {type: String, required: true}, // todo verify
  hash: {type: String, required: true}, // hashed password
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  createdDate: {type: Date, default: Date.now},

  role: {type: String, default: Role.User}, // todo enum

  // todo sub-schema
  authorized: {type: Boolean, default: false}, // todo verify

  // todo subSchema
  mbDownloaded: {type: Number, default: 0},
  numDownloads: {type: Number, default: 0}
});

schema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('User', schema);