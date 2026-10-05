const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Kaikki varausreitit vaativat tunnistautumisen
router.use(authMiddleware);

router.post('/', reservationController.createReservation);
router.get('/my', reservationController.getMyReservations);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;