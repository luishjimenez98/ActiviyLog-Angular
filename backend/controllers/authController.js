import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

export const login = async (req, res) => {
  const { Email, Contrasena } = req.body;

  if (!Email || !Contrasena) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT Id_personal, Nombre, Apellido_paterno, Admin, Email, Contrasena FROM personal WHERE Email = ?',
      [Email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(Contrasena, usuario.Contrasena);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    // Separar la contraseña del resto de los datos
    const { Contrasena: _, ...usuarioPayload } = usuario;


    const isAdmin = Boolean(usuario.Admin);
    // Firmamos el token
    const token = jwt.sign(
      { 
        id: usuario.Id_personal,
        nombre: usuario.Nombre,
        email: usuario.Email, 
        admin: isAdmin 
      },
      process.env.JWT_SECRET,
      { expiresIn: '62h' }
    );

    return res.json({
      user: {
        ...usuarioPayload,
        Admin: isAdmin
      },
      token
    });

  } catch (error) {
    console.error('Error en Login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

