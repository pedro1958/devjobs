const moongose = require('mongoose');
moongose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuariosSchema = new moongose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
});

// Método para hashear los passwords
usuariosSchema.pre('save', async function(next){
    // Si el password ya esta hasheado
    if(!this.isModified('password')){
        // Detener la ejecución
        return next();
    }
    // Si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

// Método que verifica si un correo ya existe en BD
usuariosSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoError' && error.code === 11000){
        next('Este correo ya esta registrado');
    } else {
        next(error);
    }    
});

// Autenticar usuarios
usuariosSchema.methods = {
    compararPassword: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = moongose.model('Usuarios', usuariosSchema);