const express = require('express');
const router = express.Router();
const healthController = require('../app/controllers/HealthController');

router.get('/', healthController.health_get);
router.post('/', healthController.health_post);


module.exports = router;
