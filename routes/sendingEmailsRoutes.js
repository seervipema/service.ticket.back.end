const express = require('express');

const router = express.Router();

const sendingEmailController = require('../controllers/sending.email.Controller');

router.post('/couponCode',sendingEmailController.send_email_with_coupon_code);
router.get('/reset-password/:email/:token',sendingEmailController.after_user_clicked_reset_password_in_email);
router.post('/reset-password',sendingEmailController.save_reset_password);
module.exports =router;