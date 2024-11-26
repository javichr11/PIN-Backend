const express = require('express');
const router = express.Router();
const eventController = require('../controllers/insigniaController.js');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = router;