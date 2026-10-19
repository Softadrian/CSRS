
const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Kaikki reitit vaativat kirjautumisen ja ylläpitäjän oikeudet
router.use(authMiddleware);
router.use(adminMiddleware);

// Luokkahuoneiden hallinta
router.post('/classrooms', adminController.createClassroom);
router.delete('/classrooms/:id', adminController.deleteClassroom);

// Varausten hallinta
router.get('/reservations', adminController.getAllReservations);

module.exports = router;
