const express = require("express");
const router = express.Router();
const {
  getTransactionReport,
  getAgentTransactions,
} = require("../controllers/reportController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/transactions", verifyJWT, getTransactionReport);
router.get("/agent-transactions", verifyJWT, getAgentTransactions);

module.exports = router;
