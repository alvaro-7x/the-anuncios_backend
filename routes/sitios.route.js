const { body, check } = require('express-validator');
var { Router } = require('express');
var router = Router();

const { sitio1, sitio2 } = require('../controllers/sitios.controller');
const { sitio1Validation } = require('../validations/sitio1.validation');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

router.get('/uno',sitio1Validation,sitio1);
router.get('/dos',sitio1Validation,sitio2);

module.exports = router;