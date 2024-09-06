const express = require("express");
const {
  loginService,
  registerService,
  tokenIsStillValidService,
  fetchCompleteAuthDetailsService,
  updateAuthDetailsService,
} = require("../services/auth/authServices");
const userStatusCheckerMiddleware = require("../middleware/userCheckerMiddleware");

const authrouter = express.Router();

authrouter.route("/token_is_valid").get(tokenIsStillValidService);
authrouter.route("/login").post(loginService);
authrouter.route("/register").post(registerService);
authrouter
  .route("/get_user_details/:userId")
  .get(userStatusCheckerMiddleware, fetchCompleteAuthDetailsService);
authrouter
  .route("/update_user_details")
  .post(userStatusCheckerMiddleware, updateAuthDetailsService);

module.exports = authrouter;
