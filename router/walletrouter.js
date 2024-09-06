const express = require("express");
const { fetchUserWalletService, playGameService } = require("../services/wallet/walletServices");
const userStatusCheckerMiddleware = require("../middleware/userCheckerMiddleware");

const walletrouter = express.Router();

//protect these routes
walletrouter.route("/fetch_wallet/:userId").get( userStatusCheckerMiddleware, fetchUserWalletService);
walletrouter.route("/play").post(userStatusCheckerMiddleware, playGameService);

module.exports = walletrouter;
