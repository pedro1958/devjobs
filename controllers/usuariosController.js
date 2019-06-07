const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require('shortid');

exports.formCrearCuenta = (req, res) => {
    res.render('usuarios/crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, sólo debes crear una cuenta'
    });
}

exports.validarRegistro = (req, res, next) => {
    // Saniizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();

    // Crear mensajes de validación
    req.checkBody('nombre', 'El Nombre es Obligatorio').notEmpty();
    req.checkBody('email', 'El Email es Obligatorio').notEmpty();
    req.checkBody('email', 'El Email debe ser valido').isEmail();
    req.checkBody('password', 'La contraseña no puede ir vacia').notEmpty();
    req.checkBody('confirmar', 'Confirmar contraseña no puede ir vacia').notEmpty();
    req.checkBody('confirmar', 'La contraseña es diferente').equals(req.body.password);

    const errores = req.validationErrors();

    if(errores){
        // Si hay errores
        req.flash('error', errores.map(error => error.msg));

        res.render('usuarios/crear-cuenta', {
            nombrePagina: 'Crea tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis, sólo debes crear una cuenta',
            mensajes: req.flash()
        });

        return;
    }

    // Si toda la validacion es correcta
    next();
}

exports.crearUsuario = async (req, res, next) => {
    // Crear el Usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        // Redireccionar
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        // Redireccionar
        res.redirect('/crear-cuenta');
    }
}

exports.formIniciarSesion = (req, res) => {
    res.render('usuarios/iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión en devJobs',
        tagline: 'Inicia sesión para publicar tus vacantes'
    });
}

exports.formEditarPerfil = (req, res) => {
    res.render('usuarios/editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        cerrarSesion: true,
        nombre: req.user.nombre,
        usuario: req.user,
        imagen: req.user.imagen
    });
}

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }

    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    // Mensaje
    req.flash('correcto', 'Cambios guardados correctamente');

    // Redireccionar
    res.redirect('/administracion');
}

// Validat y sanitizar formulario editar perfil
exports.validarPerfil = (req, res, next) => {
    // Sanitizar los campos
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }

    // Validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El email no puede ir vacio').notEmpty();

    // Errores
    const errores = req.validationErrors();

    // Si hay errores
    if(errores){
        req.flash('error', errores.map(error => error.msg));

        // Recargar la vista con errores
        res.render('usuarios/editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            cerrarSesion: true,
            nombre: req.user.nombre,
            usuario: req.user,
            imagen: req.user.imagen,
            mensajes: req.flash()
        });
    }

    // No hay errores
    next();
}

exports.subirImagen = (req, res, next) => {
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
            res.redirect('/administracion');
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
            cb(null, __dirname+'../../public/uploads/perfiles');
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        },
        fileFilter: (req, file, cb) => {
            if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
                cb(null, true);
            } else {
                cb(new Error('Formato no Valido'), false);
            }
        }
    })
}

const upload = multer(configuracionMuler).single('imagen');