const express = require('express');
const router = express.Router();
const path = require('path'); 
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

router.post('/classrooms', adminController.createClassroom);
router.get('/reservations', adminController.getAllReservations);
router.delete('/classrooms/:id', adminController.deleteClassroom);

module.exports = router;