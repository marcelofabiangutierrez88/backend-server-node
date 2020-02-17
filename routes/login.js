//levantando express
var express = require('express');
var app = express();

//libreria para encriptar
var bcrypt = require('bcryptjs');
// json web token
var jwt = require('jsonwebtoken');

// schema del usuario
var Usuario = require('../models/usuario');

//constantes
var SEED = require('../config/config').SEED;

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales invalidas - password',
                errors: err
            });

        }

        // crear un token!!
        usuarioDB.password = '=)';

        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }) //4 hs

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    })


});

module.exports = app;