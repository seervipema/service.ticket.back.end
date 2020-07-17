const express= require('express')
const router = express.Router();

const adminController =require('../controllers/admin.controller');

router.post('/',adminController.create_holiday);
router.delete('/:holiday_date',adminController.delete_holiday);
router.get('/',adminController.get_all_holidays);

module.exports=router