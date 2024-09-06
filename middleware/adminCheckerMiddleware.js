const { jwtIsValid } = require("../util/helpers");
const Users = require("../schema/authSchema");
const { HttpServerError, HttpForbidden } = require("../util/responses");

const adminStatusCheckMiddleware = async (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
      return HttpForbidden(res, "Unauthorized request. No bearer token sent");
    }

    const isValid = await jwtIsValid(token);
    if (!isValid) {
      return HttpForbidden(res, "expired token");
    } else {
      if (typeof isValid !== "string" && isValid?.isAdmin) {
        const admin = await Users.findOne({ _id: isValid?._id });
        if (admin?.isAdmin) {
          req.admin = admin
          next();
        } else {
          HttpForbidden(res, "unauthorized request.");
        }
      } else {
        return HttpForbidden(res, "unauthorized request.");
      }
    }
  } catch (err) {
    return HttpServerError(res, err?.message);
  }
};

module.exports = adminStatusCheckMiddleware;
