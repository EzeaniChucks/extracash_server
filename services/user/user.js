const Wallet = require("../../schema/walletSchema");
const Referral = require("../../schema/referralSchema");
const WithdrawalIntent = require("../../schema/withdrawalIntentSchema");
const FundingHistory = require("../../schema/walletFundingSchema");
const BankFundingDetails = require("../../schema/bankDetailsSchema");
const FAQ = require("../../schema/faqSchema");
const Contacts = require("../../schema/contactsSchema");

const {
  HttpForbidden,
  HttpServerError,
  HttpSuccess,
  HttpBadRequest,
} = require("../../util/responses");

//create withdrawal intents
const createWithdrawalIntentService = async (req, res) => {
  const { userId, amount, bankName, bankAccount, bankCustomerName } = req.body;
  if (!userId || !amount || !bankName || !bankAccount || !bankCustomerName) {
    return HttpBadRequest(
      res,
      "userId, amount, bankName, bankAccount and bankCustomerName must be sent with request"
    );
  }

  if (typeof amount !== "number") {
    return HttpBadRequest(res, "type of amount should be number");
  }

  try {
    if (Number(amount) < 5000) {
      return HttpForbidden(
        res,
        `You can only withdraw amounts greater than N5000. If you don't have up to this in your wallet, we encourage you to grow it through daily tasks or referrals to surpass this threshold`
      );
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return HttpBadRequest(
        res,
        "We could not fetch your wallet. Please contact support."
      );
    }
    if (Number(wallet?.balance) < Number(amount)) {
      return HttpForbidden(
        res,
        `Insufficient funds. Your wallet balance of N${Number(
          wallet?.balance?.toFixed(2)
        )} is insufficient for this transaction`
      );
    }
    // Deduct the amount from the wallet
    wallet.balance -= amount;
    await wallet.save();

    // Create the withdrawal intent
    const intent = await WithdrawalIntent.create({
      user: userId,
      amount,
      bankName,
      bankAccount,
      bankCustomerName,
    });
    return HttpSuccess(res, intent);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetching by user withdrawal requests
const userFetchWithdrawalIntentsService = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    if (limit && typeof Number(limit) !== "number") {
      return HttpBadRequest(
        res,
        "limit should be a numeric string. e.g '5' or '1' etc"
      );
    }
    if (!userId) {
      return HttpBadRequest(res, "userId must be present in url parameter");
    }

    let intents = WithdrawalIntent.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (limit) {
      intents = intents.limit(limit);
    }
    intents = await intents;

    return HttpSuccess(res, intents);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetching by user funding history (which is usually created by an admin while funding user wallet)
const userFetchFundingHistoryService = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;

    if (limit && typeof Number(limit) !== "number") {
      return HttpBadRequest(
        res,
        "limit should be a numeric string. e.g '5' or '1' etc"
      );
    }

    if (!userId) {
      return HttpBadRequest(res, "userId must be present in url parameter");
    }

    let fundingQuery = FundingHistory.find({ receiver: userId }).sort({
      createdAt: -1,
    });

    if (limit) {
      fundingQuery = fundingQuery.limit(Number(limit));
    }

    const funding = await fundingQuery;

    return HttpSuccess(res, funding);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetch user downlines
const userFetchDownlinesAndRefCode = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return HttpBadRequest(res, "userId paramater must be sent");
    }
    //first fetch user's code
    const userReferral = await Referral.findOne({ referree: userId });
    if (!userReferral) {
      return HttpBadRequest(
        res,
        "This should not happen. You do not seem to have a referral code. Please contact support"
      );
    }
    const downlines = await Referral.find({
      referrer_code: userReferral?.promoCode,
    })
      .select("referree")
      .populate({
        path: "referree",
        select: "_id firstName lastName email createdAt",
      });

    return HttpSuccess(res, {
      referralCode: userReferral?.promoCode,
      referralBalance: userReferral?.promoEarning,
      downlines,
    });
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetch bank funding details array
const fetchSystemBankFundingDetails = async (req, res) => {
  try {
    const bankfundingdetails = await BankFundingDetails.find();
    return HttpSuccess(res, bankfundingdetails[0]);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetch bank funding details array
const fetchSystemContacts = async (req, res) => {
  try {
    const contact = await Contacts.find();
    return HttpSuccess(res, contact[0]);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//fetch FAQ array
const fetchFAQ = async (req, res) => {
  try {
    const faq = await FAQ.find();
    return HttpSuccess(res, faq);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//transfer funds to wallet
const userTransferReferralFundsToWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (
      !userId ||
      amount === undefined ||
      amount === null ||
      amount === false
    ) {
      return HttpBadRequest(res, "userId and amount parameters must be sent");
    }
    if (typeof amount !== "number") {
      return HttpBadRequest(res, "type of amount must be number");
    }
    if (amount < 50) {
      return HttpBadRequest(
        res,
        "transfer request amount should be fifty naira or more"
      );
    }
    //first fetch user's code
    const usercode = await Referral.findOne({ referree: userId });

    if (Number(usercode.promoEarning) < Number(amount)) {
      return HttpBadRequest(
        res,
        "You do not have up to this amount in your referral balance"
      );
    }
    //fetch user wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return HttpBadRequest(
        res,
        "Wallet could not be reached at this time. Please contact support or try again"
      );
    }

    usercode.promoEarning -= Number(amount);
    wallet.balance += Number(amount);

    //save changes on referral and wallet collections
    const updatedRef = await usercode.save();
    const updatedWallet = await wallet.save();

    //return both
    return HttpSuccess(res, {
      usercode: {
        promoCode: updatedRef?.promoCode,
        promoEarning: updatedRef?.promoEarning,
      },
      wallet: {
        balance: updatedWallet?.balance,
      },
    });
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

module.exports = {
  createWithdrawalIntentService,
  userFetchWithdrawalIntentsService,
  userFetchFundingHistoryService,
  userFetchDownlinesAndRefCode,
  fetchSystemBankFundingDetails,
  fetchFAQ,
  fetchSystemContacts,
  userTransferReferralFundsToWallet,
};
