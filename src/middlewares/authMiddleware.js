module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // Käyttäjä on tunnistautunut, päästetään eteenpäin
  } else {
    res.status(401).json({ message: 'Pääsy kielletty. Kirjaudu sisään.' });
  }
};