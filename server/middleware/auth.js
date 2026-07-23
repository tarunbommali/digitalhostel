const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: "No authorization token, access denied" });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Malformed authorization token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found, auth failed" });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: "User account is disabled" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token is invalid or expired" });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied: forbidden role" });
    }
    // Restrict Attendance-Only Moderators from non-attendance routes
    if (
      req.user.role === "moderator" &&
      req.user.moderatorType === "attendance_only" &&
      !req.baseUrl.includes("/attendance")
    ) {
      return res.status(403).json({
        error: "Access denied: Attendance-only moderator privilege restriction",
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
