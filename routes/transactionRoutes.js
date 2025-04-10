const express = require('express');
const router = express.Router();
const { getTransactions } = require('../controllers/transactionController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/', getTransactions);

module.exports = router;
