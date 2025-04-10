const express = require('express');
const router = express.Router();
const { onboardCustomer } = require('../controllers/customerController');
const verifyJWT = require('../middleware/verifyJWT');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/onboard', verifyJWT, upload.single('photo'), onboardCustomer);

module.exports = router;
