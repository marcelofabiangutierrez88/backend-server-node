var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuario = require('../models/usuario')


//====================================================
// Busqueda por coleccion.
//====================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:

            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla no válido' }

            });

    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data

        });

    })

});


//====================================================
// Busqueda General.
//====================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');



    // me permite guardar todas las promesas en un arreglo y hacerlos asincronos para traer 
    // todos los resultados.

    Promise.all([
            buscarHospitales(busqueda, regex, 'hospitales'),
            buscarMedicos(busqueda, regex, 'medicos'),
            buscarUsuarios(busqueda, regex, 'medicos')
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]

            });

        })

});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales)
                }
            });
    });


}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Medicos.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos)
                }
            });
    });

}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role').or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('error al cargar usuarios', err)
                } else {
                    resolve(usuarios);
                }

            });
    });


}

module.exports = app;