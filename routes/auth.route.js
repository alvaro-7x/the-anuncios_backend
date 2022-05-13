const { googleVerificarId } = require('../helpers/google-verificar-id');

const { Router } = require('express');
const router = Router();

const { googleLoginValidation, recaptchaLoginValidation, renovarTokenValidation  } = require('../validations/auth.validation');
const { googleLogin, recaptchaLogin, renovarToken } = require('../controllers/auth.controller');


// Auth 
router.post('/google',googleLoginValidation, googleLogin);
router.post('/recaptcha',recaptchaLoginValidation, recaptchaLogin);
router.get('/renovar-token', renovarTokenValidation,renovarToken);


module.exports = router;