const express = require("express");
const {
  createWithdrawalIntentService,
  userFetchWithdrawalIntentsService,
  userTransferReferralFundsToWallet,
  userFetchDownlinesAndRefCode,
  userFetchFundingHistoryService,
  fetchSystemBankFundingDetails,
  fetchSystemContacts,
  fetchFAQ,
} = require("../services/user/user");

const userrouter = express.Router();

//create withdrawal request
userrouter
  .route("/create_withdrawal_intent")
  .post(createWithdrawalIntentService);

//fetch withdrawal request
userrouter
  .route("/fetch_withdrawal_intent/:userId")
  .get(userFetchWithdrawalIntentsService);

//fetch funding history
userrouter
  .route("/fetch_funding_history/:userId")
  .get(userFetchFundingHistoryService);

//fetch downlines
userrouter
  .route("/fetch_downlines_and_ref_code/:userId")
  .get(userFetchDownlinesAndRefCode);

//fetch system funding details
userrouter
  .route("/fetch_system_bank_details")
  .get(fetchSystemBankFundingDetails);

//fetch system contact details
userrouter.route("/fetch_system_contact_details").get(fetchSystemContacts);

//fetch system FAQs
userrouter.route("/fetch_system_faqs").get(fetchFAQ);

//transfer money from referal earnings to wallet
userrouter
  .route("/transfer_referral_funds_to_wallet")
  .post(userTransferReferralFundsToWallet);

module.exports = userrouter;
