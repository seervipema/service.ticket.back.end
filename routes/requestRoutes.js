var express = require('express');
var router = express.Router();
var requestController= require('../controllers/request.controller');


router.post('/request',requestController.store_request_details);
router.get('/request/:email',requestController.get_request_details);
router.put('/request',requestController.resolve_request);
router.get('/request/admin/:email',requestController.get_request_details_for_admin);
module.exports=router;