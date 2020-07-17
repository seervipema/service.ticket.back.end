const express = require('express');

const router = express.Router();

const pdfController = require('../controllers/pdf.controller');

const check_auth = require('../middlewares/check-auth');

router.get('/pdf',check_auth,pdfController.get_pdf_download_directly);
router.get('/download',check_auth,pdfController.download_pdf_data);

module.exports= router;