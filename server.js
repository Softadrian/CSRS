
require('dotenv').config();
const path = require('path');
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

// Istuntojen tallennus MySQL-tietokantaan
const sessionStore = new MySQLStore({}, pool);

// Middlewares
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());

// Session
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'super_secret_session_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// API-reitit
app.use('/api/classrooms', classroomRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Reittiä ei löytynyt' });
});

// 500
app.use((err, req, res, next) => {
  console.error('Käsittelemätön palvelinvirhe:', err);
  res.status(500).json({ message: 'Sisäinen palvelinvirhe' });
});

// Käynnistetään palvelin
app.listen(PORT, () => {
  console.log(`Palvelin on käynnistetty portissa ${PORT}`);
});

