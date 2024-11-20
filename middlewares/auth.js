const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Make sure to set this in your environment variables

const auth = (req, res, next) => {
  // Skip authorization for these routes
  const excludedRoutes = ["/signin", "/signup", "/items"];

  if (excludedRoutes.includes(req.originalUrl)) {
    return next();
  }

  // Get token from Authorization header
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = auth;
