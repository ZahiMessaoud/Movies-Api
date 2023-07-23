const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const middleware = require('../middlewares/auth');

router.post('/login', controller.login)
router.post('/register', controller.register)
router.get('/me', middleware.check, controller.me) 


module.exports = router;
