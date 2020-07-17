const express = require('express');

const router = express.Router();

const userController =require('../controllers/userController');

router.post('/signup',userController.user_signup)
router.post('/login',userController.user_login)
router.delete("/userDeletion/:email/:admin_email",userController.delete_user)
router.get('/upcomingBirthday',userController.upcoming_birthday_user);
router.get('/allUsers',userController.get_all_users);
router.get('/verification/:email/:token',userController.after_clicked_on_verify_email)
module.exports=router
