require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const adminRoutes = require('./src/routes/adminRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Swagger-dokumentointitiedoston lataaminen
const swaggerDocument = YAML.load('./swagger.yaml');

// Yhdistäminen MySQL-tietokantaan
const pool = require('./src/config/db');

// Reittien tuonti
const classroomRoutes = require('./src/routes/classroomRoutes');
const authRoutes = require('./src/routes/authRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Istuntojen tallennuksen määritys MySQL-tietokantaan
const sessionStore = new MySQLStore({}, pool);

// Middlewares
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));
app.use(express.json());

// Istuntojen hallintaohjelmiston (Session Middleware) määritys
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

// Asetetaan Swagger UI -dokumentaatio osoitteeseen /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API-reittien rekisteröinti
app.use('/api/classrooms', classroomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// Olemattomien reittien käsittely (404)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Globaali virheenkäsittelijä (500)
app.use((err, req, res, next) => {
  console.error('Необработанная ошибка сервера:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Palvelimen käynnistys
app.listen(PORT, () => {
  console.log(`Palvelin on käynnistetty portissa ${PORT}`);
});