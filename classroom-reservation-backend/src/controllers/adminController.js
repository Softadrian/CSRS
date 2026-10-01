const pool = require('../config/db');

// 1. Создание новой аудитории с автоматической генерацией мест
exports.createClassroom = async (req, res) => {
  const { nimi, rivit, paikat } = req.body; // rivit = количество рядов, paikat = мест в ряду

  if (!nimi || !rivit || !paikat) {
    return res.status(400).json({ message: 'Ilmoita nimi, rivien määrä ja paikkojen määrä rivillä' });
  }

  const connection = await pool.getConnection();

  try {
    // Начинаем транзакцию, чтобы аудитория и места создались одновременно
    await connection.beginTransaction();

    const koko = rivit * paikat;

    // 1. Создаем аудиторию
    const [classroomResult] = await connection.query(
      'INSERT INTO Luokkahuoneet (nimi, koko, rivit, paikat) VALUES (?, ?, ?, ?)',
      [nimi, koko, rivit, paikat]
    );

    const luokka_id = classroomResult.insertId;

    // 2. Генерируем места в цикле
    const seatsData = [];
    for (let r = 1; r <= rivit; r++) {
      for (let p = 1; p <= paikat; p++) {
        seatsData.push([luokka_id, r, p]);
      }
    }

    await connection.query(
      'INSERT INTO LuokanPaikat (luokka_id, rivin_numero, paikka_numero) VALUES ?',
      [seatsData]
    );

    // Подтверждаем транзакцию
    await connection.commit();

    res.status(201).json({
      message: 'Sali ja paikat luotiin onnistuneesti',
      luokka_id,
      total_seats: koko
    });
  } catch (error) {
    await connection.rollback(); // Откатываем изменения в случае ошибки
    console.error('Virhe salin luomisessa: ', error);
    res.status(500).json({ message: 'Palvelinvirhe salia luotaessa' });
  } finally {
    connection.release();
  }
};

// 2. Получение всех бронирований в системе (для админа)
exports.getAllReservations = async (req, res) => {
  try {
    const [reservations] = await pool.query(
      `SELECT v.varaus_id, v.ajankohta, k.nimi AS student_nimi, k.sahkoposti, 
              l.nimi AS luokka_nimi, lp.rivin_numero, lp.paikka_numero
       FROM Varaukset v
       JOIN Kayttajat k ON v.kayttaja_id = k.kayttaja_id
       JOIN LuokanPaikat lp ON v.paikka_id = lp.lp_id
       JOIN Luokkahuoneet l ON lp.luokka_id = l.luokka_id
       ORDER BY v.ajankohta DESC`
    );

    res.json(reservations);
  } catch (error) {
    console.error('Virhe kaikkien varausten hakemisessa:', error);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};