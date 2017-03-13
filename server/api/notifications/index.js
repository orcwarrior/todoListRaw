/**
 * Created by Dariusz on 2017-02-21.
 */
const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller.js');

router.get('/publicKey', controller.getPublicKey);
router.post('/subscribe', controller.subscribe);
exports = module.exports = router;
