const moongose = require('mongoose');
moongose.Promise = global.Promise;
const slug = require('slug');
const shorid = require('shortid');

const vacantesSchema = new moongose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        required: 'La ubicación es obligatoria',
        trim: true
    },
    salario: {
        type: String,
        default: 0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    }, 
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: moongose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});

vacantesSchema.pre('save', function(next){
    // Crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shorid.generate()}`;
    
    next();
});

// Crear un indice
vacantesSchema.index({titulo: 'text'});

module.exports = moongose.model('Vacante', vacantesSchema);