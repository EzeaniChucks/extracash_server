const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    //the code belonging to the existing user who did the invitation aka upline
    referrer_code: {
      type: String,
      default: null,
    },
    //the new user who owns this schema.
    referree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    //the new user's referral code, called promocode to make it clearly distinguishable from referrer_code above
    promoCode: {
      type: String,
    },
    //the new user's future promo earnings from their future downlines
    promoEarning: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("referrals", referralSchema);
