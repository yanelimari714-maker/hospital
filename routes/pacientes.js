const express = require('express');
const router = express.Router();
//const bcrypt = require('bcrypt'); 
const { verifyToken } = require('../utils/auth');
const db = require('../db');


//Método get para regístro único
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const query = 'SELECT * FROM pacientes WHERE id_paciente = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error();
            return res.status(500).json({ error: 'Error al obtener el paciente' })
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' })
        }
        res.json(results[0]);
    });
});


router.get('/', verifyToken, (req, res) => {
    //Obtener parámetros de la url
    const page = parseInt(req.query.page) || 1; //pagina actual por defecto 1
    const limit = parseInt(req.query.limit) || 10; //limite por defecto 10
    const offset = (page - 1) * limit; //punto de inicio de la consulta
    const cadena = req.query.cadena;
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'where cedula_pac like ? or nombre_pac like ? or apellido_pac like ?';
        const searchTerm = `%${cadena}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    //consultas para obtener registros
    const countQuery = `SELECT COUNT(*) AS TOTAL FROM pacientes ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener los pacientes' })
        }
        const totalPacientes = countResult[0].TOTAL;
        const totalPages = Math.ceil(totalPacientes / limit);
        //consulta para obtener los registros de la página 
        const pacientesQuery = `SELECT * FROM pacientes ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(pacientesQuery, queryParams, (err, pacientesResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener los pacientes' })
            }
            //enviar respuesta con los datos y la información de paginación 
            res.json({
                totalItems: totalPacientes,
                totalPage: totalPages,
                currentPage: page,
                data: pacientesResult

            });
        });
    });

});

//Método post para registrar un paciente
router.post('/', verifyToken, (req, res) => {
    //Obtener los datos de la petición
    const { cedula_pac, apellido_pac, nombre_pac, edad_pac, direccion_pac, telefono_pac } = req.body;
    const search_query = 'SELECT COUNT(*) AS contador FROM pacientes WHERE cedula_pac = ?';
    db.query(search_query, [cedula_pac], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al verificar el paciente' })
        }
        if (results[0].contador > 0) {
            return res.status(409).json({ error: 'El paciente con cédula ' + cedula_pac + ' ya existe' });
        }
    })
    const query = 'INSERT INTO pacientes values (null, ?, ?, ?, ?, ?, ?)';
    const values = [cedula_pac, apellido_pac, nombre_pac, edad_pac, direccion_pac, telefono_pac];
    db.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al registrar el paciente' })
        } else {
            res.status(201).json({
                message: 'Paciente registrado exitosamente',
                id_paciente: results.insertId
            });


        }
    })

})
//METODO PUT
router.put('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const { cedula_pac, apellido_pac, nombre_pac, edad_pac, direccion_pac, telefono_pac, id_paciente } = req.body;
    const query = 'UPDATE pacientes SET cedula_pac = ?, apellido_pac = ?, nombre_pac = ?, edad_pac = ?, direccion_pac = ?, telefono_pac = ? WHERE id_paciente = ?';
    const values = [cedula_pac, apellido_pac, nombre_pac, edad_pac, direccion_pac, telefono_pac, id];
    db.query(query, values, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar el paciente' })
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' })
        }
        res.status(200).json({
            message: 'Paciente actualizado exitosamente',
            id_paciente: id

        })
    })

});

//Método DELETE
router.delete('/:id', verifyToken, (req, res) => {
    //Obtener los datos
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const search_query = "SELECT COUNT(*) AS contador FROM citas WHERE id_paciente = ?";
    db.query(search_query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al verificar cita' })
        }
        if (result[0].contador > 0) {
            return res.status(409).json({ error: 'Paciente no se puede eliminar por que tiene registrada una cita' })
        }
        const query = 'delete from pacientes where id_paciente = ?';
        const values = [id];
        db.query(query, values, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error al eliminar el Paciente' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Paciente no encontrado" })
            }
            res.status(200).json({
                message: 'Paciente elimando correctamente'
            });
        })

    })
});


module.exports = router;