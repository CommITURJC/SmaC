async function cargarBotonera() {
  var contenedor = document.getElementById('botoneraNavegacion');
  if(!contenedor)return;
  var rol = 'USER'; //ES EL ROL DEL USUARIO POR DEFECTO
  try{
    var res = await fetch('/api/miPerfil');//HAY QUE LLAMAR PARA OBTENER EL ROL ESPECÍFICO DEL USUARIO, YA QUE PUEDE NO SER USER Y TENER QUE CARGAR MÁS FUNCIONALIDAD
    var data = await res.json();
    if(data && data.rol){
      rol = data.rol;//SE OBTIENE EL ROL DEL USUARIO AUTRENTICADO
    }
  } 
  catch(error){
    console.log('Error loading the role of the user currently using the tool');
  }
  var paginaActual = window.location.pathname.split('/').pop();
  var opciones = [ //SE CARGAN LAS OPCIONES DE LA CINTA DE NAVEGACION
    { texto: '🏠 Home', ruta: 'home.html' },
    { texto: '🧩 SmaCly', ruta: 'editor.html' },
    { texto: '📂 Workspaces', ruta: 'workspaces.html' },
    { texto: '📋 Activity logs', ruta: 'logs.html' }];//FIN CINTA DE NAVEGACIÓN
  if(rol === 'PROFESSOR' || rol === 'ADMIN'){ //SI ES UNO DE ESTOS ROLES PUEDE ACCEDER A LA GESTION DE USUARIOS
    opciones.push({ texto: '👥 Users', ruta: 'gestion_usuarios.html' });
  }
  opciones.push({ texto: '👤 My profile', ruta: 'edicion_datos_usuario.html' });

  contenedor.innerHTML = '';
  for(var i = 0; i < opciones.length; i++){
    var opcion = opciones[i];
    if (opcion.ruta === paginaActual) continue;

    var boton = document.createElement('input');
    boton.type = 'button';
    boton.value = opcion.texto;
    boton.className = 'button';

    boton.onclick = (function(ruta) {
      return function() {
        window.location.href = ruta;
      };
    })(opcion.ruta);

    contenedor.appendChild(boton);
  }
}



document.addEventListener('DOMContentLoaded', function () {
  cargarBotonera();
});

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Solicita confirmación mediante el cuadro de diálogo, guarda los logs pendientes del editor y envía el formulario de cierre de sesión
PARÁMETRO DE SALIDA: Ninguno
*/
async function cerrarSesionUsuario() {
  var confirmar = false;
  if (typeof solicitarConfirmacionEditor === "function") {
    confirmar = await solicitarConfirmacionEditor("Log out","Would you like to log out?");
  }
  else{
    confirmar = window.confirm("Would you like to log out?");
  }
  if(!confirmar) {
    return;
  }
  if (typeof registrarLogsMongo === "function") {
    await registrarLogsMongo();
  }
  var form = document.getElementById("formLogout");
  if (!form) {
    console.error("The logout form could not be found");
    if (typeof mostrarMensajeEditor === "function") {
      await mostrarMensajeEditor("Log out","The logout form could not be found.",false);
    }
    return;
  }
  form.submit();
}

function activarIconoCerrarSesion() {
  const icono = document.getElementById("salirSesion");
  if (icono) {
    icono.addEventListener("click", cerrarSesionUsuario);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  activarIconoCerrarSesion();
});
