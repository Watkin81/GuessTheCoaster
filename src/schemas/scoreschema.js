const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  userID: { type: String, required: true },
  score: { type: Number, required: true, default: 0 },
  userTag: { type: String, required: true },
  gc: { type: Array, required: true },
  comp: { type: String, required: true },
  guildID: { type: Array, required: true },
  pfp: { type: String, required: true }
}, { versionKey: false });

const ScoreModel = mongoose.model('ScoreModel', scoreSchema);

module.exports = scoreSchema;