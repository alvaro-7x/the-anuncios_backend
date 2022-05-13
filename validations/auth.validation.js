const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

const googleLoginValidation = [
	check('id_token','El id_token es requerido').not().isEmpty(),
	validarCampos
];

const recaptchaLoginValidation = [
	check('responseCaptcha','La respuesta captcha es requerida').not().isEmpty(),
	validarCampos
];


const renovarTokenValidation = [
	validarJWT
];


module.exports = {
	googleLoginValidation,
	recaptchaLoginValidation,
	renovarTokenValidation,
}
