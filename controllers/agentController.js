const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

exports.registerAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if agent already exists
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `AgencyBanking (${email})`,
    });

    // Save agent
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, twofa_secret) VALUES ($1, $2, $3) RETURNING *`,
      [email, hashedPassword, secret.base32]
    );

    // Generate QR code
    const otpauthURL = secret.otpauth_url;
    const qr = await qrcode.toDataURL(otpauthURL);

    res.status(201).json({
      message: "Agent registered",
      qrCode: qr,
      base32: secret.base32,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.loginAgent = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Agent not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: "base32",
      token: token,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid 2FA token" });
    }

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login successful", token: jwtToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

exports.getAllAgents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email FROM users ORDER BY id"
    );
    res.json({ agents: result.rows });
  } catch (err) {
    console.error("Error fetching agents:", err);
    res.status(500).json({ message: "Failed to fetch agents" });
  }
};
