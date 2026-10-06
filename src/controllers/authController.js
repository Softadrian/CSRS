
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Rekisteröinti
exports.register = async (req, res) => {
  const { nimi, sahkoposti, salasana } = req.body;

  if (!nimi || !sahkoposti || !salasana) {
    return res.status(400).json({
      message: 'Täytä kaikki kentät'
    });
  }

  try {
    // Tarkistetaan, onko käyttäjä jo olemassa
    const [existingUser] = await pool.query(
      'SELECT * FROM Kayttajat WHERE sahkoposti = ?',
      [sahkoposti]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: 'Tällä sähköpostilla on jo käyttäjä'
      });
    }

    // Salataan salasana
    const hashedPassword = await bcrypt.hash(salasana, 10);

    // Tallennetaan salasana oikeaan sarakkeeseen
    const [result] = await pool.query(
      `INSERT INTO Kayttajat
       (nimi, sahkoposti, salasanan_hash, rooli)
       VALUES (?, ?, ?, ?)`,
      [nimi, sahkoposti, hashedPassword, 'student']
    );

    res.status(201).json({
      message: 'Rekisteröinti onnistui',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Virhe rekisteröinnissä:', error);

    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};


// Kirjautuminen
exports.login = async (req, res) => {
  const { sahkoposti, salasana } = req.body;

  if (!sahkoposti || !salasana) {
    return res.status(400).json({
      message: 'Anna sähköposti ja salasana'
    });
  }

  try {
    // Etsitään käyttäjä sähköpostilla
    const [users] = await pool.query(
      'SELECT * FROM Kayttajat WHERE sahkoposti = ?',
      [sahkoposti]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: 'Virheellinen sähköposti tai salasana'
      });
    }

    const user = users[0];

    // Tarkistetaan salasana
    const isMatch = await bcrypt.compare(
      salasana,
      user.salasanan_hash
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Virheellinen sähköposti tai salasana'
      });
    }

    // Tallennetaan käyttäjä sessioon
    req.session.user = {
      id: user.kayttaja_id,
      nimi: user.nimi,
      sahkoposti: user.sahkoposti,
      rooli: user.rooli
    };

    res.json({
      message: 'Kirjautuminen onnistui',
      user: req.session.user
    });

  } catch (error) {
    console.error('Virhe kirjautumisessa:', error);

    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};


// Nykyinen käyttäjä
exports.getMe = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: 'Et ole kirjautunut sisään'
    });
  }

  res.json(req.session.user);
};


// Uloskirjautuminen
exports.logout = (req, res) => {
  req.session.destroy((err) => {

    if (err) {
      return res.status(500).json({
        message: 'Uloskirjautuminen epäonnistui'
      });
    }

    res.clearCookie('session_cookie_name');

    res.json({
      message: 'Uloskirjautuminen onnistui'
    });
  });
};
