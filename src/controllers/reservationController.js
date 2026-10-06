const pool = require('../config/db');

// Luo varaus
exports.createReservation = async (req, res) => {
  const { paikka_id, ajankohta } = req.body;

  if (!paikka_id || !ajankohta) {
    return res.status(400).json({
      message: 'Ilmoita paikan ID ja päivämäärä'
    });
  }

  const kayttaja_id = req.session.user.id;

  try {
    // Tarkista, että paikka on olemassa
    const [seat] = await pool.query(
      'SELECT * FROM Luokkahuoneen_paikat WHERE lp_id = ?',
      [paikka_id]
    );

    if (seat.length === 0) {
      return res.status(404).json({
        message: 'Paikkaa ei löytynyt'
      });
    }

    // Tarkista, onko paikka jo varattu kyseisenä päivänä
    const [existing] = await pool.query(
      `SELECT * FROM Varaukset
       WHERE paikka_id = ?
       AND DATE(ajankohta) = ?
       AND status = 'active'`,
      [paikka_id, ajankohta]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Tämä paikka on jo varattu valittuna päivänä.'
      });
    }

    // Luo varaus
    const [result] = await pool.query(
      `INSERT INTO Varaukset
       (kayttaja_id, paikka_id, ajankohta, status)
       VALUES (?, ?, ?, 'active')`,
      [kayttaja_id, paikka_id, `${ajankohta} 00:00:00`]
    );

    res.status(201).json({
      message: 'Paikka on varattu onnistuneesti',
      varaus_id: result.insertId
    });
  } catch (error) {
    console.error('Virhe varauksen luomisessa:', error);
    res.status(500).json({
      message: 'Palvelinvirhe varausta tehtäessä'
    });
  }
};

// Hae nykyisen käyttäjän varaukset
exports.getMyReservations = async (req, res) => {
  const kayttaja_id = req.session.user.id;

  try {
    const [reservations] = await pool.query(
      `SELECT
        v.varaus_id,
        v.ajankohta,
        k.nimi AS student_nimi,
        l.nimi AS luokka_nimi,
        lp.rivin_numero,
        lp.paikka_numero
       FROM Varaukset v
       JOIN Kayttajat k
         ON v.kayttaja_id = k.kayttaja_id
       JOIN Luokkahuoneen_paikat lp
         ON v.paikka_id = lp.lp_id
       JOIN Luokkahuoneet l
         ON lp.luokka_id = l.luokka_id
       WHERE v.kayttaja_id = ?
       AND v.status = 'active'
       ORDER BY v.ajankohta ASC`,
      [kayttaja_id]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Virhe varausten hakemisessa:', error);
    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};

// Peruuta varaus
exports.deleteReservation = async (req, res) => {
  const varaus_id = req.params.id;
  const kayttaja_id = req.session.user.id;

  try {
    const [reservation] = await pool.query(
      `SELECT * FROM Varaukset
       WHERE varaus_id = ?
       AND kayttaja_id = ?
       AND status = 'active'`,
      [varaus_id, kayttaja_id]
    );

    if (reservation.length === 0) {
      return res.status(404).json({
        message: 'Varausta ei löytynyt tai sinulla ei ole oikeutta peruuttaa sitä.'
      });
    }

    await pool.query(
      `UPDATE Varaukset
       SET status = 'cancelled'
       WHERE varaus_id = ?`,
      [varaus_id]
    );

    res.json({
      message: 'Varaus on peruutettu onnistuneesti'
    });
  } catch (error) {
    console.error('Virhe varauksen peruutuksessa:', error);
    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};