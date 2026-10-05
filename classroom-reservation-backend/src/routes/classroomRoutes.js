const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');

// Reitit
router.get('/', classroomController.getAllClassrooms);
router.get('/:id/seats', classroomController.getClassroomSeats);

module.exports = router;