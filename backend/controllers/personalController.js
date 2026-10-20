import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';


//Ver personal
export const getPersonal = async (req, res) => {
  try {
    // 1.- Consulta para obtener los proyectos de la base de datos
    const [personal] = await pool.query(
      'SELECT Id_personal, Nombre, Apellido_paterno FROM personal'
    );

    return res.status(200).json({
      personal
    });

  } catch (error) {
    console.error('Error al buscar al personal', error);
    return res.status(500).json({ error: 'Error interno al buscar en la base de datos.' });
  }
};


// Crear un nuevo usuario (Solo Admin)
export const createPersonal = async (req, res) => {
  const { Nombre, Apellido_paterno, Apellido_materno,Telefono,Admin,Email, Contrasena } = req.body;

  if (!Nombre || !Apellido_paterno || !Email || !Contrasena) {
    return res.status(400).json({ error: 'Los campos obligatorios deben ser completados.' });
  }

  try {
    // 1. Verificar si el email ya existe
    const [existingPersonal] = await pool.query(
      'SELECT Id_personal FROM personal WHERE Email = ?',
      [Email]
    );

    if (existingPersonal.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // 2. Encriptar la contraseña con bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(Contrasena, saltRounds);

    // 3. Insertar el nuevo usuario en la base de datos
    // Aseguramos que Admin sea 1 o 0
    const isAdmin = Admin ? 1 : 0;

    const [result] = await pool.query(
      'INSERT INTO personal (Id_personal,Nombre, Apellido_paterno,Apellido_materno, Telefono,Admin,Email, Contrasena) VALUES (?,?, ?, ?, ?, ?,?,?)',
      [null,Nombre, Apellido_paterno, Apellido_materno,Telefono,isAdmin,Email, passwordHash]
    );

    return res.status(201).json({
      message: 'Usuario creado exitosamente.',
      personalId: result.insertId
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: 'Error al registrar el usuario en la base de datos.' });
  }
};

//Ver personal en proyecto
export const getPersonalProject = async (req, res) => {
  const { id_proyecto } = req.body || {};

  if (!id_proyecto) {
    return res.status(400).json({ error: 'Falta el id_proyecto' });
  }

  try {
    const [integrantes] = await pool.query(
      `SELECT 
         per.Id_personal,
         per.Nombre,
         per.Apellido_paterno,
         IFNULL(SUM(rh.Horas), 0) AS horas_registradas
       FROM personal_proyecto pp
       INNER JOIN personal per ON pp.Id_personal = per.Id_personal
       LEFT JOIN registro_horas rh ON pp.Id_participacion = rh.Id_participacion
       WHERE pp.Id_proyecto = ?
       GROUP BY per.Id_personal, per.Nombre, per.Apellido_paterno`,
      [id_proyecto]
    );

    return res.status(200).json({
      integrantes
    });

  } catch (error) {
    console.error('Error al obtener integrantes:', error);
    return res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
};

//Ver permisos

export const getPermisos = async(req,res)=>{
  try{

    const [permisos] = await pool.query(
        `SELECT *
        FROM permisos`
      );
      return res.status(200).json({
        permisos
      });

  }catch (error) {
    console.error('Error al buscar estados');
    return res.status(500).json({ 
      error: 'Error interno en la base de datos.'
    });
  }
}

//Crear permisos

export const crearPermisos = async(req,res)=>{
  const {nombre}=req.body;
  try{

    const [permisos] = await pool.query(
        `Insert into permisos (Id_permiso,nombre)
        values (?,?)`,[null,nombre]
      );
      return res.status(201).json({
        nombre:nombre
      });

  }catch (error) {
    console.error('Error al insertar el permiso');
    return res.status(500).json({ 
      error: 'Error interno en la base de datos.'
    });
  }
}


export const getPersonalProyectoPermisos = async (req, res) => {
  const { id_personal, id_proyecto } = req.body;

  if (!id_personal || !id_proyecto) {
    return res.status(400).json({ error: 'El id_personal e id_proyecto son obligatorios.' });
  }

  try {
    // 1. Obtener datos 
    const [[detalle]] = await pool.query(
      `SELECT 
        p.Id_personal,
        p.Nombre,
        p.Apellido_paterno,
        pr.Id_proyecto,
        pr.nombre AS nombre_proyecto,
        pp.Id_participacion
       FROM personal_proyecto pp
       INNER JOIN personal p ON pp.Id_personal = p.Id_personal
       INNER JOIN proyectos pr ON pp.Id_proyecto = pr.Id_proyecto
       WHERE pp.Id_personal = ? AND pp.Id_proyecto = ?`,
      [id_personal, id_proyecto]
    );

    if (!detalle) {
      return res.status(404).json({ error: 'No se encuentra asignado a este proyecto.' });
    }

    // 2. Obtener permisos activos
    const [permisos] = await pool.query(
      `SELECT Id_permiso 
       FROM permisos_proyecto 
       WHERE Id_participacion = ? AND activo = 1`,
      [detalle.Id_participacion]
    );

    const permisosIds = permisos.map(p => p.Id_permiso);

    return res.status(200).json({
      trabajador: {
        Id_personal: detalle.Id_personal,
        Nombre: detalle.Nombre,
        Apellido_paterno: detalle.Apellido_paterno,
        Id_participacion: detalle.Id_participacion
      },
      proyecto: {
        Id_proyecto: detalle.Id_proyecto,
        nombre: detalle.nombre_proyecto
      },
      permisosAsignados: permisosIds
    });

  } catch (error) {
    console.error('Error al obtener detalle de personal en proyecto:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos.' });
  }
};

export const updatePermisosPersonal = async (req, res) => {
  const { id_participacion, permisosSeleccionados } = req.body; 
  // permisosSeleccionados es un arreglo de IDs: ej. [1, 2]

  if (!id_participacion || !Array.isArray(permisosSeleccionados)) {
    return res.status(400).json({ error: 'Datos incompletos para actualizar permisos.' });
  }

  try {
    // Opción rápida y limpia: Desactivar todos los permisos de la participación
    await pool.query(
      `UPDATE permisos_proyecto SET activo = 0 WHERE Id_participacion = ?`,
      [id_participacion]
    );

    // Para cada permiso seleccionado en el arreglo, hacemos INSERT / ON DUPLICATE KEY UPDATE a activo = 1
    for (const idPermiso of permisosSeleccionados) {
      await pool.query(
        `INSERT INTO permisos_proyecto (Id_permiso, Id_participacion, activo)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE activo = 1`,
        [idPermiso, id_participacion]
      );
    }

    return res.status(200).json({ message: 'Permisos actualizados correctamente.' });

  } catch (error) {
    console.error('Error al actualizar permisos:', error);
    return res.status(500).json({ error: 'Error interno en la base de datos.' });
  }
};
