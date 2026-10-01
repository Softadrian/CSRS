module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // Пользователь авторизован, пропускаем дальше
  } else {
    res.status(401).json({ message: 'Pääsy kielletty. Kirjaudu sisään.' });
  }
};