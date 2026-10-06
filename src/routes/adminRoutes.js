const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Kaikki ylläpitäjän reitit vaativat sekä tunnistautumisen että admin-roolin
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/classrooms', adminController.createClassroom);
router.get('/reservations', adminController.getAllReservations);

//router.get('/', "../../index.html");

module.exports = router;