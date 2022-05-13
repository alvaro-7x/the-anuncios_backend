const jwt = require('jsonwebtoken');
const { comprobarJWT, generarJWT } = require('../helpers/administrar-token');


const validarJWT = async (req, res, next) => 
{
	const token = req.header('x-token');

	if( !token )
	{
		return res.status(401).json({
			estado: false,
			msg: 'Token no enviado'
		});
	}

	const payload = comprobarJWT(token);
	res.header("Access-Control-Expose-Headers","x-token");
	let nuevoToken = '';

	if(!payload)
	{
		res.setHeader('x-token', nuevoToken);
		return res.status(401).json({
			estado: false,
			msg: 'Token no valido'
		});
	}

	req.datosUsuario = payload;
	
	// En cada peticion si existe un token valido, lo actualizamos y lo enviamos
	const { iat, exp, ...datosToken} = payload;
	nuevoToken = await generarJWT(datosToken);
	res.setHeader('x-token', nuevoToken);

	next();
}

module.exports = {
	validarJWT
}