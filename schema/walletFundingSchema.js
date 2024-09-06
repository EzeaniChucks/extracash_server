const mongoose = require("mongoose");

const walletFunding = new mongoose.Schema(
  {
    //the admin
    funder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    //the user
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    amount: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["bank credit", "refund"],
      default: "bank credit",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("walletfunding", walletFunding);
