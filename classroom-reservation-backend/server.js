const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Проверка подключения к БД
require('./src/config/db');

const classroomRoutes = require('./src/routes/classroomRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Подключение роутов
app.use('/api/classrooms', classroomRoutes);

// Проверочный роут
app.get('/', (req, res) => {
  res.json({ message: 'API системы бронирования мест работает!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});