const Wallet = require("../../schema/walletSchema");
const Referrer = require("../../schema/referralSchema");
const { increaseWallet } = require("../../util/helpers");
const {
  HttpServerError,
  HttpSuccess,
  HttpNotFound,
  HttpBadRequest,
  HttpForbidden,
} = require("../../util/responses");

//fetch user wallet
const fetchUserWalletService = async (req, res) => {
  const { userId } = req.params;
  try {
    const wallet = await Wallet.findOne({ user: userId }).populate({
      path: "user",
      select: "_id firstName", // Include only _id and firstName from users model
    });

    if (!wallet) {
      return HttpNotFound(res, "Wallet does not exist");
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const lastTransactionDay = new Date(wallet?.lastTransactionDate).setHours(
      0,
      0,
      0,
      0
    );

    if (today !== lastTransactionDay) {
      // New day, reset the allowance
      wallet.dailyTransactions = 15;
      wallet.lastTransactionDate = today;
      await wallet.save();
    }
    return HttpSuccess(res, wallet);
  } catch (error) {
    return HttpServerError(res, error.message);
  }
};

//play game
const playGameService = async (req, res) => {
  let { userId, amount } = req.body;

  //check that userId and amount are present
  if (!userId || !amount) {
    return HttpBadRequest(
      res,
      "userId and amount must be passed in request body"
    );
  }

  //check if amount is numeric
  if (typeof amount !== "number") {
    return HttpBadRequest(res, "type of amount must be number");
  }

  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return HttpBadRequest(
        res,
        "Wallet could not be fetched. This should not normally happen. Please contact support for a quick fix"
      );
    }
    //check that wallet balance isn't zero
    if (Number(wallet?.balance) <= 0) {
      return HttpForbidden(
        res,
        "Kindly fund your wallet to start growing your money!"
      );
    }
    const today = new Date().setHours(0, 0, 0, 0);
    const lastTransactionDay = new Date(wallet?.lastTransactionDate).setHours(
      0,
      0,
      0,
      0
    );

    if (today !== lastTransactionDay) {
      // New day, reset the allowance
      wallet.dailyTransactions = 15;
      wallet.lastTransactionDate = today;
    }

    // Check if the user still has remaining daily transactions
    if (wallet.dailyTransactions <= 0) {
      return HttpBadRequest(
        res,
        "Daily transaction limit reached. Try again tomorrow."
      );
    }

    //calculate amount to increase wallet by
    if (Number(amount) > 0.005) {
      //make sure amount is never greater than 0.1
      amount = 0.005;
    }

    const useramount = Number(Number(amount) * Number(wallet?.balance)).toFixed(
      2
    );
    const referreramount = Number(useramount * 0.05).toFixed(4);

    //reduce daily transaction limit before rewarding user wallet with value
    //the updated wallet is saved into the database within the increaseWallet helper function

    wallet.dailyTransactions = Number(wallet?.dailyTransactions) - 1;

    //increase user wallet
    const increasedwallet = await increaseWallet(wallet, Number(useramount));

    // console.log(useramount, increasedwallet?.balance, referreramount);

    if (!increasedwallet) {
      return HttpBadRequest(
        res,
        "Could not top up wallet. This shouldn't happen. Please contact support"
      );
    }

    //check if user has a referrer, so you'll reward them
    //first find user referral collection
    const referrerExists = await Referrer.findOne({ referree: userId });

    //if they have a referrer_code, aka an upline's code, then implement this code block
    if (referrerExists && referrerExists?.referrer_code) {
      const referrer = await Referrer.findOne({
        promoCode: referrerExists?.referrer_code?.toString(),
      }); //find the upline with referrer_code present on downlines referral model

      if (referrer) {
        //reward referrer
        referrer.promoEarning += Number(referreramount);
        await referrer.save();
      }
    }

    return HttpSuccess(res, increasedwallet);
  } catch (e) {
    return HttpServerError(res, e.message);
  }
};

module.exports = {
  fetchUserWalletService,
  playGameService,
};
