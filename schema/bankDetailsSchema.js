const mongoose = require("mongoose");

const fundingDetailsSchema = new mongoose.Schema({
  fundingDetails: [
    {
      accountNumber: { type: String },
      accountBank: { type: String },
      accoutName: { type: String },
    },
  ],
  whatsAppNumber: { type: String }, //whatsApp fundingDetails where bank payment receipt will be sent to.
});

module.exports = mongoose.model("fundingDetails", fundingDetailsSchema);
