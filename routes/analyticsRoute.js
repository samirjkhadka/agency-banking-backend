const express = require("express");
const router = express.Router();
const {
  getAgentSummary,
  getCustomerSummary,
  getDailyTransactions,
} = require("../controllers/analyticsController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/agent-summary", verifyJWT, getAgentSummary);
router.get("/customer-summary/:customer_id", getCustomerSummary);
router.get("/daily-transactions", getDailyTransactions);

module.exports = router;
