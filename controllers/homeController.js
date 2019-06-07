const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante')

exports.mostrarTrabajos = async (req, res, next) => {
    const vacantes = await Vacante.find();
    //console.log(vacantes);
    
    if(!vacantes) return next();
    
    if(req.user){
        res.render('home/home', {
            nombrePagina: 'devJobs',
            tagline: 'Encuentra y Pública trabajos para Desarrolladores Web',
            barra: true,
            boton: true,
            vacantes
        });
    } else {
        res.render('home/home', {
            nombrePagina: 'devJobs',
            tagline: 'Busca y postula a trabajos para desarrolladores web',
            barra: true,
            boton: false,
            vacantes
        });
    }
}