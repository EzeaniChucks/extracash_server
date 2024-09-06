const express = require("express");

const bankdetailsrouter = express.Router();

bankdetailsrouter.route("/get_contact").get(); //type is sent as query param. Enum includes
bankdetailsrouter.route("/edit_contact").patch();

module.exports = bankdetailsrouter;
