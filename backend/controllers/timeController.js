import { pool } from '../config/db.js';

// Añadir horas
export const addTime = async (req, res) => {
  const { id_proyecto, horas } = req.body;
  const id_personal =  req.user?.id;

  if (!id_personal) {
    return res.status(401).json({ error: 'Usuario no autenticado correctamente.' });
  }

  if (!id_proyecto || !horas) {
    return res.status(400).json({ error: 'El proyecto y las horas son obligatorios.' });
  }

  try {
    // 1. Obtener el Id_participacion
    const [participacion] = await pool.query(
      'SELECT Id_participacion FROM personal_proyecto WHERE Id_personal = ? AND Id_proyecto = ?',
      [id_personal, id_proyecto]
    );

    if (participacion.length === 0) {
      return res.status(404).json({ error: 'No estás registrado en este proyecto.' });
    }

    const id_participacion = participacion[0].Id_participacion;

    // 2. Insertar el registro de horas
    await pool.query(
      'INSERT INTO registro_horas (Id_participacion, Horas, Fecha) VALUES (?, ?, ?)',
      [id_participacion, horas, new Date()]
    );

    return res.status(201).json({
      message: 'Horas registradas correctamente'
    });

  } catch (error) {
    console.error('Error al añadir horas:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos.' });
  }
};