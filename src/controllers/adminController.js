
const pool = require('../config/db');

// Luo uusi luokkahuone ja sen paikat
exports.createClassroom = async (req, res) => {
  const { nimi, rivit, paikat } = req.body;

  if (
    typeof nimi !== 'string' ||
    !nimi.trim() ||
    !Number.isInteger(Number(rivit)) ||
    !Number.isInteger(Number(paikat)) ||
    Number(rivit) < 1 ||
    Number(paikat) < 1
  ) {
    return res.status(400).json({
      message: 'Anna luokkahuoneen nimi, rivien määrä ja paikkojen määrä.'
    });
  }

  const rivienMaara = Number(rivit);
  const paikkojenMaara = Number(paikat);

  // Estetään vahingossa erittäin suurten luokkahuoneiden luominen
  if (rivienMaara > 100 || paikkojenMaara > 100) {
    return res.status(400).json({
      message: 'Rivien ja paikkojen määrä voi olla enintään 100.'
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const koko = rivienMaara * paikkojenMaara;

    const [classroomResult] = await connection.query(
      `INSERT INTO Luokkahuoneet
       (nimi, koko, rivit, paikat)
       VALUES (?, ?, ?, ?)`,
      [nimi.trim(), koko, rivienMaara, paikkojenMaara]
    );

    const luokkaId = classroomResult.insertId;
    const seatsData = [];

    for (let r = 1; r <= rivienMaara; r++) {
      for (let p = 1; p <= paikkojenMaara; p++) {
        seatsData.push([luokkaId, r, p]);
      }
    }

    if (seatsData.length > 0) {
      await connection.query(
        `INSERT INTO Luokkahuoneen_paikat
         (luokka_id, rivin_numero, paikka_numero)
         VALUES ?`,
        [seatsData]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Luokkahuone ja paikat luotiin onnistuneesti.',
      luokka_id: luokkaId,
      total_seats: koko
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Luokkahuoneen luontivirhe:', error);

    return res.status(500).json({
      message: 'Luokkahuoneen luominen epäonnistui.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// Poista luokkahuone, sen paikat ja niihin liittyvät varaukset
exports.deleteClassroom = async (req, res) => {
  const luokkaId = Number(req.params.id);

  if (!Number.isInteger(luokkaId) || luokkaId < 1) {
    return res.status(400).json({
      message: 'Virheellinen luokkahuoneen tunnus.'
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Tarkista luokkahuoneen olemassaolo
    const [classrooms] = await connection.query(
      `SELECT luokka_id
       FROM Luokkahuoneet
       WHERE luokka_id = ?
       FOR UPDATE`,
      [luokkaId]
    );

    if (classrooms.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: 'Luokkahuonetta ei löydy.'
      });
    }

    // Poista paikkoihin liittyvät varaukset
    await connection.query(
      `DELETE v
       FROM Varaukset v
       INNER JOIN Luokkahuoneen_paikat lp
         ON v.paikka_id = lp.lp_id
       WHERE lp.luokka_id = ?`,
      [luokkaId]
    );

    // Poista luokkahuoneen paikat
    await connection.query(
      `DELETE FROM Luokkahuoneen_paikat
       WHERE luokka_id = ?`,
      [luokkaId]
    );

    // Poista itse luokkahuone
    await connection.query(
      `DELETE FROM Luokkahuoneet
       WHERE luokka_id = ?`,
      [luokkaId]
    );

    await connection.commit();

    return res.status(200).json({
      message: 'Luokkahuone ja siihen liittyvät paikat sekä varaukset poistettiin onnistuneesti.'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Luokkahuoneen poistovirhe:', error);

    return res.status(500).json({
      message: 'Luokkahuoneen poistaminen epäonnistui. Tarkista palvelimen virheloki.'
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// Hae kaikki varaukset ylläpitäjälle
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

    return res.json(reservations);
  } catch (error) {
    console.error('Varausten hakeminen epäonnistui:', error);

    return res.status(500).json({
      message: 'Varausten hakeminen epäonnistui.'
    });
  }
};
