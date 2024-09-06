// redisClient.js
const { createClient } = require("redis");

// Create and configure the Redis client
const redisClient = createClient();

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
