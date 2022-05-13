const jwt = require('jsonwebtoken');

const { googleVerificarId } = require('./google-verificar-id');


const generarJWT = ( data = null ) => 
{
	if(!data)
	{
		//throw new Error('Se debe enviar un payload distinto de null para generar el token.');
		return null;
	}

	if(Object.keys(data).length == 0)
	{
		return null;
	}

	return new Promise( ( resolve, reject) => 
	{
		const payload = data;

		jwt.sign(payload, process.env.PRIVATE_KEY, { expiresIn: '3h'} ,(error, token) =>
		{
			if(error)
			{
				console.log(error);
				reject(null);
			}
			else
			{
				resolve(token);
			}
		})
	});
}

const comprobarJWT = (token) =>
{
	try
	{
		const segmentos = token.split('.');
		if (segmentos.length !== 3)
		{
			return null;
		}

		const payload = jwt.verify(token, process.env.PRIVATE_KEY);

		return payload;
	}
	catch(e)
	{
		return null;
	}
}


module.exports = {
	generarJWT,
	comprobarJWT,
}