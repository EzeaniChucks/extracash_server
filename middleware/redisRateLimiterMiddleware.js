const redis = require("redis");
const { HttpBadRequest } = require("../util/responses");
const redisClient = redis.createClient()
// const redisClient = require('../redis/redisClient') // Initialize Redis redisClient

// Middleware to rate limit based on admin-user combination
const redisRateLimitCreditUser = (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return HttpBadRequest(res, "userId must be present in request body");
  }
  // const adminId = req.adminId; // Assuming you have a way to identify the admin (e.g., via a JWT or session)

  // const rateLimitKey = `credit:${adminId}:${userId}`; // Unique key for each admin-user combination
  const rateLimitKey = `credit:${userId}`; // Unique key for user

  redisClient.get(rateLimitKey, (err, lastRequestTime) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });

    const now = Date.now();
    const oneMinute = 60 * 1000; // 1 minute in milliseconds

    if (lastRequestTime && now - lastRequestTime < oneMinute) {
      return res.status(429).json({
        message: "Too many requests. Please wait before trying again.",
      });
    }

    // Set the new timestamp for the rate limit key
    redisClient.set(rateLimitKey, now, "EX", 60); // Expire key after 60 seconds
    next();
  });
};

module.exports = redisRateLimitCreditUser;
