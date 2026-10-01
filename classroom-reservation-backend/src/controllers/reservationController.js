const pool = require('../config/db');

// 1. Создать бронирование
exports.createReservation = async (req, res) => {
  const { paikka_id, ajankohta } = req.body;
  const kayttaja_id = req.session.user.id; // Берем ID из текущей сессии

  if (!paikka_id || !ajankohta) {
    return res.status(400).json({ message: 'Ilmoita paikan ID ja päivämäärä' });
  }

  try {
    // Проверяем, не забронировано ли уже это место на указанную дату
    const [existing] = await pool.query(
      'SELECT * FROM Varaukset WHERE paikka_id = ? AND ajankohta = ?',
      [paikka_id, ajankohta]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tämä paikka on jo varattu valittuna päivänä.' });
    }

    // Создаем запись о бронировании
    const [result] = await pool.query(
      'INSERT INTO Varaukset (kayttaja_id, paikka_id, ajankohta) VALUES (?, ?, ?)',
      [kayttaja_id, paikka_id, ajankohta]
    );

    res.status(201).json({
      message: 'Paikka on varattu onnistuneesti',
      varaus_id: result.insertId
    });
  } catch (error) {
    console.error('Virhe varauksen luomisessa: ', error);
    res.status(500).json({ message: 'Palvelinvirhe varausta tehtäessä' });
  }
};

// 2. Получить бронирования текущего пользователя
exports.getMyReservations = async (req, res) => {
  const kayttaja_id = req.session.user.id;

  try {
    const [reservations] = await pool.query(
      `SELECT v.varaus_id, v.ajankohta, lp.rivin_numero, lp.paikka_numero, l.nimi AS luokka_nimi
       FROM Varaukset v
       JOIN LuokanPaikat lp ON v.paikka_id = lp.lp_id
       JOIN Luokkahuoneet l ON lp.luokka_id = l.luokka_id
       WHERE v.kayttaja_id = ?
       ORDER BY v.ajankohta ASC`,
      [kayttaja_id]
    );

    res.json(reservations);
  } catch (error) {
    console.error('Virhe varausten hakevissa: ', error);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};

// 3. Отменить бронирование
exports.deleteReservation = async (req, res) => {
  const varaus_id = req.params.id;
  const kayttaja_id = req.session.user.id;

  try {
    // Проверяем, принадлежит ли бронирование текущему пользователю
    const [reservation] = await pool.query(
      'SELECT * FROM Varaukset WHERE varaus_id = ? AND kayttaja_id = ?',
      [varaus_id, kayttaja_id]
    );

    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Varausta ei löytynyt или sinulla ei ole oikeutta peruuttaa sitä.' });
    }

    await pool.query('DELETE FROM Varaukset WHERE varaus_id = ?', [varaus_id]);

    res.json({ message: 'Varaus on peruutettu onnistuneesti' });
  } catch (error) {
    console.error('Virhe varauksen peruutuksessa:', error);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};