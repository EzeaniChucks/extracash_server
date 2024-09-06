const bcrypt = require("bcryptjs");
const User = require("../../schema/authSchema");
const Referral = require("../../schema/referralSchema");
const cryptos = require("crypto");
const {
  HttpSuccess,
  HttpServerError,
  HttpBadRequest,
  HttpForbidden,
} = require("../../util/responses");
const {
  createJwt,
  generateUniqueReferralCode,
  jwtIsValid,
} = require("../../util/helpers");

const tokenIsStillValidService = async (req, res) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return HttpForbidden(res, false);
    }
    const result = await jwtIsValid(token);
    if (result) {
      return HttpSuccess(res, true);
    } else {
      return HttpForbidden(res, false);
    }
  } catch (err) {
    return HttpServerError(res, false);
  }
};

const registerService = async (req, res) => {
  const {
    password,
    email,
    refferer_code,
    gender,
    phoneNumber,
    firstName,
    lastName,
  } = req.body;

  if (
    !password ||
    !email ||
    !gender ||
    !phoneNumber ||
    !firstName ||
    !lastName
  ) {
    return HttpBadRequest(res, "incomplete credentials");
  }

  try {
    //check if user doesn't already exist
    const userExists = await User.findOne({ email });
    if (userExists) {
      return HttpForbidden(
        res,
        "This user already exists. Try logging in instead"
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpass = await bcrypt.hash(password, salt);

    const user = await User.create({
      ...req.body,
      password: hashedpass,
    });

    if (!user) {
      return HttpBadRequest(
        res,
        "User could not be created. Please contact support"
      );
    }
    //create referral code
    await Referral.create({
      referree: user._id,
      promoCode: await generateUniqueReferralCode(user?._id, user?.firstName),
      referrer_code: refferer_code ? refferer_code : null,
    });
    const responseBody = {
      _id: user?._id,
      firstName: user?.firstName,
    };
    const token = await createJwt({ ...responseBody, isAdmin: user?.isAdmin });
    return HttpSuccess(res, { ...responseBody, token });
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

const loginService = async (req, res) => {
  const { password, email } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Incomplete credentials" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "This user does not exist. Try registering" });
    }

    const isPassCorrect = await bcrypt.compare(password, user?.password);

    if (isPassCorrect) {
      const responseBody = {
        _id: user?._id,
        firstName: user?.firstName,
      };
      const token = await createJwt({
        ...responseBody,
        isAdmin: user?.isAdmin,
      });
      return HttpSuccess(res, { ...responseBody, token });
    } else {
      return HttpBadRequest(res, "wrong email or password");
    }
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

//fetch complete details of a single user
const fetchCompleteAuthDetailsService = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      msg: "Please send a values 'userId' in your url parameter",
    });
  }
  try {
    const user = await User.findOne({ _id: String(userId) }).select(
      "_id firstName lastName email phoneNumber"
    );

    return HttpSuccess(res, user);
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

//edit details of a single user
const updateAuthDetailsService = async (req, res) => {
  const { userId, firstName, lastName, phoneNumber } = req.body;
 
  if (!userId || (!phoneNumber && !firstName && !lastName)) {
    return res.status(400).json({
      msg: "Please send values 'userId' alongside 'name' or 'phoneNumber' in your request field",
    });
  }
  try {
    const user = await User.findOne({ _id: String(userId) });
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    await user.save();
   
    return HttpSuccess(res, {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

// const verifyEmailService = async (req, res) => {
//   try {
//     const { verificationToken, email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ msg: "No user with this email. Please try registering" });
//     }

//     if (user.verificationToken !== verificationToken) {
//       return res.status(400).json({
//         msg: "false or expired token. Your account may already be verified. Try loggin in.",
//       });
//     }

//     user.isVerified = true;
//     user.verified = Date.now();
//     user.verificationToken = "";
//     await user.save();
//     const { _id, firstName, lastName, phoneNumber, isVerified } = user;
//     await validateUserWallet(_id);
//     return res.status(200).json({
//       msg: "email verified",
//       user: {
//         _id,
//         email: user.email,
//         firstName,
//         lastName,
//         phoneNumber,
//         isVerified,
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// };

module.exports = {
  tokenIsStillValidService,
  registerService,
  loginService,
  fetchCompleteAuthDetailsService,
  updateAuthDetailsService,
};
