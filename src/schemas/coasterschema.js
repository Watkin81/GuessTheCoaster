const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coasterSchema = new Schema({
  key: { type: String, required: true , default: "e1" }, // e1, m21, h45 (take difficulty AND length of easy coaster array + 1)
  dif: { type: String, required: true, default: "e" }, // e, m, h (entered by user)
  names: { type: Array, required: true, default: ["", ""] }, // entered by user
}, { versionKey: false });

const CoasterModel = mongoose.model('CoasterModel', coasterSchema);

module.exports = coasterSchema;