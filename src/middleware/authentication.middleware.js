const expressAsyncHandler = require("express-async-handler");
const jwtServices = require("../utils/jwtServices");
const responseStatusCodes = require("../utils/responseStatusCode");
const sendResponse = require("../utils/sendResponse");
// Assuming you have defined a type or interface for encryptData

const authentication = async (req, res, next) => {
  if (
    req.url.startsWith("/api/test") ||
    req.url.endsWith("refreshToken") ||
    req.url.endsWith("login") ||
    req.url.endsWith("register")
  ) {
    console.log("if case");
    next();
    return;
  } else {
    console.log("else case");
    const authorization = req.headers.authorization;
    if (authorization) {
      try {
        const token = authorization.slice(7); // Remove "Bearer " prefix
        if (token) {
          const tokenData = await jwtServices.authenticate(token);
          if (tokenData) {
            req.query.userId = tokenData?.userId;
            req.query.role = tokenData?.type;
            next();
            return;
          } else {
            await sendResponse(
              res,
              responseStatusCodes.UNAUTHORIZED,
              "Authentication failed!",
              false,
              null,
              null
            );
            return;
          }
        } else {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            "Authentication failed!",
            false,
            null,
            null
          );
          return;
        }
      } catch (error) {
        console.log("error: ", error);
        if (error.message === "jwt expired") {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            "Authentication failed!",
            false,
            null,
            null
          );
          return;
        } else {
          await sendResponse(
            res,
            responseStatusCodes.UNAUTHORIZED,
            error.message,
            false,
            null,
            null
          );
          res.status(401).send({ msg: error.message });
          return;
        }
      }
    } else {
      await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "Authentication failed!",
        false,
        null,
        null
      );
      return;
    }
  }
};

module.exports = authentication;

exports.authUser = expressAsyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header and remove "Bearer"
    const authorizationHeader = req.header("Authorization");
    const token = authorizationHeader ? authorizationHeader.slice(7) : null;

    // Check if token exists
    if (!token) {
      return await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "No Token. Access Denied",
        false,
        null,
        null
      );
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (error, decodedUser) => {
      if (error) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Authorization. Access Denied",
          false,
          null,
          error.message
        );
      }

      // Find user by ID
      const userData = await findUserById(decodedUser.id);
      const adminUser = await adminUserServices.getOne(decodedUser.id);

      // Check if user or admin user exists
      if (!userData && !adminUser) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Authentication Failed!",
          false,
          null,
          null
        );
      }
      // Check if the user's email is verified
      if (userData && !userData.isVerified) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Email not verified. Authentication Failed!",
          false,
          null,
          null
        );
      }

      // If authentication is successful, attach user to request and proceed
      req.user = decodedUser;
      next();
    });
  } catch (error) {
    console.error(error);
    return await sendResponse(
      res,
      responseStatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      false,
      null,
      error.message
    );
  }
});

exports.authAdmin = expressAsyncHandler(async (req, res, next) => {
  try {
    // Get token from Authorization header and remove "Bearer"
    const authorizationHeader = req.header("Authorization");
    const token = authorizationHeader ? authorizationHeader.slice(7) : null;

    // Check if token exists
    if (!token) {
      return await sendResponse(
        res,
        responseStatusCodes.UNAUTHORIZED,
        "No Token. Access Denied",
        false,
        null,
        null
      );
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (error, decodedUser) => {
      if (error) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Invalid Authorization. Access Denied",
          false,
          null,
          null
        );
      }

      // Find user in adminUserServices by user ID
      const userData = await adminUserServices.getOne(decodedUser?.id);
      if (!userData) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Authentication Failed!",
          false,
          null,
          null
        );
      }

      // Check if the user has a role
      if (!userData?.role) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Access Denied. No role is assigned to this user",
          false,
          null,
          null
        );
      }

      // Restrict permissions for certain API routes to super-admin only
      if (
        req.originalUrl.startsWith("/api/permission") &&
        (req.method === "POST" || req.method === "DELETE") &&
        userData?.role.role !== "super-admin"
      ) {
        return await sendResponse(
          res,
          responseStatusCodes.UNAUTHORIZED,
          "Access Denied. Super admin only",
          false,
          null,
          null
        );
      }

      // Attach user and role to request object
      req.user = decodedUser;
      req.user.role = userData?.role.role;
      next();
    });
  } catch (error) {
    console.error(error);
    return await sendResponse(
      res,
      responseStatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      false,
      null,
      error.message
    );
  }
});
