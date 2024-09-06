const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  phone: [{ type: String }],
  email: [{ type: String }],
  whatsapp: [{ type: String }],
});

module.exports = mongoose.model("contacts", contactSchema);
