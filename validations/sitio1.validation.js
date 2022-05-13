
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');


const sitio1Validation = [
	validarJWT,
	check('departamento','El departamento es requerido').not().isEmpty(),
	check('termino','El campo termino solo acepta texto alfabetico').trim().escape(),
	check('page','El campo page solo acepta datos numericos').optional().isNumeric(),
	validarCampos
]


module.exports = {
	sitio1Validation,
}
