import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    // Alertas
    const alertas = document.querySelector('.alertas');
    if(alertas){
        limpiarAlertas();
    }

    // Skills
    const skills = document.querySelector('.lista-conocimientos');
    if(skills){
        skills.addEventListener('click', agregarSkills);

        // Una vez en editar, llamar la función
        skillsSeleccionados();
    }

    // Acciones del administrador
    const vacantesListado = document.querySelector('.panel-administracion');
    if(vacantesListado){
        vacantesListado.addEventListener('click', accionesListado);
    }
});

const skills = new Set();

const agregarSkills = e => {
    //console.log(e.target);
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // Quitar del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // Agracar al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }

    const skillsArray = [...skills];
    //console.log(skillsArray);
    document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    //console.log(seleccionadas);

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    });

    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(() => {
        if(alertas.children.length > 0){
            alertas.removeChild(alertas.children[0]);
        } else if(alertas.children.length === 0){
            alertas.parentElement.removeChild(alertas);
            clearInterval(interval);
        }
    }, 2000);
}

// Eliminar Vacante
const accionesListado = e => {
    e.preventDefault();
    
    if(e.target.dataset.eliminar){
        // eliminando por axios
        
        Swal.fire({
            title: '¿Confirmar Eliminación?',
            text: "Una vez Eliminada, no se puede recuperar",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText: 'No, Cancelar'
        }).then((result) => {
            if (result.value) {
                // enviar la petición con axios
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                
                // Axios para eliminar el registro
                axios.delete(url, {params: { url }})
                    .then(function(respuesta){
                        if(respuesta.status === 200){
                            Swal.fire(
                                '¡¡Eliminada!!',
                                respuesta.data,
                                'success'
                            );

                            // Eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    });
            }
        });
    } else if(e.target.tagName === 'A'){
        window.location.href = e.target.href;
    }
}