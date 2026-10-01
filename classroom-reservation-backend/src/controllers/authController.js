const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Регистрация
exports.register = async (req, res) => {
  const { nimi, sahkoposti, salasana } = req.body;

  if (!nimi || !sahkoposti || !salasana) {
    return res.status(400).json({ message: 'Заполните все поля' });
  }

  try {
    // Проверяем, существует ли пользователь
    const [existingUser] = await pool.query('SELECT * FROM Kayttajat WHERE sahkoposti = ?', [sahkoposti]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(salasana, salt);

    // Сохраняем в БД (по умолчанию роль 'student')
    const [result] = await pool.query(
      'INSERT INTO Kayttajat (nimi, sahkoposti, salasana, rooli) VALUES (?, ?, ?, ?)',
      [nimi, sahkoposti, hashedPassword, 'student']
    );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован', userId: result.insertId });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Вход в систему (Login)
exports.login = async (req, res) => {
  const { sahkoposti, salasana } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM Kayttajat WHERE sahkoposti = ?', [sahkoposti]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const user = users[0];

    // Проверяем пароль
    const isMatch = await bcrypt.compare(salasana, user.salasana);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Сохраняем данные пользователя в сессию (Express автоматический отправит куку!)
    req.session.user = {
      id: user.kayttaja_id,
      nimi: user.nimi,
      sahkoposti: user.sahkoposti,
      rooli: user.rooli
    };

    res.json({ message: 'Успешный вход', user: req.session.user });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение текущего профиля (Me)
exports.getMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Не авторизован' });
  }
  res.json(req.session.user);
};

// Выход из системы (Logout)
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Не удалось выйти из системы' });
    }
    res.clearCookie('session_cookie_name');
    res.json({ message: 'Вы успешно вышли' });
  });
};