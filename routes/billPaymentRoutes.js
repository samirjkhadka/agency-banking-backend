const express = require("express");
const router = express.Router();
const {
payBill
} = require("../controllers/billPaymentController");
const verifyJWT = require("../middleware/verifyJWT");

router.post("/pay", verifyJWT, payBill);


module.exports = router;
