require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

const sitios = require('./routes/sitios.route');
const auth = require('./routes/auth.route');

/* MIDLEWARES */
//app.disable('etag'); 

// cors
const corsOptions = {
    origin : ['http://localhost:8080'],
}  
app.use( cors(corsOptions) );

// parseo de datos
app.use( express.json() );

// archivos estaticos
app.use(express.static('public'));



/* RUTAS */
// Autenticacion
app.use('/auth', auth);

//sitio de donde se obtendran los datos
app.use('/web', sitios);




app.get('*', (req, res)=>
{
	res.sendFile(path.resolve(__dirname, 'public/index.html'));
});



app.listen(PORT, () =>
{
	console.log('servidor corriendo el puerto: '+ PORT);
});

