const pool = require('../config/db');

// Luo uusi luokkahuone ja paikat
exports.createClassroom = async (req, res) => {
  const { nimi, rivit, paikat } = req.body;

  if (!nimi || !rivit || !paikat) {
    return res.status(400).json({
      message: 'Ilmoita nimi, rivien määrä ja paikkojen määrä rivillä'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const koko = rivit * paikat;

    // Luo luokkahuone
    const [classroomResult] = await connection.query(
      `INSERT INTO Luokkahuoneet
       (nimi, koko, rivit, paikat)
       VALUES (?, ?, ?, ?)`,
      [nimi, koko, rivit, paikat]
    );

    const luokka_id = classroomResult.insertId;

    // Luo paikat
    const seatsData = [];

    for (let r = 1; r <= rivit; r++) {
      for (let p = 1; p <= paikat; p++) {
        seatsData.push([
          luokka_id,
          r,
          p
        ]);
      }
    }

    await connection.query(
      `INSERT INTO Luokkahuoneen_paikat
       (luokka_id, rivin_numero, paikka_numero)
       VALUES ?`,
      [seatsData]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Sali ja paikat luotiin onnistuneesti',
      luokka_id: luokka_id,
      total_seats: koko
    });
  } catch (error) {
    await connection.rollback();

    console.error('Virhe salin luomisessa:', error);

    res.status(500).json({
      message: 'Palvelinvirhe salia luotaessa'
    });
  } finally {
    connection.release();
  }
};

// Hae kaikki varaukset
exports.getAllReservations = async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT
        v.varaus_id,
        v.ajankohta,
        k.nimi AS student_nimi,
        k.sahkoposti,
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
       WHERE v.status = 'active'
       ORDER BY v.ajankohta DESC`
    );

    res.json(reservations);
  } catch (error) {
    console.error('Virhe kaikkien varausten hakemisessa:', error);

    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};

// Poista luokkahuone (sekä siihen liittyvät paikat транзакцией)
exports.deleteClassroom = async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Сначала удаляем все места, привязанные к этому классу, 
    // чтобы избежать ошибок внешнего ключа (foreign key constraints)
    await connection.query(
      `DELETE FROM Luokkahuoneen_paikat WHERE luokka_id = ?`,
      [id]
    );

    // 2. Затем удаляем сам класс
    const [result] = await connection.query(
      `DELETE FROM Luokkahuoneet WHERE luokka_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return.status(404).json({
        message: 'Luokkahuonetta ei löytynyt'
      });
    }

    await connection.commit();

    res.json({
      message: 'Luokkahuone ja sen paikat poistettu onnistuneesti'
    });
  } catch (error) {
    await connection.rollback();

    console.error('Virhe luokan poistamisessa:', error);

    res.status(500).json({
      message: 'Palvelinvirhe luokkaa poistettaessa'
    });
  } finally {
    connection.release();
  }
};