
var logsEventos = [];//Array para conservar todos los logs que se producen
var idSession = generateId(); //Para generar por sesión un ID único
var indiceInicioDescargaUsuario = 0;//Para indicar desde que log se ha de descargar cuando el usuario marque la casilla de registrar logs
var ultimoIndiceLogGuardado = 0; // Marca hasta qué log ya se envió a MongoDB
var guardandoLogsMongo = false;  // Evita envíos simultáneos
var intervaloGuardadoLogs = null;
var timeLastAction = time();//Inicializo la fecha
var idFile; //Para asignar al resto de bloques el ID del bloque Fichero
var workspace = null;
var workspaceIdActual = localStorage.getItem('workspaceIdActual') || "";
const cantidadLogsPendientesMaximo = 50;
const tiempoSegundosSinGuardarLogs = 200000;


/*
Parámetro de entrada: El evento que se ha producido en el workspace
Descripción: Crea un elemento log y lo almacena en el array de logs para conservarlo. Antes de crearlo, hace una limpieza de eventos innecesarios que se producen y carecen de valor
*/

function logger(e) { 
  if(!(e.type == Blockly.Events.DELETE && e.group == "") && !(e.type == Blockly.Events.CREATE && e.group == "") 
  && !(e.type == Blockly.Events.MOVE && e.group == "")  && !(e.type == Blockly.Events.UI && e.element != "category" && e.group == "" && workspace.getBlockById(e.newValue) == null)){
    var logEvento = new LogEventBlockly(e);
    logsEventos.push(logEvento); 
    comprobarGuardadoAutomaticoPorCantidad();//Se comprueba si ha superado el umbral de pendientes, si lo ha superado, se mete en mongoDb
  }
}

/*
  Descripción: Parsea a texto los logs del array del evento para poder descargar un archivo en el que están recogidos todos estos
*/
function saveLog(){
  var logEvento = new LogEventButtonBlockly("downloadLog",workspace);
  logsEventos.push(logEvento); 
  comprobarGuardadoAutomaticoPorCantidad();
  var logsUsuario = logsEventos.slice(indiceInicioDescargaUsuario);//Devuelve un array con los logs desde que el usuario marcó la casilla
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logsUsuario));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",dataStr);
  downloadAnchorNode.setAttribute("download","logEvents.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/*
  Descripción: Devuelve un trozo del array desde el ultimo log que se guardó en el array
*/
function obtenerLogsPendientes() {
  return logsEventos.slice(ultimoIndiceLogGuardado);
}

/*
    Parámetro de entrada: Si el usuario ha marcado o desmarcado la opción de registrar eventos
    Descripción: Activa el registro de eventos en la aplicación
  */
/*function logEvents(state) {
  var checkbox1 = document.getElementById('logCheck');
  var checkbox2 = document.getElementById('logFlyoutCheck');
  var buttonSaveLog = document.getElementById('saveLogButton');
  checkbox1.checked = state;
  if (sessionStorage) {
    sessionStorage.setItem('logEvents', Number(state));
  }
  if (state) {
    buttonSaveLog.disabled = false;
    workspace.addChangeListener(logger);
    const logEvento = new LogEventButtonBlockly("activateLogEvent",workspace);
    logsEventos.push(logEvento);
  } else {
    workspace.removeChangeListener(logger);
    const logEvento = new LogEventButtonBlockly("disableLogEvent",workspace);
    logsEventos.push(logEvento);
    if((checkbox1.checked == false) && (checkbox2.checked == false)){
      buttonSaveLog.disabled = true;
    }
  }
}

function logFlyoutEvents(state) {
  var checkbox1 = document.getElementById('logCheck');
  var checkbox2 = document.getElementById('logFlyoutCheck');
  var buttonSaveLog = document.getElementById('saveLogButton');
  checkbox2.checked = state;
  if (sessionStorage) {
    sessionStorage.setItem('logFlyoutEvents', Number(state));
  }
  var flyoutWorkspace = workspace.getFlyout().getWorkspace();
  if (state) {
    buttonSaveLog.disabled = false;
    flyoutWorkspace.addChangeListener(logger);
    const logEvento = new LogEventButtonBlockly("activateLogFlyoutEvent",workspace);
    logsEventos.push(logEvento);
  } else {
    flyoutWorkspace.removeChangeListener(logger);
    const logEvento = new LogEventButtonBlockly("disableLogFlyoutEvent",workspace);
    logsEventos.push(logEvento);
    if((checkbox1.checked == false) && (checkbox2.checked == false)){
      buttonSaveLog.disabled = true;
    }
  }
}*/
  
function enlazarLoggerWorkspace() {
  if (!window.workspace) {
    return;
  }
  workspace = window.workspace;
  workspace.removeChangeListener(logger);
  workspace.addChangeListener(logger);
}

function registerLogs(state){
  var checkbox1 = document.getElementById('logCheck');
  var buttonSaveLog = document.getElementById('saveLogButton');
  checkbox1.checked = state;
  if (sessionStorage) {
    sessionStorage.setItem('logEvents', Number(state));
    sessionStorage.setItem('logFlyoutEvents', Number(state));
  }
  if (state) {
    indiceInicioDescargaUsuario = logsEventos.length;
    buttonSaveLog.disabled = false;
    var logEvento1 = new LogEventButtonBlockly("activateLogEvent", workspace);
    logsEventos.push(logEvento1);
    comprobarGuardadoAutomaticoPorCantidad();
  } else {
    buttonSaveLog.disabled = true;
    var logEvento1 = new LogEventButtonBlockly("disableLogEvent", workspace);
    logsEventos.push(logEvento1);
    comprobarGuardadoAutomaticoPorCantidad();
  }
}

/*
DESCRIPCIÓN: Comprueba si el numero de logs pendientes de subir a mongo es mayor que la cantidad establecida máxima, si lo es, los registra 
*/
function comprobarGuardadoAutomaticoPorCantidad() {
  var logsPendientes = obtenerLogsPendientes();
  if (logsPendientes.length >= cantidadLogsPendientesMaximo) {
    registrarLogsMongo();
  }
}

/*
DESCRIPCIÓN: Comprueba si ha pasado el tiempo máximo sin guardar, si ha pasado, los registra
*/
function iniciarGuardadoAutomaticoLogsMongo() {
  if (intervaloGuardadoLogs != null) {
    return;
  }
  intervaloGuardadoLogs = setInterval(function () {
    registrarLogsMongo();
  }, tiempoSegundosSinGuardarLogs);
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Envía los logs pendientes al abandonar la página utilizando el identificador actualizado del workspace
PARÁMETRO DE SALIDA: Ninguno
*/
function registrarLogsMongoAlSalir() {
  workspaceIdActual = localStorage.getItem("workspaceIdActual") || workspaceIdActual;
  var logsPendientes = obtenerLogsPendientes();
  if (!logsPendientes || logsPendientes.length === 0) {
    return;
  }

  if (!workspaceIdActual) {
    console.warn("No logs are saved upon exit because there is no ID for the current workspace yet");
    return;
  }

  var payload = {workspaceId: workspaceIdActual,logs: logsPendientes };
  fetch("/api/registrarLogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(function(error) {
    console.error("Error saving logs when leaving the editor:", error);
  });
}

 
async function registrarLogsMongo() {
  workspaceIdActual = localStorage.getItem('workspaceIdActual') || workspaceIdActual;
  if (guardandoLogsMongo) {
    return;
  }
  var logsPendientes = obtenerLogsPendientes();

  if (!logsPendientes || logsPendientes.length === 0) {
    return;
  }
  if (!workspaceIdActual) {
    console.warn("No logs are saved because there is not yet a defined ID for the workspace you are currently working on");
    return;
  }
  guardandoLogsMongo = true;
  var totalAntesDeGuardar = logsEventos.length;
  var payload = { workspaceId: workspaceIdActual, logs: logsPendientes };//SE ASOCIA EL ID DEL WORKSPACE CON LOS LOGS
  console.log("workspaceIdActual:", workspaceIdActual);
  console.log("logsPendientes:", logsPendientes);
  try {
    const response = await fetch("/api/registrarLogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    const resultado = await response.json();
    if (resultado.exito) {
      ultimoIndiceLogGuardado = totalAntesDeGuardar;
      console.log("Logs stored in MongoDB:", resultado.mensaje);
    }
    else{
      console.warn("Logs could not be saved into MongoDB", resultado.mensaje);
    }

  } 
  catch (error) {
    console.error("Error saving logs into MongoDB", error);
  } finally {
    guardandoLogsMongo = false;
  }
}


/*
 PARÁMETRO DE ENTRADA: Tipo de acción realizada y workspace actual
 DESCRIPCIÓN: Representa un log generado al pulsar un botón del editor
 PARÁMETRO DE SALIDA: Instancia de LogEventButtonBlockly
*/
class LogEventButtonBlockly {
  constructor(typeActionButton, workspaceActual) {
    this.idSession = idSession;
    this.idEvent = generateId();
    this.typeEvent = "click tool button";
    this.date = time();

    switch (typeActionButton) {
      case "seeXML":
        this.action = "see XML file";
        break;
      case "seeSolidity":
        this.action = "see XML file";
        break;
      case "downloadXML":
        this.action = "download XML file";
        break;
      case "compileSolidityCode":
        this.action = "compile Solidity code";
        break;
      case "downloadSolidity":
        this.action = "download Solidity file";
        break;
      case "downloadVyper":
        this.action = "download Vyper file";
        break;
      case "downloadLog":
        this.action = "download Log file";
        break;
      case "cleanBlocks":
        this.action = "clean workspace";
        break;
      case "importXML":
        this.action = "import XML file";
        break;
      case "transform":
        this.action = "transform to XML language";
        break;
      case "transformBlockToSolidity":
        this.action = "transform to Solidity code";
        break;
      case "transformBlockToVyper":
        this.action = "transform to Vyper code";
        break;
      case "activateLogFlyoutEvent":
        this.action = "activate flyout event logs";
        break;
      case "disableLogFlyoutEvent":
        this.action = "disable flyout event logs";
        break;
      case "activateLogEvent":
        this.action = "activate event logs";
        break;
      default:
        this.action = "disable event logs";
        break;
    }
  }
}

/*
 PARÁMETRO DE ENTRADA: Fecha en la que se detecta la inactividad
DESCRIPCIÓN: Representa un periodo de inactividad del usuario
PARÁMETRO DE SALIDA: Instancia de LogEventInactive
*/
class LogEventInactive {
  constructor(currentDate) {
    this.idSession = idSession;
    this.idEvent = generateId();
    this.typeEvent = "Inactive";
    this.date = currentDate;
  }
}

/*
 PARÁMETRO DE ENTRADA: Evento generado por Blockly
DESCRIPCIÓN: Analiza un evento de Blockly y construye el log correspondiente
PARÁMETRO DE SALIDA: Instancia de LogEventBlockly
*/
class LogEventBlockly {
  constructor(e) {
    this.idSession = idSession;
    this.typeEvent = e.type;
    this.date = time();

    calculateTimeLastAction(timeLastAction);
    timeLastAction = this.date;

    this.idBlock = e.blockId;
    this.idEvent = generateId();

    var block;

    switch (e.type) {
      case Blockly.Events.CREATE:
        eventCreateBlock(e, this, block);
        break;
      case Blockly.Events.CHANGE:
        eventChangeBlock(e, this);
        break;
      case Blockly.Events.MOVE:
        eventMoveBlock(e, this);
        break;
      case Blockly.Events.DELETE:
        eventDeleteBlock(e, this, block);
        break;
      case Blockly.Events.UI:
        eventUIBlock(e, this, block);
        break;
      case Blockly.Events.FINISHED_LOADING:
        this.action = "workspace is ready";
        break;
      default:
        this.action = "not recognized";
        break;
    }
  }
}

  /*
  * Parámetros de entrada: El evento producido que es de tipo CREATE, el log a construir y el bloque que se mueve
  * Descripción: Creación del log que registra la creación de un bloque o recuperación de estos tras haberse borrado en el lienzo
  */
  function eventCreateBlock(e,log,block){
    if(e.ids.length > 1){
      log.action = "recover workspace";
      var idBlocks = [];
      log.workspace = [];
      for(var i=0;i<e.ids.length;i++){//Saco los ids de los elementos que se eliminaron
        idBlocks[i] =  e.ids[i];
      }
      log.idBlock = idBlocks;
      log.amountBlocksCreated = idBlocks.length;
      for(var i=0;i < idBlocks.length;i++){//Saco los bloques que recupero de nuevo para el workspace
        block = {
          idBlock: workspace.getBlockById(idBlocks[i]).id,
          typeBlock: workspace.getBlockById(idBlocks[i]).type,
        }
        log.workspace[i] = block;
      } 
   }
   else{
      log.action = "create element";
      log.nowValueBlock = e.xml.textContent;  
      log.typeBlock = e.xml.attributes[0].value;   
      log.workspace = block;
      log.amountBlocksCreated = 1;
   }
  }

  /*
  * Parámetros de entrada: El evento producido que es de tipo CHANGE, el log a construir y el bloque que se modifica
  * Descripción: Creación del log que registra la modificación que se ha realizado sobre un bloque o conjunto de estos
  */
  function eventChangeBlock(e,log){
    log.typeBlock = workspace.getBlockById(log.idBlock).type;
    if(e.element == "collapsed"){
      if(e.newValue == false && e.oldValue == true){
        log.action = "extend block";
      }
      else if(e.newValue == true && e.oldValue == false){
        log.action = "collapse block";
      }            
    }
    else if(e.element == "inline"){
      if(e.newValue == true && e.oldValue == false){
        log.action = "change block for inline entries";
      }
      else if(e.newValue == false && e.oldValue == true){
        log.action = "change block for external entries";
      }            
    }
    else if(e.element == "disabled"){
      if(e.newValue == false && e.oldValue == true){
        log.action = "enable block";
      }
      else if(e.newValue == true && e.oldValue == false){
        log.action = "disable block";
      }            
    }    
    else if(e.element == "field"){
      log.oldValueBlock = e.oldValue;
      log.nowValueBlock = e.newValue;        
      log.action = "change value block field";
    }           
    else if(e.element == "comment"){
      log.oldValueBlock = e.oldValue;
      log.nowValueBlock = e.newValue; 
      if(e.oldValue == null && e.newValue == ""){
        log.action = "create comment"
      }
      else{
        if(e.newValue == null && (e.oldValue != "" || e.oldValue != null)){
          log.action = "remove comment";
        }
      }
    }
  }


  /*
  * Parámetros de entrada: El evento producido que es de tipo MOVE, el log a construir y el bloque que se mueve
  * Descripción: Creación del log que registra el movimiento que se ha realizado sobre un bloque o conjunto de estos
  */
  function eventMoveBlock(e,log){
    log.typeBlock = workspace.getBlockById(log.idBlock).type;
    if(e.oldInputName != "" && e.oldInputName != null){
      log.typeBlock = e.oldInputName;
      log.action = "move:" + log.typeBlock;     
    }
    else{
      log.action = "move";
    }
    if(e.oldCoordinate != null){
      log.originCoordinateX = e.oldCoordinate.x;
      log.originCoordinateY = e.oldCoordinate.y;
      log.originCoordinate =  '('+ e.oldCoordinate.x + "," + e.oldCoordinate.y + ')';
    }
    if(e.newCoordinate != null){
      log.destinyCoordinateX = e.newCoordinate.x; 
      log.destinyCoordinateY = e.newCoordinate.y;
      log.destinyCoordinate =  '('+ e.newCoordinate.x + "," + e.newCoordinate.y + ')';
    }
  }

  /*
  * Parámetros de entrada: El evento producido que es de tipo DELETE, el log a construir y el bloque que se borra
  * Descripción: Creación del log que registra el movimiento que se ha realizado sobre un bloque o conjunto de estos
  */
  function eventDeleteBlock(e,log,block){
    log.nowValueBlock = e.oldXml.textContent;     
    var idBlocks = [];
    log.workspace = [];
    if(e.ids.length > 1){
    for(var i=0;i<e.ids.length;i++){//Saco los ids de los elementos que elimino en caso de que sea + de 1 elemento
      idBlocks[i] =  e.ids[i];
      block = {
          idBlock: workspace.getBlockById(idBlocks[i]).id,
          typeBlock: workspace.getBlockById(idBlocks[i]).type,
      }
      log.blockDelete[i] = block;            
    }
    log.idBlock = idBlocks;
    }
    else{
      log.typeBlock = e.oldXml.attributes[0].value; 
    }
    log.blockDelete = e.oldXml.toString;
  }

  /*
  * Parámetros de entrada: El evento producido que es de tipo UI, el log a construir y el bloque con el que se interactua
  * Descripción: Creación del log que registra la acción del usuario que se ha realizado sobre un bloque o conjunto de estos
  */
  function eventUIBlock(e,log,block){
    if(e.element == "category"){
      log.action = "select toolbox option"
      log.category = e.newValue;
      if(e.oldValue == null){
        log.lastOptionSelect = "none";
      }
      else{
        log.lastOptionSelect = e.oldValue;
      }
   }
   else if(e.element == "selected"){
      if((e.newValue == "" || e.newValue == null) && e.oldValue != null){
          block = {
            idBlock: workspace.getBlockById(e.oldValue).id,
            typeBlock: workspace.getBlockById(e.oldValue).type,
          }
          log.action = "select delete block option";
          log.blockSelect = block;
          log.idBlock = block.idBlock;
          log.typeBlock = block.typeBlock;
      }
      else if((e.newValue == "" || e.newValue == null) && e.oldValue == null){//Se abre el menu de opciones sobre el elemento
        log.action = "open menu block option";
        block = {
          idBlock: workspace.getBlockById(e.newValue).id,
          typeBlock: workspace.getBlockById(e.newValue).type,
        }
        log.blockSelect = block;
      }    
      else if((e.newValue != "" || e.newValue != null) && e.oldValue != null){//Se ha seleccionado un bloque desde la barra de x
        if(workspace.getBlockById(e.newValue) != null){ 
          log.action = "select type block from toolbox";
          block = {
            idBlock: workspace.getBlockById(e.newValue).id,
            typeBlock: workspace.getBlockById(e.newValue).type,
          }
          log.blockSelect = block;
        }
      }   
      else if((e.newValue != "" || e.newValue != null) && e.oldValue == null){//Se ha seleccionado un bloque desde la barra de herramienta
        if(workspace.getBlockById(e.newValue) != null){ 
          log.action = "select type block from workspace";
          block = {
            idBlock: workspace.getBlockById(e.newValue).id,
            typeBlock: workspace.getBlockById(e.newValue).type,
          }
          log.blockSelect = block;
        }
      }            
   }  
   else if(e.element == "commentOpen"){
       if(e.newValue == false && e.oldValue == true){
        log.action = "close comment";
       }
       else if(e.newValue == true && e.oldValue == false){
        log.action = "open comment";
       }            
   }  
   else if(e.element == "dragStart"){  
      log.blocksDrag = [];
      for(var i=0;i<e.newValue.length;i++){//Saco los bloques que arrastro
        block = {
          idBlock: e.newValue[i].id,
          typeBlock: e.newValue[i].type,
        }
        log.blocksDrag[i] = block;
      } 
      log.action = "start drag element";    
   }  
   else if(e.element == "dragStop"){  
      log.blocksDrag = [];
      for(var i=0;i<e.oldValue.length;i++){//Saco los bloques que arrastro
        block = {
          idBlock: e.oldValue[i].id,
          typeBlock: e.oldValue[i].type,
        }
        log.blocksDrag[i] = block;
      }  
      log.action = "stop drag element";   
   }
  }

  /*  
    Descripción: Calcula la hora actual y la devuelve como un string
    Parámetro de salida: String de la hora actual
  */
  function time(){
    return new Date().toISOString();
  }

  /*  
    Descripción: Calcula la hora actual y la devuelve como un string
    Parámetro de salida: String de la hora actual
  */
    function timeToLocaleString(){
      return new Date().toLocaleString();
    }

  /*
  Descripción: Calcula el intervalo entre la ultima acción y la actual
  Parámetro de salida: String de la hora actual
 */
  function calculateTimeLastAction(timeLastAction){
    // Convertir la cadena de fecha guardada de nuevo a un objeto Date
    let lastAction = new Date(timeLastAction);
    // Obtener la fecha actual
    let currentDate = new Date();
    // Calcular la diferencia en milisegundos
    let differenceInMilliseconds = currentDate - lastAction;
    // Convertir la diferencia a minutos
    let differenceInMinutes = differenceInMilliseconds / 1000 / 60;
    if (differenceInMinutes > 2){
      logEvento1 = new LogEventInactive(currentDate);
      logsEventos.push(logEvento1);
      comprobarGuardadoAutomaticoPorCantidad();
    }  // Retorna true si han pasado más de 5 minutos

  }

   /*  
    Descripción:Genera un identificador único
    Parámetro de salida: Genera un id para el log
  */
  function generateId() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  var funcionesEditorLogs = [
  "logger",
  "saveLog",
  "obtenerLogsPendientes",
  "enlazarLoggerWorkspace",
  "registerLogs",
  "comprobarGuardadoAutomaticoPorCantidad",
  "iniciarGuardadoAutomaticoLogsMongo",
  "registrarLogsMongoAlSalir",
  "registrarLogsMongo",
  "eventCreateBlock",
  "eventChangeBlock",
  "eventMoveBlock",
  "eventDeleteBlock",
  "eventUIBlock",
  "time",
  "timeToLocaleString",
  "calculateTimeLastAction",
  "generateId"
];

for (var i = 0; i < funcionesEditorLogs.length; i++) {
  var nombreFuncion = funcionesEditorLogs[i];

  if (typeof window[nombreFuncion] === "function") {
    window[nombreFuncion].__archivoOrigen = "editorLogs.js";
  }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Inicia el guardado automático de logs cuando se carga la página
PARÁMETRO DE SALIDA: Ninguno
*/
document.addEventListener("DOMContentLoaded", function() {
  iniciarGuardadoAutomaticoLogsMongo();
});

/*
PARÁMETRO DE ENTRADA: Evento de cambio de visibilidad
DESCRIPCIÓN: Intenta guardar los logs cuando la página deja de estar visible
PARÁMETRO DE SALIDA: Ninguno
*/
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "hidden") {
    registrarLogsMongoAlSalir();
  }
});

/*
 PARÁMETRO DE ENTRADA: Evento de salida de la página
DESCRIPCIÓN: Intenta guardar los logs antes de abandonar la página
 PARÁMETRO DE SALIDA: Ninguno
*/
window.addEventListener("pagehide", function() {
  registrarLogsMongoAlSalir();
});