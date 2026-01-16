const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../utils/auth");

//Método get para regístro único
router.get('/:id', verifyToken, (req, res) => {
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const query = 'SELECT * FROM citas WHERE id_cita = ?;';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error();
            return res.status(500).json({ error: 'Error al obtener la cita' })
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' })
        }
        res.json(results[0]);
    });
});

//Método Get para múltiples registros con paginación
router.get('/', verifyToken, (req, res) => {
    //Obtener parámetros de la URL
    const page = parseInt(req.query.page) || 1; //Página actual, por defecto 1
    const limit = parseInt(req.query.limit) || 10; //Límite de registro, por defecto 10
    const offset = (page - 1) * limit; //El punto de inicio de la conuslta
    const cadena = req.query.cadena; //De acuerdo a la url documentada, SALDRÁ EN LA PRUEBAAA
    let whereClause = '';
    let queryParams = [];
    if (cadena) {
        whereClause = 'where fecha_cita like ? or motivo_cita like ?';
        const searchTerm = `%${cadena}%`
        queryParams.push(searchTerm, searchTerm);
    }
    //Consultas para obtener TOTAL de registros
    const countQuery = `select count(*) as total from citas ${whereClause}`;
    db.query(countQuery, queryParams, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener total de citas' });
        }
        const totalCitas = countResult[0].total;
        const totalPages = Math.ceil(totalCitas / limit);
        //Consulta para obtener los registros de la página
        const citasQuery = `select * from citas ${whereClause} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        db.query(citasQuery, queryParams, (err, citasResult) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al obtener las citas' })
            }
            //Enviar respuesta con los datos y la información de paginación
            res.json({
                totalItems: totalCitas,
                totalPage: totalPages,
                currentPage: page,
                limit: limit,
                data: citasResult
            });
        });
    });
});

//Método POST
router.post('/', verifyToken, (req, res) => {
    //Obtener los datos
    const { fecha_cita, hora_cita, motivo_cita, id_paciente, id_medico } = req.body;
    const query = 'insert into citas values(null, ?, ?, ?, ?, ?)';
    const values = [fecha_cita, hora_cita, motivo_cita, id_paciente, id_medico];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al insertar la cita' });
        }
        res.status(201).json({
            message: 'Cita insertado correctamente',
            id_cita: result.insertId
        });
    })
})

//Método PUT
router.put('/:id', verifyToken, (req, res) => {
    //Obtener los datos
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const { fecha_cita, hora_cita, motivo_cita, id_paciente, id_medico } = req.body;
    const query = 'update citas set fecha_cita = ?, hora_cita = ?, motivo_cita = ?, id_paciente = ?, id_medico = ? where id_cita = ?';
    const values = [fecha_cita, hora_cita, motivo_cita, id_paciente, id_medico, id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al actualizar la cita' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({message : "Cita no encontrado"})
        }
        res.status(201).json({
            message: 'Cita actualizado correctamente'
        });
    })
});

//Método DELETE
router.delete('/:id', verifyToken, (req, res) => {
    //Obtener los datos
    const { id } = req.params; //Capturar el id desde los parámetros de la URL
    const query = 'delete from citas where id_cita = ?';
    const values = [id];
    db.query(query, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error al eliminar la cita' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({message : "Cita no encontrado"})
        }
        res.status(201).json({
            message: 'Cita elimanda correctamente'
        });
    })
});

module.exports = router;