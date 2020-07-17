var express = require('express');
var router = express.Router();
const check_auth= require('../middlewares/check-auth.js')

const fileController = require('../controllers/files.controller');

router.get('/other-document-latest',fileController.sending_latest_other_document_file);
router.post('/upload',fileController.upload_file);
router.post('/download',fileController.download_file);
router.get('/getFilesNames',fileController.send_all_files_name);
router.post('/delete',fileController.delete_file);
router.post('/upload-other-document',fileController.upload_other_document_file);
router.post('/download-other-document',fileController.download_other_document_file);
router.get('/get-other-document-files-names',fileController.send_all_other_document_files_name);
router.post('/delete-other-document',fileController.delete_other_document_file);
router.post('/file',fileController.file_sending);



module.exports=router;