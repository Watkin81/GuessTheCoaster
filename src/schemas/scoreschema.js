const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  userID: { type: String, required: true },
  score: { type: Number, required: true, default: 0 },
  streak: { type: Number, required: true, default: 0 },
  userTag: { type: String, required: true },
  gc: { type: Array, required: true },
  badges: { type: Array, required: true, default: [false, false, false, false, false, false] },
  comp: { type: String, required: true },
  guildID: { type: Array, required: true },
  pfp: { type: String, required: true },
  compTime: { type: Number, required: true, default: 999999999999 },
}, { versionKey: false });

const ScoreModel = mongoose.model('ScoreModel', scoreSchema);

module.exports = scoreSchema;