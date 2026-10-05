const pool = require('../config/db');

// Hae kaikki luokkahuoneet
exports.getAllClassrooms = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Luokkahuoneet'
    );

    res.json(rows);
  } catch (error) {
    console.error('Virhe luokkahuoneiden hakemisessa:', error);
    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};

// Hae luokkahuoneen paikat ja varaustilanne
exports.getClassroomSeats = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      message: 'Päivämäärä puuttuu'
    });
  }

  try {
    const [classrooms] = await pool.query(
      'SELECT * FROM Luokkahuoneet WHERE luokka_id = ?',
      [id]
    );

    if (classrooms.length === 0) {
      return res.status(404).json({
        message: 'Luokkahuonetta ei löytynyt'
      });
    }

    const query = `
      SELECT
        p.lp_id,
        p.rivin_numero,
        p.paikka_numero,
        CASE
          WHEN v.varaus_id IS NOT NULL THEN TRUE
          ELSE FALSE
        END AS is_reserved
      FROM Luokkahuoneen_paikat p
      LEFT JOIN Varaukset v
        ON p.lp_id = v.paikka_id
        AND DATE(v.ajankohta) = ?
        AND v.status = 'active'
      WHERE p.luokka_id = ?
      ORDER BY p.rivin_numero, p.paikka_numero
    `;

    const [seats] = await pool.query(
      query,
      [date, id]
    );

    res.json({
      classroom: classrooms[0],
      seats: seats
    });
  } catch (error) {
    console.error('Virhe paikkojen hakemisessa:', error);
    res.status(500).json({
      message: 'Palvelinvirhe'
    });
  }
};