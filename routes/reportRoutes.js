const express = require("express");
const router = express.Router();
const { getTransactionReport } = require("../controllers/reportController");
const verifyJWT = require("../middleware/verifyJWT");

router.get("/transactions", verifyJWT, getTransactionReport);

module.exports = router;
