const jwt = require("jsonwebtoken");

function verifyJWT(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userRole = decoded.role;
    const isAuthorized =
      (req.path.startsWith("/books") && ["member", "librarian"].includes(userRole)) ||
      (req.path.includes("/availability") && userRole === "librarian");

    if (!isAuthorized) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = verifyJWT;
