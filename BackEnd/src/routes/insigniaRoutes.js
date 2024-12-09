const express = require('express');
const router = express.Router();
const insigniaController = require('../controllers/insigniaController');
const multer = require('multer');


router.get('/insigniasLogradas', insigniaController.obtenerLogradas);


module.exports = router;