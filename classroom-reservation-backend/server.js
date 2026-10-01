const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

// Подключение к базе данных MySQL
const pool = require('./src/config/db');

// Импорт маршрутов
const classroomRoutes = require('./src/routes/classroomRoutes');
const authRoutes = require('./src/routes/authRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка хранилища сессий в MySQL
const sessionStore = new MySQLStore({}, pool);

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // URL вашего фронтенд-приложения
  credentials: true // Обязательно для передачи Cookie между клиентом и сервером
}));

app.use(express.json());

// Настройка сессий (Session Middleware)
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'super_secret_session_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Сессия действительна 24 часа
    httpOnly: true, // Защита от доступа через JavaScript (XSS)
    secure: false,  // true только при использовании HTTPS
    sameSite: 'lax'
  }
}));

// Регистрация маршрутов API
app.use('/api/classrooms', classroomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Palvelin on käynnistetty portissa ${PORT}`);
});