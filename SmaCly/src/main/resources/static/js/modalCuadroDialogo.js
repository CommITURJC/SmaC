var resolverModalMensajeEditor = null;
var elementoFocoAnteriorModal = null;
var overflowAnteriorDocumento = "";


/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea el cuadro de diálogo general cuando la página todavía no contiene su estructura HTML
PARÁMETRO DE SALIDA: Elemento HTML que representa el cuadro de diálogo
*/
function crearModalMensajeEditorSiNoExiste() {
  var modal = document.getElementById("modalMensajeEditor");
  if (modal) {
    return modal;
  }
  modal = document.createElement("div");
  modal.id = "modalMensajeEditor";
  modal.className = "modal-editor-fondo";
  modal.innerHTML = '<div class="modal-editor-caja" role="dialog" aria-modal="true" aria-labelledby="tituloModalMensajeEditor" aria-describedby="contenidoModalMensajeEditor"><h2 id="tituloModalMensajeEditor" class="modal-editor-titulo">Message</h2><div id="contenidoModalMensajeEditor" class="modal-editor-mensaje"></div><div class="modal-editor-acciones"><button type="button" id="cancelarModalMensajeEditorBtn" class="button boton-secundario" hidden>Cancel</button><button type="button" id="aceptarModalMensajeEditorBtn" class="button">Accept</button></div></div>';
  document.body.appendChild(modal);
  return modal;
}

/*
PARÁMETRO DE ENTRADA: Título, mensaje, indicador de confirmación e indicador de desplazamiento vertical
DESCRIPCIÓN: Abre el cuadro de diálogo general del editor y configura su contenido y sus botones
PARÁMETRO DE SALIDA: Promesa que devuelve true al aceptar y false al cancelar
*/
function abrirModalMensajeEditor(titulo, mensaje, esConfirmacion, conScroll) {
  crearModalMensajeEditorSiNoExiste();
  var modal = document.getElementById("modalMensajeEditor");
  var tituloModal = document.getElementById("tituloModalMensajeEditor");
  var contenido = document.getElementById("contenidoModalMensajeEditor");
  var botonAceptar = document.getElementById("aceptarModalMensajeEditorBtn");
  var botonCancelar = document.getElementById("cancelarModalMensajeEditorBtn");

  if (!modal || !tituloModal || !contenido || !botonAceptar || !botonCancelar) {
    console.error("The editor dialog could not be found");
    return Promise.resolve(false);
  }

  if (typeof resolverModalMensajeEditor === "function") {
    resolverModalMensajeEditor(false);
    resolverModalMensajeEditor = null;
  }

  elementoFocoAnteriorModal = document.activeElement;
  overflowAnteriorDocumento = document.body.style.overflow;
  tituloModal.textContent = titulo || "Message";
  contenido.textContent = mensaje || "";
  contenido.className = "modal-editor-mensaje";

  if (conScroll === true) {
    contenido.classList.add("modal-editor-mensaje-scroll");
  }

  contenido.scrollTop = 0;
  botonCancelar.hidden = esConfirmacion !== true;
  document.body.style.overflow = "hidden";
  modal.style.display = "flex";

  window.setTimeout(function() {
    botonAceptar.focus();
  }, 0);

  return new Promise(function(resolve) {
    resolverModalMensajeEditor = resolve;
  });
}

/*
PARÁMETRO DE ENTRADA: Resultado seleccionado por el usuario
DESCRIPCIÓN: Cierra el cuadro de diálogo y resuelve la promesa pendiente
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalMensajeEditor(resultado) {
  var modal = document.getElementById("modalMensajeEditor");

  if (modal) {
    modal.style.display = "none";
  }

  document.body.style.overflow = overflowAnteriorDocumento;

  if (typeof resolverModalMensajeEditor === "function") {
    resolverModalMensajeEditor(resultado === true);
  }

  resolverModalMensajeEditor = null;

  if (elementoFocoAnteriorModal && typeof elementoFocoAnteriorModal.focus === "function") {
    elementoFocoAnteriorModal.focus();
  }

  elementoFocoAnteriorModal = null;
}

/*
PARÁMETRO DE ENTRADA: Título, mensaje e indicador de desplazamiento vertical
DESCRIPCIÓN: Muestra un mensaje informativo mediante el cuadro de diálogo general
PARÁMETRO DE SALIDA: Promesa que finaliza cuando el usuario acepta el mensaje
*/
function mostrarMensajeEditor(titulo, mensaje, conScroll) {
  return abrirModalMensajeEditor(titulo, mensaje, false, conScroll === true);
}

/*
PARÁMETRO DE ENTRADA: Título y mensaje de confirmación
DESCRIPCIÓN: Solicita al usuario que acepte o cancele una operación del editor
PARÁMETRO DE SALIDA: Promesa con true si acepta y false si cancela
*/
function solicitarConfirmacionEditor(titulo, mensaje) {
  return abrirModalMensajeEditor(titulo, mensaje, true, false);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea el cuadro de diálogo cuando sea necesario y registra sus eventos de aceptación, cancelación y teclado
PARÁMETRO DE SALIDA: Ninguno
*/
function prepararModalMensajeEditor() {
  crearModalMensajeEditorSiNoExiste();
  var botonAceptar = document.getElementById("aceptarModalMensajeEditorBtn");
  var botonCancelar = document.getElementById("cancelarModalMensajeEditorBtn");
  if(botonAceptar){
    botonAceptar.addEventListener("click",function() {cerrarModalMensajeEditor(true);});
  }
  if(botonCancelar) {
    botonCancelar.addEventListener("click",function() {cerrarModalMensajeEditor(false);});
  }
  document.addEventListener("keydown",function(evento) {
    var modal = document.getElementById("modalMensajeEditor");
    if (evento.key === "Escape" && modal && modal.style.display === "flex") {
      cerrarModalMensajeEditor(false);
    }
  });
}

document.addEventListener("DOMContentLoaded", prepararModalMensajeEditor);