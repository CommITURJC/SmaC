var codigoSolidityE3Value = '';
var contratoElegidoE3Value = '';
var contratosE3Value = [];
var eventosE3Value = [];
var preguntasObjetosE3Value = [];

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Obtiene el código Solidity generado desde el workspace actual de Blockly e inicia el flujo de conversión a e3value
PARÁMETRO DE SALIDA: Ninguno
*/
function iniciarConversionE3ValueDesdeEditor() {
  if (!window.workspace) {
    alert('No se encontró el workspace de Blockly.');
    return;
  }

  if (typeof SolidityGenerator === 'undefined') {
    alert('No se encontró el generador de Solidity.');
    return;
  }

  var codigoSolidity = SolidityGenerator.workspaceToCode(window.workspace);

  iniciarConversionE3ValueDesdeCodigo(codigoSolidity);
}

/*
PARÁMETRO DE ENTRADA: Código Solidity que se quiere convertir a e3value
DESCRIPCIÓN: Comprueba que exista código Solidity y comienza el flujo común de conversión a e3value
PARÁMETRO DE SALIDA: Ninguno
*/
function iniciarConversionE3ValueDesdeCodigo(codigoSolidity) {
  if (codigoSolidity == null || codigoSolidity.trim() === '') {
    alert('No hay código Solidity para convertir.');
    return;
  }

  codigoSolidityE3Value = codigoSolidity;
  contratoElegidoE3Value = '';
  contratosE3Value = [];
  eventosE3Value = [];
  preguntasObjetosE3Value = [];

  crearModalesE3ValueSiNoExisten();
  obtenerContratosE3Value();
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea los modales necesarios para la conversión e3value si todavía no existen en la página
PARÁMETRO DE SALIDA: Ninguno
*/
function crearModalesE3ValueSiNoExisten() {
  if (!document.getElementById('modalSeleccionContratoE3Value')) {
    crearModalSeleccionContratoE3Value();
  }
  if (!document.getElementById('modalConfiguracionE3Value')) {
    crearModalConfiguracionE3Value();
  }
  if (!document.getElementById('modalResultadoE3Value')) {
    crearModalResultadoE3Value();
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea el modal que permite seleccionar el contrato Solidity que se quiere convertir
PARÁMETRO DE SALIDA: Ninguno
*/
function crearModalSeleccionContratoE3Value() {
  var modal = document.createElement('div');
  modal.id = 'modalSeleccionContratoE3Value';
  modal.className = 'modal_e3value';
  modal.style.display = 'none';

  modal.innerHTML =
    '<div class="modal_e3value_contenido">' +
      '<h2>Seleccionar contrato</h2>' +
      '<p class="texto_modal_e3value">Selecciona el contrato Solidity que quieres convertir a e3value.</p>' +

      '<div class="campo">' +
        '<label for="selectContratoE3Value">Contrato</label>' +
        '<select id="selectContratoE3Value"></select>' +
      '</div>' +

      '<div class="acciones_modal_e3value">' +
        '<button type="button" class="button" onclick="confirmarContratoE3Value()">Continuar</button>' +
        '<button type="button" class="button boton-secundario" onclick="cerrarModalSeleccionContratoE3Value()">Cancelar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea el modal donde se configuran los tipos de eventos y los objetos de valor de vuelta
PARÁMETRO DE SALIDA: Ninguno
*/
function crearModalConfiguracionE3Value() {
  var modal = document.createElement('div');
  modal.id = 'modalConfiguracionE3Value';
  modal.className = 'modal_e3value';
  modal.style.display = 'none';

  modal.innerHTML =
    '<div class="modal_e3value_contenido modal_e3value_grande">' +
      '<h2>Configurar conversión e3value</h2>' +

      '<h3>Tipos de eventos</h3>' +
      '<p class="texto_modal_e3value">Indica si cada evento es inicial o final</p>' +
      '<div id="contenedorEventosE3Value"></div>' +

      '<h3>Objetos de valor de vuelta</h3>' +
      '<p class="texto_modal_e3value">Indica el objeto de valor de vuelta si existe</p>' +
      '<div id="contenedorObjetosE3Value"></div>' +
      '<div class="acciones_modal_e3value">' +
        '<button type="button" class="button" onclick="convertirE3Value()">Generar e3value</button>' +
        '<button type="button" class="button boton-secundario" onclick="cerrarModalConfiguracionE3Value()">Cancelar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea el modal donde se muestra el XML e3value generado
PARÁMETRO DE SALIDA: Ninguno
*/
function crearModalResultadoE3Value() {
  var modal = document.createElement('div');
  modal.id = 'modalResultadoE3Value';
  modal.className = 'modal_e3value';
  modal.style.display = 'none';

  modal.innerHTML =
    '<div class="modal_e3value_contenido modal_e3value_grande">' +
      '<h2>Resultado e3value</h2>' +
      '<div class="campo">' +
        '<label for="resultadoXmlE3Value">XML generado</label>' +
        '<textarea id="resultadoXmlE3Value" readonly></textarea>' +
      '</div>' +
      '<div class="acciones_modal_e3value">' +
        '<button type="button" class="button" onclick="descargarXmlE3Value()">Descargar XML</button>' +
        '<button type="button" class="button boton-secundario" onclick="cerrarModalResultadoE3Value()">Cerrar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Solicita al backend los contratos Solidity encontrados en el código actual
PARÁMETRO DE SALIDA: Ninguno
*/
async function obtenerContratosE3Value() {
  try {
    var respuesta = await fetch('/api/e3value/contratos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(crearPeticionBaseE3Value())
    });

    if (!respuesta.ok) {
      throw new Error('Error obteniendo contratos');
    }

    contratosE3Value = await respuesta.json();

    if (!contratosE3Value || contratosE3Value.length === 0) {
      alert('No se encontraron contratos en el código Solidity.');
      return;
    }

    if (contratosE3Value.length === 1) {
      contratoElegidoE3Value = contratosE3Value[0];
      prepararConfiguracionE3Value();
    }
    else {
      mostrarModalSeleccionContratoE3Value();
    }
  }
  catch (error) {
    console.error(error);
    alert('No se pudieron obtener los contratos Solidity.');
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Crea la petición base con el código Solidity y las opciones de compilación
PARÁMETRO DE SALIDA: Objeto JSON con los datos necesarios para analizar o convertir el contrato
*/
function crearPeticionBaseE3Value() {
  return {
    codigoFuenteContrato: codigoSolidityE3Value,
    nombreArchivoContrato: 'ContratoGenerado.sol',
    optimizadorActivo: true,
    ejecucionesOptimizador: 200
  };
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Muestra el modal de selección de contrato y rellena el selector con los contratos encontrados
PARÁMETRO DE SALIDA: Ninguno
*/
function mostrarModalSeleccionContratoE3Value() {
  var modal = document.getElementById('modalSeleccionContratoE3Value');
  var select = document.getElementById('selectContratoE3Value');

  select.innerHTML = '';

  for (var i = 0; i < contratosE3Value.length; i++) {
    var option = document.createElement('option');
    option.value = contratosE3Value[i];
    option.textContent = contratosE3Value[i];
    select.appendChild(option);
  }

  modal.style.display = 'flex';
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Cierra el modal de selección de contrato
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalSeleccionContratoE3Value() {
  var modal = document.getElementById('modalSeleccionContratoE3Value');

  if (modal) {
    modal.style.display = 'none';
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Guarda el contrato elegido por el usuario y continúa con la preparación de la conversión e3value
PARÁMETRO DE SALIDA: Ninguno
*/
function confirmarContratoE3Value() {
  var select = document.getElementById('selectContratoE3Value');

  if (!select || !select.value) {
    alert('Debes seleccionar un contrato.');
    return;
  }

  contratoElegidoE3Value = select.value;
  cerrarModalSeleccionContratoE3Value();
  prepararConfiguracionE3Value();
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Valida si el contrato tiene los componentes mínimos y, si es correcto, solicita al backend los eventos y las preguntas de objetos de valor del contrato seleccionado
PARÁMETRO DE SALIDA: Ninguno
*/
async function prepararConfiguracionE3Value() {
  try {
    var payload = crearPeticionBaseE3Value();
    payload.contratoElegido = contratoElegidoE3Value;

    var validacion = await validarContratoE3Value();

    if (!validacion.valido) {
      mostrarAlertaComponentesMinimosE3Value(validacion);
      return;
    }

    var respuestaEventos = await fetch('/api/e3value/eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!respuestaEventos.ok) {
      throw new Error('Error obteniendo eventos');
    }

    eventosE3Value = await respuestaEventos.json();

    var respuestaObjetos = await fetch('/api/e3value/preguntas-objetos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!respuestaObjetos.ok) {
      throw new Error('Error obteniendo objetos de valor');
    }

    preguntasObjetosE3Value = await respuestaObjetos.json();

    mostrarModalConfiguracionE3Value();
  }
  catch (error) {
    console.error(error);
    alert('No se pudo preparar la configuración e3value.');
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Muestra el modal de configuración con los eventos y objetos de valor obtenidos del backend
PARÁMETRO DE SALIDA: Ninguno
*/
function mostrarModalConfiguracionE3Value() {
  var modal = document.getElementById('modalConfiguracionE3Value');
  var contenedorEventos = document.getElementById('contenedorEventosE3Value');
  var contenedorObjetos = document.getElementById('contenedorObjetosE3Value');

  contenedorEventos.innerHTML = '';
  contenedorObjetos.innerHTML = '';

  pintarEventosE3Value(contenedorEventos);
  pintarPreguntasObjetosE3Value(contenedorObjetos);

  modal.style.display = 'flex';
}

/*
PARÁMETRO DE ENTRADA: Contenedor HTML donde se pintarán los eventos
DESCRIPCIÓN: Rellena el contenedor con un selector para indicar si cada evento es inicial o final
PARÁMETRO DE SALIDA: Ninguno
*/
function pintarEventosE3Value(contenedorEventos) {
  if (!eventosE3Value || eventosE3Value.length === 0) {
    contenedorEventos.innerHTML = '<p>No hay eventos para configurar.</p>';
    return;
  }

  for (var i = 0; i < eventosE3Value.length; i++) {
    var evento = eventosE3Value[i];

    var div = document.createElement('div');
    div.className = 'campo';

    div.innerHTML =
      '<label>' + escaparHtmlE3Value(evento) + '</label>' +
      '<select class="tipoEventoE3Value" data-evento="' + escaparHtmlE3Value(evento) + '">' +
        '<option value="INITIAL">INITIAL</option>' +
        '<option value="FINAL">FINAL</option>' +
      '</select>';

    contenedorEventos.appendChild(div);
  }
}

/*
PARÁMETRO DE ENTRADA: Contenedor HTML donde se pintarán las preguntas
DESCRIPCIÓN: Rellena el contenedor con campos para indicar los objetos de valor de vuelta
PARÁMETRO DE SALIDA: Ninguno
*/
function pintarPreguntasObjetosE3Value(contenedorObjetos) {
  if (!preguntasObjetosE3Value || preguntasObjetosE3Value.length === 0) {
    contenedorObjetos.innerHTML = '<p>No hay objetos de valor de vuelta que configurar.</p>';
    return;
  }

  for (var i = 0; i < preguntasObjetosE3Value.length; i++) {
    var pregunta = preguntasObjetosE3Value[i];

    var texto = pregunta.origen + ' → ' + pregunta.destino + ' / ' + pregunta.actividad;

    var div = document.createElement('div');
    div.className = 'campo';

    div.innerHTML =
      '<label>' + escaparHtmlE3Value(texto) + '</label>' +
      '<input type="text" class="objetoValorE3Value" data-clave="' + escaparHtmlE3Value(pregunta.clave) + '" placeholder="Objeto de valor de vuelta">';

    contenedorObjetos.appendChild(div);
  }
}




/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Cierra el modal donde se muestra el XML e3value generado
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalResultadoE3Value() {
  cerrarModalE3Value('modalResultadoE3Value');
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Cierra el modal de configuración e3value y limpia el mensaje de validación
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalConfiguracionE3Value() {
  cerrarModalE3Value('modalConfiguracionE3Value');
}

/*
PARÁMETRO DE ENTRADA: Identificador del modal que se quiere cerrar
DESCRIPCIÓN: Cierra el modal indicado si existe en la página
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalE3Value(idModal) {
  var modal = document.getElementById(idModal);

  if (modal) {
    modal.style.display = 'none';
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Llama al backend para comprobar si el contrato seleccionado tiene los componentes mínimos necesarios para generar un modelo e3value
PARÁMETRO DE SALIDA: Objeto con el resultado de la validación
*/
async function validarContratoE3Value() {
  var payload = crearPeticionBaseE3Value();
  payload.contratoElegido = contratoElegidoE3Value;

  var respuesta = await fetch('/api/e3value/validar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!respuesta.ok) {
    throw new Error('Error validando contrato e3value');
  }

  return await respuesta.json();
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Recoge la configuración indicada por el usuario y solicita al backend la generación del XML e3value
PARÁMETRO DE SALIDA: Ninguno
*/
async function convertirE3Value() {
  try {
   
    var tiposEventos = obtenerTiposEventosSeleccionadosE3Value();
    var objetosValorVuelta = obtenerObjetosValorVueltaE3Value();

    var payload = crearPeticionBaseE3Value();
    payload.contratoElegido = contratoElegidoE3Value;
    payload.tiposEventos = tiposEventos;
    payload.objetosValorVuelta = objetosValorVuelta;

    var respuesta = await fetch('/api/e3value/convertirE3Value', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!respuesta.ok) {
      throw new Error('Error convirtiendo a e3value');
    }

    var data = await respuesta.json();

    if (!data || !data.xml) {
      alert('No se recibió el XML e3value');
      return;
    }

    cerrarModalConfiguracionE3Value();
    mostrarResultadoE3Value(data.xml);
  }
  catch (error) {
    console.error(error);
    alert('No se pudo generar el XML e3value');
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Recoge los tipos de eventos seleccionados por el usuario
PARÁMETRO DE SALIDA: Mapa con el nombre del evento y el tipo seleccionado
*/
function obtenerTiposEventosSeleccionadosE3Value() {
  var tiposEventos = {};
  var selects = document.querySelectorAll('.tipoEventoE3Value');
  for (var i = 0; i < selects.length; i++) {
    var nombreEvento = selects[i].getAttribute('data-evento');
    tiposEventos[nombreEvento] = selects[i].value;
  }

  return tiposEventos;
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Recoge los objetos de valor de vuelta escritos por el usuario
PARÁMETRO DE SALIDA: Mapa con la clave de la relación y el objeto de valor indicado
*/
function obtenerObjetosValorVueltaE3Value() {
  var objetosValorVuelta = {};
  var inputs = document.querySelectorAll('.objetoValorE3Value');

  for (var i = 0; i < inputs.length; i++) {
    var clave = inputs[i].getAttribute('data-clave');
    var valor = inputs[i].value;

    if (valor != null && valor.trim() !== '') {
      objetosValorVuelta[clave] = valor.trim();
    }
  }

  return objetosValorVuelta;
}

/*
PARÁMETRO DE ENTRADA: XML e3value generado por el backend
DESCRIPCIÓN: Muestra en pantalla el XML generado
PARÁMETRO DE SALIDA: Ninguno
*/
function mostrarResultadoE3Value(xml) {
  var modal = document.getElementById('modalResultadoE3Value');
  var textarea = document.getElementById('resultadoXmlE3Value');

  textarea.value = xml;
  modal.style.display = 'flex';
}

/*
PARÁMETRO DE ENTRADA: Resultado de la validación devuelto por el backend
DESCRIPCIÓN: Muestra una alerta indicando los componentes mínimos que faltan para poder abrir la configuración e3value
PARÁMETRO DE SALIDA: Ninguno
*/
function mostrarAlertaComponentesMinimosE3Value(validacion) {
  var mensaje = 'No se puede configurar la conversión e3value porque el contrato no cumple los requisitos mínimos\n\n';

  mensaje += 'Elementos encontrados:\n';
  mensaje += '- Actores: ' + (validacion.numeroActores || 0) + '\n';
  mensaje += '- Eventos: ' + (validacion.numeroEventos || 0) + '\n';
  mensaje += '- Funciones: ' + (validacion.numeroFunciones || 0) + '\n';
  mensaje += '- Relaciones de valor: ' + (validacion.numeroRelacionesValor || 0) + '\n\n';

  mensaje += 'Elementos que faltan:\n';

  if (validacion.errores && validacion.errores.length > 0) {
    for (var i = 0; i < validacion.errores.length; i++) {
      mensaje += '- ' + validacion.errores[i] + '\n';
    }
  }
  else {
    mensaje += '- No se pudo determinar el motivo exacto\n';
  }

  alert(mensaje);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Cierra el modal donde se muestra el XML e3value generado
PARÁMETRO DE SALIDA: Ninguno
*/
function cerrarModalResultadoE3Value() {
  var modal = document.getElementById('modalResultadoE3Value');

  if (modal) {
    modal.style.display = 'none';
  }
}




/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Descarga el XML e3value generado en un archivo
PARÁMETRO DE SALIDA: Ninguno
*/
function descargarXmlE3Value() {
  var textarea = document.getElementById('resultadoXmlE3Value');

  if (!textarea || textarea.value.trim() === '') {
    alert('No hay XML e3value para descargar.');
    return;
  }

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(textarea.value));
  element.setAttribute('download', 'e3value.xml');

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/*
PARÁMETRO DE ENTRADA: Texto que se quiere escapar para pintarlo en HTML
DESCRIPCIÓN: Evita que caracteres especiales puedan romper el HTML que se genera
PARÁMETRO DE SALIDA: Texto escapado para HTML
*/
function escaparHtmlE3Value(texto) {
  if (texto == null) {
    return '';
  }

  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}