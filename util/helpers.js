const Users = require("../schema/authSchema");
const ReferralCode = require("../schema/referralSchema");
const FAQ = require("../schema/faqSchema");
const Contacts = require("../schema/contactsSchema");
const FundingDetails = require("../schema/bankDetailsSchema");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { HttpForbidden } = require("./responses");

//helper function
const increaseWallet = async (wallet, amount) => {
  try {
    //increase wallet by amount
    wallet.balance += Number(amount);

    //save alteration to database
    await wallet.save();
    return wallet;
  } catch (e) {
    return null;
  }
};

//helper function
const decreaseWallet = async (wallet, amount) => {
  try {
    //decrease wallet by amount
    wallet.balance -= Number(amount);

    //save alteration to database
    await wallet.save();
    return wallet;
  } catch (e) {
    return null;
  }
};

const createJwt = async (body) => {
  try {
    const token = await jwt.sign(body, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
  } catch (err) {
    throw new InternalServerErrorException({ msg: err.message });
  }
};

const jwtIsValid = async (token) => {
  try {
    if (!token) {
      return false;
    }
    const isValid = jwt.verify(token, process.env.JWT_SECRET);
    if (isValid) {
      return isValid;
    } else {
      return false;
    }
  } catch (err) {
    return false
  }
};

//generate new referral code
function generateReferralCode(firstName, length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = firstName;
  const charsetLength = charset.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsetLength);
    referralCode += charset[randomIndex];
  }

  return referralCode;
}

//below function makes sure the above generated referral code doesn't already exist in the database
async function generateUniqueReferralCode(userId, userFirstName) {
  let unique = false;
  let referralCode = "";

  while (!unique) {
    referralCode = generateReferralCode(userFirstName, 4);
    const existingUser = await ReferralCode.findOne({ referrer: userId });
    if (!existingUser?.referralCode) {
      unique = true;
    }
  }

  return referralCode;
}

const populateFAQ = async () => {
  const count = await FAQ.countDocuments();

  if (count === 0) {
    // await currencyRepository.save(currencyData);
    await FAQ.create([
      {
        question: "How much can I fund my wallet with?",
        answer: "You can fund your wallet with N1000 and above",
      },
      {
        question: "Where do I pay to?",
        answer:
          "Click on Fund Wallet tab on your dashboard for instructions on how to fund your wallet",
      },
      {
        question: "How long does it take for my money to reflect in my wallet",
        answer:
          "Once we receive confirmation of your payment via our WhatsApp contact, we will fund your online wallet immediately",
      },
      {
        question:
          "How do i reach you for complaints, recommendations or questions?",
        answer:
          "On your dashboard, click on 'Contact Us'. We have multiple media through which you can get to us. Our response time is almost immediate",
      },
      {
        question: "How do I withdraw my money?",
        answer:
          "Withdrawing is extremely easy. Click on 'Withdraw' in your dashboard. Fill the form with the amount and the bank details you want us to send the money to. We will receive your request and process it within few hours, sometimes in less than thirty minutes.",
      },
      {
        question: "How much can I withdraw?",
        answer: "You can withdraw N5000 and above.",
      },
      {
        question:
          "How long does it take for withdrawals to show in my bank account?",
        answer:
          "Once we receive your request, we queue it and process it within an hour.",
      },
      {
        question: "How much do I make on referrals",
        answer:
          "Your accumulated earnings from referrals can be much bigger than any amount you can generate personally. You earn a percentage from every of your downlines' activities. It's our way of saying thank you for helping the community of investors grow",
      },
      {
        question: "How do i have access to my referral earnings",
        answer:
          "On your dashboard, click on Referrals. You'll be led to a page displaying your referral code (which you should share with your invitees to use during their registration). You will also see your referral earning (a product of the activities from everyone you've invited). Lastly, you will find a list of your invitees on this page.",
      },
      {
        question:
          "How much can I transfer from my referral wallet to my main wallet",
        answer:
          "You can transfer more than 50 naira and above to your main wallet. There are no upper limits",
      },
      {
        question:
          "I invited someone but they failed to use my referral code or they entered the wrong one. What do I do?",
        answer:
          "Reach out to us with evidence that you invited them. We will rectify the problem IMMEDIATELY",
      },
    ]);

    console.log("FAQ collection has been populated with initial data.");
  }
};

const populateContacts = async () => {
  const count = await Contacts.countDocuments();

  if (count === 0) {
    await Contacts.create({
      phone: ["08067268692", "08043676366"],
      email: ["extracash@gmail.com"],
      whatsapp: ["08067268692", "08043676366"],
    });
    console.log("contacts collection filled with initial data");
  }
};

const populateFundingDetails = async () => {
  const count = await FundingDetails.countDocuments();

  if (count === 0) {
    await FundingDetails.create({
      fundingDetails: [
        {
          accountNumber: "0037497074",
          accountBank: "GTBank",
          accoutName: "Ezeani Chukwudi",
        },
      ],
      whatsAppNumber: "08067268692",
    });
    console.log("fundingDetails collection populated with initial data");
  }
};

module.exports = {
  increaseWallet,
  decreaseWallet,
  createJwt,
  jwtIsValid,
  generateUniqueReferralCode,
  populateFAQ,
  populateContacts,
  populateFundingDetails,
};
