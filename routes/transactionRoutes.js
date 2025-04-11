const express = require("express");
const router = express.Router();
const {
  getTransactions,
  depositCash,
  withdrawCash,
  fundTransfer,
  payBill,
} = require("../controllers/transactionController");
const verifyJWT = require("../middleware/verifyJWT");

router.post("/deposit", verifyJWT, depositCash);
router.post("/withdraw", verifyJWT, withdrawCash);
router.post("/transfer", verifyJWT, fundTransfer);
router.post("/bill-payment", verifyJWT, payBill);

module.exports = router;
