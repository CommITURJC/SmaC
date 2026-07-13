window.__smaclyRefactor = window.__smaclyRefactor || {};
window.__smaclyRefactor.editorWorkspaceCargado = true;

/*
 PARÁMETRO DE ENTRADA: Ninguno
 DESCRIPCIÓN: Obtiene el workspace de Blockly que está abierto en el editor
PARÁMETRO DE SALIDA: Workspace de Blockly o null si todavía no existe
*/
function obtenerWorkspaceEditor() {
  if (window.workspace) {
    return window.workspace;
  }

  return null;
}

/*
 PARÁMETRO DE ENTRADA: Nombre de la acción realizada en el editor
DESCRIPCIÓN: Crea un log de una acción del workspace y comprueba si debe guardarse en MongoDB
PARÁMETRO DE SALIDA: Ninguno
*/
function registrarLogWorkspace(tipoAccion) {
  var workspaceActual = obtenerWorkspaceEditor();
  if (!workspaceActual) {
    return;
  }
  if (typeof LogEventButtonBlockly !== "function") {
    return;
  }
  if (typeof logsEventos === "undefined" || !Array.isArray(logsEventos)) {
    return;
  }
  var logEvento = new LogEventButtonBlockly(tipoAccion, workspaceActual);
  logsEventos.push(logEvento);
  if (typeof comprobarGuardadoAutomaticoPorCantidad === "function") {
    comprobarGuardadoAutomaticoPorCantidad();
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Convierte los bloques del workspace a XML y muestra el resultado en el área de código
PARÁMETRO DE SALIDA: true si se genera el XML y false si el editor no está disponible
*/
function toXml() {
  var workspaceActual = obtenerWorkspaceEditor();
  var output = document.getElementById("XmlArea");
  if (!workspaceActual || !output) {
    return false;
  }
  var xml = Blockly.Xml.workspaceToDom(workspaceActual);
  output.value = Blockly.Xml.domToPrettyText(xml);
  registrarLogWorkspace("seeXML");
  textAreaChange();
  var botonTransformar = document.getElementById("tranformButtonBlockly");
  var botonGuardar = document.getElementById("saveXMLButton");
  if (botonTransformar) {
    botonTransformar.disabled = output.value.trim() === "";
  }
  if (botonGuardar) {
    botonGuardar.disabled = output.value.trim() === "";
  }
  if (typeof actualizarNumerosLineasCodigo === "function") {
    actualizarNumerosLineasCodigo();
  }
  output.focus();
  output.select();
  return true;
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Genera el XML del workspace y lo descarga en un archivo
    PARÁMETRO DE SALIDA: true si se inicia la descarga y false si el workspace no está disponible
*/
function saveXml() {
  var workspaceActual = obtenerWorkspaceEditor();

  if (!workspaceActual) {
    return false;
  }

  registrarLogWorkspace("downloadXML");

  var xml = Blockly.Xml.workspaceToDom(workspaceActual);
  var textoXml = Blockly.Xml.domToText(xml);
  var blob = new Blob([textoXml], { type: "text/xml;charset=utf-8" });
  var url = window.URL.createObjectURL(blob);
  var enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "SmaClyContract.xml";

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  window.setTimeout(function() {
    window.URL.revokeObjectURL(url);
  }, 0);

  return true;
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Solicita confirmación y elimina todos los bloques del workspace
    PARÁMETRO DE SALIDA: true si se limpia el workspace y false si no se realiza la limpieza
*/
function cleanWorkspace() {
  var workspaceActual = obtenerWorkspaceEditor();

  if (!workspaceActual) {
    return false;
  }

  var cantidadBloques = workspaceActual.getAllBlocks(false).length;

  if (cantidadBloques === 0) {
    return false;
  }

  var confirmar = window.confirm("Delete all blocks in workspace?");

  if (!confirmar) {
    return false;
  }

  registrarLogWorkspace("cleanBlocks");
  workspaceActual.clear();

  if (typeof generateId === "function" && typeof idSession !== "undefined") {
    idSession = generateId();
  }

  checkBlocksAmount();

  return true;
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Lee el archivo XML seleccionado, muestra su contenido y lo convierte automáticamente en bloques
    PARÁMETRO DE SALIDA: Ninguno
*/
/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Lee el archivo XML seleccionado, muestra su contenido, lo convierte en bloques y muestra el resultado mediante el cuadro de diálogo
PARÁMETRO DE SALIDA: Ninguno
*/
function loadFileAsText() {
  var inputArchivo = document.getElementById("loadFileButton");
  if (!inputArchivo || !inputArchivo.files || !inputArchivo.files[0]) {
    return;
  }
  registrarLogWorkspace("importXML");
  var lector = new FileReader();
  lector.onload = async function(evento) {
    try {
      var contenido = evento.target.result || "";
      var areaCodigo = document.getElementById("XmlArea");

      if(!areaCodigo) {
        await mostrarMensajeEditor("XML import","The code editor could not be found.",false);
        return;
      }

      if(typeof establecerContenidoEditorCodigo === "function") {
        establecerContenidoEditorCodigo(contenido);
      }
      else{
        areaCodigo.value = contenido;
      }

      var botonTransformar = document.getElementById("tranformButtonBlockly");
      var botonVerXml = document.getElementById("seeXMLButton");

      if (botonTransformar) {
        botonTransformar.disabled = contenido.trim() === "";
      }

      if (botonVerXml) {
        botonVerXml.disabled = contenido.trim() === "";
      }

      textAreaChange();
      var convertido = fromXml();

      if (convertido) {
        await mostrarMensajeEditor("XML import","The XML file was imported and converted to blocks successfully.",false);
      }
    }
    catch (error) {
      console.error("Error loading XML file:",error);
      await mostrarMensajeEditor("XML import","The uploaded XML could not be processed.\n\n" + error.message,false);
    }
    finally {
      inputArchivo.value = "";
    }
  };
  lector.onerror = async function(error) {
    console.error("Error reading XML file:",error);
    inputArchivo.value = "";
    await mostrarMensajeEditor("XML import","The XML file could not be read.",false);
  };
  lector.readAsText(inputArchivo.files[0],"UTF-8");
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Convierte el XML escrito en el área de código en bloques del workspace
PARÁMETRO DE SALIDA: true si el XML es válido y false si no puede convertirse
*/
function fromXml() {
  var workspaceActual = obtenerWorkspaceEditor();
  var input = document.getElementById("XmlArea");
  if(!workspaceActual || !input){
    mostrarMensajeEditor("XML conversion","The workspace or code editor is not available.",false);
    return false;
  }

  if(!input.value || input.value.trim() === ""){
    mostrarMensajeEditor("XML conversion","The XML content is empty.",false);
    return false;
  }

  try {
    var xml = Blockly.Xml.textToDom(input.value);
    workspaceActual.clear();
    Blockly.Xml.appendDomToWorkspace(xml,workspaceActual);
    checkBlocksAmount();
    input.focus();
    input.select();
    return true;
  }
  catch (error) {
    console.error("Invalid XML:",error);
    mostrarMensajeEditor("XML conversion","Invalid XML.\n\n" + error.message,false);
    return false;
  }
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Habilita o deshabilita el botón de descarga XML según el contenido del área de código
    PARÁMETRO DE SALIDA: Ninguno
*/
function textAreaChange() {
  var areaCodigo = document.getElementById("XmlArea");
  var botonGuardar = document.getElementById("saveXMLButton");

  if (!areaCodigo || !botonGuardar) {
    return;
  }

  botonGuardar.disabled = areaCodigo.value.trim() === "";
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Habilita o deshabilita los botones que necesitan bloques en el workspace
    PARÁMETRO DE SALIDA: Ninguno
*/
function checkBlocksAmount() {
  var workspaceActual = obtenerWorkspaceEditor();
  if (!workspaceActual) {
    return;
  }

  var activar = workspaceActual.getAllBlocks(false).length > 0;

  var idsDependientes = ["seeXMLButton","cleanBlockButton","seeSolidityCode","saveSolidityCode"];

  for (var i = 0; i < idsDependientes.length; i++) {
    var elemento = document.getElementById(idsDependientes[i]);
    if (elemento) {
      elemento.disabled = !activar;
    }
  }

  textAreaChange();
}

/*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Guarda temporalmente en sessionStorage los bloques del workspace
    PARÁMETRO DE SALIDA: true si se guarda el XML y false si no puede guardarse
*/
function guardarWorkspace() {
  var workspaceActual = obtenerWorkspaceEditor();

  if (!workspaceActual) {
    return false;
  }

  try {
    var xmlDom = Blockly.Xml.workspaceToDom(workspaceActual);
    var xmlTexto = Blockly.Xml.domToText(xmlDom);
    sessionStorage.setItem("smacly_workspace_xml", xmlTexto);
    return true;
  } catch (error) {
    console.error("The workspace could not be stored temporarily:", error);
    return false;
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Restaura en Blockly los bloques guardados temporalmente en sessionStorage
PARÁMETRO DE SALIDA: true si se restaura el workspace y false si no existe un XML temporal válido
*/
function restaurarWorkspace() {
  var workspaceActual = obtenerWorkspaceEditor();
  if(!workspaceActual){
    return false;
  }
  var xmlTexto = sessionStorage.getItem("smacly_workspace_xml");
  if (!xmlTexto) {
    return false;
  }
  try {
    var xmlDom = Blockly.Xml.textToDom(xmlTexto);
    workspaceActual.clear();
    Blockly.Xml.appendDomToWorkspace(xmlDom, workspaceActual);
    sessionStorage.removeItem("smacly_workspace_xml");
    checkBlocksAmount();

    if (typeof actualizarNumerosLineasCodigo === "function") {
      actualizarNumerosLineasCodigo();
    }
    return true;
  } 
  catch (error) {
    console.error("The temporary workspace could not be restored:", error);
    return false;
  }
}


/*
PARÁMETRO DE ENTRADA: Ninguno
 DESCRIPCIÓN: Marca las funciones para comprobar que proceden de editorWorkspace.js
 PARÁMETRO DE SALIDA: Ninguno
*/
function marcarFuncionesEditorWorkspace() {
  var funciones = [
    "obtenerWorkspaceEditor",
    "registrarLogWorkspace",
    "toXml",
    "saveXml",
    "cleanWorkspace",
    "loadFileAsText",
    "fromXml",
    "textAreaChange",
    "checkBlocksAmount",
    "guardarWorkspace",
    "restaurarWorkspace"
    ];

  for (var i = 0; i < funciones.length; i++) {
    var nombreFuncion = funciones[i];

    if (typeof window[nombreFuncion] === "function") {
      window[nombreFuncion].__archivoOrigen = "editorWorkspace.js";
    }
  }
}

marcarFuncionesEditorWorkspace();