const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Все админские маршруты требуют и авторизации, и роли admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/classrooms', adminController.createClassroom);
router.get('/reservations', adminController.getAllReservations);

module.exports = router;