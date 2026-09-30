const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Tietokantayhteyden tarkistus
require('./src/config/db');

const classroomRoutes = require('./src/routes/classroomRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Reittien yhdistäminen
app.use('/api/classrooms', classroomRoutes);

// Testireitti
app.get('/', (req, res) => {
  res.json({ message: 'API системы бронирования мест работает!' });
});

// Palvelimen käynnistys
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});