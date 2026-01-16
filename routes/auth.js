const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const {generateToken}= require('../utils/auth');
const db = require('../db');

router.post('/login',(req, res) =>  {
  const {cedula_med, clave_med} = req.body;
  
  // Validación de campos requeridos
  if (!cedula_med || !clave_med) {
    return res.status(400).json({ message: "Faltan datos de logueo" });
  }

  db.query('SELECT * FROM medicos WHERE cedula_med = ?', [cedula_med], async (err, results) => {
    
      if (err) throw err;
       if(results.length === 0){
           return res.status(401).json({message: 'Cedula no encontrada'});
       }
      const user= results[0];

      //Verificar contraseña

      const isPasswordValid = await bcrypt.compare(clave_med, user.clave_med);
      if (!isPasswordValid) {
          return res.status(401).json({message: 'Usuario o contraseña incorrecta'});
      }
      
      //Generar token
      //console.log({id: user.id_medico, nombre_med: user.nombre_med });

      const token = generateToken({id: user.id_medico, cedula_med: user.cedula_med });
      res.json({message: 'Login exitoso', token});
      }
  ); 
});

module.exports = router;

