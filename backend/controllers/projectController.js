import { pool } from '../config/db.js';

//Ver proyectos
export const getProject = async (req, res) => {
  const { id_proyecto } = req.body || {};

  try {

    if (id_proyecto) {
      const [proyecto] = await pool.query(
        `SELECT 
          p.Id_proyecto, 
          p.nombre, 
          p.Id_estado, 
          e.nombre AS estado,
          p.fecha_inicio, 
          p.horas_asignadas, 
          p.horas_aumentadas, 
          p.codigo_acceso,
          IFNULL(
            (SELECT SUM(rh.Horas) 
            FROM personal_proyecto pp_all
            INNER JOIN registro_horas rh ON pp_all.Id_participacion = rh.Id_participacion
            WHERE pp_all.Id_proyecto = p.Id_proyecto), 
            0
          ) AS horas_registradas
        FROM proyectos p
        LEFT JOIN estados e ON p.Id_estado = e.Id_estado
        WHERE p.Id_proyecto = ?`,
        [id_proyecto]
      );

      if (proyecto.length === 0) {
        return res.status(404).json({ message: 'Proyecto no encontrado.' });
      }

      return res.status(200).json({
        proyecto: proyecto[0]
      });
    }
    const [proyectos] = await pool.query(
      `SELECT 
        p.Id_proyecto, 
        p.nombre, 
        p.Id_estado, 
        e.nombre AS estado,
        p.fecha_inicio, 
        p.horas_asignadas, 
        p.horas_aumentadas,
        IFNULL(
          (SELECT SUM(rh.Horas) 
          FROM personal_proyecto pp_all
          INNER JOIN registro_horas rh ON pp_all.Id_participacion = rh.Id_participacion
          WHERE pp_all.Id_proyecto = p.Id_proyecto), 
          0
        ) AS horas_registradas
      FROM proyectos p
      LEFT JOIN estados e ON p.Id_estado = e.Id_estado`
    );

    return res.status(200).json({
      proyectos
    });

  } catch (error) {
    console.error('Erros al encontrar proyectos');
    return res.status(500).json({ 
      error: 'Error interno en la base de datos.'
    });
  }
};



//Crear proyecto
export const createProject = async(req, res) =>{
    const {nombre,estado,fecha,horas_asignadas,horas_aumentadas}=req.body;

    if (!nombre || horas_asignadas==null) {
        return res.status(400).json({ error: 'Los campos obligatorios deben ser completados.' });
    }
    try {
    // 1. Verificar si el nombre del proyecto ya existe
    const [existingProject] = await pool.query(
      'SELECT Id_proyecto FROM proyectos WHERE nombre = ?',
      [nombre]
    );

    if (existingProject.length > 0) {
      return res.status(400).json({ error: 'El nombre del proyecto ya está registrado.' });
    }

    // 2. Crear el codigo de acceso y verificar que no existe
    const codigoAcceso = Math.floor(1000 + Math.random() * 9000).toString();
    const codigo = await existing(codigoAcceso)

    async function existing (code){
        const [existingCode] = await pool.query(
        'select Id_proyecto from proyectos where codigo_acceso = ?',
        [code]
        );
        if(existingCode.length===0){
            return code
        }else{
            const codigoAcceso = Math.floor(1000 + Math.random() * 9000).toString();
        return await existing(codigoAcceso)
        }
    }
    // 3. Insertar el nuevo proyecto en la base de datos

    const [result] = await pool.query(
      'INSERT INTO proyectos (Id_proyecto, nombre, Id_estado, fecha_inicio, horas_asignadas, horas_aumentadas,codigo_acceso) values (?,?,?,?,?,?,?)',
      [null,nombre,estado || 1,fecha||new Date(),horas_asignadas,horas_aumentadas||0,codigo] 
    );

    return res.status(201).json({
      message: 'Proyecto creado exitosamente.',
      proyectoId: result.insertId,
      proyectoNom: nombre,
      proyectoCode: codigo
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error al registrar el proyecto en la base de datos.' });
  }
};

// Unirse a un proyecto
export const joinProject = async (req, res) => {
  const { id_proyecto, codigo } = req.body;
  // Extraer id_personal de la sesión del usuario
  const id_personal = req.user?.Id_personal || req.user?.id_personal || req.user?.id;

  if (!id_personal) {
    return res.status(401).json({ error: 'No se pudo identificar al usuario desde el token.' });
  }
  
  if (!id_proyecto || !codigo) {
    return res.status(400).json({ error: 'El proyecto y el código son obligatorios.' });
  }

  try {
    // 1. Verificar existencia del proyecto Y validez del código
    const [project] = await pool.query(
      'SELECT Id_proyecto FROM proyectos WHERE Id_proyecto = ? AND codigo_acceso = ?',
      [id_proyecto, codigo]
    );

    if (project.length === 0) {
      return res.status(400).json({ error: 'El proyecto no existe o el código de acceso es incorrecto.' });
    }

    // 2. Verificar si el usuario ya esta registrado en el proyecto
    const [alreadyJoined] = await pool.query(
      'SELECT * FROM personal_proyecto WHERE Id_personal = ? AND Id_proyecto = ?',
      [id_personal, id_proyecto]
    );

    if (alreadyJoined.length > 0) {
      return res.status(400).json({ error: 'Ya estás registrado en este proyecto.' });
    }

    // 3. Insertar la relación en la base de datos
    const [result] = await pool.query(
      'INSERT INTO personal_proyecto (Id_personal, Id_proyecto) VALUES (?, ?)',
      [id_personal, id_proyecto]
    );

    const idParticipacion = result.insertId;

    // 4. Asignar permiso por defecto: "Registrar horas" (Id_permiso = 1)
    await pool.query(
      'INSERT INTO permisos_proyecto (Id_permiso, Id_participacion, activo) VALUES (1, ?, 1)',
      [idParticipacion]
    );

    return res.status(201).json({
      message: 'Te has unido al proyecto exitosamente.',
      proyecto: id_proyecto,
      personal: id_personal
    });

  } catch (error) {
    console.error('Error al unirse al proyecto:', error);
    return res.status(500).json({ error: 'Error interno al registrar la unión en la base de datos.' });
  }
};


// Ver proyectos por personal
export const getProjectPersonal = async (req, res) => {
  let { id_personal } = req.body;
  if (!id_personal) {
    id_personal = req.user?.id_personal || req.user?.Id_personal || req.user?.id;
  }

  try {
    if (!id_personal) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Consulta con permisos activos concatenados por cada participación
    const [proyectos] = await pool.query(
      `SELECT 
        p.Id_proyecto,
        p.nombre,
        p.Id_estado,
        e.nombre AS estado,
        p.horas_asignadas,
        p.horas_aumentadas,
        IFNULL(
          (SELECT SUM(rh.Horas) 
           FROM personal_proyecto pp_all
           INNER JOIN registro_horas rh ON pp_all.Id_participacion = rh.Id_participacion
           WHERE pp_all.Id_proyecto = p.Id_proyecto), 
          0
        ) AS horas_registradas,
        (
          SELECT GROUP_CONCAT(perm.Id_permiso)
          FROM permisos_proyecto perm
          WHERE perm.Id_participacion = pp_user.Id_participacion AND perm.activo = 1
        ) AS permisos_str
      FROM personal_proyecto pp_user
      INNER JOIN proyectos p ON pp_user.Id_proyecto = p.Id_proyecto
      LEFT JOIN estados e ON p.Id_estado = e.Id_estado
      WHERE pp_user.Id_personal = ?`,
      [id_personal]
    );

    if (proyectos.length === 0) {
      return res.status(200).json({ 
        message: 'No estás registrado en ningún proyecto.',
        proyectos: [] 
      });
    }

    // Convertimos la cadena de permisos "1,2" en un arreglo numérico [1, 2] para facil uso en Frontend
    const proyectosFormatted = proyectos.map(proj => {
      const permisos = proj.permisos_str 
        ? proj.permisos_str.split(',').map(Number) 
        : [];
      const { permisos_str, ...resto } = proj;
      return {
        ...resto,
        permisos
      };
    });

    return res.status(200).json({
      proyectos: proyectosFormatted
    });

  } catch (error) {
    console.error('Error al buscar proyectos del personal:', error);
    return res.status(500).json({ error: 'Error interno al buscar en la base de datos.' });
  }
};

// editar un proyecto / admin
export const updateProject = async (req, res) => {
  const { 
    id_proyecto, 
    nombre, 
    estado, 
    fecha, 
    horas_asignadas, 
    codigo, 
    horas_aumentadas 
  } = req.body;

  if (!id_proyecto || !nombre || estado == null || horas_asignadas == null) {
    return res.status(400).json({ error: 'Los campos obligatorios deben ser completados.' });
  }

  try {
    // 1. Verificar si el proyecto existe
    const [existingProject] = await pool.query(
      'SELECT Id_proyecto FROM proyectos WHERE Id_proyecto = ?',
      [id_proyecto]
    );

    if (existingProject.length === 0) {
      return res.status(400).json({ error: 'El proyecto no está registrado.' });
    }

    // 2. Determinar o generar el código de acceso
    let codigoFinal = codigo;
    if (!codigoFinal) {
      codigoFinal = Math.floor(1000 + Math.random() * 9000).toString();
    }

    // 3. Verificar que el código no esté asignado a OTRO proyecto diferente
    const [existingCode] = await pool.query(
      'SELECT Id_proyecto FROM proyectos WHERE codigo_acceso = ? AND Id_proyecto != ?',
      [codigoFinal, id_proyecto]
    );

    if (existingCode.length > 0) {
      return res.status(400).json({ error: 'El código de acceso ya está registrado en otro proyecto.' });
    }

    // 4. Actualizar en la base de datos
    await pool.query(
      `UPDATE proyectos 
       SET nombre = ?, 
           Id_estado = ?, 
           fecha_inicio = ?, 
           horas_asignadas = ?, 
           horas_aumentadas = ?, 
           codigo_acceso = ? 
       WHERE Id_proyecto = ?`,
      [
        nombre, 
        estado, 
        fecha, 
        horas_asignadas, 
        horas_aumentadas || 0, 
        codigoFinal, 
        id_proyecto
      ]
    );

    return res.status(200).json({ message: 'Proyecto actualizado correctamente.' });

  } catch (error) {
    console.error('Error al actualizar el proyecto:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos.' });
  }
};


//Ver estados

export const getEstados = async(req,res)=>{
  try{

    const [estados] = await pool.query(
        `SELECT *
        FROM estados`
      );

      return res.status(200).json({
        estados
      });

  }catch (error) {
    console.error('Error al buscar estados');
    return res.status(500).json({ 
      error: 'Error interno en la base de datos.'
    });
  }
}

//crear Estados
export const crearEstados = async(req,res)=>{
  const {nombre}=req.body;
  try{

    const [estados] = await pool.query(
        `Insert into estados (Id_estado,nombre)
        values (?,?)`,[null,nombre]
      );
      return res.status(201).json({
        nombre:nombre
      });

  }catch (error) {
    console.error('Error al insertar el estado');
    return res.status(500).json({ 
      error: 'Error interno en la base de datos.'
    });
  }
}
