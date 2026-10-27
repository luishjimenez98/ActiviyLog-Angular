import { pool } from '../config/db.js';

// Añadir horas
export const addTime = async (req, res) => {
  const { id_proyecto, horas } = req.body;
  const id_personal = req.user?.id || req.user?.Id_personal;
  const isAdmin = Boolean(req.user?.Admin);

  if (!id_personal) {
    return res.status(401).json({ error: 'Usuario no autenticado correctamente.' });
  }

  if (!id_proyecto || horas === undefined || horas === null) {
    return res.status(400).json({ error: 'El proyecto y las horas son obligatorios.' });
  }

  // Validación: Horas deben ser un número finito positivo (se permiten decimales redondeados a 2 dígitos)
  const nuevasHoras = Math.round(Number(horas) * 100) / 100;
  if (!Number.isFinite(nuevasHoras) || nuevasHoras <= 0) {
    return res.status(400).json({ error: 'La cantidad de horas debe ser un número válido mayor a 0.' });
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

    // Validación 1.3: Verificar que el usuario tenga permiso activo para registrar horas (Id_permiso = 1)
    if (!isAdmin) {
      const [permiso] = await pool.query(
        'SELECT 1 FROM permisos_proyecto WHERE Id_participacion = ? AND Id_permiso = 1 AND activo = 1',
        [id_participacion]
      );

      if (permiso.length === 0) {
        return res.status(403).json({ error: 'No tienes permisos asignados para registrar horas en este proyecto.' });
      }
    }

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

    if (proyecto.Id_estado === 2 || horasActuales >= totalPermitido) {
      return res.status(400).json({ 
        error: 'Este proyecto ya se encuentra terminado o ha alcanzado su límite de horas.' 
      });
    }

    const nuevoTotal = Math.round((horasActuales + nuevasHoras) * 100) / 100;

    if (nuevoTotal > totalPermitido) {
      const disponibles = Math.round((totalPermitido - horasActuales) * 100) / 100;
      return res.status(400).json({ 
        error: `Las horas ingresadas superan el límite del proyecto. Horas disponibles: ${disponibles}` 
      });
    }

    // 3. Insertar el registro de horas
    await pool.query(
      'INSERT INTO registro_horas (Id_participacion, Horas, Fecha) VALUES (?, ?, ?)',
      [id_participacion, nuevasHoras, new Date()]
    );

    // 4. Si se alcanza o supera el total de horas, actualizar automáticamente el estado a Terminado (Id_estado = 2)
    if (nuevoTotal >= totalPermitido) {
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

export const getHorasPersonalProyecto = async (req, res) => {
  const { id_personal, id_proyecto } = req.body;
  const currentUserId = req.user?.id || req.user?.Id_personal;
  const isAdmin = Boolean(req.user?.Admin);

  if (!id_personal || !id_proyecto) {
    return res.status(400).json({ error: 'El ID del personal y del proyecto son obligatorios.' });
  }

  try {
    // Prevención de IDOR (1.5): si no es admin ni es el propio colaborador consultando sus horas,
    // validar si tiene asignado el rol/permiso de Administrar el proyecto (Id_permiso = 2)
    if (!isAdmin && Number(currentUserId) !== Number(id_personal)) {
      const [esAdminProyecto] = await pool.query(
        `SELECT 1 FROM personal_proyecto pp
         INNER JOIN permisos_proyecto pr ON pp.Id_participacion = pr.Id_participacion
         WHERE pp.Id_personal = ? AND pp.Id_proyecto = ? AND pr.Id_permiso = 2 AND pr.activo = 1`,
        [currentUserId, id_proyecto]
      );

      if (esAdminProyecto.length === 0) {
        return res.status(403).json({ error: 'No tienes autorización para consultar el historial de horas de este colaborador.' });
      }
    }
    const [registros] = await pool.query(
      `SELECT 
        rh.Id_registro,
        rh.Horas,
        rh.Fecha
       FROM registro_horas rh
       INNER JOIN personal_proyecto pp ON rh.Id_participacion = pp.Id_participacion
       WHERE pp.Id_personal = ? AND pp.Id_proyecto = ?
       ORDER BY rh.Fecha DESC`,
      [id_personal, id_proyecto]
    );

    return res.status(200).json({
      historial: registros
    });

  } catch (error) {
    console.error('Error al obtener el historial de horas:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos al obtener historial de horas.' });
  }
};