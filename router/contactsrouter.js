const express = require("express");

const contactsrouter = express.Router();

contactsrouter.route("/get_contact").get(); //type is sent as query param. Enum includes  
contactsrouter.route("/edit_contact").patch();

module.exports = contactsrouter;