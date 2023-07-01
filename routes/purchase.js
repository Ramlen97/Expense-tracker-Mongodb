const express = require('express');
const purchaseController = require('../controllers/purchase');
const userAuthentcation = require('../middleware/auth');

const router = express.Router();

router.get('/premiummembership', userAuthentcation, purchaseController.getPremiumMembership);

router.post('/updatetransaction',userAuthentcation,purchaseController.postUpdateTransaction);

module.exports = router;
