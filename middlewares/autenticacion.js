var jwt = require('jsonwebtoken');

//constantes
var SEED = require('../config/config').SEED;

//====================================================================
//                   Verificar token middleware.
//====================================================================(

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token',
                errors: err
            });
        }
        req.usuario = decoded.usuario;

        next();


    });

}