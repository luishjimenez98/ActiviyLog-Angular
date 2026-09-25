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
  const { Nombre, Apellido_paterno, Apellido_materno,Telefono,Admin,Email, Constrasena } = req.body;

  if (!Nombre || !Apellido_paterno || !Email || !Constrasena) {
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
    const passwordHash = await bcrypt.hash(Constrasena, saltRounds);

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