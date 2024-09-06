const {
  HttpServerError,
  HttpSuccess,
  HttpBadRequest,
} = require("../../util/responses");
const WithdrawalIntent = require("../../schema/withdrawalIntentSchema");
const Wallet = require("../../schema/walletSchema");
const WalletFunding = require("../../schema/walletFundingSchema");
const User = require("../../schema/authSchema");
const { increaseWallet } = require("../../util/helpers");

const status_enums = ["pending", "completed", "rejected"];

// admin credit user wallet
//should be done only after bank payment details have been confirmed

const adminCreditUserService = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    if (!amount || !userId) {
      return HttpBadRequest(
        res,
        "amount and userId should be present in request body"
      );
    }
    //check that amount is of type number
    if (typeof amount !== "number") {
      return HttpBadRequest(res, "type of amount should be number");
    }

    //get admin info from middleware
    const adminId = req?.admin?._id;

    if (!adminId) {
      return HttpBadRequest(
        res,
        "Please pass the right token with this request. No admin Id present"
      );
    }
    //check if user exist
    const userExists = await User.findOne({ _id: userId });

    if (!userExists) {
      return HttpBadRequest(res, "A user with this ID does not exist");
    }

    //fetch wallet
    const wallet = await Wallet.findOne({ user: userId });

    //increase wallet
    const increasedwallet = await increaseWallet(wallet, Number(amount));

    //create funding transaction
    await WalletFunding.create({
      funder: adminId,
      receiver: userExists._id,
      amount: Number(amount),
    });

    return HttpSuccess(res, increasedwallet);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//admin fetch withdrawal requests
const adminFetchWithdrawalIntentsService = async (req, res) => {
  try {
    const { status } = req.params;

    //check if status is sent
    if (!status) {
      return HttpBadRequest(res, "include status param in you request");
    }

    //check if status is rightly sent
    if (!status_enums.includes(status)) {
      return HttpBadRequest(
        res,
        "status param type can only be 'pending', 'completed' or 'rejected'"
      );
    }

    const filter = status ? { status } : {};
    const intent = await WithdrawalIntent.find(filter)
      .populate({ path: "user", select: "_id firstName lastName email" })
      .sort({ createdAt: -1 });
    return HttpSuccess(res, intent);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

//admin update (approve or reject) withdrawal requests
const adminUpdateWithdrawalIntentService = async (req, res) => {
  const { intentId, status, rejectionReason } = req.body;

  //check for intentId ans status
  if (!intentId || !status) {
    return HttpBadRequest(
      res,
      "intentId and status are compulsory request fields"
    );
  }

  //check if status is rightly sent
  if (status !== "completed" && status !== "rejected") {
    return HttpBadRequest(
      res,
      "status param type can only be 'completed' or 'rejected'"
    );
  }

  if (!req?.url?.includes("approve_intent") && !rejectionReason) {
    return HttpBadRequest(
      res,
      "To successfully reject intent, please include rejectionReason field"
    );
  }

  //check if rejected status is sent with approve intent url, which shouldn't be so
  if (req?.url?.includes("approve_intent") && status === "rejected") {
    return HttpBadRequest(
      res,
      "Rejected status shouldn't be sent on approve request endpoint. Change status to completed instead"
    );
  }

  //get admin info from middleware
  const adminId = req?.admin?._id;

  if (!adminId) {
    return HttpBadRequest(
      res,
      "Please pass the right token with this request. No admin Id present"
    );
  }

  try {
    const intent = await WithdrawalIntent.findById(intentId);
    if (!intent) {
      return HttpBadRequest(res, "No withdrawal intent with this ID exists");
    }

    if (intent?.status !== "pending") {
      return HttpBadRequest(
        res,
        `No further action can be performed on intents with non-pending status. This one already has a status of ${intent.status}`
      );
    }
    intent.status = status;
    if (status === "rejected") {
      intent.rejectionReason = rejectionReason;
      const intentCreatorId = intent?.user?.toString();
      
      //during rejection, increase user's wallet by intent amount.
      //basically refunding their money back to their wallet (since it was debited on intent creation)
      const wallet = await Wallet.findOne({ user: intentCreatorId });
      
      await increaseWallet(wallet, Number(intent?.amount));

      //create refund transaction
      await WalletFunding.create({
        funder: adminId,
        receiver: intentCreatorId,
        amount: Number(intent?.amount),
        type: "refund", //enum 'bank credit' | 'refund'
      });
    }
    await intent.save();

    return HttpSuccess(res, intent);
  } catch (e) {
    return HttpServerError(res, e?.message);
  }
};

module.exports = {
  adminCreditUserService,
  adminFetchWithdrawalIntentsService,
  adminUpdateWithdrawalIntentService,
};
