const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const {
  registerAgent,
  loginAgent,
  getProfile,
  getAllAgents,
} = require("../controllers/agentController");

router.post("/login", loginAgent);
router.get("/me", verifyJWT, getProfile);
router.post("/register", registerAgent);
router.get("/", verifyJWT, getAllAgents);

module.exports = router;
