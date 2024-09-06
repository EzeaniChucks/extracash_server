const { jwtIsValid } = require("../util/helpers");
const Users = require("../schema/authSchema");
const { HttpServerError, HttpForbidden } = require("../util/responses");

const userStatusCheckerMiddleware = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return HttpForbidden(
        res,
        "token issue: Unauthorized. No bearer token sent"
      );
    }

    const isValid = await jwtIsValid(token);
    if (!isValid) {
      return HttpForbidden(res, "token issue: Expired token");
    } else {
      if (typeof isValid !== "string") {
        const user = await Users.findOne({ _id: isValid?._id });
        if (user) {
          req.user = user;
          next();
        } else {
          HttpForbidden(res, "token issue: Forbidden request.");
        }
      } else {
        return HttpForbidden(res, "token issue: Invalid token received.");
      }
    }
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

module.exports = userStatusCheckerMiddleware;
