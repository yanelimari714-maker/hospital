const express = require('express');
const cors = require('cors'); // Importar cors
require('dotenv').config(); // Importar dotenv variable de entorno
const app = express(); 
const port = process.env.PORT || 5000;  //Hace referencia a la variable entorno    
app.use (cors()); // Habilitar cors 
app.use(express.json()); // Habilitar json
//importar rutas
const authRoutes = require('./routes/auth'); // Importar las rutas de autenticación
const pacientesRoutes = require ('./routes/pacientes')
const citasRoutes = require ('./routes/citas')

//usar rutas

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/citas', citasRoutes);

//ruta de ejemplo

app.get ('/', (req, res) => {
    res.send('Hola desde el servidor Express');   
});
    
//inicia el servisor
app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
})
