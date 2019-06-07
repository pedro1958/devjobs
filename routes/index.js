const express = require('express');
const router = express.Router();

// Controllers
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    // Home
    router.get('/', homeController.mostrarTrabajos);
    // Vacantes
    // Crear vacante    
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva', 
        authController.verificarUsuario, 
        vacantesController.validarVacante, 
        vacantesController.crearNuevaVacante
    );
    // Mostrar vacante
    router.get('/vacantes/:url',  
        vacantesController.mostrarVacante
    );
    // Recibir mensajes de candidatos
    router.post('/vacantes/:url',
        vacantesController.subirCV, 
        vacantesController.contactar
    );
    // Editar Vacante
    router.get('/vacantes/editar/:url',  
        authController.verificarUsuario, 
        vacantesController.formularioEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario, 
        vacantesController.validarVacante, 
        vacantesController.editarVacante
    );
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    );
    // Buscador
    router.post('/buscador',
        vacantesController.buscador
    );
    // Candidatos
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostarCandidatos
    );

    // Usuarios
    // Crear Cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
        usuariosController.validarRegistro,
        usuariosController.crearUsuario    
    );
    // Autenticar Usuario
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    // Resetear password
    router.get('/reestablecer-password', authController.formResetearPassword);
    router.post('/reestablecer-password', authController.enviarToken);
    // Reestablecer Password
    router.get('/reestablecer-password/:token', authController.formReestablecerPassword);
    router.post('/reestablecer-password/:token', authController.cambiarPassword);
    // Editar perfil
    router.get('/editar-perfil',
        authController.verificarUsuario, 
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil', 
        authController.verificarUsuario, 
        //usuariosController.validarPerfil, 
        usuariosController.subirImagen, 
        usuariosController.editarPerfil
    );
    // Cerrar sesión
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );
    // Administración
    // panel
    router.get('/administracion', 
        authController.verificarUsuario, 
        authController.mostrarPanel
    );
    
    return router;
}