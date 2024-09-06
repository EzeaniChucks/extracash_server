const express = require("express");

const {
  adminCreditUserService,
  adminFetchWithdrawalIntentsService,
  adminUpdateWithdrawalIntentService,
} = require("../services/admin/adminServices");
const redisRateLimitCreditUser = require("../middleware/redisRateLimiterMiddleware");
const adminStatusCheckMiddleware = require("../middleware/adminCheckerMiddleware");

const adminrouter = express.Router();

adminrouter
  .route("/credit_user")
  //   .post(redisRateLimitCreditUser, adminCreditUserService); //apply rate limiter as a middleware to admin route
  .post(adminStatusCheckMiddleware, adminCreditUserService); //apply rate limiter as a middleware to admin route
adminrouter
  .route("/fetch_withdrawal_intents/:status")
  .get(adminStatusCheckMiddleware, adminFetchWithdrawalIntentsService);
adminrouter
  .route("/approve_intent")
  .post(adminStatusCheckMiddleware, adminUpdateWithdrawalIntentService);
adminrouter
  .route("/reject_intent")
  .post(adminStatusCheckMiddleware, adminUpdateWithdrawalIntentService);

module.exports = adminrouter;
