const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');
const emailConfig = require('../config/email');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Utilizar templates de handlebars
transport.use('compile', hbs({
    viewEngine: {
        extName: 'hbs',
        partialsDir: __dirname+'/../views/emails',
        layoutsDir:  __dirname+'/../views/emails',
        defaultLayout: 'reset.hbs'
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.hbs'
}));

exports.enviar = async(opciones) => {
    const opcionesEmail = {
        from: 'devJobs <noreply@devjobs.com>',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,
        context: {
            resetUrl: opciones.resetUrl
        }
    }

    const sendEmail = util.promisify(transport.sendMail, transport);
    return sendEmail.call(transport, opcionesEmail);
}