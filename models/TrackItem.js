const mongoose = require("mongoose");
const { Schema } = mongoose;

const trackItemSchema = new Schema({
  trackCode: { type: String, required: true },
  lastCheckTimestamp: String,
  lastEventDate: String,
  lastEventDescription: String,
  addedToFavTimestamp: String,
  descrText: String
});

// mongoose.model("trackitems", trackItemSchema);
module.exports = trackItemSchema;
