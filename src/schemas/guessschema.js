const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guessSchema = new Schema({
  lastNumsE: { type: Array, required: true , default: [0, 1] },
  lastNumsM: { type: Array, required: true , default: [0, 1] },
  lastNumsH: { type: Array, required: true , default: [0, 1] }
}, { versionKey: false });

const GuessModel = mongoose.model('GuessModel', guessSchema);

module.exports = guessSchema;