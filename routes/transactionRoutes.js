const express = require("express");
const router = express.Router();
const {
  getTransactions,
  depositCash,
} = require("../controllers/transactionController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/deposit", verifyJWT, depositCash);

module.exports = router;
