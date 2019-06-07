const passport = require('passport');
const crypto = require('crypto');

// Modelos
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');

// Email
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

// Verfificar si el usuario esta autenticado
exports.verificarUsuario = (req, res, next) => {
    // Revisar el usuario
    if(req.isAuthenticated()){
        // Esta autenticado
        return next();
    }

    // Redireccionar
    res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res, next) => {
    const vacantes = await Vacante.find({autor: req.user._id});

    res.render('usuarios/administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tus vacantes aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    });
}

exports.formResetearPassword = (req, res) => {
    res.render('usuarios/reestablecer-password', {
        nombrePagina: 'Reestablecer Contraseña en devJobs',
        tagline: 'Si ya tienes cuenta pero olvidaste tu contraseña, coloca tu email'
    });
}

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario){
        req.flash('error', 'No existe esta cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // El usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Actualizar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    //console.log(resetUrl);

    await enviarEmail.enviar({
        usuario,
        subject: 'Resetear Contraseña',
        resetUrl,
        archivo: 'reset'
    });

    // Todo correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}

exports.formReestablecerPassword = async (req, res) => {
    const fechaHoraActual = Date.now();
    //console.log(fechaHoraActual);
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    // db.inventory.find( { qty: { $gt: 20 } } )

    // Si el token o la fecha de expira no es valido
    if(!usuario){
        req.flash('error', 'El formulario no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    // Todo ok, mostrar el formulario
    res.render('usuarios/nuevo-password', {
        nombrePagina: 'Nueva Contraseña'
    });
}

exports.cambiarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    // Si el token o la fecha de expira no es valido
    if(!usuario){
        req.flash('error', 'El formulario no es valido, intenta de nuevo');
        return res.redirect('/reestablecer-password');
    }

    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    // Guardar password
    await usuario.save();

    // Redireccionar
    req.flash('correcto', 'Contraseña modificada correctamente');
    res.redirect('/iniciar-sesion');
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesión correctamente');
    return res.redirect('/iniciar-sesion');
}