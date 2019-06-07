const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        const usuario = await Usuarios.findOne({email});
        
        // El usuario no existe
        if(!usuario) return done(null, false, {
            message: 'Usuario no Existente'
        });

        // El usuario existe y verificar su validez
        const verificarPass = usuario.compararPassword(password);
        if(!verificarPass) return done(null, false, {
            message: 'Contraseña incorrecta'
        });

        // El usuario verificado
        return done(null, usuario);
    })
);

passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;