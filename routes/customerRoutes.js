const express = require('express');
const router = express.Router();
const { onboardCustomer, getCustomers } = require('../controllers/customerController');
const verifyJWT = require('../middleware/verifyJWT');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/onboard', verifyJWT,  onboardCustomer);
router.get('/', verifyJWT,  getCustomers);

module.exports = router;
