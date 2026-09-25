import { pool } from '../config/db.js';

//Ver proyectos
export const getProject = async (req, res) => {
  try {
    // 1.- Consulta para obtener los proyectos de la base de datos
    const [proyectos] = await pool.query(
      'SELECT Id_proyecto, nombre, Id_estado, fecha_inicio, horas_asignadas, horas_aumentadas FROM proyectos'
    );

    return res.status(200).json({
      proyectos
    });

  } catch (error) {
    console.error('Error al buscar proyectos', error);
    return res.status(500).json({ error: 'Error interno al buscar en la base de datos.' });
  }
};



//Crear proyecto
export const createProject = async(req, res) =>{
    const {nombre,estado,fecha,horas_asignadas,horas_aumentadas}=req.body;

    if (!nombre || !estado || !horas_asignadas) {
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
      [null,nombre,estado,fecha||new Date(),horas_asignadas,horas_aumentadas||0,codigo] 
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

//Unirse a un proyecto
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


//Ver proyectos por personal
export const getProjectPersonal = async (req, res) => {
  try {
    const id_personal = req.user?.id;
    const nombre = req.user?.nombre;
    if (!id_personal) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Consulta para obtener los proyectos donde esta registrado el usuario
    const [proyectos] = await pool.query(
      `SELECT 
        p.Id_proyecto,
        p.nombre,
        p.horas_asignadas,
        p.horas_aumentadas,
        IFNULL(
          (SELECT SUM(rh.Horas) 
           FROM personal_proyecto pp_all
           INNER JOIN registro_horas rh ON pp_all.Id_participacion = rh.Id_participacion
           WHERE pp_all.Id_proyecto = p.Id_proyecto), 
          0
        ) AS horas_registradas
      FROM personal_proyecto pp_user
      INNER JOIN proyectos p ON pp_user.Id_proyecto = p.Id_proyecto
      WHERE pp_user.Id_personal = ?`,
      [id_personal]
    );

    if (proyectos.length === 0) {
      return res.status(200).json({ 
        message: `Bienvenido ${id_personal}. \n No estás registrado en ningún proyecto.`,
        proyectos: [] 
      });
    }

    return res.status(200).json({
      proyectos
    });

  } catch (error) {
    console.error('Error al buscar proyectos del personal:', error);
    return res.status(500).json({ error: 'Error interno al buscar en la base de datos.' });
  }
};