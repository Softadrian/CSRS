const express = require('express');
const router = express.Router();
const path = require('path'); // Добавляем модуль path для работы с путями
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Если index.html должен быть доступен ТОЛЬКО администраторам, 
// оставляем проверки выше роута:
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/ — возвращает файл index.html из корня проекта
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../index.html'));
});

// Остальные API-маршруты администратора
router.post('/classrooms', adminController.createClassroom);
router.get('/reservations', adminController.getAllReservations);

module.exports = router;