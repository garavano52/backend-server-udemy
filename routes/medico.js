var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ========================================
// Obtener todos los medicos
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; 
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos)=> {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,   // Por ES6 o lo mismo usuarios:usuarios. 
                    total: conteo
                });
            })

            
        })
});


// ========================================
// Crear un nuevo Medico
// ========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => { 
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado)=>{ 
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});


// ========================================
// Actualizar Medico
// ========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id: ' + id + ' no existe.',
                errors: { message: 'No existe un médico con ese id.' }
            });
        }

        medico.nombre  = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado)=>{ 
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});


// ========================================
//  Borrar un médico por el ID
// ========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }
        if ( !medicoBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe médico con ese id.',
                errors: { message: 'No existe médico con ese id.' }
            });
        } 
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
}); 

module.exports = app;