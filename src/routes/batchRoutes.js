const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.get('/ready', batchController.getReadyForBatch);
router.post('/', batchController.createBatch);

module.exports = router;
