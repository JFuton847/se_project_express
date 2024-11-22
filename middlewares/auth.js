const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Ensure this is consistent

const auth = (req, res, next) => {
  // Skip authorization for these routes
  const excludedRoutes = ["/signin", "/signup"];
  const isExcluded = excludedRoutes.some((route) =>
    req.originalUrl.startsWith(route)
  );

  if (isExcluded) {
    return next();
  }

  // Get token from Authorization header
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required" });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Add user data to request for downstream access
    return next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = auth;
