module.exports = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.rooli === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Pääsy kielletty. Vaaditaan pääkäyttäjän oikeudet.' });
  }
};