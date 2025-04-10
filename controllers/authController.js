const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

let users = []; // Mock DB — replace with actual DB calls

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const secret = speakeasy.generateSecret({ name: `AgencyBanking (${email})` });

  const user = {
    id: Date.now(),
    name,
    email,
    password: hashed,
    secret: secret.base32,
  };
  users.push(user);

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  res.json({ message: "Registered successfully", qrCodeUrl });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  // Don't issue JWT yet — wait for 2FA
  res.json({ message: "2FA required", userId: user.id });
};

exports.verify2FA = (req, res) => {
  const { userId, token } = req.body;
  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ message: "User not found" });

  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: "base32",
    token,
  });

  if (!verified) return res.status(401).json({ message: "Invalid 2FA token" });

  const jwtToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token: jwtToken });
};
