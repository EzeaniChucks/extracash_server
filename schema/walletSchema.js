const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "NGN" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    dailyTransactions: { type: Number, default: 15 }, // Start with 15 as the daily allowance
    lastTransactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("wallets", walletSchema);