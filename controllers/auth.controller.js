const axios = require('axios');
const { googleVerificarId } = require('../helpers/google-verificar-id');
const { generarJWT } = require('../helpers/administrar-token');

const googleLogin = async ( req, res ) => 
{
	const { id_token } = req.body;

	try
	{
		const { id, email, name, given_name, family_name, picture } = await googleVerificarId(id_token);

		// generar el jwt
		const payload = {
			email, 
			given_name, 
			family_name, 
			picture, 
		}

		const token = await generarJWT(payload);
		if (token)
		{
			return res.json({
				token,
			});
		}
		else
		{
			return res.status(400).json({
				msg: 'No se puedo generar el token',
			});
		}
		
	}
	catch (e)
	{
		return res.status(400).json({
			msg: 'Token de google no valido',
		});
	}
}


const recaptchaLogin = async(req, res) => 
{
	const { responseCaptcha } = req.body;

	const instance = axios.create({
		baseURL: `https://www.google.com/recaptcha/api/siteverify`,
		params: {
			secret: process.env.GOOGLE_CAPTCHA,
			response: responseCaptcha
		}
	});

	try
	{
		const resp = await instance.post();
		const { data } = resp;
		if(data.success === true)
		{
			// generar el jwt
			const payload = {
				email: '', 
				given_name: '', 
				family_name: '', 
				picture: 'anonimo',
				time: data.challenge_ts
			}

			const token = await generarJWT(payload);
			if (token)
			{
				return res.json({
					token,
				});
			}
			else
			{
				return res.status(400).json({
					msg: 'No se puedo generar el token',
				});
			}
		}
		else
		{
			return res.status(401).json({
				msg: 'Respuesta captcha no valida',
			});
		}

	}
	catch(e)
	{
		return res.status(400).json({
			msg: 'Respuesta recaptcha no valido',
		});
	}
}


const renovarToken = async(req, res) => 
{

	const { datosUsuario } = req;

	const { iat, exp, ...payload} = datosUsuario;

	//generar token
	const token = await generarJWT(payload);
	
	if (token)
	{
		return res.json({
			estado: true,
			usuario: payload,
			token,
		});
	}
	else
	{
		return res.status(400).json({
			estado: false,
			msg: 'No se puedo generar el token',
		});
	}
};


module.exports = {
	googleLogin,
	recaptchaLogin,
	renovarToken,
}