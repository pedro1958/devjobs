const mongoose = require('mongoose');
// Databases
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

// rutas
const routes = require('./routes');

require('dotenv').config({path: 'variables.env'});

// Crear una app de express
const app = express();

// Definir el puerto
app.set('port', process.env.PUERTO || 4000);

// Habilitar el bodyParsw para leer los datos del formulario
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Habilitar validación de campos
app.use(expressValidator());

// Plantilla
app.engine('.hbs',
    exphbs({
        defaultLayout: 'layout',
        helpers: require('./helpers/handlebars'),
        extname: '.hbs'
    })
);
app.set('view engine', '.hbs');

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Cookie y sesión
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash message
app.use(flash());

// Crear middleware para mensajes y autenticación
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

// Rutas
app.use('/', routes());

// Error 404, página no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
});

// Administración de los errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('home/error');
});

// Dejar que heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;
app.listen(port. host, () => {
    console.log('El servidor corriendo');
});/**/

// Iniciar servidor
/*app.listen(app.get('port'), () => {
    console.log('Servidor corriendo...');
    console.log(`Ir a http://localhost:${app.get('port')}`);
});*/