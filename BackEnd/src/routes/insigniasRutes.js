const express = require('express');
const router = express.Router();
const insigniasController = require('../controllers/insigniasController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });


module.exports = router;
