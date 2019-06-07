const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('vacantes/nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.crearNuevaVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // Autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de conocimientos (skills)
    vacante.skills = req.body.skills.split(',');

    // Almacenar en la base de datos
    const nuevaVacante = await vacante.save();

    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor');
    //console.log(vacante);

    if(!vacante) return next();

    if(req.user){
        res.render('vacantes/vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true,
            botonEditar: true
        });
    } else {
        res.render('vacantes/vacante', {
            vacante,
            nombrePagina: vacante.titulo,
            barra: true,
            botonEditar: false
        });
    }
}

exports.formularioEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});
    //console.log(vacante);

    if(!vacante) return next();

    res.render('vacantes/editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

exports.editarVacante = async (req, res, next) => {
    const vacanteActualizada = req.body;
    const {url} = req.params;

    vacanteActualizada.skills = req.body.skills.split(',');
    
    const vacante = await Vacante.findOneAndUpdate({url}, vacanteActualizada, {
        new: true,
        runValidators: true
    });

    res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y sanitizar los campos en formularios
exports.validarVacante = (req, res, next) => {
    // Sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    //req.sanitizeBody('descripcion').escape();
    req.sanitizeBody('skills').escape();

    // Validar
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    // Errores
    const errores = req.validationErrors();

    // Si hay errores
    if(errores){
        req.flash('error', errores.map(error => error.msg));

        // Recargar la vista con errores
        res.render('vacantes/nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        });
    }

    // No hay errores
    next();
}

exports.eliminarVacante = async (req, res) => {
    const {id} = req.params;

    const vacante = await Vacante.findById(id);

    console.log(vacante);

    if(verificarAutor(vacante, req.user)){
        // Si es el usuario, eliminar
        vacante.remove();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // No permitido
        res.status(403).send('Error');
    }
    //
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
}

exports.subirCV = (req, res, next) => {
    upload(req, res, function(error){
        if(error) {
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande. Máximo 100kb');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            return next();
        }
    });
}

// Opciones de multer
const configuracionMuler = {
    storage: fileStorage = multer.diskStorage({
        limits: {fileSize: 100000},
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        },
        fileFilter: (req, file, cb) => {
            if(file.mimetype === 'application/pdf'){
                cb(null, true);
            } else {
                cb(new Error('Formato no Valido'), false);
            }
        }
    })
}

const upload = multer(configuracionMuler).single('cv');

// Almacenar los candidatos en BD
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url});

    // Sino existe la vacante
    if(!vacante) return next();

    // Existe la vacante, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    };

    // agregar a vacante el objeto
    vacante.candidatos.push(nuevoCandidato);

    // Guardar en la BD
    await vacante.save();

    // Mensaje flash y redireccionar
    req.flash('correcto', 'Se envío Tu Curriculum Correctamente');
    res.redirect('/');
}

exports.mostarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id);

    // Validar
    if(req.user._id.toString() != vacante.autor){
        return next();
    }

    if(!vacante) return next();

    //pasando la validación
    res.render('vacantes/candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    });
}

exports.buscador = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });

    // mostrar las vacantes
    res.render('home/home', {
        nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    });
}