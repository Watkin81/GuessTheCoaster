const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guessSchema = new Schema({
  lastNum: { type: Number, required: true , default: 0 },
  streakUser: { type: String, required: true, default: "UserID" },
  streak: { type: Number, required: true, default: 0 },
}, { versionKey: false });

const GuessModel = mongoose.model('GuessModel', guessSchema);

module.exports = guessSchema;