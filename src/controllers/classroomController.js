const pool = require('../config/db');

// Hae kaikkien tilojen luettelo
exports.getAllClassrooms = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Luokkahuoneet');
    res.json(rows);
  } catch (error) {
    console.error('Virhe tilojen hakemisessa:', error);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};

// Hae tila paikkakartalla ja varaustilanteella tietylle päivämäärälle
exports.getClassroomSeats = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query; // YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ message: 'Parametri date on pakollinen (YYYY-MM-DD)' });
  }

  try {
    // Haetaan luokan tiedot
    const [classrooms] = await pool.query('SELECT * FROM Luokkahuoneet WHERE luokka_id = ?', [id]);
    
    if (classrooms.length === 0) {
      return res.status(404).json({ message: 'Tilaa ei löytynyt' });
    }

    // Получаем места и статус их бронирования на конкретную дату
    const query = `
      SELECT 
        p.lp_id,
        p.rivin_numero,
        p.paikka_numero,
        CASE WHEN v.varaus_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_reserved
      FROM Luokkahuoneen_paikat p
      LEFT JOIN Varaukset v 
        ON p.lp_id = v.paikka_id 
        AND DATE(v.ajankohta) = ? 
        AND v.status = 'active'
      WHERE p.luokka_id = ?
      ORDER BY p.rivin_numero, p.paikka_numero
    `;

    const [seats] = await pool.query(query, [date, id]);

    res.json({
      classroom: classrooms[0],
      seats: seats
    });
  } catch (error) {
    console.error('Ошибка при получении мест:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};