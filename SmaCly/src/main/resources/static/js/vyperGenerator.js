  
"use strict";


var VyperGenerator = new Blockly.Generator('Vyper');

VyperGenerator.ORDER_ATOMIC = 0;
VyperGenerator.ORDER_NONE = 0;
var logElementosNoContemplados;//Almacén para ir guardando los logs
VyperGenerator.init = function(workspace) {
    logElementosNoContemplados = "";//Cuando se inicia hay una limpienza y asi no aacumula logs llamada tras llamada
    limpiarFuncionesInterfacesVyper(); // Lo mismo para que no se acumulen llamadas a la generación de interfaces y se vayan acumulando antiguas
    registrarFuncionesInterfacesWorkspaceVyper(workspace);
};
VyperGenerator.finish = function(code) {
  return quitarIndentacionInicialVyper(code);
};

VyperGenerator.scrub_ = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if(nextBlock != null){
    if(nextBlock.type == "inputparamshortidentifier" || nextBlock.type == "input_param"){
      code +=  ", ";
    }
  }
  var nextCode = VyperGenerator.blockToCode(nextBlock);
  return code + nextCode;
};

var parteFinalMensajeNoInclusionVyper = " has not been included when generating the Vyper code.";
var parteFinalMensajeSustitucionElemento = ". It has been replaced by ";


var contadorElementosGenericos = 0;

var propiedadesSubidasVyper = {};//Contenedor para guardar el código Vyper generado por las variables
var ordenPropiedadesSubidasVyper = [];//Para indicar luego el orden en el que se encontraron y que se debe respetar al subir las propiedades que se encuentren dentro de un MODIFIER, CONSTRUCTOR o ABSTRACT CONTRACT
var propiedadesEstadoVyper = {};//Contenedor para guardar las variables de estado que NO son CONSTANTES
var inicializacionesPropiedadesVyper = {};
var ordenInicializacionesPropiedadesVyper = [];
var fallbackPayableVyper = false;//Si el fallback de la funcion solidity emite divisa
var existeReceiveVyper = false;// Si el modelo de bloques tiene recogido el bloque receive para representar la función
var existeFallbackVyper = false;// Si el modelo de bloques tiene recogido el bloque fallback para representar la función
var contenidoReceiveVyper = "";//Si en el cuerpo de la función receive en el modelo de bloques no esta vacío
var contenidoFallbackVyper = "";//Si en el cuerpo de la función fallback en el modelo de bloques no esta vacío
var funcionesInterfacesVyper = {};//Guarda la mutabilidad de las funciones declaradas en las interfaces
var requiereGenerarFuncionesBibliotecaVyper = false; //Se pone a true cuando se encuentra una biblioteca con funciones para tratarlas como funciones internas
var existeConstructorVyper = false;
var parametrosConstructorVyper = "";
var contenidoConstructorVyper = "";
var constructorPayableVyper = false;
var herenciaConstructorVyper = "";
var LIMITE_ARRAY_DINAMICO_VYPER = 100;//LIMITE ESTABLECIDO YA QUE EN VYPER SE REQUIERE QUE LOS ARRAY TENGAN TAMAÑO FIJO
var LIMITE_BYTES_VYPER = 1024;//LIMITE ESTABLECIDO PARA LAS PROPIEDADS DE TIPO BYTE YA QUE EN VYPER SE REQUIERE 
var MARCADOR_BALANCE_CONTRATO_VYPER = "__SMACLY_CONTRACT_BALANCE__";//Sustituir las expresiones de balance de solidity por esto
var generandoStructVyper = false;
var camposStructsVyper = {};
var generandoStructVyper = false;
var tiposPropiedadesEstadoVyper = {};

function sustituirPalabrasReservadasSolidity(texto){
  var palabrasReservadas = {
    "from": "sender",
    "as": "alias_name",
    "def": "function_name",
    "event": "event_name",
    "interface": "interface_name",
    "struct": "struct_name",
    "flag": "flag_name",
    "enum": "enum_name",
    "contract": "contract_name",
    "import": "import_name",
    "implements": "implements_name",
    "exports": "exports_name",
    "initializes": "initializes_name",
    "uses": "uses_name",
    "public": "public_value",
    "private": "private_value",
    "internal": "internal_value",
    "external": "external_value",
    "payable": "payable_value",
    "view": "view_value",
    "pure": "pure_value",
    "constant": "constant_value",
    "immutable": "immutable_value",
    "transient": "transient_value",
    "balance": "balance_value"
  };

  var salida = "";
  var palabra = "";
  var dentroTexto = false;
  var comillaTexto = "";

  if(texto == null){
    return "";
  }

  texto = String(texto);
  texto = texto.split("address(this).balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);
  texto = texto.split("this.balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);
  texto = texto.split("self.balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);

  for(var i = 0; i < texto.length; i++){
    var caracter = texto.charAt(i);

    if(dentroTexto){
      salida += caracter;

      if(caracter == comillaTexto){
        dentroTexto = false;
        comillaTexto = "";
      }
    }
    else if(caracter == '"' || caracter == "'"){
      if(palabra != ""){
        if(Object.prototype.hasOwnProperty.call(palabrasReservadas, palabra)){
          salida += palabrasReservadas[palabra];
        }
        else{
          salida += palabra;
        }

        palabra = "";
      }

      dentroTexto = true;
      comillaTexto = caracter;
      salida += caracter;
    }
    else if(esCaracterNombreVyper(caracter)){
      palabra += caracter;
    }
    else{
      if(palabra != ""){
        if(Object.prototype.hasOwnProperty.call(palabrasReservadas, palabra)){
          salida += palabrasReservadas[palabra];
        }
        else{
          salida += palabra;
        }

        palabra = "";
      }

      salida += caracter;
    }
  }

  if(palabra != ""){
    if(Object.prototype.hasOwnProperty.call(palabrasReservadas, palabra)){
      salida += palabrasReservadas[palabra];
    }
    else{
      salida += palabra;
    }
  }

  salida = salida.split(MARCADOR_BALANCE_CONTRATO_VYPER).join("self.balance");
  return salida;
}

function limpiarNombre(nombre) {
  if (nombre == null) {
    nombre = "";
  }
  nombre = String(nombre).trim();
  if (nombre.indexOf("Insert here") === 0) {
    contadorElementosGenericos++;
    return "element_" + contadorElementosGenericos;
  }
  var nombreOriginal = nombre;
  nombre = sustituirPalabrasReservadasSolidity(nombre);
  if(nombre != nombreOriginal && logElementosNoContemplados != null){
    logElementosNoContemplados += "The Solidity identifier " + nombreOriginal + " is reserved or conflicts with Vyper" + parteFinalMensajeSustitucionElemento + nombre + ".\n";
  }

  return nombre;
}

/*
PARÁMETRO DE ENTRADA: Tipo numérico seleccionado en el bloque
DESCRIPCIÓN: Normaliza el tipo entero para Vyper. Si viene int o uint sin tamaño, usa int256 o uint256. Si ya viene con tamaño, lo deja igual
PARÁMETRO DE SALIDA: Tipo numérico válido para Vyper
*/
function normalizarEnteroVyper(tipo) {
  if(tipo == null){
    return "uint256";
  }
  tipo = String(tipo).trim();
  if(tipo == ""){
    return "uint256";
  }

  if(tipo == "uint"){
    return "uint256";
  }
  else if(tipo == "int"){
    return "int256";
  }

  return tipo;
}

/*
PARÁMETRO DE ENTRADA: Codigo generado por Blockly
DESCRIPCIÓN: Quita los espacios que sobran al principio del codigo Vyper
PARÁMETRO DE SALIDA: Codigo Vyper con los elementos principales pegados a la izquierda
*/
function quitarIndentacionInicialVyper(codigo){
  if(codigo == null || codigo == ""){
    return "";
  }
  var lineas = codigo.split("\n");
  var espaciosMinimos = -1;
  for(var i = 0;i < lineas.length;i++){
    var linea = lineas[i];
    if(linea.trim() == ""){
      continue;
    }
    var espacios = contarEspaciosInicioVyper(linea);
    if(espaciosMinimos == -1 || espacios < espaciosMinimos){
      espaciosMinimos = espacios;
    }
  }
  if(espaciosMinimos <= 0){
    return codigo;
  }
  var salida = "";
  for(var j = 0;j < lineas.length;j++){
    var lineaActual = lineas[j];
    if(lineaActual.length >= espaciosMinimos){
      lineaActual = lineaActual.substring(espaciosMinimos);
    }

    salida += lineaActual;

    if(j < lineas.length - 1){
      salida += "\n";
    }
  }
  return salida;
}

/*
PARÁMETRO DE ENTRADA: Una linea del codigo
DESCRIPCIÓN: Cuenta los espacios que tiene una linea al principio
PARÁMETRO DE SALIDA: Numero de espacios iniciales
*/
function contarEspaciosInicioVyper(linea){
  var contador = 0;
  for(var i = 0;i < linea.length;i++){
    if(linea.charAt(i) == ' '){
      contador++;
    }
    else{
      break;
    }
  }

  return contador;
}

/*
DESCRIPCIÓN: Limpia la lista de propiedades subidas cuando se genera un contrato nuevo (Cuando encuentra un bloque CONTRACT)
*/
function limpiarPropiedadesSubidasVyper() {
  propiedadesSubidasVyper = {};
  ordenPropiedadesSubidasVyper = [];
  propiedadesEstadoVyper = {};
  inicializacionesPropiedadesVyper = {};
  ordenInicializacionesPropiedadesVyper = [];
  existeConstructorVyper = false;
  parametrosConstructorVyper = "";
  contenidoConstructorVyper = "";
  constructorPayableVyper = false;
  herenciaConstructorVyper = "";
  camposStructsVyper = {};
  generandoStructVyper = false;
  tiposPropiedadesEstadoVyper = {};
}


/*
DESCRIPCIÓN: Limpia los marcadores de existencia de las funciones fallback y receive de Solidity para poder generar la función default
*/
function limpiarPropiedadesGeneracionFuncionDefault(){
  fallbackPayableVyper = false;
  existeReceiveVyper = false;
  existeFallbackVyper = false;
  contenidoReceiveVyper = "";
  contenidoFallbackVyper = "";
}

/*
DESCRIPCIÓN: Limpia  las interfaces recogidas en llamadas anteriores al generador de Vyper
*/
function limpiarFuncionesInterfacesVyper(){
  funcionesInterfacesVyper = {};
}

/*
PARÁMETYRO DE ENTRADA: El nombre de la propiedad
DESCRIPCIÓN:Guarda una propiedad para escribirla luego arriba del contrato
*/
function subirPropiedadVyper(nombre, codigo) {
  if(nombre == null || codigo == null){
    return;
  }
  nombre = String(nombre).trim();
  if(nombre == "" || codigo == ""){
    return;
  }
  // Si ya se ha guardado antes NO hay que repetirla
  if (!propiedadesSubidasVyper[nombre]) {
    propiedadesSubidasVyper[nombre] = codigo;
    ordenPropiedadesSubidasVyper.push(nombre);//Se almacena la propiedad en la cola para indicar el orden en el que luego tienen que definirse en los elementos
  }
}

/*
DESCRIPCIÓN:Devuelve todas las propiedades que se han subido a nivel de contrato.
*/
function obtenerPropiedadesSubidasVyper() {
  var code = "";
  for (var i = 0; i < ordenPropiedadesSubidasVyper.length; i++) {
    var nombre = ordenPropiedadesSubidasVyper[i];//Se recoge cada propiedad por orden en el que se metió en la cola
    code += propiedadesSubidasVyper[nombre];//Se obtiene el código vyper asociada a la propiedad
  }
  return code;
}

/*
DESCRIPCIÓN: Busca hacia arriba hasta encontrar un bloque contenedor.Así se puede saber si una propiedad está directamente en el contrato o si está dentro de una función, constructor o modificador.
*/
function obtenerPadreContenedor(block) {
  var actual = block.getSurroundParent();
  while (actual != null) {
   if(actual.type == "contract" ||actual.type == "contract_constructor" ||actual.type == "clause" || actual.type == "modifier"){
      return actual;
   }
   actual = actual.getSurroundParent();
  }
  return null;
}

/*
PARAMETRO DE ENTRADA : Bloque actual 
DESCRIPCIÓN:Devuelve true si la propiedad está dentro de una parte (constructor, modificador, funcion) donde Vyper no permite declarar variables de estado
*/
function propiedadFueraContrato(block) {
  var padre = obtenerPadreContenedor(block);
  if(padre == null){
    return false;
  }
  return padre.type == "contract_constructor" || padre.type == "clause" ||padre.type == "modifier";
}


/*
PARÁMETRO DE ENTRADA: Nombre de una propiedad de estado
DESCRIPCIÓN: Guarda una variable de estado para saber luego si debe usar self
*/
function guardarPropiedadEstadoVyper(nombre,tipo){
  // Los campos declarados dentro de un struct no son variables de estado del contrato
  if(generandoStructVyper || nombre == null){
    return;
  }
  nombre = String(nombre).trim();
  if (nombre === "") {
    return;
  }
  propiedadesEstadoVyper[nombre] = true;
  if (tipo != null && String(tipo).trim() !== "") {
    tiposPropiedadesEstadoVyper[nombre] = String(tipo).trim();
  }
}


/*
PARÁMETRO DE ENTRADA: Nombre de una variable
DESCRIPCIÓN: Comprueba si es una variable 
*/
function esPropiedadEstadoVyper(nombre){
  if(nombre == null){
    return false;
  }
  if(nombre == ""){
    return false;
  }
  if(propiedadesEstadoVyper[nombre]){//Si esta ya en el contenedor de variables de estado devuelve un true y por eso tiene que añadir un self.
    return true;
  }
  return false;
}

/*
PARÁMETRO DE ENTRADA: Nombre de la propiedad y valor inicial
DESCRIPCIÓN: Guarda una inicializacion para escribirla luego dentro del constructor
*/
function subirInicializacionPropiedadVyper(nombre, valor){
  if(nombre == null || valor == null){
    return;
  }
  nombre = nombre.trim();
  valor = valor.trim();
  if(nombre == "" || valor == ""){
    return;
  }
  if(!inicializacionesPropiedadesVyper[nombre]){
    inicializacionesPropiedadesVyper[nombre] = valor;
    ordenInicializacionesPropiedadesVyper.push(nombre);
  }
}

/*
DESCRIPCIÓN: Devuelve las inicializaciones pendientes de variables de estado
*/
function obtenerInicializacionesPropiedadesVyper(){
  var code = "";
  var nombre;
  var valor;
  for(var i = 0;i < ordenInicializacionesPropiedadesVyper.length;i++){
    nombre = ordenInicializacionesPropiedadesVyper[i];// SE SACA EL NOMBRE DE LA PROPIEDAD EN BASE AL RECORRIDO DEL FOR
    valor = inicializacionesPropiedadesVyper[nombre];//SE SACA LA INICIALIZACIÓN DE LA VARIABLE ASOCIADA AL NOMBRE DE LA FUNCIÓN
    code +="  self." + nombre + " = " + incluirSelfVariable(valor) +"\n";
  }
  return code;
}


/*
DESCRIPCIÓN: Comprueba si una palabra es una variable de estado. Si lo es, le pone self.
*/
function tratarVariableEstadoVyper(palabra, salidaActual){
  var ultimoCaracter = "";
  if(palabra == null || palabra == ""){
    return "";
  }
  if(salidaActual.length > 0){
    ultimoCaracter = salidaActual.charAt(salidaActual.length - 1);
  }
  if(ultimoCaracter == "."){//CASO DE QUE HAYA ANTES UN . COMO MSG. SENDER EN ESE CASO NO SE TOCA NADA
    return palabra;
  }
  if(esPropiedadEstadoVyper(palabra)){
    return "self." + palabra;
  }
  return palabra;
}

/*
PARÁMETRO DE ENTRADA: Un caracter
DESCRIPCIÓN: Comprueba si el caracter puede formar parte del nombre de una variable
*/
function esCaracterNombreVyper(caracter){
  if(caracter >= "a" && caracter <= "z"){
    return true;
  }
  if(caracter >= "A" && caracter <= "Z"){
    return true;
  }
  if(caracter >= "0" && caracter <= "9"){
    return true;
  }
  if(caracter == "_"){
    return true;
  }
  return false;
}

/*
PARÁMETRO DE ENTRADA: Una expresion de Vyper
DESCRIPCIÓN: Añade self. a las variables de estado que aparezcan en la expresion
*/
function incluirSelfVariable(expresion){
  var code = "";
  var palabra = "";
  var caracter;
  var dentroTexto = false;
  var comillaTexto = "";

  if(expresion == null){
    return "";
  }
  expresion = String(expresion);
  for(var i = 0;i < expresion.length;i++){
    caracter = expresion.charAt(i);
    if(dentroTexto){//Comprueba si el nombre de la variable esta contenida dentro de un STRING para no hacer nada en ese caso
      code += caracter;
      if(caracter == comillaTexto){
        dentroTexto = false;
        comillaTexto = "";
      }
      continue;
    }
    //Si empieza un texto antes guardamos la palabra que estuviera pendiente
    if(caracter == '"' || caracter == "'"){
      if(palabra != ""){
        code += tratarVariableEstadoVyper(palabra, code);
        palabra = "";
      }

      dentroTexto = true;
      comillaTexto = caracter;
      code += caracter;
    }
    else{
      //Si el caracter forma parte de un nombre se va acumulando
      if(esCaracterNombreVyper(caracter)){
        palabra += caracter;
      }
      else{
        // Si aparece un separador, cerramos la palabra anterior.
        if(palabra != ""){
          code += tratarVariableEstadoVyper(palabra, code);
          palabra = "";
        }
        code += caracter;
      }
    }
  }
  //Si la expresion acaba justo con una palabra tambien hay que revisarla
  if(palabra != ""){
    code += tratarVariableEstadoVyper(palabra, code);
  }

  return code;
}

/*
DESCRIPCIÓN:Obtiene codigo de un input aunque sea value input o statement input
*/
function obtenerCodigoConexionVyper(block, nombreInput){
  var code = "";
  try{
    code = VyperGenerator.valueToCode(block, nombreInput, VyperGenerator.ORDER_NONE);
  }
  catch(e){
    code = "";
  }
  if(code == null || code == ""){
    try{
      code = VyperGenerator.statementToCode(block, nombreInput);
    }
    catch(e2){
      code = "";
    }
  }
  if(code == null){
    code = "";
  }

  return code;
}

/*
DESCRIPCIÓN: GENERA POR CADA LÍNEA DE CODIGO QUE RECIBE UN COMENTARIO LÍNEA POR LÍNEA
*/
function generarComentarioCodigoVyper(codigo){
  var lineas;
  var salida = "";
  if(codigo == null || codigo == ""){
    return "";
  }
  lineas = codigo.split("\n");
  for(var i = 0;i < lineas.length;i++){
    if(lineas[i].trim() != ""){
      salida += "# " + lineas[i] + "\n";
    }
  }
  return salida;
}

/*
PARÁMETRO DE ENTRADA: Bloque que puede contener dimensiones de array
DESCRIPCIÓN: Obtiene las dimensiones usando los nombres utilizados por los distintos bloques
PARÁMETRO DE SALIDA: Dimensiones del array
*/
function obtenerDimensionesArrayVyper(block){
  var dimensiones = obtenerCodigoConexionVyper(
    block,
    "arraydimension"
  );

  if(dimensiones == null || dimensiones.trim() == ""){
    dimensiones = obtenerCodigoConexionVyper(
      block,
      "array_dimension"
    );
  }

  if(dimensiones == null){
    return "";
  }

  return dimensiones.trim();
}

/*
PARÁMETRO DE ENTRADA: Tipo base y dimensiones del array declarado en una propiedad e Solidity
DESCRIPCIÓN: Convierte las dimensiones de Solidity al formato utilizado por Vyper
PARÁMETRO DE SALIDA: Tipo completo de Vyper con "DynArray"
*/
function aplicarDimensionesArrayVyper(tipoBase, dimensiones){
  if(tipoBase == null){
    tipoBase = "";
  }

  if(dimensiones == null){
    dimensiones = "";
  }

  tipoBase = String(tipoBase).trim();
  dimensiones = String(dimensiones).trim();

  if(dimensiones == ""){
    return tipoBase;
  }
  var listaDimensiones = [];
  var dimensionActual = "";
  var dentroDimension = false;
  // Se obtiene el contenido de cada pareja de corchetes
  for(var i = 0;i < dimensiones.length;i++){
    var caracter = dimensiones.charAt(i);
    if(caracter == '['){
      dentroDimension = true;
      dimensionActual = "";
    }
    else if(caracter == ']' && dentroDimension){
      listaDimensiones.push(dimensionActual.trim());
      dimensionActual = "";
      dentroDimension = false;
    }
    else if(dentroDimension){
      dimensionActual += caracter;
    }
  }
  var tipoCompleto = tipoBase;

  // Hay que empezar por la dimensión más cercana al tipo base
  for(var j = listaDimensiones.length - 1;j >= 0;j--){
    var dimension = listaDimensiones[j];

    if(dimension == ""){
      tipoCompleto ="DynArray[" + tipoCompleto +", " +LIMITE_ARRAY_DINAMICO_VYPER +']';
    }
    else{
      tipoCompleto = tipoCompleto + '[' +dimension +']';
    }
  }

  return tipoCompleto;
}


/*
PARÁMETRO DE ENTRADA: Una expresión que puede contener la función .length
DESCRIPCIÓN: Parsea las expresiones a len (expression)
PARÁMETRO DE SALIDA: la nueva expresion que comienza por len
*/
function normalizarExpresionVyper(expresion){
  if(expresion == null){
    return "";
  }
  expresion = String(expresion).trim();
  expresion = expresion.replaceAll("abi.encode(", "abi_encode(");
  if(expresion == "true" || expresion == "TRUE"){
    return "True";
  }
  if(expresion == "false" || expresion == "FALSE"){
    return "False";
  }
  var operadorDelegatecall = ".delegatecall(";
  var posicionDelegatecall = expresion.indexOf(operadorDelegatecall);
  if(posicionDelegatecall == -1){
    operadorDelegatecall = ".delegatecall (";
    posicionDelegatecall = expresion.indexOf(operadorDelegatecall);
  }
  if(posicionDelegatecall != -1){
    var receptor = expresion.substring(0, posicionDelegatecall).trim();
    var inicioDatos = posicionDelegatecall + operadorDelegatecall.length;
    var finDatos = expresion.lastIndexOf(")");
    if(finDatos >= inicioDatos){
      var datos = expresion.substring(inicioDatos, finDatos).trim();
      if(receptor == "address(this)" || receptor == "this" || receptor == "self"){
        receptor = "self";
      }
      else{
        if(receptor.indexOf("address(") == 0 && receptor.endsWith(")")){
          receptor = receptor.substring(8, receptor.length - 1).trim();
        }
        receptor = normalizarExpresionVyper(receptor);
      }
      if(datos == "" || datos == '""' || datos == "''"){
        datos = 'b""';
      }
      else{
        datos = normalizarExpresionVyper(datos);
      }
      logElementosNoContemplados += "The Solidity delegatecall expression " + expresion + parteFinalMensajeSustitucionElemento + "Vyper raw_call with is_delegate_call=True.\n";
      return "raw_call(" + receptor + ", " + datos + ", is_delegate_call=True, revert_on_failure=False)";
    }
  }
  // Se protege el saldo del contrato para que "balance" no se trate como identificador reservado.
  expresion = expresion.split("address(this).balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);
  expresion = expresion.split("this.balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);
  expresion = expresion.split("self.balance").join(MARCADOR_BALANCE_CONTRATO_VYPER);
  expresion = sustituirPalabrasReservadasSolidity(expresion);
  // Se restaura utilizando exactamente el mismo marcador.
  expresion = expresion.split(MARCADOR_BALANCE_CONTRATO_VYPER).join("self.balance");
  if(expresion.endsWith(".length")){
    var contenido = expresion.substring(0,expresion.length - ".length".length).trim();
    var posicionParentesis = contenido.indexOf('(');
    if(posicionParentesis != -1 &&
       contenido.endsWith(')')){

      var nombreConversion = contenido.substring(0,posicionParentesis).trim();
      var esConversionBytes = nombreConversion == "bytes" || nombreConversion == "string";

      if(nombreConversion.indexOf("bytes") == 0){
        var tamanioTexto = nombreConversion.substring(5);
        if(tamanioTexto == ""){
          esConversionBytes = true;
        }
        else{
          var tamanio = Number(tamanioTexto);
          if(!Number.isNaN(tamanio) && tamanio >= 1 && tamanio <= 32){
            esConversionBytes = true;
          }
        }
      }

      if(esConversionBytes){
        contenido = contenido.substring( posicionParentesis + 1,contenido.length - 1).trim();
      }
    }

    return "len(" + incluirSelfVariable(contenido) + ')';
  }

  return incluirSelfVariable(expresion);
}

/*
  PARÁMETRO DE ENTRADA: Tipo bytes de Solidity
  DESCRIPCIÓN: Convierte bytes dinámicos al tipo Bytes de Vyper
  PARÁMETRO DE SALIDA: Tipo bytes válido en Vyper
*/
function normalizarBytesVyper(tipo){
  if(tipo == null || tipo == ""){
    return "bytes1";
  }

  tipo = String(tipo).trim();
  if(tipo == "bytes"){
    return "Bytes[" + LIMITE_BYTES_VYPER + "]";
  }

  if(tipo == "byte"){
    return "bytes1";
  }

  return tipo;
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Devuelve el log generado durante la conversión de Solidity a Vyper
PARÁMETRO DE SALIDA: Texto con los elementos no contemplados o modificados
*/
function obtenerLogElementosNoContempladosVyper() {
  if(logElementosNoContemplados == null || logElementosNoContemplados.trim() == ""){
    return "No se han registrado cambios ni elementos no contemplados durante la generación de Vyper.";
  }
  var logs = logElementosNoContemplados.trim();
  return logs;
}

/*
PARÁMETRO DE ENTRADA: Bloque file
DESCRIPCIÓN: Genera el codigo principal del fichero Vyper
PARÁMETRO DE SALIDA: Codigo Vyper del fichero
*/
VyperGenerator['file'] = function(block) {
  var version = VyperGenerator.valueToCode(block, 'version_file', VyperGenerator.ORDER_NONE);
  var statements_content = VyperGenerator.statementToCode(block, 'elements_file');
  var code = "";
  if(version == null){
    version = "";
  }
  if(statements_content == null){
    statements_content = "";
  }
  contadorElementosGenericos = 0;
  statements_content = quitarIndentacionInicialVyper(statements_content);
  if(version.trim() != ""){
    code += version.trim() + "\n\n";
  }
  return code + statements_content;
};

VyperGenerator['version'] = function(block) {
  var symbol = block.getFieldValue('symbolversion');
  var value1 = block.getFieldValue('value1version');
  var value2 = block.getFieldValue('value2version');
  var value3 = block.getFieldValue('value3version');
  var superior = Number(value1);
  var inferior = Number(value2);
  var code = "";
  if(superior > 0 || (superior == 0 && inferior >= 4)){
    code = "#pragma version >0.3.0";
    logElementosNoContemplados += "The Solidity compiler version " + value1 + "." + value2 + "." + value3 + parteFinalMensajeSustitucionElemento + " Vyper compiler version 0.4.0.\n";
  }
  else{
    if(symbol == "greater"){
      symbol = ">";
    }
    else if(symbol == "greater_equal"){
      symbol = ">=";
    }
    else if(symbol == "less"){
      symbol = "<";
    }
    else if(symbol == "less_equal"){
      symbol = "<=";
    }

    code = "#pragma version " + symbol + value1 + "." + value2 + "." + value3;
  }
  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['range_version'] = function(block) {
  var symbol1 = block.getFieldValue('symbolversion');
  var value1 = block.getFieldValue('value1version');
  var value2 = block.getFieldValue('value2version');
  var value3 = block.getFieldValue('value3version');
  var symbol2 = block.getFieldValue('symbolcomparation');
  var optional1 = block.getFieldValue('value1versionoptional');
  var optional2 = block.getFieldValue('value2versionoptional');
  var optional3 = block.getFieldValue('value3versionoptional');
  var mayor1 = Number(value1);
  var inferior1 = Number(value2);
  var mayor2 = Number(optional1);
  var inferior2 = Number(optional2);
  var code = "";

  if(mayor1 > 0 ||(mayor1 == 0 && inferior1 >= 4) ||mayor2 > 0 || (mayor2 == 0 && inferior2 >= 4)){
    code = "#pragma version >0.3.0";
    logElementosNoContemplados += "The Solidity compiler version range" + parteFinalMensajeSustitucionElemento + " Vyper compiler version 0.4.0.\n";
  }
  else{
    if(symbol1 == "greater"){
      symbol1 = ">";
    }
    else if(symbol1 == "greater_equal"){
      symbol1 = ">=";
    }
    else if(symbol1 == "less"){
      symbol1 = "<";
    }
    else if(symbol1 == "less_equal"){
      symbol1 = "<=";
    }

    if(symbol2 == "greater"){
      symbol2 = ">";
    }
    else if(symbol2 == "greater_equal"){
      symbol2 = ">=";
    }
    else if(symbol2 == "less"){
      symbol2 = "<";
    }
    else if(symbol2 == "less_equal"){
      symbol2 = "<=";
    }
    code = "#pragma version " + symbol1 + value1 + "." + value2 + "." + value3;
    if(optional1 != "0" || optional2 != "0" || optional3 != "0"){
      code += "," + symbol2 + optional1 + "." + optional2 + "." + optional3;
    }
  }

  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['import'] = function(block) { 
  var ruta = block.getFieldValue('resource_route'); 
  var alias = VyperGenerator.statementToCode(block, 'alias');
  if(ruta == null){ 
    ruta = ""; 
  } 
  if(alias == null){
    alias = ""; 
  } 
  ruta = ruta.trim(); // Quita las comillas del principio y del final 
  if( (ruta.charAt(0) == '"' && ruta.charAt(ruta.length - 1) == '"') || (ruta.charAt(0) == "'" && ruta.charAt(ruta.length - 1) == "'") ){ 
    ruta = ruta.substring(1, ruta.length - 1); 
  }
  if(ruta.endsWith(';')){ 
    ruta = ruta.substring(0, ruta.length - 1); 
  } 
  if(ruta.endsWith(".sol")){ // Quita la extensión del fichero 
    ruta = ruta.substring(0, ruta.length - 4); 
  }
  else if(ruta.endsWith(".vyi")){
     ruta = ruta.substring(0, ruta.length - 4); 
  } 
  else if(ruta.endsWith(".vy")){
     ruta = ruta.substring(0, ruta.length - 3); 
  } 
  ruta = ruta.split("/").join("."); // Cambia las barras de la ruta por puntos 
  while(ruta.charAt(0) == "."){ // Quita los puntos que puedan quedar al principio 
    ruta = ruta.substring(1); 
  } 
  var code = "import " + ruta; 
  if(alias.trim() != ""){ 
    code += ' ' + alias.trim(); 
  } 
  return code + "\n"; 
};

VyperGenerator['library'] = function(block) {
  var library_name = limpiarNombre(block.getFieldValue('name'));
  var statements_content = "";
  requiereGenerarFuncionesBibliotecaVyper = true;  // Indica a las funciones que están dentro de una biblioteca
  statements_content = VyperGenerator.statementToCode(block, 'functions_library');
  requiereGenerarFuncionesBibliotecaVyper = false; // Por si hay que procesar otra nueva biblioteca en el propio contrato
  if(statements_content == null){
    statements_content = "";
  }
  logElementosNoContemplados += "The Solidity library " +library_name + " has been replaced by internal functions in the Vyper contract.\n";
  if(statements_content.trim() == ""){
    return "";
  }

  return quitarIndentacionInicialVyper(statements_content) + "\n";
};

VyperGenerator['interface'] = function(block) {
  var interface_name = limpiarNombre(block.getFieldValue('name'));
  var interface_father = obtenerCodigoConexionVyper(block, 'nameinterfacefather');
  var current_block = block.getInputTargetBlock('interface_functions');
  var events_code = "";
  var functions_code = "";
  if(interface_father == null){
    interface_father = "";
  }
  while(current_block != null){
    if(current_block.type == "event"){
      events_code += VyperGenerator['event'](current_block) + "\n";
    }
    else if(current_block.type == "interface_clausedeclaration"){
      var function_code = VyperGenerator['interface_clausedeclaration'](current_block);
      if(function_code != null && function_code.trim() != ""){
        functions_code += "  " + function_code;
      }
    }
    if(current_block.nextConnection != null){
      current_block = current_block.nextConnection.targetBlock();
    }
    else{
      current_block = null;
    }
  }
  if(interface_father.trim() != ""){
    logElementosNoContemplados += "The inheritance of interface " + interface_name + " from " + interface_father.trim() + parteFinalMensajeNoInclusionVyper + "\n";
  }
  var code = events_code + "interface " + interface_name + ":\n";
  if(functions_code.trim() == ""){
    code += "  pass\n";
  }
  else{
    code += functions_code;
  }
  return code + "\n";
};

VyperGenerator['interface_father'] = function(block) {
  var interface_name = limpiarNombre(block.getFieldValue('name'));
  var next_interface = VyperGenerator.valueToCode(block, 'interfaces_inherit', VyperGenerator.ORDER_NONE);
  var code = "";
  if(next_interface == null){
    next_interface = "";
  }
  if(interface_name != null && interface_name.trim() != ""){
    code += interface_name + "\n";
  }
  if(next_interface != null && next_interface.trim() != ""){
    code += next_interface;
  }
  return code;
};

/*
PARÁMETRO DE ENTRADA: Bloque que contiene el nombre, parámetros, retorno y mutabilidad de una función de interfaz
DESCRIPCIÓN: Genera la declaración de una función dentro de una interfaz Vyper
PARÁMETRO DE SALIDA: Declaración de la función de interfaz
*/
VyperGenerator['interface_clausedeclaration'] = function(block) {
  var interface_function_name = limpiarNombre(block.getFieldValue('name'));
  var mutability = block.getFieldValue('values_inputmodifier');
  var inputparams_content = obtenerCodigoConexionVyper(block, 'inputparams_function');
  var outputparam = obtenerCodigoConexionVyper(block, 'returns_values');
  var code = "";

  if(inputparams_content == null){
    inputparams_content = "";
  }
  if(outputparam == null){
    outputparam = "";
  }
  inputparams_content = inputparams_content.trim();
  outputparam = outputparam.trim();
  if(mutability == null || mutability == "" || mutability == "none"){
    mutability = "nonpayable";
  }
  else if(mutability == "constant"){
    mutability = "view";
  }
  registrarFuncionInterfazVyper( obtenerInterfazContenedoraVyper(block),interface_function_name, mutability
  );
  code = "def " + interface_function_name + "(" + inputparams_content + ')';
  if(outputparam != ""){
    code += " -> " + outputparam;
  }
  code += ": " + mutability + "\n";
  return code;
};

/*
PARÁMETRO DE ENTRADA: Bloque que representa la definición de una gfunción dentro de una interfaz
DESCRIPCION: Sube de nivel de la definición de una función de la interfaz hasta llegar a la declaración de la interfaz para sacar el nombre
PARAMETRO DE SALIDA: Nombre de la interfaz o nada si no lo encuentra
*/
function obtenerInterfazContenedoraVyper(block){
  var bloqueActual = block;
  while(bloqueActual != null){  // Para hasta que no haya un bloque que revisar   
    if(bloqueActual.type == "interface"){//Comprueba si el bloque actual es una interfaz
      var nombreInterfaz = bloqueActual.getFieldValue('name');
      if(nombreInterfaz == null){
        return "";
      }
      return nombreInterfaz.trim();
    }
    // Comprueba que el bloque permita obtener su bloque contenedor
    if(typeof bloqueActual.getSurroundParent =="function"){
      bloqueActual = bloqueActual.getSurroundParent();//Sube un nivel dentro de la estructura de bloques
    }
    else{
      bloqueActual = null;
    }
  }
  return "";
}


/*
PARAMETROS DE ENTRADA:
DESCRIPCIÓN:Recorre las funciones de interfaz del workspace y guarda su mutabilidad
*/
function registrarFuncionesInterfacesWorkspaceVyper(workspace){
  if(workspace == null || typeof workspace.getAllBlocks != "function"){
    return;
  }
  var bloques = workspace.getAllBlocks(false);
  for(var i = 0;i < bloques.length;i++){
    var bloqueActual = bloques[i];
    if(bloqueActual.type == "interface_clausedeclaration"){
      var nombreInterfaz = obtenerInterfazContenedoraVyper(bloqueActual);
      var nombreFuncion = bloqueActual.getFieldValue('name');
      var mutabilidad = bloqueActual.getFieldValue('values_inputmodifier');
      registrarFuncionInterfazVyper(nombreInterfaz,nombreFuncion,mutabilidad
      );
    }
  }
}


/*
PARAMETROS DE ENTRADA: La expresion que esta llamando a una funcion de una Interfaz
DESCRIPCIÓN: Obtiene el nombre de la interfaz y de la función  a la que se llama en la expresion que se esta analizando
*/
function obtenerDatosLlamadaExternaVyper(expresion){
  var datos = {interfaz: "",funcion: ""};
  if(expresion == null){
    return datos;
  }
  expresion = String(expresion).trim();
  var aperturaInterfaz = expresion.indexOf('(');
  if(aperturaInterfaz <= 0){
    return datos;
  }
  var nombreInterfaz = expresion.substring(0,aperturaInterfaz).trim();
  var nivelParentesis = 0;
  var cierreInterfaz = -1;
  // Busca el cierre de la conversión de la interfaz
  for(var i = aperturaInterfaz;i < expresion.length;i++){
    if(expresion.charAt(i) == '('){
      nivelParentesis++;
    }
    else if(expresion.charAt(i) == ')'){
      nivelParentesis--;

      if(nivelParentesis == 0){
        cierreInterfaz = i;
        break;
      }
    }
  }
  if(cierreInterfaz == -1){
    return datos;
  }
  var posicion = cierreInterfaz + 1;
  // Salta los espacios que pueda haber
  while(posicion < expresion.length && expresion.charAt(posicion) == ' '){
    posicion++;
  }
  if(expresion.charAt(posicion) != "."){
    return datos;
  }
  posicion++;
  // Salta los espacios situados después del punto
  while(posicion < expresion.length && expresion.charAt(posicion) == ' '){
    posicion++;
  }
  var nombreFuncion = "";
  // Recoge el nombre de la función 
  while(posicion < expresion.length && esCaracterNombreVyper(expresion.charAt(posicion))){
    nombreFuncion += expresion.charAt(posicion);
    posicion++;
  }
  // Comprueba que después del nombre comiencen los argumentos
  while(posicion < expresion.length && expresion.charAt(posicion) == ' '){
    posicion++;
  }
  if(nombreInterfaz == "" || nombreFuncion == "" || expresion.charAt(posicion) != '('){
    return datos;
  }
  datos.interfaz = nombreInterfaz;
  datos.funcion = nombreFuncion;
  return datos;
}


/*
PARAMETRO DE ENTRADA: Nombre de la interfaz, nombre de la función y el modificador de mutabilidad
DESCRIPCIÓN: Registra en una lista el modificador de mutabilidad asociado a la función de una interfaz para luego si es llamada controlar si hay que ponerle un EXTCALL O STATICALL
*/
function registrarFuncionInterfazVyper(nombreInterfaz,nombreFuncion,mutabilidad){
  if(nombreInterfaz == null || nombreFuncion == null){
    return;
  }
  nombreInterfaz = nombreInterfaz.trim();
  nombreFuncion = nombreFuncion.trim();
  if(nombreInterfaz == "" || nombreFuncion == ""){
    return;
  }
  if(mutabilidad == null || mutabilidad.trim() == "" || mutabilidad == "none"){
    mutabilidad = "nonpayable";
  }
  else if(mutabilidad == "constant"){
    mutabilidad = "view";
  }
  var clave = nombreInterfaz + "." + nombreFuncion;
  funcionesInterfacesVyper[clave] = mutabilidad.trim();
}

/*
PARAMETRO DE ENTRADA: Recibe una expresion y comprueba si estaba en la lista de funciones registradas de la interfaz, por si esta haciendo una llamada y requiere de EXTCALL O STATICALL
DESCRIPCION: SI SE ESTA HACIENDO USO DE UNA LLAMADA A UNA FUNCIÓN DE UNA INTERFAZ EN LA EXPRESIÓN, USA STATICALL O EXTCALL SEGÚN EL MODIFICADOR DE MUTABILIDAD
*/
function convertirLlamadaExternaTipadaVyper(expresion){
  if(expresion == null){
    return "";
  }
  expresion = String(expresion).trim();//Se castea a string por si acaso se recibiera un número, un booleano u otra cosa que no fuera texto y se limpia
  if(expresion.endsWith(';')){
    expresion = expresion.substring(0,expresion.length - 1).trim();
  }

  if(expresion.indexOf("extcall ") == 0 || expresion.indexOf("staticcall ") == 0){
    return expresion;
  }
  var datos = obtenerDatosLlamadaExternaVyper(expresion);//Saca la info de la interfaz (NOMBRE) y de la funcion (NOMBRE)
  if(datos.interfaz == "" || datos.funcion == ""){
    return expresion;
  }
  var clave = datos.interfaz + "." + datos.funcion;
  var mutabilidad = funcionesInterfacesVyper[clave];// Se saca  la mutabilidad de la función a partir de la clave única
  if(mutabilidad == null){
    logElementosNoContemplados += "The mutability of external call " + datos.interfaz + "." + datos.funcion +" could not be determined.\n";
    return expresion;
  }
  if(mutabilidad == "view" || mutabilidad == "pure"){
    return "staticcall " + expresion;
  }
  return "extcall " + expresion;
}

VyperGenerator['event'] = function(block) {
  var event_name = limpiarNombre(block.getFieldValue('name'));
  var current_param = block.getInputTargetBlock('inputparams');
  var code = "event " + event_name + ":\n";
  var contains_params = false;
  if(current_param != null && current_param.type == "inputparam"){
    current_param = current_param.getInputTargetBlock('inputparams');
  }
  while(current_param != null){
    var param_code = VyperGenerator[current_param.type](current_param);
    if(Array.isArray(param_code)){
      param_code = param_code[0];
    }
    if(param_code != null && String(param_code).trim() != ""){
      param_code = String(param_code).trim();
      if(param_code.indexOf("from :") == 0){
       param_code = "sender" + param_code.substring(4);
      }
      code += "  " + param_code + "\n";
      contains_params = true;
    }
    if(current_param.nextConnection != null){
      current_param = current_param.nextConnection.targetBlock();
    }
    else{
      current_param = null;
    }
  }
  if(!contains_params){
    code += "  pass\n";
  }
  return code;
};


VyperGenerator['modifier'] = function(block) {
  var modifier_name = limpiarNombre(block.getFieldValue('name'));
  var statements_content = VyperGenerator.statementToCode(block, 'restrictions_modifier');
  var inputparams_content = VyperGenerator.valueToCode(block, 'inputparams', VyperGenerator.ORDER_NONE);
  if(statements_content == null){
    statements_content = "";
  }
  if(inputparams_content == null){
     inputparams_content = "";
  }
  if(statements_content.trim() == ""){
    statements_content = "  pass\n";
  }
  logElementosNoContemplados += "The modifier " + modifier_name + " has not been included in the code because Vyper does not support it." + parteFinalMensajeSustitucionElemento + "a function with the same name.\n";
  return "@internal\ndef " + modifier_name + "(" + inputparams_content.trim() + "):\n" + statements_content + "\n";
};

VyperGenerator['restriction_clause'] = function(block) {
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  if(condition == null){ 
    condition = ""; 
  }
  logElementosNoContemplados += "The Solidity expression 'require' that defines " + condition  + "has not been included in the code because Vyper does not support it." + parteFinalMensajeSustitucionElemento +  " an 'assert' expression" + "\n";
  return "assert " + condition.trim() + "\n";
};

VyperGenerator['restriction_clausecomment'] = function(block) {
  var comment = block.getFieldValue('comment');
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  if(comment == null){ 
    comment = "";
  }
  if(condition == null){ 
    condition = ""; 
  }
   logElementosNoContemplados += "The Solidity expression 'require' that defines " + condition  + "has not been included in the code because Vyper does not support it." + parteFinalMensajeSustitucionElemento +  " an 'assert' expression" + "\n";
  return 'assert ' + condition.trim() + ', "' + comment + '"\n';
};

VyperGenerator['coin_expression'] = function(block) {
  var amount = block.getFieldValue('amount_coin');
  var type_coin = block.getFieldValue('type_coin');
  var code = 'as_wei_value(' + amount +  ', "' +type_coin + '")'
  return code;
};

VyperGenerator['closemodifier'] = function(block) {
  var code = "_;\n";
  logElementosNoContemplados += "The Solidity element " + code + parteFinalMensajeNoInclusionVyper + "\n";
  return "";
};

VyperGenerator['markmodifier'] = function(block) {
  var code = "_;\n";
  logElementosNoContemplados += "The Solidity element " + code + parteFinalMensajeNoInclusionVyper + "\n";
  return "";
};


VyperGenerator['input_param'] = function(block) {
  var inputparam_type = obtenerCodigoConexionVyper(block,'type');
  var inputparam_name = limpiarNombre(block.getFieldValue('name'));
  var inputparam_indexed = block.getFieldValue('indexed');
  var storage = block.getFieldValue('storagedata_values');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var code = "";

  if(inputparam_type == null){
    inputparam_type = "";
  }
  if(storage == null){
    storage = "";
  }
  inputparam_type = inputparam_type.trim();
  if(inputparam_type == ""){
    logElementosNoContemplados += "The parameter " + inputparam_name + " has not been included because its type is missing.\n";
    return "";
  }
  inputparam_type = aplicarDimensionesArrayVyper(inputparam_type,dimensiones);
  if(inputparam_indexed == "TRUE"){
    code = inputparam_name + " : indexed(" + inputparam_type + ")";
  }
  else{
    code = inputparam_name + " : " +  inputparam_type;
  }

  if(storage.trim() != "" && storage.trim() != "none"){
    logElementosNoContemplados +="The Solidity data location " +  storage.trim() +  " of parameter " +inputparam_name + parteFinalMensajeNoInclusionVyper +"\n";
  }

  return code;
};


VyperGenerator['inputparamshortidentifier'] = function(block) {
  var inputparam_type = obtenerCodigoConexionVyper(block,'type');
  var inputparam_name = limpiarNombre(block.getFieldValue('name'));
  var dimensiones = obtenerDimensionesArrayVyper(block);
  if(inputparam_type == null){
    inputparam_type = "";
  }
  inputparam_type = inputparam_type.trim();
  if(inputparam_type == ""){
    logElementosNoContemplados += "The parameter " + inputparam_name + " has not been included because its type is missing.\n";
    return "";
  }
  inputparam_type = aplicarDimensionesArrayVyper(inputparam_type,dimensiones);
  return inputparam_name + " : " + inputparam_type;
};

VyperGenerator['inputparam'] = function(block) {
  var code = VyperGenerator.statementToCode(block, 'inputparams');
  if(code == null){
    code = "";
  }
  return [code.trim(), VyperGenerator.ORDER_NONE];
};

VyperGenerator['outputparam'] = function(block) {
  var outputparam_name = block.getFieldValue('name');
  var outputparam_type = obtenerCodigoConexionVyper(block,'value_type_outputparam');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  if(outputparam_name == null){
    outputparam_name = "";
  }
  if(outputparam_type == null){
    outputparam_type = "";
  }
  outputparam_name = outputparam_name.trim();
  outputparam_type = outputparam_type.trim();
  if(outputparam_type == ""){
    logElementosNoContemplados +="The output parameter has not been included because its type is missing.\n";
    return ["",VyperGenerator.ORDER_NONE];
  }
  outputparam_type = aplicarDimensionesArrayVyper(outputparam_type,dimensiones);
  if(outputparam_name != "" && outputparam_name.indexOf("Insert here") != 0){
    logElementosNoContemplados += "The output parameter name " +  outputparam_name + parteFinalMensajeNoInclusionVyper + "\n";
  }
  return [outputparam_type,VyperGenerator.ORDER_NONE];
};

VyperGenerator['abstract_contract'] = function(block) {
  var contract_name = limpiarNombre(block.getFieldValue('name'));
  var current_block = block.getInputTargetBlock('contract_elements');
  var functions_code = "";
  var code = "";
  while(current_block != null){
    if(current_block.type == "abstract_clausedeclaration"){
      var function_code = VyperGenerator['abstract_clausedeclaration'](current_block); //SE LLAMA AL GENERADOR DE FUNCIONES QUE HAY EN UN CONTRATO ABSTRACTO PARA OBTENER EL CODIGO
      if(function_code != null && function_code.trim() != ""){
        functions_code += "  " + function_code;
      }
    }
    else{
      logElementosNoContemplados += "The element " + current_block.type +" from abstract contract " + contract_name +parteFinalMensajeNoInclusionVyper + "\n";
    }
    if(current_block.nextConnection != null){
      current_block = current_block.nextConnection.targetBlock();
    }
    else{
      current_block = null;
    }
  }
  code = "interface " + contract_name + ":\n";
  if(functions_code == ""){
    code += "  pass\n";
  }
  else{
    code += functions_code;
  }
  logElementosNoContemplados += "The abstract contract " + contract_name + parteFinalMensajeSustitucionElemento + " a Vyper interface.\n";
  return code + "\n";
};

VyperGenerator['abstract_clausedeclaration'] = function(block) {
  var function_name = limpiarNombre(block.getFieldValue('name'));
  var function_visibility = block.getFieldValue('values_visibility');
  var function_state = block.getFieldValue('values_inputmodifier');
  var inputparams_content = obtenerCodigoConexionVyper(block, 'inputparams_function');
  var outputparam = obtenerCodigoConexionVyper(block, 'returns_values');
  var code = "";
  if(inputparams_content == null){
    inputparams_content = "";
  }
  if(outputparam == null){
    outputparam = "";
  }

  inputparams_content = inputparams_content.trim();
  outputparam = outputparam.trim();
  
  if(function_visibility != "public" && function_visibility != "external"){// Una interfaz solo puede tener funciones públicas o externas
    logElementosNoContemplados +="The abstract function " + function_name +  parteFinalMensajeNoInclusionVyper +"\n";
    return "";
  }

  if(function_state == null || function_state == "" || function_state == "none"){
    function_state = "nonpayable";
  }
  else if(function_state == "constant"){
    function_state = "view";
  }
  code = "def " + function_name + '(' + inputparams_content + ')';
  if(outputparam != ""){
    code += " -> " + outputparam;
  }
  code += ": " + function_state + "\n";
  return code;
};


VyperGenerator['contract'] = function(block) {
  limpiarPropiedadesSubidasVyper();
  limpiarPropiedadesGeneracionFuncionDefault();
  var contract_name =limpiarNombre(block.getFieldValue('name'));
  var statements_content = VyperGenerator.statementToCode(block,'contract_elements');
  var inheritance_contract = obtenerCodigoConexionVyper(block,'namecontractfather');
  var implements_code = generarImplementsInterfacesVyper(inheritance_contract);
  var propiedadesSubidas = obtenerPropiedadesSubidasVyper();
  // En este punto ya se han procesado todas las propiedades.
  var inicializaciones_content = obtenerInicializacionesPropiedadesVyper();

  var function_default = generarDefaultVyper();

  var constructor_code = "";
  var code = "";

  if(statements_content == null){
    statements_content = "";
  }

  // Se genera el constructor cuando existe en Solidity o cuando hay propiedades que necesitan inicializarse.
  if( existeConstructorVyper || inicializaciones_content.trim() != ""){
    constructor_code += "@deploy\n";
    if(constructorPayableVyper){
      constructor_code += "@payable\n";
    }
    constructor_code += "def __init__(" +  parametrosConstructorVyper + "):\n";
    // Primero se inicializan las propiedades de estado
    constructor_code += inicializaciones_content;
    // Después se añade el cuerpo original del constructor
    constructor_code += contenidoConstructorVyper;
    if(inicializaciones_content.trim() == "" && contenidoConstructorVyper.trim() == ""){
      constructor_code += "  pass\n";
    }
    constructor_code += "\n";
  }

  if(implements_code != null && implements_code.trim() != ""){
    code += implements_code + "\n";
    logElementosNoContemplados += "The contract " +  contract_name + " implements interface elements.\n";
  }
  if(propiedadesSubidas != null && propiedadesSubidas.trim() != ""){
    code += propiedadesSubidas + "\n";
  }

  if(statements_content.trim() != ""){
    code +=quitarIndentacionInicialVyper(statements_content ) + "\n";
  }
  if(constructor_code.trim() != ""){
    code += constructor_code;  // Se añade para procesar luego todas las propiedades
  }

  if(function_default != null && function_default.trim() != ""){
    code += function_default + "\n";
  }

  logElementosNoContemplados +="The element " +contract_name +parteFinalMensajeNoInclusionVyper +"\n";
  return code;
};


// Registra la herencia de contratos porque Vyper no permite herencia clásica como Solidity.
VyperGenerator['contract_father'] = function(block) {
  // Intenta obtener el nombre del contrato padre desde el campo name.
  var contract_name = block.getFieldValue('name');

  // Intenta obtener el nombre desde contract_name si el primer campo no existe.
  if( contract_name == null || String(contract_name).trim() == ""){
    contract_name = block.getFieldValue('contract_name');
  }
  // Intenta obtener el nombre desde contract_name_inherance si lo utilizan los bloques actuales.
  if(contract_name == null || String(contract_name).trim() == ""){
    contract_name = block.getFieldValue('contract_name_inherance');
  }
  // Utiliza un nombre genérico si no puede obtener el nombre del contrato padre.
  if(contract_name == null ||  String(contract_name).trim() == ""){
    contract_name = "unknown contract";
  }
  // Limpia el nombre obtenido.
  contract_name = limpiarNombre(contract_name);
  // Registra que la herencia del contrato no se ha incluido
  logElementosNoContemplados +=
    "The inheritance from contract " +
    contract_name +
    parteFinalMensajeNoInclusionVyper +
    " Vyper uses modules and composition instead of contract inheritance.\n";

  // Devuelve una cadena vacía para evitar generar implements con un contrato padre
  return "";
};

/*
PARAMETRO DE ENTRADA: Instrucciones dentro del IF o ELSE o ELSE IF
DESCRIPCIÓN: Añade dos espacios adicionales a cada línea de un cuerpo introducido dentro de un if o else
+*/
function indentarDefaultVyper(codigo){
  if(codigo == null || codigo == ""){
    return "";
  }
  var lineas = codigo.split("\n");// Divide el código en líneas
  var codigoIndentado = "";
  for(var i = 0;i < lineas.length;i++){
    if(lineas[i].trim() != ""){
      codigoIndentado += "  " + lineas[i] + "\n";  // Solo añade las líneas que contienen código
    }
  }
  return codigoIndentado;
}


/*
* PARÁMETRO DE ENTRADA: Los nombres de las interfaces recogido
* DESCRIPCION: Controla que al meter el implements por cada nombre de interfaz recogido no se duplique al añadirlo al codigo vyper
*/
function generarImplementsInterfacesVyper(interfaces_code){
  var code = "";
  var interfaces_generadas = {};//PARA CONTROLAR DE NO METER DUPLICADOS
  var lineas;
  var nombre;
  if(interfaces_code == null || interfaces_code.trim() == ""){
    return "";
  }
  lineas = interfaces_code.split("\n"); //Divide el código en líneas
  for(var i = 0;i < lineas.length;i++){
    nombre = lineas[i].trim();
    if( nombre != "" && !interfaces_generadas[nombre]){
      code += "implements: " + nombre + "\n";
      interfaces_generadas[nombre] = true;
    }
  }
  return code;
}


VyperGenerator['contract_constructor'] = function(block) {
  var statements_content = VyperGenerator.statementToCode(block, 'expressions_constructor');
  var inputparams_content = VyperGenerator.valueToCode(block, 'type', VyperGenerator.ORDER_NONE);
  var inherance_constructor = VyperGenerator.valueToCode(block, 'inherance', VyperGenerator.ORDER_NONE);
  var constructor_payable = block.getFieldValue('payable');

  if(statements_content == null){
    statements_content = "";
  }
  if(inputparams_content == null){
    inputparams_content = "";
  }
  if(inherance_constructor == null){
    inherance_constructor = "";
  }

  existeConstructorVyper = true;
  parametrosConstructorVyper = inputparams_content.trim();
  contenidoConstructorVyper = statements_content;
  herenciaConstructorVyper = inherance_constructor.trim();
  constructorPayableVyper = constructor_payable == "TRUE";

  if(herenciaConstructorVyper != ""){
    logElementosNoContemplados += "The call to the parent constructor " + herenciaConstructorVyper + parteFinalMensajeNoInclusionVyper + "\n";
  }

  return "";
};

VyperGenerator['block_constructor_contract_inherance'] = function(block) {
  var contract_name = block.getFieldValue('contract_name_inherance');
  var inputparams_content = VyperGenerator.valueToCode(block, 'input_params', VyperGenerator.ORDER_NONE);
  if(contract_name == null){
    contract_name = "";
  }
  if(inputparams_content == null){
    inputparams_content = "";
  }
  var code = contract_name.trim() + "(" + inputparams_content.trim() + ')';
  return [code, VyperGenerator.ORDER_NONE];
};

VyperGenerator['clause'] = function(block) {
  var function_name = limpiarNombre(block.getFieldValue('name'));
  var function_visibility = block.getFieldValue('values_visibility');
  var function_state = block.getFieldValue('values_inputmodifier');
  var inputparams_content = VyperGenerator.valueToCode(block, 'inputparams_function', VyperGenerator.ORDER_NONE);
  var outputparam = VyperGenerator.valueToCode(block, 'returns_values', VyperGenerator.ORDER_NONE);
  var function_modifiers = VyperGenerator.valueToCode(block, 'modifiers', VyperGenerator.ORDER_NONE);
  var function_statements_content = VyperGenerator.statementToCode(block, 'elements_function');
  var visibility_vyper = "";
  var state_vyper = "";
  var code = "";
  if(inputparams_content == null){ 
    inputparams_content = "";
  }
  if(outputparam == null){
     outputparam = "";
   }
  if(function_modifiers.trim() != ""){
    function_modifiers = indentarDefaultVyper(quitarIndentacionInicialVyper(function_modifiers));
  }
  if(function_statements_content == null){
     function_statements_content = "";
  }
  if(function_visibility == null){ 
    function_visibility = ""; 
  }
  if(function_state == null){
     function_state = "";
  }
  inputparams_content = inputparams_content.trim();
  outputparam = outputparam.trim();
  function_visibility = function_visibility.trim();
  function_state = function_state.trim();

  if(requiereGenerarFuncionesBibliotecaVyper){
    visibility_vyper = "internal";
  }
  else if(function_visibility == "internal" || function_visibility == "private"){
    visibility_vyper = "internal";
  }
  else{
    visibility_vyper = "external";
  }
  code += "@" + visibility_vyper + "\n";
  if(function_state == "constant"){
    state_vyper = "view";
  }
  else if(function_state == "view" || function_state == "pure" || function_state == "payable"){
    state_vyper = function_state;
  }
  if(state_vyper != ""){
    code += "@" + state_vyper + "\n";
    logElementosNoContemplados += "The state modifier " + function_state + " of function " + function_name + parteFinalMensajeSustitucionElemento + "@" + state_vyper + ".\n";
  }

  if(outputparam == "int" || outputparam == "uint"){
    outputparam = normalizarEnteroVyper(outputparam);
  }

  code += "def " + function_name + "(" + inputparams_content + ')';
  if(outputparam != ""){
    code += " -> " + outputparam;
  }
  code += ":\n" + function_modifiers + function_statements_content;
  if(function_modifiers.trim() == "" && function_statements_content.trim() == ""){
    code += "  pass\n";
  }
  logElementosNoContemplados += "The visibility " + function_visibility + " of function " + function_name + parteFinalMensajeSustitucionElemento + "@" + visibility_vyper + ".\n";
   if(requiereGenerarFuncionesBibliotecaVyper && (function_visibility == "public" || function_visibility == "external")){
    logElementosNoContemplados += "The function " + function_name + " from a Solidity library" + parteFinalMensajeSustitucionElemento + "an internal Vyper function.\n";
  }
  return code + "\n";
};

VyperGenerator['return_clause'] = function(block) {
  var value = VyperGenerator.valueToCode(block,'values',VyperGenerator.ORDER_NONE);
  if(value == null){
    value = "";
  }
  value = value.trim();
  if(value == ""){
    return "return\n";
  }
  return "return " + normalizarExpresionVyper(value) + "\n";
};

VyperGenerator['overridemodifier'] = function(block) {
  var value = VyperGenerator.valueToCode(block, 'inputparams', VyperGenerator.ORDER_NONE);
  if(value == null){ 
    value = ""; 
  }
  logElementosNoContemplados += "Unlike Solidity, inheritance is not supported in Vyper. For this reason, the override tag" + parteFinalMensajeNoInclusionVyper;
  return ["", VyperGenerator.ORDER_NONE];
};

VyperGenerator['block_inputmodifier'] = function(block) {
  var modifier_name = limpiarNombre(block.getFieldValue('value'));
  var inputparams = VyperGenerator.valueToCode(block, 'inputparams', VyperGenerator.ORDER_NONE);
  if(inputparams == null){
   inputparams = "";
   }
  var next_modifier = VyperGenerator.valueToCode(block, 'modifier', VyperGenerator.ORDER_NONE);
  if(inputparams == null){ 
    inputparams = "";
  }
  if(next_modifier == null){
     next_modifier = "";
  }
  var code = "self." + modifier_name + "(" + inputparams.trim() + ")\n" + next_modifier;
  return [code, VyperGenerator.ORDER_NONE];
};

VyperGenerator["receive_function"] = function(block) {
  contenidoReceiveVyper = VyperGenerator.statementToCode( block, "elements_function");
  if(contenidoReceiveVyper == null){
    contenidoReceiveVyper = "";
  }
  existeReceiveVyper = true;//Para indicar que tiene que generar el default para vyper
  return "";
};

VyperGenerator["fallback_function"] = function(block) {
  var payable = block.getFieldValue("payable");
  contenidoFallbackVyper = VyperGenerator.statementToCode(block, "elements_function");
  if(contenidoFallbackVyper == null){
    contenidoFallbackVyper = "";
  }
  existeFallbackVyper = true;//Para indicar que tiene que generar el default para vyper
  if (payable == "TRUE"){
    fallbackPayableVyper = true;//Para indicar el envío de la dividsa
  }
  return "";
};

/*
PARAMETROS DE ENTRADA: NINGUNO
DESCRIPCIÓN: Genera el codigo de la función default en vyper en base a si han aparecido los bloques fallback y receive y si estos tienen cuerpo o no
*/
function generarDefaultVyper(){
  var code = "";
  if(!existeReceiveVyper && !existeFallbackVyper){//PRIMERO COMPRUEBA SI EXISTEN EN EL MODELO DE BLOQUES
    return "";
  }
  code += "@external\n";

  if(existeReceiveVyper || fallbackPayableVyper){//COMPRUEBA SI SE VA A ENVIAR O RECIBIR DIVISA PARA INDICAR LA ETIQUETA PAYABLE
    code += "@payable\n";
  }
  code += "def __default__():\n";//CABECERA DE LA FUNCIÓN
  // CASO 1: SOLO EXISTE RECEIVE EN EL MODELO DE BLOQUES
  if(existeReceiveVyper && !existeFallbackVyper){
    code += "  assert len(msg.data) == 0\n";
    if(contenidoReceiveVyper.trim() == ""){
      code += "  pass\n";    // Si receive no contiene instrucciones se añade pass para evitar que la función quede vacía

    }
    else{ // Se añade el contenido de receive dentro de default
      code += contenidoReceiveVyper;
    }
  }
  // CASO 2: SOLO EXISTE FALLBACK EN EL MODELO DE BLOQUES
  else if(!existeReceiveVyper && existeFallbackVyper){
    // Si fallback no contiene instrucciones se añade pass
    if(contenidoFallbackVyper.trim() == ""){
      code += "  pass\n";
    }
    else{// Se añade el contenido de fallback dentro de default
      code += contenidoFallbackVyper;
    }
  }
  else{// CASO 3: EXISTEN FALLBACK Y RECEIVE EN E MODELO DE BLOQUES
    // Si la llamada no contiene datos se ejecuta el contenido de receive
    code += "  if len(msg.data) == 0:\n";
    // Si receive está vacío, se añade pass
    if(contenidoReceiveVyper.trim() == ""){
      code += "    pass\n";
    }
    else{// Se añade una indentación adicional porque el contenido se encuentra dentro del bloque if
      code += indentarDefaultVyper(contenidoReceiveVyper);
    }
    // Si la llamada contiene datos se ejecuta el contenido de fallback
    code += "  else:\n";
    // La función default debe ser payable cuando existe receive. Si el fallback original no era payable se impide que reciba Ether
    if(!fallbackPayableVyper){
      code += "    assert msg.value == 0\n";
    }
    // Si fallback está vacío y es payable se añade pass para evitar que el bloque else quede vacío
    if(contenidoFallbackVyper.trim() == ""){
      if(fallbackPayableVyper){
        code += "    pass\n";
      }
    }
    else{// Hay que añadir una indentación adicional porque el contenido se encuentra dentro del bloque else
      code += indentarDefaultVyper(contenidoFallbackVyper);
    }
  }

  return code;
}


//Generador de propiedades largas

function generadorVyperValorPropiedades(property_valueproperty){
  if(property_valueproperty == null || property_valueproperty == ""){
    property_valueproperty = "";
  }
  else{
    property_valueproperty = ' = ' + property_valueproperty.trim();
  }
  return property_valueproperty;
}


/*
PARÁMETROS DE ENTRADA: Nombre, tipo, dimensión y visibilidad de una propiedad constante sin valor
DESCRIPCIÓN: Convierte una constante sin valor inicial en una variable de estado no constante
*/
function generarEstadoDesdeConstanteSinValorVyper(property_name, property_type, property_array, property_visibility){
  var declaration_code = "";
  if(property_name == null){
    property_name = "";
  }
  if(property_type == null){
    property_type = "";
  }
  if(property_array == null){
    property_array = "";
  }
  if(property_visibility == null){
    property_visibility = "";
  }
  property_name = property_name.trim();
  property_type = property_type.trim();
  property_array = property_array.trim();
  property_visibility = property_visibility.trim();
  if(property_visibility == "public"){
    declaration_code = property_name + " : public(" + property_type + property_array + ')';
  }
  else{
    declaration_code = property_name + " : " + property_type + property_array;
  }

  guardarPropiedadEstadoVyper(property_name);
  logElementosNoContemplados += "The Solidity constant property " + property_name + " has no initial value and cannot be declared as constant in Vyper" + parteFinalMensajeSustitucionElemento + "a non-constant state variable.\n";
  return declaration_code + "\n";
}

VyperGenerator['text_property'] = function(block) {
  var property_name = limpiarNombre(  block.getFieldValue('name'));
  var property_type=  block.getFieldValue('type');
  var property_constant = block.getFieldValue('constant');
  var property_visibility =block.getFieldValue('values_visibility');
  var property_array = obtenerCodigoConexionVyper( block, 'arraydimension' );
  var property_valueproperty = obtenerCodigoConexionVyper( block,'valueproperty');
  var code = "";
  var declaration_code = "";

  if(property_visibility == null){
    property_visibility = "";
  }

  if(property_array == null){
    property_array = "";
  }

  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  if(property_type == "string_type" ||property_type == "string" || property_type == "String"){
    property_type = "String[100]";//Se pone por defecto 100 porque necesita un tamaño fijo
    logElementosNoContemplados += "The unbounded Solidity string property " + property_name + parteFinalMensajeSustitucionElemento + "String[100].\n";
  }
  else if(property_type == "bytes_type" || property_type == "bytes" || property_type == "Bytes"){
    property_type = "Bytes[100]";
    logElementosNoContemplados +="The unbounded Solidity bytes property " + property_name + parteFinalMensajeSustitucionElemento +  "Bytes[100].\n";
  }
  else if(property_type == null || property_type == ""){
    property_type = "String[100]";
    logElementosNoContemplados += "The text type of property " + property_name + " could not be determined" + parteFinalMensajeSustitucionElemento + "String[100].\n";
  }
  property_array = property_array.trim();
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code =  property_name +  " : " + property_type +  property_array;
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code +" = empty(" + property_type + property_array +")\n";
    }
  }
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name, property_type,property_array,property_visibility );
      }
      else{
        declaration_code =property_name + " : constant(" + property_type + property_array + ')';

        code =
          declaration_code +" = " + property_valueproperty +"\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + property_array + ')';
      }
      else{
        declaration_code = property_name + " : " + property_type + property_array;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }

  return code;
};

VyperGenerator['byte_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = normalizarBytesVyper(block.getFieldValue('byte_type'));
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";
  if(property_visibility == null){ 
    property_visibility = ""; 
  }
  if(property_valueproperty == null){
     property_valueproperty = ""; 
  }
  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función, constructor o modificador es una variable local.
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado.
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }
  return code;
};

VyperGenerator['identifier_property'] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = block.getFieldValue('type');
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";

  if(property_type == null){
    property_type = "";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  property_type = String(property_type).trim();
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());

  var tipoCompleto = aplicarDimensionesArrayVyper(property_type,dimensiones);

  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + tipoCompleto;
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty +"\n";
    }
    else{
      code = declaration_code + " = empty(" + tipoCompleto + ")\n";
    }
  }
  else if(property_constant == "TRUE"){
    if(property_valueproperty == ""){
      code = generarEstadoDesdeConstanteSinValorVyper(property_name,tipoCompleto,"",property_visibility);
    }
    else{
      declaration_code = property_name +" : constant(" +tipoCompleto +")";
      code = declaration_code + " = " + property_valueproperty +"\n";
    }
  }
  else{
    if(property_visibility == "public"){
      declaration_code = property_name +" : public(" + tipoCompleto +")";
    }
    else{
      declaration_code = property_name + " : " +  tipoCompleto;
    }
    guardarPropiedadEstadoVyper(property_name,tipoCompleto);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }
    code = declaration_code + "\n";
  }

  return code;
};

VyperGenerator['boolean_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("bool",obtenerDimensionesArrayVyper(block));
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";
  if(property_visibility == null){ 
    property_visibility = ""; 
  }
  if(property_valueproperty == null){
     property_valueproperty = ""; 
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;

    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }
  return code;
};

VyperGenerator['address_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = block.getFieldValue('addresstype_values');
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";
  if(property_type == null || property_type == ""){ 
    property_type = "address"; 
  }
  if(property_visibility == null){ 
    property_visibility = ""; 
  }
  if(property_valueproperty == null){ 
    property_valueproperty = "";
  }
  if(property_type == "address payable" || property_type == "address_payable"){
    property_type = "address";
    logElementosNoContemplados += "The Solidity type address payable of property " + property_name + parteFinalMensajeSustitucionElemento + "address.\n";
  }
  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }

  return code;
};

VyperGenerator['number_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = normalizarEnteroVyper(block.getFieldValue('numbertype_property'));
  var tipoBase = property_type;
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";

  if(property_visibility == null){
    property_visibility = "";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());

  // Se utiliza max_value para no calcular un valor intermedio fuera del rango.
  if(property_constant == "TRUE" && dimensiones == "" && tipoBase.indexOf("uint") == 0){
    var valorLimite = property_valueproperty.split(" ").join("").split("\t").join("").split("\n").join("");
    valorLimite = valorLimite.split("(").join("").split(")").join("");

    var bits = tipoBase.substring(4);
    if(bits == ""){ bits = "256"; }

    if(valorLimite == "2**" + bits + "-1"){
      property_valueproperty = "max_value(" + tipoBase + ")";
      logElementosNoContemplados += "The maximum value expression of " + tipoBase + parteFinalMensajeSustitucionElemento + property_valueproperty + ".\n";
    }
  }

  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;

    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }

      guardarPropiedadEstadoVyper(property_name);

      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }

      code = declaration_code + "\n";
    }
  }

  return code;
};

VyperGenerator['user_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("User",obtenerDimensionesArrayVyper(block));
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";

  if(property_visibility == null){ 
    property_visibility = "";
  }
  if(property_valueproperty == null){ 
    property_valueproperty = "";
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;

    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }
  return code;
};

VyperGenerator['company_property'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("Company",obtenerDimensionesArrayVyper(block));
  var property_constant = block.getFieldValue('constant');
  var property_visibility = block.getFieldValue('values_visibility');
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  var declaration_code = "";

  if(property_visibility == null){ 
    property_visibility = ""; 
  }
  if(property_valueproperty == null){ 
    property_valueproperty = ""; 
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    declaration_code = property_name + " : " + property_type;
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    if(property_constant == "TRUE"){
      if(property_valueproperty == ""){
        code = generarEstadoDesdeConstanteSinValorVyper(property_name,property_type,"",property_visibility);
      }
      else{
        declaration_code = property_name + " : constant(" + property_type + ")";
        code = declaration_code + " = " + property_valueproperty + "\n";
      }
    }
    else{
      if(property_visibility == "public"){
        declaration_code = property_name + " : public(" + property_type + ")";
      }
      else{
        declaration_code = property_name + " : " + property_type;
      }
      guardarPropiedadEstadoVyper(property_name);
      if(property_valueproperty != ""){
        subirInicializacionPropiedadVyper(property_name,property_valueproperty);
      }
      code = declaration_code + "\n";
    }
  }
  return code;
};


VyperGenerator['mapping_property'] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_visibility = block.getFieldValue('values_visibility');
  var property_constant = block.getFieldValue('constant');
  var property_key = VyperGenerator.valueToCode(block, 'key', VyperGenerator.ORDER_NONE);
  var property_value = VyperGenerator.valueToCode(block, 'value', VyperGenerator.ORDER_NONE);
  var property_array = VyperGenerator.valueToCode(block, 'arraydimension', VyperGenerator.ORDER_NONE);
  var property_valueproperty = VyperGenerator.valueToCode(block, 'valueproperty', VyperGenerator.ORDER_NONE);
  var property_type = "";
  var declaration_code = "";

  if(property_visibility == null){
    property_visibility = "";
  }
  if(property_constant == null){
    property_constant = "FALSE";
  }
  if(property_key == null){
    property_key = "";
  }
  if(property_value == null){
    property_value = "";
  }
  if(property_array == null){
    property_array = "";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  property_visibility = property_visibility.trim();
  property_key = property_key.trim();
  property_value = property_value.trim();
  property_array = property_array.trim();
  property_valueproperty = property_valueproperty.trim();

  if(property_key == "" || property_value == ""){
    logElementosNoContemplados += "The mapping " + property_name + " has not been included because its key or value type is missing.\n";
    return "";
  }
  if(property_key == "uint" || property_key == "int"){
    property_key = normalizarEnteroVyper(property_key);
  }
  if(property_value == "uint" || property_value == "int"){
    property_value = normalizarEnteroVyper(property_value);
  }
  if(propiedadFueraContrato(block)){
    logElementosNoContemplados += "The mapping " + property_name + " has not been included because Vyper only allows HashMap as a state variable.\n";
    return "";
  }
  if(property_constant == "TRUE"){
    logElementosNoContemplados += "The constant mapping " + property_name + " has not been included because Vyper does not allow constant HashMap variables.\n";
    return "";
  }
  if(property_array != ""){
    logElementosNoContemplados += "The array dimension of mapping " + property_name + parteFinalMensajeNoInclusionVyper + "\n";
  }

  if(property_valueproperty != ""){
    logElementosNoContemplados += "The initial value of mapping " + property_name + parteFinalMensajeNoInclusionVyper + "\n";
  }
  property_type = "HashMap[" + property_key + ", " + property_value + ']';
  if(property_visibility == "public"){
    declaration_code = property_name + " : public(" + property_type + ')';
  }
  else{
    declaration_code = property_name + " : " + property_type;
  }

  guardarPropiedadEstadoVyper(property_name);
  return declaration_code + "\n";
};


VyperGenerator['personalized_struct'] = function(block){
  var struct_name = limpiarNombre(block.getFieldValue('name'));
  var struct_properties = "";
  var campos = [];
  var propiedadActual = block.getInputTargetBlock('properties_struct');
  // Se guardan los campos para poder generar constructores Vyper con argumentos nombrados
  while(propiedadActual != null){
    var nombreCampo = propiedadActual.getFieldValue('name');

    if(nombreCampo != null && String(nombreCampo).trim() != ""){
      campos.push(limpiarNombre(String(nombreCampo).trim()));
    }

    if(propiedadActual.nextConnection != null){
      propiedadActual = propiedadActual.nextConnection.targetBlock();
    }
    else{
      propiedadActual = null;
    }
  }
  camposStructsVyper[struct_name] = campos;
  generandoStructVyper = true;
  try{
    struct_properties = VyperGenerator.statementToCode(block,'properties_struct');
  }
  finally{
    generandoStructVyper = false;
  }
  if(struct_properties == null || struct_properties.trim() == ""){
    struct_properties = "  pass\n";
  }
  return "struct " + struct_name + ":\n" + struct_properties + "\n";
};

VyperGenerator['enum'] = function(block) {
  var enum_name = limpiarNombre(block.getFieldValue('name'));
  var enum_values = VyperGenerator.statementToCode(block, 'values_enum');
  var code = "flag " + enum_name + ":\n";
  code += enum_values + "\n";
  return code;
};

VyperGenerator['enum_value'] = function(block) {
  var enum_value = block.getFieldValue('value_enum');
  var statement_next_enum_value = VyperGenerator.statementToCode(block, 'value');
  var code = enum_value + "\n" + statement_next_enum_value
  return code;
};
//Generador de propiedades largas

//Generador de propiedades cortas

VyperGenerator['identifier_shortproperty'] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = block.getFieldValue('type');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  if(property_type == null){
    property_type = "";
  }

  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  property_type = String(property_type).trim();
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  var tipoCompleto = aplicarDimensionesArrayVyper(property_type,dimensiones);
  var declaration_code =property_name + " : " + tipoCompleto;

  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty +"\n";
    }
    else{
      code = declaration_code + " = empty(" + tipoCompleto + ")\n";
    }
  }
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }
    code = declaration_code + "\n";
  }

  return code;
};

VyperGenerator['boolean_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("bool",obtenerDimensionesArrayVyper(block));
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  if(property_valueproperty == null){ 
    property_valueproperty = "";
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  var declaration_code = property_name + " : " + property_type;

  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }

    code = declaration_code + "\n";
  }

  return code;
};

VyperGenerator["byte_shortproperty"] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue("name"));
  var property_type = normalizarBytesVyper(block.getFieldValue("byte_type"));
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_value = obtenerCodigoConexionVyper(block, "valueproperty");

  if (property_value == null) {
    property_value = "";
  }

  property_type = aplicarDimensionesArrayVyper(property_type, dimensiones);
  property_value = normalizarExpresionVyper(property_value.trim());

  var declaration_code = property_name + ": " + property_type;

  if (propiedadFueraContrato(block)) {
    if (property_value !== "") {
      return declaration_code + " = " + property_value + "\n";
    }

    return declaration_code + " = empty(" + property_type + ")\n";
  }

  guardarPropiedadEstadoVyper(property_name);

  if (property_value !== "") {
    subirInicializacionPropiedadVyper(property_name, property_value);
  }

  return declaration_code + "\n";
};

VyperGenerator['number_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = normalizarEnteroVyper(block.getFieldValue('numbertype_property'));
  var tipoBase = property_type;
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";

  if(property_valueproperty == null){
    property_valueproperty = "";
  }

  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());

  // Se utiliza max_value para no calcular un valor intermedio fuera del rango
  if(dimensiones == "" && tipoBase.indexOf("uint") == 0){
    var valorLimite = property_valueproperty.split(" ").join("").split("\t").join("").split("\n").join("");
    valorLimite = valorLimite.split("(").join("").split(")").join("");

    var bits = tipoBase.substring(4);
    if(bits == ""){ bits = "256"; }

    if(valorLimite == "2**" + bits + "-1"){
      property_valueproperty = "max_value(" + tipoBase + ")";
      logElementosNoContemplados += "The maximum value expression of " + tipoBase + parteFinalMensajeSustitucionElemento + property_valueproperty + ".\n";
    }
  }

  var declaration_code = property_name + " : " + property_type;

  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);

    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }

    code = declaration_code + "\n";
  }

  return code;
};

VyperGenerator['text_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = block.getFieldValue('type');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  if(property_type == "bytes_type" || property_type == "bytes" || property_type == "Bytes"){
    property_type = "Bytes[100]";
  }
  else{
    property_type = "String[100]";
  }
  if(property_valueproperty == null){
     property_valueproperty = "";
  }
  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());

  var declaration_code = property_name + " : " + property_type;

  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }

    code = declaration_code + "\n";
  }
  return code;
};

VyperGenerator['address_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = block.getFieldValue('addresstype_values');
  var dimensiones = obtenerDimensionesArrayVyper(block);
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  if(property_type == null || property_type == ""){
     property_type = "address";
    }
  if(property_valueproperty == null){ 
    property_valueproperty = ""; 
  }
  if(property_type == "address payable" || property_type == "address_payable"){
    property_type = "address";
    logElementosNoContemplados += "The Solidity type address payable of property " + property_name + parteFinalMensajeSustitucionElemento + "address.\n";
  }
  property_type = aplicarDimensionesArrayVyper(property_type,dimensiones);
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  var declaration_code = property_name + " : " + property_type;
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }
    code = declaration_code + "\n";
  }
  return code;
};

VyperGenerator['user_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("User",obtenerDimensionesArrayVyper(block));
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";

  if(property_valueproperty == null){
     property_valueproperty = "";
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  var declaration_code = property_name + " : " + property_type;
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);

    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }

    code = declaration_code + "\n";
  }

  return code;
};


VyperGenerator['user_shortproperty'] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_valueproperty = VyperGenerator.valueToCode(block, 'valueproperty', VyperGenerator.ORDER_NONE);
  var property_array = VyperGenerator.valueToCode(block, 'array_dimension', VyperGenerator.ORDER_NONE);
  var property_type = "User";
  var code = "";
  var declaration_code = "";
  if(property_array == null){
    property_array = "";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }
  property_array = property_array.trim();
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  declaration_code = property_name +  " : " +  property_type +  property_array;
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code =  declaration_code + " = " +  property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" +  property_type + property_array + ")\n";
    }
  }
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name, property_valueproperty);
    }
    code = declaration_code + "\n";
  }

  return code;
};

VyperGenerator['company_shortproperty'] = function(block){
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_type = aplicarDimensionesArrayVyper("Company",obtenerDimensionesArrayVyper(block));
  var property_valueproperty = obtenerCodigoConexionVyper(block,'valueproperty');
  var code = "";
  if(property_valueproperty == null){ 
    property_valueproperty = "";
  }
  property_valueproperty = normalizarExpresionVyper(property_valueproperty.trim());
  var declaration_code = property_name + " : " + property_type;
  // Dentro de una función, constructor o modificador es una variable local
  if(propiedadFueraContrato(block)){
    if(property_valueproperty != ""){
      code = declaration_code + " = " + property_valueproperty + "\n";
    }
    else{
      code = declaration_code + " = empty(" + property_type + ")\n";
    }
  }
  // Directamente dentro del contrato es una variable de estado
  else{
    guardarPropiedadEstadoVyper(property_name);
    if(property_valueproperty != ""){
      subirInicializacionPropiedadVyper(property_name,property_valueproperty);
    }
    code = declaration_code + "\n";
  }
  return code;
};

VyperGenerator['mapping_shortproperty'] = function(block) {
  var property_name = limpiarNombre(block.getFieldValue('name'));
  var property_key = VyperGenerator.valueToCode(block, 'key', VyperGenerator.ORDER_NONE);
  var property_value = VyperGenerator.valueToCode(block, 'value', VyperGenerator.ORDER_NONE);
  var property_array = VyperGenerator.valueToCode(block, 'arraydimension', VyperGenerator.ORDER_NONE);
  var property_valueproperty = VyperGenerator.valueToCode(block, 'valueproperty', VyperGenerator.ORDER_NONE);
  var property_type = "";
  if(property_key == null){
    property_key = "";
  }
  if(property_value == null){
    property_value = "";
  }
  if(property_array == null){
    property_array = "";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }
  property_key = property_key.trim();
  property_value = property_value.trim();
  property_array = property_array.trim();
  property_valueproperty = property_valueproperty.trim();
  if(property_key == "" || property_value == ""){
    logElementosNoContemplados += "The mapping " + property_name + " has not been included because its key or value type is missing.\n";
    return "";
  }
  if(property_key == "uint" || property_key == "int"){
    property_key = normalizarEnteroVyper(property_key);
  }
  if(property_value == "uint" || property_value == "int"){
    property_value = normalizarEnteroVyper(property_value);
  }

  if(propiedadFueraContrato(block)){
    logElementosNoContemplados += "The mapping " + property_name + " has not been included because Vyper does not allow local HashMap variables.\n";
    return "";
  }

  if(property_array != ""){
    logElementosNoContemplados += "The array dimension of mapping " + property_name + parteFinalMensajeNoInclusionVyper + "\n";
  }

  if(property_valueproperty != ""){
    logElementosNoContemplados += "The initial value of mapping " + property_name + parteFinalMensajeNoInclusionVyper + "\n";
  }
  property_type = "HashMap[" + property_key + ", " + property_value + ']';
  guardarPropiedadEstadoVyper(property_name);
  return property_name + " : " + property_type + "\n";
};
//Generador de propiedades cortas

//Generador de variables predefinidas

VyperGenerator['blockvariables'] = function(block){
var value = block.getFieldValue('values_blockvariables');
  if(value == null){ 
    value = ""; 
  }
  return [value, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['msgvariables'] = function(block) {
  var code = block.getFieldValue('msgvariables');
  if(code == null){
    code = "";
  }
  return [code.trim(), VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['txvariables'] = function(block) {
  var value = block.getFieldValue('values_txvariables');
  if(value == null){
     value = ""; 
  }
  return [value, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_this'] = function(block) {  
  var value = block.getFieldValue("thisvalues");
  logElementosNoContemplados += "The expression 'this' is not supported in Vyper" + parteFinalMensajeSustitucionElemento + " self." + "\n";
  if(value == null){
    value = "";
  }
  value = String(value).trim();
  if(value == ""|| value == "this" || value == "address(this)"){
    return "self";
  }
  if(value == "balance" || value == "this.balance" || value == "address(this).balance"){
    return "self.balance";
  }
  else{
    return "self" + value;
  }
};

VyperGenerator['block_thisexpression'] = function(block) {
  logElementosNoContemplados += "The expression 'this' is not supported in Vyper" + parteFinalMensajeSustitucionElemento + " self." + "\n";
  var value = block.getFieldValue("value");
  if(value == null){
    value = "";
  }
  if(value == "" || value == "this" ||value == "address(this)"){
    return "self";
  }
  if(value == "balance" || value == "this.balance" || value == "address(this).balance")
    {
    return "self.balance";
  }
  if(value.indexOf("this.") == 0){
    value = value.substring(5);
  }
  if(value.indexOf("self.") == 0){
    return value;
  }
  logElementosNoContemplados += "The Solidity expression this." + value + parteFinalMensajeSustitucionElemento + "self." + value + ". The result must be reviewed if it is an external function call.\n";
  return "self." + value;
};

VyperGenerator['block_now'] = function(block) {
    return ["block.timestamp", VyperGenerator.ORDER_ATOMIC];
};
//Fin Generador de variables predefinidas

//Generador de Expresiones

VyperGenerator['block_usinglibrary'] = function(block) {
  var name = limpiarNombre(block.getFieldValue('name'));
  var alias_for = block.getFieldValue('alias');
  if(alias_for == null){
    alias_for = "";
  }
  logElementosNoContemplados +="The Solidity expression using " +name +" for " +alias_for +parteFinalMensajeNoInclusionVyper + " Calls that use the library extension syntax must be reviewed manually.\n";
  return "";
};



VyperGenerator['shift_expression'] = function(block) {
  var operator = block.getFieldValue('operators');
  var expression1 = VyperGenerator.valueToCode(block, 'value1_shiftexpression', VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block, 'value2_shiftexpression', VyperGenerator.ORDER_NONE);
  var code = incluirSelfVariable(expression1.trim()) + " " + operator + " " + incluirSelfVariable(expression2.trim());
  return [code, VyperGenerator.ORDER_NONE];
};

VyperGenerator['time_expression'] = function(block) {
  var time_value = block.getFieldValue('time_value');
  var time_unity = block.getFieldValue('time_unity');
  var code = time_value + ' ' + time_unity;
  return code;
};

VyperGenerator['assign_value_expression'] = function(block){
  var operator = block.getFieldValue("operators");
  var expression1 = VyperGenerator.valueToCode(block,'value1_assignexpression',VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block,'value2_assignexpression',VyperGenerator.ORDER_NONE);
  if(expression1 == null){
    expression1 = ""; 
  }
  if(expression2 == null){ 
    expression2 = ""; 
  }
  expression1 = expression1.trim();
  expression2 = expression2.trim();
  var nombreVariable = "";
  // Hay que comprobar la tupla antes de añadir self a las expresiones
  if(expression1.startsWith("(") && expression1.endsWith(")")){
    var contenidoTupla = expression1.substring(1,expression1.length - 1).trim();
    var posicionComa = contenidoTupla.indexOf(",");
    if(posicionComa != -1 && contenidoTupla.substring(posicionComa + 1).trim() == ""){
      var declaracion = contenidoTupla.substring(0,posicionComa).trim();
      declaracion = declaracion.split("\t").join(" ");
      while(declaracion.indexOf("  ") != -1){
        declaracion = declaracion.split("  ").join(" ");
      }
      if(declaracion.indexOf("bool ") == 0){
        nombreVariable = declaracion.substring(5).trim();
        for(var i = 0;i < nombreVariable.length;i++){
          if(!esCaracterNombreVyper(nombreVariable.charAt(i))){
            nombreVariable = "";
            break;
          }
        }
      }
    }
  }
  if(nombreVariable != ""){
    if(expression2.indexOf(".delegatecall(") != -1 || expression2.indexOf(".delegatecall (") != -1){
      expression2 = normalizarExpresionVyper(expression2);
    }
    else if(expression2.indexOf(".call{") != -1 || expression2.indexOf(".call(") != -1){
      expression2 = convertirEnvioDivisaVyper(expression2);
    }

    if(expression2.indexOf("raw_call(") == 0){
      nombreVariable = limpiarNombre(nombreVariable);
      logElementosNoContemplados += "The Solidity low-level call assigned to the tuple " + expression1 + " has been replaced by a Vyper raw_call returning a boolean value.\n";
      return nombreVariable + ": bool = " + expression2 + "\n";
    }
  }
  expression1 = normalizarExpresionVyper(expression1);
  expression2 = normalizarExpresionVyper(expression2);

  return expression1 + " " + operator + " " + expression2 + "\n";
};


VyperGenerator['assing_value_expression1inputs'] = function(block) {
var expression = VyperGenerator.valueToCode(block, 'value1_assignexpression', VyperGenerator.ORDER_NONE);
if(expression == null){
    expression = "";
  }
  expression = incluirSelfVariable(expression.trim());
  return [expression, VyperGenerator.ORDER_NONE];
};

VyperGenerator['casting_expression'] = function(block) {
  var type = obtenerCodigoConexionVyper(block, 'type');
  var expression = obtenerCodigoConexionVyper(block, 'expressioncast');
  if(type == null){
    type = "";
  }
  if(expression == null){
    expression = "";
  }
  type = type.trim();
  expression = expression.trim();
  if(type == "" || expression == ""){
    logElementosNoContemplados += "The casting expression has not been included because its type or value is missing" + "\n";
    return ["", VyperGenerator.ORDER_NONE];
  }
  var code = "convert(" + expression + ", " + type + ')';
  logElementosNoContemplados += "Vyper requires the function convert for casting actions "+ "\n";
  return [code, VyperGenerator.ORDER_NONE];
};

VyperGenerator['bitwise_expression'] = function(block) {
  var operator = block.getFieldValue('operators');
  var expression1 = VyperGenerator.valueToCode(block, 'value1_bitwiseexpression', VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block, 'value2_bitwiseexpression', VyperGenerator.ORDER_NONE);
  if(expression1 == null){ 
    expression1 = ""; }
  if(expression2 == null){ 
    expression2 = "";
  }
  var code = incluirSelfVariable(expression1.trim()) + " " + operator + " " + incluirSelfVariable(expression2.trim());
  return [code,VyperGenerator.ORDER_NONE];
};

VyperGenerator['bitwise_expression1inputs'] = function(block) {
  var operator = block.getFieldValue('operators');
  var expression = VyperGenerator.valueToCode(block, 'value2_shiftexpression', VyperGenerator.ORDER_NONE);
  if(expression == null){ 
    expression = "";
   }
  var code =   operator + " " + incluirSelfVariable(expression.trim());
  return [code,VyperGenerator.ORDER_NONE];
};


VyperGenerator['tuple'] = function(block) {
  var expression = VyperGenerator.valueToCode(block, 'values', VyperGenerator.ORDER_NONE);
  if(expression == null){ 
    expression = ""; 
  
  }
  expression = "(" + expression + ')';
  return [expression, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_assembly'] = function(block) {
  var assembly_statements_content = VyperGenerator.statementToCode(block,'assembly_values');
  var code = "";
  code += "# ADVICE: Solidity assembly is not supported in Vyper.\n";
  if(assembly_statements_content.trim() != ""){
    code += generarComentarioCodigoVyper(quitarIndentacionInicialVyper(assembly_statements_content));}
  logElementosNoContemplados += "The Solidity assembly block" +  parteFinalMensajeNoInclusionVyper + "\n";
  return code;
};




VyperGenerator['block_assignvalue_assemblyexpression'] = function(block) {
  var name_var = block.getFieldValue('name_var');
  var assembly_var_statements_content = VyperGenerator.statementToCode(block,'expression');
  var code = generarComentarioCodigoVyper(name_var + " := " + assembly_var_statements_content);
  return code;;
};

VyperGenerator['block_let_expression'] = function(block) {
  var name_var_let = block.getFieldValue('name_var_let');
  var assembly_let_var_statements_content = VyperGenerator.statementToCode(block,'expression');
  var code = "let " + name_var_let + " := " + assembly_let_var_statements_content;
  return code;
};

/*
DESCRIPCIÓN: Comprueba si una expresión de Solidity envía divisa para luego pasar a la funcion de conversión a Vyper el método con el que envía divisa y la expresion
*/
function convertirEnvioDivisaVyper(expresion){
  if(expresion == null){ return ""; }

  expresion = String(expresion).trim();
  if(expresion.indexOf(".transfer(") != -1){
    return convertirTransferSendVyper(expresion,".transfer(");
  }
  else if(expresion.indexOf(".send(") != -1){
    return convertirTransferSendVyper(expresion,".send(");
  }
  else if(expresion.indexOf(".call{") != -1){
    return convertirTransferSendVyper(expresion,".call{");
  }
  else if(expresion.indexOf(".call(") != -1){
    return convertirTransferSendVyper(expresion,".call(");
  }
  return normalizarExpresionVyper(expresion);
}

/*
PARÁMETROS DE ENTRADA: Expresión Solidity y operador utilizado
DESCRIPCIÓN: Convierte transfer, send y call al formato utilizado por Vyper
PARÁMETRO DE SALIDA: Expresión Vyper
*/
function convertirTransferSendVyper(expresion,operador){
  var posicionOperador = expresion.indexOf(operador);
  if(posicionOperador == -1){ 
    return normalizarExpresionVyper(expresion);
  }
  var receptor = expresion.substring(0,posicionOperador).trim();
  if(receptor.indexOf("payable(") == 0 && receptor.endsWith(")")){
    receptor = receptor.substring(8,receptor.length - 1).trim();
  }
  if(receptor.indexOf("address(") == 0 && receptor.endsWith(")")){
    receptor = receptor.substring(8,receptor.length - 1).trim();
  }
  receptor = normalizarExpresionVyper(receptor);
  if(operador == ".transfer(" || operador == ".send("){
    var cantidad = expresion.substring(posicionOperador + operador.length).trim();
    if(cantidad.endsWith(";")){ 
      cantidad = cantidad.substring(0,cantidad.length - 1).trim();
    }
    if(cantidad.endsWith(")")){ 
      cantidad = cantidad.substring(0,cantidad.length - 1).trim(); 
    }
    cantidad = normalizarExpresionVyper(cantidad);
    return "send(" + receptor + ", " + cantidad + ")";
  }

  var resto = expresion.substring(posicionOperador + operador.length).trim();
  var opciones = "";
  var cantidadCall = "";
  var gasCall = "";
  var datos = "";
  var posicionParentesis = -1;

  if(operador == ".call{"){
    var posicionCierre = resto.indexOf("}");
    if(posicionCierre == -1){ return normalizarExpresionVyper(expresion); }
    opciones = resto.substring(0,posicionCierre).trim();
    resto = resto.substring(posicionCierre + 1).trim();
    // Se obtienen las opciones value y gas para generar los argumentos de raw_call
    var listaOpciones = opciones.split(",");

    for(var i = 0;i < listaOpciones.length;i++){
      var opcion = listaOpciones[i].trim();
      var posicionDosPuntos = opcion.indexOf(":");

      if(posicionDosPuntos != -1){
        var nombreOpcion = opcion.substring(0,posicionDosPuntos).trim();
        var valorOpcion = opcion.substring(posicionDosPuntos + 1).trim();
        if(nombreOpcion == "value"){ 
          cantidadCall = normalizarExpresionVyper(valorOpcion); 
        }
        else if(nombreOpcion == "gas"){ 
          gasCall = normalizarExpresionVyper(valorOpcion);
         }
      }
    }
    posicionParentesis = resto.indexOf("(");
  }
  else{
    posicionParentesis = 0;
  }

  if(posicionParentesis == -1){ 
    return normalizarExpresionVyper(expresion); 
  }

  var posicionCierreParentesis = resto.lastIndexOf(")");
  if(posicionCierreParentesis == -1){
     return normalizarExpresionVyper(expresion); 
  }
  datos = resto.substring(posicionParentesis + 1,posicionCierreParentesis).trim();

  // Hay que utilizar un literal bytes vacío cuando Solidity no envía datos
  if(datos == "" || datos == '""' || datos == "''"){
    datos = 'b""';
  }
  else{
    datos = normalizarExpresionVyper(datos);
  }

  var code = "raw_call(" + receptor + ", " + datos;

  if(gasCall != ""){ 
    code += ", gas=" + gasCall;
   }
  if(cantidadCall != ""){ 
    code += ", value=" + cantidadCall;
   }
  code += ", revert_on_failure=False)";
  return code;
}



VyperGenerator['personalized_expression'] = function(block){
  var code = block.getFieldValue('values_expression');
  if(code == null){ code = ""; }

  code = sustituirPalabrasReservadasSolidity(code);

  // Vyper utiliza append para añadir elementos a un DynArray
  code = code.split(".push(").join(".append(");
  code = code.split(".push (").join(".append(");

  // Se convierten los constructores posicionales de todos los structs registrados
  for(var nombreStruct in camposStructsVyper){
    if(!Object.prototype.hasOwnProperty.call(camposStructsVyper,nombreStruct)){ continue; }

    var campos = camposStructsVyper[nombreStruct];
    var textoConstructor = nombreStruct + "(";
    var posicionBusqueda = 0;

    while(posicionBusqueda < code.length){
      var inicioConstructor = code.indexOf(textoConstructor,posicionBusqueda);
      if(inicioConstructor == -1){ break; }

      var inicioArgumentos = inicioConstructor + textoConstructor.length;
      var finConstructor = -1;
      var nivel = 1;
      var dentroTexto = false;
      var comilla = "";

      // Se obtiene el paréntesis que cierra el constructor.
      for(var i = inicioArgumentos;i < code.length;i++){
        var caracter = code.charAt(i);

        if(dentroTexto){
          if(caracter == comilla && code.charAt(i - 1) != "\\"){
            dentroTexto = false;
            comilla = "";
          }
        }
        else if(caracter == '"' || caracter == "'"){
          dentroTexto = true;
          comilla = caracter;
        }
        else if(caracter == '('){
          nivel++;
        }
        else if(caracter == ')'){
          nivel--;

          if(nivel == 0){
            finConstructor = i;
            break;
          }
        }
      }

      if(finConstructor == -1){ 
        break;
       }

      var contenido = code.substring(inicioArgumentos,finConstructor);
      var argumentos = [];
      var argumentoActual = "";
      var nivelParentesis = 0;
      var nivelCorchetes = 0;
      var nivelLlaves = 0;
      dentroTexto = false;
      comilla = "";
      // Se separan los argumentos sin dividir llamadas o expresiones internas
      for(var j = 0;j < contenido.length;j++){
        var actual = contenido.charAt(j);
        if(dentroTexto){
          argumentoActual += actual;
          if(actual == comilla && contenido.charAt(j - 1) != "\\"){
            dentroTexto = false;
            comilla = "";
          }
        }
        else if(actual == '"' || actual == "'"){
          dentroTexto = true;
          comilla = actual;
          argumentoActual += actual;
        }
        else if(actual == '('){
          nivelParentesis++;
          argumentoActual += actual;
        }
        else if(actual == ')'){
          nivelParentesis--;
          argumentoActual += actual;
        }
        else if(actual == '['){
          nivelCorchetes++;
          argumentoActual += actual;
        }
        else if(actual == ']'){
          nivelCorchetes--;
          argumentoActual += actual;
        }
        else if(actual == '{'){
          nivelLlaves++;
          argumentoActual += actual;
        }
        else if(actual == '}'){
          nivelLlaves--;
          argumentoActual += actual;
        }
        else if(actual == ',' && nivelParentesis == 0 && nivelCorchetes == 0 && nivelLlaves == 0){
          argumentos.push(argumentoActual.trim());
          argumentoActual = "";
        }
        else{
          argumentoActual += actual;
        }
      }

      if(argumentoActual.trim() != ""){
        argumentos.push(argumentoActual.trim());
      }

      if(argumentos.length != campos.length){
        posicionBusqueda = finConstructor + 1;
        continue;
      }
      var constructorVyper = nombreStruct + "(";
      for(var k = 0;k < argumentos.length;k++){
        if(k > 0){ 
           constructorVyper += ", "; 
        }
        constructorVyper += campos[k] + "=" + normalizarExpresionVyper(argumentos[k]);
      }

      constructorVyper += ")";
      code = code.substring(0,inicioConstructor) + constructorVyper + code.substring(finConstructor + 1);
      posicionBusqueda = inicioConstructor + constructorVyper.length;
    }
  }
  code = convertirEnvioDivisaVyper(code);
  code = convertirLlamadaExternaTipadaVyper(code);
  code = code.trim();
  if(code.indexOf("staticcall ") == 0){
    logElementosNoContemplados += "The result of staticcall must be assigned to a variable.\n";
    return "# WARNING: staticcall result must be assigned\n";
  }
  if(code.charAt(0) == "_" && code.indexOf("(") > 0){
    code = "self." + code;
  }
  if(code == ""){ return ""; }
  return code + "\n";
};

VyperGenerator['personalized_inputexpression'] = function(block) {
  var code = block.getFieldValue('values_expression');
  if(code == null){
    code = "";
  }
  code = normalizarExpresionVyper(code);
  code = convertirLlamadaExternaTipadaVyper(code);


  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_number'] = function(block) {
  return [String(block.getFieldValue('value')), VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_positivenumber'] = function(block) {
  return [String(block.getFieldValue('value')), VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_text'] = function(block) {
  var value = block.getFieldValue('value');
  if(value == null){ 
    value = "";
  }
  return ['"' + value + '"', VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['emit_event'] = function(block) { 
  var event_name = limpiarNombre(block.getFieldValue('name'));
  var parametroActual = block.getInputTargetBlock('inputparams');
  var parametros = [];
  // El bloque inputparam contiene realmente los parámetros del evento
  if(parametroActual != null && parametroActual.type == "inputparam"){
    parametroActual = parametroActual.getInputTargetBlock('inputparams');
  }
  // Recorre los parámetros situados dentro del contenedor
  while(parametroActual != null){
    var parametro = "";
    if(parametroActual.type == "input_param" || parametroActual.type == "inputparamshortidentifier"){
      parametro = limpiarNombre(parametroActual.getFieldValue('name'));
    }
    else if(typeof VyperGenerator[parametroActual.type] == "function"){
      parametro = VyperGenerator[parametroActual.type](parametroActual);
      if(Array.isArray(parametro)){
        parametro = parametro[0];
      }
      if(parametro != null){
        parametro = String(parametro).trim();
      }
    }
    if(parametro != null && parametro != ""){
      parametros.push(parametro);
    }

    if(parametroActual.nextConnection != null){
      parametroActual =
        parametroActual.nextConnection.targetBlock();
    }
    else{
      parametroActual = null;
    }
  }
  var code ="log " + event_name +'(' + parametros.join(", ") +")\n";
  logElementosNoContemplados += "The Solidity expression 'emit' is not supported in Vyper" + parteFinalMensajeSustitucionElemento +" log expression.\n";
  return code;
};

VyperGenerator['arithmetical_expression'] = function(block) {
  var operator = block.getFieldValue('operators');
  if(operator == "/"){
    operator = "//"//En vyper la division es utilizando las dos barritas invertidas
  }
  var expression1 = VyperGenerator.valueToCode(block, 'value1_arithmeticalexpression', VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block, 'value2_arithmeticalexpression', VyperGenerator.ORDER_NONE);
   if(expression1 == null){
    expression1 = "";
  }
  if(expression2 == null){
    expression2 = "";
  }
  expression1 = incluirSelfVariable(expression1.trim());
  expression2 = incluirSelfVariable(expression2.trim());
  var code = expression1 + ' ' + operator + ' ' + expression2;
  return [code, VyperGenerator.ORDER_NONE];
};

//Fin Generador de Expresiones 

//Generador de Funciones Predefinidas 

VyperGenerator['keccak_function'] = function(block) {
  var text_value = block.getFieldValue('value_parameter');
  var code = 'keccak256' + '(' + text_value + ')\n';
  return code;
};

VyperGenerator["keccak_inputfunction"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "keccak256(" + text_value + ")";
  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['sha_function'] = function(block) {
  var sha_type = limpiarNombre(block.getFieldValue('name'));
  var text_value = block.getFieldValue('value_parameter');
  var code = sha_type + '(' + text_value + ')\n';
  return code;
};

VyperGenerator['sha_inputfunction'] = function(block) {
  var sha_type = block.getFieldValue('identifier');
  var text_value = block.getFieldValue('value_parameter');
  var code = sha_type + '(' + text_value + ')';
  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['abyencode_function'] = function(block) {
  var text_value = block.getFieldValue('value_parameter');
  var code = "abi_encode(" + text_value + ')\n';
  return code;
};

VyperGenerator['abyencode_inputfunction'] = function(block) {
  var text_value = block.getFieldValue('value_parameter');
  var code = "abi_encode(" + text_value + ')';
  return [code, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['selfdestruct_function'] = function(block) {
  var text_value = block.getFieldValue('value_parameter');
  var code = "selfdestruct (" + text_value + ')\n';
  return code;
};

VyperGenerator['assert_function'] = function(block) {
  var text_value = block.getFieldValue('value_parameter');
  text_value = normalizarExpresionVyper(text_value.trim());
  var code = "assert " + text_value + '\n';
  return code;
};

VyperGenerator['revert_expression'] = function(block) {
  var value = block.getFieldValue("value_revertexpression");
  if(value == null){ 
    value = ""; }
  value = value.trim();
  if(value == ""){
    return "raise\n";
  }
  value = sustituirPalabrasReservadasSolidity(value);
  var posicionParentesis = value.indexOf("(");
  if(posicionParentesis != -1){
    var nombreError = value.substring(0, posicionParentesis).trim();
    return 'raise "' + nombreError + '"\n';
  }
  if(value.startsWith('"') || value.startsWith("'")){
    return "raise " + value + "\n";
  }
  return 'raise "' + value + '"\n'
};


VyperGenerator["deleteexpression"] = function(block){
  var nombre = limpiarNombre(block.getFieldValue("value_deleteexpression"));
  var tipo = tiposPropiedadesEstadoVyper[nombre];
  var destino = nombre;
  if(tipo == null || tipo == ""){
    logElementosNoContemplados += "The Solidity delete expression for " + nombre + " cannot be translated because its type is unknown.\n";
    return "# ERROR: type required to delete " + nombre + "\n";
  }
  if(esPropiedadEstadoVyper(nombre)){
    destino = "self." + nombre;
  }
  return destino + " = empty(" + tipo + ")\n";
};

VyperGenerator["error_definition"] = function(block) {
  var error_name = block.getFieldValue("name");
  logElementosNoContemplados += "The custom error " + error_name + " has not been included because Vyper does not support custom error declarations\n";
  return "";
};
VyperGenerator["block_unchecked"] = function(block) {
  var statements = VyperGenerator.statementToCode(block, "statements");
  if(statements == null){ statements = ""; }

  logElementosNoContemplados += "The unchecked block has been removed because Vyper does not support disabling arithmetic checks for a complete block\n";

  return statements;
};

VyperGenerator['log_function'] = function(block) {
  return "";
};



//Fin Generador de Funciones Predefinidas

//Generador de Expresiones Logicas
VyperGenerator['block_ifcondition'] = function(block) {
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  var actionsif = VyperGenerator.statementToCode(block, 'actionsif');
  if(condition == null){
    condition = "";
  }
  if(actionsif == null || actionsif.trim() == ""){
    actionsif = "  pass\n";
  }
  return "if " + condition.trim() + ":\n" + actionsif;
};

VyperGenerator['block_elseifcondition'] = function(block) {
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  var actionselseif = VyperGenerator.statementToCode(block, 'actionselseif');
  if(condition == null){ 
    condition = ""; 

  }
  if(actionselseif == null || actionselseif.trim() == ""){
     actionselseif = "  pass\n";
    }
  condition = condition.trim();
  logElementosNoContemplados += "The Solidity expression 'else if' in else if(" + condition + ") is not supported in Vyper" + parteFinalMensajeSustitucionElemento + "elif.\n";
  logElementosNoContemplados += "The keys in else if expression" + parteFinalMensajeNoInclusionVyper + "\n";
  return "elif " + condition + ":\n" + actionselseif;
}

VyperGenerator['block_elsecondition'] = function(block) {
  var expression = VyperGenerator.statementToCode(block, 'actionselse');
  if(expression == null || expression.trim() == ""){
    expression = "  pass\n";
  }
  var code =  "else:" + "\n" + expression +  "\n";
  logElementosNoContemplados += "The keys in else expression" + parteFinalMensajeNoInclusionVyper;
  return code;
};

VyperGenerator['block_negation'] = function(block) {
   var expression = VyperGenerator.valueToCode(block, 'value', VyperGenerator.ORDER_NONE);
  if(expression == null){ 
    expression = ""; 
  }
  expression = expression.trim();
  var code = "not" + ' ' + expression;
  logElementosNoContemplados += "The symbol '!' include in " + expression + "are not supported in Vyper" + parteFinalMensajeSustitucionElemento + "not." + "\n";
  return [code, VyperGenerator.ORDER_NONE];
};

VyperGenerator['block_null'] = function(block) {
  logElementosNoContemplados += "#ADVICE null is not supported in Vyper language\n";
  return ["", VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['block_boolean'] = function(block) {
  var expresion = block.getFieldValue('values');
  var booleanoDevuelto = "False";
  if(expresion == "true" || expresion == "TRUE"){
    booleanoDevuelto =  "True";
  }
  return [booleanoDevuelto, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['comparation_expression'] = function(block) {
  var operator = block.getFieldValue('operators');
  var expression1 = VyperGenerator.valueToCode(block, 'value1_expression', VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block, 'value2_expression', VyperGenerator.ORDER_NONE);
  if(expression1 == null){
    expression1 = "";
  }
  if(expression2 == null){
    expression2 = "";
  }
  if(operator == "&&"){
    operator = "and";
  }
  else if(operator == "||"){
    operator = "or";
  }
  expression1 = normalizarExpresionVyper(expression1.trim());
  expression2 = normalizarExpresionVyper(expression2.trim());
  var code = expression1.trim() + " " + operator + " " + expression2.trim();
  return [code, VyperGenerator.ORDER_NONE];
};


VyperGenerator['comparation_logicalexpression'] = function(block) {
  var operator = block.getFieldValue('operators');
  var expression1 = VyperGenerator.valueToCode(block, 'value1_logicalexpression', VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block, 'value2_logicalexpression', VyperGenerator.ORDER_NONE);
  if(expression1 == null){
    expression1 = "";
  }

  if(expression2 == null){
    expression2 = "";
  }

  if(operator == "&&"){
    operator = "and";
  }
  else if(operator == "||"){
    operator = "or";
  }
  expression1 = normalizarExpresionVyper( expression1.trim());
  expression2 =normalizarExpresionVyper(expression2.trim());
  var code = expression1 + " " + operator + " " + expression2;
  return [code, VyperGenerator.ORDER_NONE];

};

VyperGenerator['comparation_arithmeticalexpression'] = function(block){
  var operator = block.getFieldValue('operators');
  var expression1 = VyperGenerator.valueToCode(block,'value1_arithmeticalcomparationexpression',VyperGenerator.ORDER_NONE);
  var expression2 = VyperGenerator.valueToCode(block,'value2_arithmeticalcomparationexpression',VyperGenerator.ORDER_NONE);
  if(expression1 == null){ 
    expression1 = "";
   }
  if(expression2 == null){ 
    expression2 = ""; 
  }
  expression1 = normalizarExpresionVyper(expression1.trim());
  expression2 = normalizarExpresionVyper(expression2.trim());
  return [expression1 + " " + operator + " " + expression2,VyperGenerator.ORDER_NONE];
};


VyperGenerator['parenthesis_expression'] = function(block) {
  var expression = VyperGenerator.valueToCode(block, 'value', VyperGenerator.ORDER_NONE);
  if(expression == null){ 
    expression = ""; 
  }
  return ["(" + expression.trim() + ')', VyperGenerator.ORDER_ATOMIC];
};

//Fin Generador de Expresiones Logicas

//Generador de bucles
VyperGenerator['block_whileloop'] = function(block) {
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  var statements_content = VyperGenerator.statementToCode(block, 'elements_while');
  var code = "";

  if(condition == null){
    condition = "";
  }

  if(statements_content == null){
    statements_content = "";
  }

  condition = condition.trim();

  code += "#ADVICE: while loop is not supported in Vyper.\n";
  code += "#While condition not included in Vyper code: " + condition + "\n";
  if(statements_content.trim() != ""){
    code += "#While loop body not included in Vyper code:\n";
    code += generarComentarioCodigoVyper(quitarIndentacionInicialVyper(statements_content));
  }
  logElementosNoContemplados += "The while loop" + parteFinalMensajeNoInclusionVyper + "\n";
  return code;
};

VyperGenerator['block_dowhile'] = function(block) {
  var condition = VyperGenerator.valueToCode(block, 'condition', VyperGenerator.ORDER_NONE);
  var statements_content = VyperGenerator.statementToCode(block, 'elements_dowhile');
  var code = "";
  if(condition == null){
    condition = "";
  }
  if(statements_content == null){
    statements_content = "";
  }
  condition = condition.trim();
  code += "#ADVICE: do while loop is not supported in Vyper.\n";
  code += "#Do while condition not included in Vyper code:: " + condition + "\n";
  if(statements_content.trim() != ""){
    code += "#Do while loop body not included in Vyper code::\n";
    code += generarComentarioCodigoVyper(quitarIndentacionInicialVyper(statements_content));
  }
  logElementosNoContemplados +=  "Do while not exists in Vyper." + parteFinalMensajeNoInclusionVyper;
  return code;
};

VyperGenerator['block_for'] = function(block){
  var name_counter = limpiarNombre(block.getFieldValue('namevariable'));
  var initialization_counter = block.getFieldValue('value');
  var operatorcomparation = block.getFieldValue('operatorcomparation');
  var limit = block.getFieldValue('limit');
  var counter_postoperation = block.getFieldValue('arithmeticaloperator');
  var statements_content = VyperGenerator.statementToCode(block, 'expressions_for');
  var code = "";
  var range_expression = "";
  var dynamic_limit = false;
  var range_bound = LIMITE_ARRAY_DINAMICO_VYPER;

  if(initialization_counter == null){
    initialization_counter = "0";
  }
  if(limit == null){
    limit = "";
  }
  if(statements_content == null || statements_content.trim() == ""){
    statements_content = "  pass\n";
  }

  initialization_counter = normalizarExpresionVyper(String(initialization_counter));
  limit = normalizarExpresionVyper(String(limit));
  if(!/^\d+$/.test(limit)){
    dynamic_limit = true;
  }
  if(operatorcomparation == "<="){
    limit = "(" + limit + " + 1)";
    range_bound = LIMITE_ARRAY_DINAMICO_VYPER + 1;
  }
  if(counter_postoperation != "++" || (operatorcomparation != "<" && operatorcomparation != "<=")){
    logElementosNoContemplados += "Vyper only supports increasing bounded range-based for loops." + parteFinalMensajeNoInclusionVyper + "\n";
    return "";
  }
  if(dynamic_limit){
    if(initialization_counter == "0"){
      range_expression = "range(" + limit + ", bound=" + range_bound + ")";
    }
    else{
      range_expression = "range(" + initialization_counter + ", " + limit + ", bound=" + range_bound + ")";
    }
  }
  else{
    if(initialization_counter == "0"){
      range_expression = "range(" + limit + ")";
    }
    else{
      range_expression = "range(" + initialization_counter + ", " + limit + ")";
    }
  }

  code = "for " + name_counter + ": uint256 in " + range_expression + ":\n";
  code += statements_content;
  return code;
};
//Fin Generador de bucles

//Generador de tipos

VyperGenerator['type_int'] = function(block) {
  var options = block.getFieldValue('int_options');
  if(options == null || options == ""){
    options = "int256";
  }
  options = normalizarEnteroVyper(options);
  return [options, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['type_uint'] = function(block) {
  var options = block.getFieldValue('uint_options');
  if(options == null || options == ""){
    options = "uint256";
  }
  options = normalizarEnteroVyper(options);
  return [options, VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_bool'] = function(block) {
  return ["bool", VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_float'] = function(block) {
  return ["decimal", VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_User'] = function(block) {
  return ["User", VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_Company'] = function(block) {
  return ["Company", VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_address'] = function(block) {
  var options = block.getFieldValue('address_options');
  if(options == null || options == ""){
    options = "address";
  }
  if(options == "address payable" || options == "address_payable"){
    options = "address";
    logElementosNoContemplados += "The Solidity type address payable" + parteFinalMensajeSustitucionElemento + "address.\n";
  }
  return [options, VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['type_text'] = function(block) {
  logElementosNoContemplados += "The unbounded Solidity string type" + parteFinalMensajeSustitucionElemento + "String[100].\n";
  return ["String[100]", VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['type_identifier'] = function(block) {
  var options = block.getFieldValue('identifier_options');
  if(options == null){
    options = "";
  }
  options = options.trim();
  if(options == "string"){
    options = "String[100]";
    logElementosNoContemplados += "The unbounded Solidity string type" + parteFinalMensajeSustitucionElemento + "String[100].\n";
  }
  else if(options == "bytes"){
    options = "Bytes[100]";
    logElementosNoContemplados += "The unbounded Solidity bytes type" + parteFinalMensajeSustitucionElemento + "Bytes[100].\n";
  }
  else if(options == "uint"){
    options = "uint256";
  }
  else if(options == "int"){
    options = "int256";
  }
  else if(options == "address payable" || options == "address_payable"){
    options = "address";
    logElementosNoContemplados += "The Solidity type address payable" + parteFinalMensajeSustitucionElemento + "address.\n";
  }

  return [options, VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['type_byte'] = function(block){
  var options = normalizarBytesVyper(block.getFieldValue('bytes_options'));
  return [options,VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['type_mapping'] = function(block) {
  var key_type = VyperGenerator.valueToCode(block, 'key', VyperGenerator.ORDER_NONE);
  var value_type = VyperGenerator.valueToCode(block, 'value', VyperGenerator.ORDER_NONE);
  if(key_type == null){
    key_type = "";
  }
  if(value_type == null){
    value_type = "";
  }
  key_type = key_type.trim();
  value_type = value_type.trim();
  if(key_type == "" || value_type == ""){
    logElementosNoContemplados += "The Solidity mapping type has not been included because its key or value type is missing.\n";
    return ["", VyperGenerator.ORDER_ATOMIC];
  }

  if(key_type == "uint" || key_type == "int"){
    key_type = normalizarEnteroVyper(key_type);
  }
  if(value_type == "uint" || value_type == "int"){
    value_type = normalizarEnteroVyper(value_type);
  }
  return ["HashMap[" + key_type + ", " + value_type + ']', VyperGenerator.ORDER_ATOMIC];
};


VyperGenerator['block_payable'] = function(block) {
  logElementosNoContemplados += "The Solidity payable address conversion" + parteFinalMensajeSustitucionElemento + "address.\n";
  return ["address", VyperGenerator.ORDER_ATOMIC];
};
//Fin generador de tipos

VyperGenerator['array_property'] = function(block) {
  var dimension = block.getFieldValue('cells');
  var siguienteDimension = VyperGenerator.valueToCode(block,'plus_dimension', VyperGenerator.ORDER_NONE
  );
  if(siguienteDimension == null){
    siguienteDimension = "";
  }
  var code = '[' + dimension + ']' +siguienteDimension.trim();
  return [code,VyperGenerator.ORDER_ATOMIC];
};

VyperGenerator['dynamic_array'] = function(block) {
  var siguienteDimension = VyperGenerator.valueToCode(block,'dimension',VyperGenerator.ORDER_NONE);
  if(siguienteDimension == null){
    siguienteDimension = "";
  }
  var code = "[]" + siguienteDimension.trim();

  return [code,VyperGenerator.ORDER_ATOMIC];
};



