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

// Middleware to automatically create a wallet when a new user is created
authSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      await Wallet.create({ user: this._id });
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("users", authSchema);