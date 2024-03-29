const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.set('strictQuery', false);

const globalSchema = new Schema({ // Global Data, saves count of every coaster difficulty for completion reasons.
  coasterCount: { type: Number, required: true, default: 0 },
  easyCount: { type: Number, required: true, default: 0 },
  mediumCount: { type: Number, required: true, default: 0 },
  hardCount: { type: Number, required: true, default: 0 },
  contributers: { type: Array, required: true, default: ["207199551646466059", "69420"] } //userIDs of contributers
  //score: { type: Number, required: true, default: 0 },
}, { versionKey: false });

const globalModel = mongoose.model('GlobalModel', globalSchema);

module.exports = globalSchema;