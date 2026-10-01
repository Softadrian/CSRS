const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

// Подключение к БД
const pool = require('./src/config/db');

const classroomRoutes = require('./src/routes/classroomRoutes');
const authRoutes = require('./src/routes/authRoutes'); // Подключим далее

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка хранилища сессий в MySQL
const sessionStore = new MySQLStore({}, pool);

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // URL фронтенда (React/Vue/etc.)
  credentials: true // Обязательно для передачи кук между фронтом и бэком!
}));

app.use(express.json());

// Настройка сессий
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'super_secret_session_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Сессия живет 1 день (в миллисекундах)
    httpOnly: true, // Защита от XSS (JS на фронте не имеет доступа к куке)
    secure: false,  // true только для HTTPS (на localhost ставим false)
    sameSite: 'lax'
  }
}));

// Подключение роутов
app.use('/api/classrooms', classroomRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});