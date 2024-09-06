const mongoose = require("mongoose");
const Wallet = require("./walletSchema");

const authSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["m", "f"],
    },
    // dateOfBirth: {
    //   type: Date,
    //   required: true,
    // },
    // verificationToken: {type: String, default:''},
    // isVerified: { type: Boolean, default: false },
    // verified: Date,
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Middleware to automatically create a wallet after a user is saved
authSchema.post("save", async function (doc, next) {
  try {
    await Wallet.create({ user: doc._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("users", authSchema);
