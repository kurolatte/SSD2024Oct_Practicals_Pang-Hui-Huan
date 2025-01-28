const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function registerUser(req, res) {
  const { username, password, role } = req.body;

  try {
    // Validate user data
    const validationErrors = validateUserData(username, password, role);
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ message: "Invalid user data", errors: validationErrors });
    }

    // Check for existing username
    const existingUser = await User.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const user = await User.createUser(username, hashedPassword, role);
    return res
      .status(201)
      .json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err });
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // Validate user credentials
    const user = await User.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES || "1h",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err });
  }
}

function validateUserData(username, password, role) {
  const errors = [];

  if (!username || username.trim() === "") {
    errors.push("Username is required");
  }

  if (!password || password.trim() === "") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!role || role.trim() === "") {
    errors.push("Role is required");
  } else if (!["member", "librarian"].includes(role.toLowerCase())) {
    errors.push("Invalid role. Valid roles: member, librarian");
  }

  return errors;
}

module.exports = {
  registerUser,
  login,
};
