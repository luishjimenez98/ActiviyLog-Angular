import { pool } from '../config/db.js';

// Añadir horas
export const addTime = async (req, res) => {
  const { id_proyecto, horas } = req.body;
  const id_personal = req.user?.id;

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

    // 2. Consultar horas totales y actuales del proyecto
    const [[proyecto]] = await pool.query(
      `SELECT 
        p.Id_estado,
        (p.horas_asignadas + p.horas_aumentadas) AS total_permitido,
        IFNULL(
          (SELECT SUM(rh.Horas) 
           FROM personal_proyecto pp_all
           INNER JOIN registro_horas rh ON pp_all.Id_participacion = rh.Id_participacion
           WHERE pp_all.Id_proyecto = p.Id_proyecto), 
          0
        ) AS horas_registradas
       FROM proyectos p
       WHERE p.Id_proyecto = ?`,
      [id_proyecto]
    );

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado.' });
    }

    const totalPermitido = Number(proyecto.total_permitido || 0);
    const horasActuales = Number(proyecto.horas_registradas || 0);
    const nuevasHoras = Number(horas);

    if (proyecto.Id_estado === 2 || horasActuales >= totalPermitido) {
      return res.status(400).json({ 
        error: 'Este proyecto ya se encuentra terminado o ha alcanzado su límite de horas.' 
      });
    }

    if (horasActuales + nuevasHoras > totalPermitido) {
      const disponibles = totalPermitido - horasActuales;
      return res.status(400).json({ 
        error: `Las horas ingresadas superan el límite del proyecto. Horas disponibles: ${disponibles}` 
      });
    }

    // 3. Insertar el registro de horas
    await pool.query(
      'INSERT INTO registro_horas (Id_participacion, Horas, Fecha) VALUES (?, ?, ?)',
      [id_participacion, nuevasHoras, new Date()]
    );

    // 4. Si se alcanza el total de horas, actualizar automáticamente el estado a Terminado (Id_estado = 2)
    if (horasActuales + nuevasHoras === totalPermitido) {
      await pool.query(
        'UPDATE proyectos SET Id_estado = 2 WHERE Id_proyecto = ?',
        [id_proyecto]
      );
    }

    return res.status(201).json({
      message: 'Horas registradas correctamente'
    });

  } catch (error) {
    console.error('Error al añadir horas:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos.' });
  }
};