var express = require('express');
var fs = require('fs');

// se mueve import y uso de fileUpload al app raiz porque no veia req.files el objeto volvia null

// var fileUpload = require('express-fileupload');

var app = express();


// middleware
// app.use(fileUpload());

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.put('/:tipo/:id', (req, res, next) => {

    // declaro variables para asignar los valores que me vienen por la url
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion

    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];
    if (tiposValidos.indexOf(tipo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });

    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono ninguna imagen',
            errors: { message: 'Debe seleccionar una imagen' },
            req: req.files
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extensiones.
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas }
        });

    }
    // nombre de archivo personalizado.
    // ej. 1231231324656-123.png el nombre se forma por el id de quien sube la img + un random

    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo} `;

    // mover el archivo del temp a un path

    var path = `./uploads/${tipo}/${nombreArchivo} `;

    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        //     res.status(200).json({
        //         ok: true,
        //         mensaje: 'Archivo movido correctamente',
        //         extension: extensionArchivo
        //     });
    })


});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            // en caso de que no exista el usuario. ...

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });

            }

            //en caso de ver algun error en el path....
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en el path',
                    errors: err
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar registro' + usuario,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });

            })



        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico existe' }
                });
            }

            //en caso de ver algun error en el path....

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en el path',
                    errors: err
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;


            // si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar registro' + medico,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: medicoActualizado
                });

            })



        });


    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no exite',
                    errors: { message: 'Hospital existe' }
                });
            }


            //en caso de ver algun error en el path....

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en el path',
                    errors: err
                });
            }
            var pathViejo = './uploads/usuarios/' + hospital.img;

            // si existe elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar registro' + hospital,
                        errors: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    hospital: hospitalActualizado
                });

            })



        });


    }


}



// Pensar en la implementacion de codigo en funciones para no reescribir siempre lo mismo...
// por ejemplo funciones de manejo de errores.

// function error(err) {
//     if (err) {
//         return res.status(400).json({
//             ok: false,
//             mensaje: 'Error en el path',
//             errors: err
//         });
//     }

// }



module.exports = app;