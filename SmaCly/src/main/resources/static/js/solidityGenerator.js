  
"use strict";


var SolidityGenerator = new Blockly.Generator("Solidity");

SolidityGenerator.ORDER_ATOMIC = 0;
SolidityGenerator.ORDER_NONE = 0;

SolidityGenerator.init = function(workspace) {};
SolidityGenerator.finish = function(code) {return code;};

SolidityGenerator.scrub_ = function(block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if(nextBlock != null){
    if(nextBlock.type == "inputparamshortidentifier" || nextBlock.type == "input_param"){
      code +=  ", ";
    }
  }
  var nextCode = SolidityGenerator.blockToCode(nextBlock);
  return code + nextCode;
};

var contadorElementosGenericos = 0;

function limpiarNombrePorDefecto(nombre) {
  if (nombre == null) {
    nombre = "";
  }
  nombre = String(nombre).trim();
  if (nombre.indexOf("Insert here") === 0) {
    contadorElementosGenericos++;
    return "element_" + contadorElementosGenericos;
  }

  return nombre;
}

/*
PARAMETRO DE ENTRADA: block es el bloque actual y tipos es la lista de tipos de bloque que se quieren buscar
DESCRIPCION: Comprueba si el bloque actual esta dentro de alguno de los tipos indicados
*/
function tieneAncestroDeTipo(block, tipos) {
  var actual = null;
  if(block != null && typeof block.getParent == "function"){
    actual = block.getParent();
    }
  while(actual != null){
    if(tipos.indexOf(actual.type) != -1){
      return true;
    }
    if(typeof actual.getParent == "function"){
      actual = actual.getParent();
    }
    else{
      actual = null;
    }
  }
  return false;
}

/*
PARAMETRO DE ENTRADA: block es el bloque que se quiere comprobar
DESCRIPCION: Comprueba si el bloque esta colocado dentro de una estructura
*/
function estaDentroDeStruct(block) {
  var tipos = ["personalized_struct", "block_struct", "block_user", "block_company"];
  return tieneAncestroDeTipo(block, tipos);
}

/*
PARAMETRO DE ENTRADA: block es el bloque que se quiere comprobar
DESCRIPCION: Comprueba si el bloque esta colocado dentro de una funcion constructor o modificador
*/
function estaDentroDeFuncion(block) {
  var tipos = ["clause", "abstract_clausedeclaration", "interface_clausedeclaration", "contract_constructor", "modifier", "receive_function", "fallback_function"];
  return tieneAncestroDeTipo(block, tipos);
}

/*
PARAMETRO DE ENTRADA: block es el bloque actual y nombreTipo es el nombre del tipo que se quiere buscar
DESCRIPCION: Comprueba si el tipo indicado corresponde a una estructura definida en el espacio de trabajo
*/
function esStructDefinidoEnWorkspace(block, nombreTipo) {
  nombreTipo = String(nombreTipo || "").trim();
  if(nombreTipo == "User" || nombreTipo == "Company"){
    return true;
  }
  if(block == null || block.workspace == null){
    return false;
  }
  if(typeof block.workspace.getAllBlocks != "function"){
    return false;
  }
  var bloques = block.workspace.getAllBlocks(false);
  for(var i = 0; i < bloques.length; i++){
    var candidato = bloques[i];
    if(candidato.type == "personalized_struct" || candidato.type == "block_struct"){
      var nombre = String(candidato.getFieldValue("name") || "").trim();
      if(nombre == nombreTipo){
        return true;
      }
    }
  }
  return false;
}

/*
PARAMETRO DE ENTRADA: block es el bloque actual tipo es el tipo de dato y dimensionArray contiene la dimension del array
DESCRIPCION: Comprueba si un tipo necesita una ubicacion de datos
*/
function esTipoReferencia(block, tipo, dimensionArray) {
  tipo = String(tipo || "").trim();
  dimensionArray = String(dimensionArray || "").trim();
  if(tipo == "string" || tipo == "bytes"){
    return true;
  }
  if(dimensionArray != ""){
    return true;
  }
  if(tipo.indexOf("[") != -1){
    return true;
  }
  if(tipo.indexOf("mapping(") == 0){
    return true;
  }
  if(esStructDefinidoEnWorkspace(block, tipo)){
    return true;
  }
  return false;
}

/*
PARAMETRO DE ENTRADA: block es el bloque de la propiedad que se esta generando
DESCRIPCION: Obtiene la visibilidad y la elimina cuando la propiedad pertenece a una estructura
*/
function obtenerVisibilidadPropiedad(block) {
  var visibilidad = block.getFieldValue("values_visibility");
  if(estaDentroDeStruct(block)){
    visibilidad = "";
  }
  return visibilidad;
}

/*
PARAMETRO DE ENTRADA: block es el bloque de la propiedad que se esta generando
DESCRIPCION: Obtiene el valor constant y lo desactiva cuando la propiedad pertenece a una estructura
*/
function obtenerConstantePropiedad(block) {
  var constante = block.getFieldValue("constant");
  if(estaDentroDeStruct(block)){
    constante = "FALSE";
  }
  return constante;
}

/*
PARAMETRO DE ENTRADA: block es el bloque actual tipo es el tipo de dato e inicializador es el valor asignado a la variable
DESCRIPCION: Obtiene la ubicacion de datos de una variable local de tipo estructura
*/
function ubicacionDatosLocal(block, tipo, inicializador) {
  var seleccionada = block.getFieldValue("data_location");
  if(seleccionada == null || seleccionada == ""){
    seleccionada = block.getFieldValue("storagedata_values");
  }
    seleccionada = String(seleccionada || "").trim();
  if(seleccionada != ""){
   return seleccionada;
  }
  if(!estaDentroDeFuncion(block) || !esStructDefinidoEnWorkspace(block, tipo)){
    return "";
  }
  inicializador = String(inicializador || "").trim();
  if(inicializador == ""){
   return "memory";
  }
  if(inicializador.indexOf("=") == 0){
    inicializador = inicializador.substring(1).trim();
  }
  var inicioConstructor = String(tipo).trim() + "(";
  if(inicializador.indexOf(inicioConstructor) == 0){
    return "memory";
  }
    return "storage";
}

/*
Parámetro de entrada: El bloque que va a generar su código asociado
Descripción de la función: Lo que hace generar el código definido en ese elemento y se guarda en la variable code
Párametro de salidad: El código generado almacenado en la variable code
*/
SolidityGenerator["file"] = function(block) {
  var version = SolidityGenerator.statementToCode(block, "version_file");
  var statements_content = SolidityGenerator.statementToCode(block, "elements_file");
  var licencia = "// SPDX-License-Identifier: MIT" + "\n";
  var code =  licencia + version + "\n" + statements_content + "\n";
  contadorElementosGenericos = 0; //Se añade el contador para que cuando se pulse compilar no autosume un numero al nombre por defecto "element_x"
  return code;
};

SolidityGenerator["version"] = function(block) {
  var dropdown_symbolversion = block.getFieldValue("symbolversion");
  var number_value1version = block.getFieldValue("value1version");
  var number_value2version = block.getFieldValue("value2version");
  var number_value3version = block.getFieldValue("value3version");
  if(dropdown_symbolversion == "greater"){
    dropdown_symbolversion = ">";
  }
  else if(dropdown_symbolversion == "greater_equal"){
    dropdown_symbolversion = ">=";
  }
  var code = "pragma solidity " + dropdown_symbolversion + number_value1version + "." + number_value2version + "." + number_value3version + ";";
  return code;
};

SolidityGenerator["range_version"] = function(block) {
  let symbol = block.getFieldValue("symbolversion");
  let v1 = block.getFieldValue("value1version");
  let v2 = block.getFieldValue("value2version");
  let v3 = block.getFieldValue("value3version");

  let comp = block.getFieldValue("symbolcomparation");
  let ov1 = block.getFieldValue("value1versionoptional");
  let ov2 = block.getFieldValue("value2versionoptional");
  let ov3 = block.getFieldValue("value3versionoptional");

  // Operador principal
  if (symbol === "greater") symbol = ">";
  else if (symbol === "greater_equal") symbol = ">=";

  if (comp === "less") comp = "<";
  else if (comp === "less_equal") comp = "<=";
  let code = `pragma solidity ${symbol}${v1}.${v2}.${v3}`;

  // Solo añadir rango opcional si no es 0.0.0
  if (String(ov1) !== "0" || String(ov2) !== "0" || String(ov3) !== "0") {
    code += ` ${comp}${ov1}.${ov2}.${ov3}`;
  }

  code += ";";
  return code;
};


SolidityGenerator["import"] = function(block) {
  var resource_route = block.getFieldValue("resource_route");
  var aliasCode = "";
  var aliasBlock = block.getInputTargetBlock("alias");
  if (aliasBlock != null) {
    var generated = SolidityGenerator.blockToCode(aliasBlock);
    if (Array.isArray(generated)) {
      aliasCode = generated[0];
    } 
    else {
      aliasCode = generated;
    }
    if (aliasCode != null && aliasCode != "") {
      aliasCode = ' ' + aliasCode.trim();
    } 
    else {
      aliasCode = "";
    }
  } 
  else{
    aliasCode = "";
  }
  var code = 'import "' + resource_route + '"' + aliasCode + ';\n';   
  return code;
};

SolidityGenerator["alias_import"] = function(block) {
  var alias = block.getFieldValue("alias");
  return ["as " + alias, SolidityGenerator.ORDER_ATOMIC];
};

SolidityGenerator["library"] = function(block) {
  var library_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var statements_content = SolidityGenerator.statementToCode(block, "functions_library");
  var code = "library " + library_name + " {\n" + statements_content + "}\n";
  return code;
};

SolidityGenerator["interface"] = function(block) {
  var interface_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var statements_content = SolidityGenerator.statementToCode(block, "interface_functions");
  var inheritance_interface = SolidityGenerator.statementToCode(block, "nameinterfacefather");
  inheritance_interface = (inheritance_interface || "").trim();
  var code;
  if(inheritance_interface !== ""){
    code = "interface " + interface_name + " is " + inheritance_interface + " {\n" + statements_content + "}\n";
  } 
  else{
    code = "interface " + interface_name + " {\n" + statements_content + "}\n";
  }
  return code;
};

SolidityGenerator["interface_father"] = function(block) {
  var interface_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var next_interface = SolidityGenerator.statementToCode(block, "interface_inherit");
  next_interface = (next_interface || "").trim();

  var interfaces_inherit = "";
  if (next_interface !== "") {
    interfaces_inherit = ", " + next_interface;
  }

  return interface_name + interfaces_inherit;
};

SolidityGenerator["interface_clausedeclaration"] = function(block) {
  var interface_function_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var interface_function_visibility = block.getFieldValue("values_visibility");
  var interface_function_valuesinputmodifier = block.getFieldValue("values_inputmodifier");
  var interface_function_personalizedmodifier = SolidityGenerator.statementToCode(block, "modifiers");
  interface_function_personalizedmodifier = (interface_function_personalizedmodifier || "").trim();
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams_function");
  inputparams_content = inputparams_content.trim();
  var outputparam = SolidityGenerator.statementToCode(block, "returns_values");
  outputparam = (outputparam || "").trim();
  if (outputparam !== "") {
    outputparam = " returns (" + outputparam + ")";
  }
  var code;
  if(interface_function_personalizedmodifier === "") {
    code = "function " + interface_function_name + "(" + inputparams_content + ") " + interface_function_visibility + " " + interface_function_valuesinputmodifier + outputparam + ";\n";
  } 
  else{
    code = "function " + interface_function_name + "(" + inputparams_content + ") " + interface_function_visibility + " " + interface_function_valuesinputmodifier + " " + interface_function_personalizedmodifier + outputparam + ";\n";
  }
  return code;
};

SolidityGenerator["event"] = function(block) {
  var event_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams");
  inputparams_content = inputparams_content.trim();
  inputparams_content = String(inputparams_content || "").replaceAll(" memory", "").replaceAll(" calldata", "").replaceAll(" storage", "").trim();
   var code = "event " + event_name + "(" + inputparams_content + ");\n";
  return code;
};

SolidityGenerator["error_definition"] = function(block) {
  var error_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams");
  if(inputparams_content == null){ 
    inputparams_content = ""; 
  }
  inputparams_content = inputparams_content.trim();
  return "error " + error_name + "(" + inputparams_content + ");\n";
};

SolidityGenerator["modifier"] = function(block) {
  var modifier_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var statements_content = SolidityGenerator.statementToCode(block, "restrictions_modifier");
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams");
  inputparams_content = inputparams_content.trim();
  var code = "modifier " + modifier_name + "(" + inputparams_content + "){\n" + statements_content + "}\n";
  return code;
};

SolidityGenerator["restriction_clause"] = function(block) {
  var require_condition_content = SolidityGenerator.statementToCode(block, "condition");
  var code = "require(" + require_condition_content + ");\n";
  return code;
};

SolidityGenerator["restriction_clausecomment"] = function(block) {
  var comment = block.getFieldValue("comment");
  var require_condition_content = SolidityGenerator.statementToCode(block, "condition");
  var code = 'require(' + require_condition_content.trim() + ', "' + comment + '");\n'; 
   return code;
};

SolidityGenerator["coin_expression"] = function(block) {
  var amount_coin = block.getFieldValue("amount_coin");
  var type_coin = block.getFieldValue("type_coin");
  var code = amount_coin + " " + type_coin;
  return code;
};

SolidityGenerator["closemodifier"] = function(block) {
  var code = "_;\n";
  return code;
};

SolidityGenerator["markmodifier"] = function(block) {
  var code = "_;\n";
  return code;
};


SolidityGenerator["inputparam"] = function(block) {
  //var value_name = SolidityGenerator.valueToCode(block, "NAME", SolidityGenerator.ORDER_ATOMIC);
  var statements_content = SolidityGenerator.statementToCode(block,"inputparams");
  statements_content = statements_content.trim();
  var code = statements_content;
  return code;
};

SolidityGenerator["input_param"] = function(block) {
  var inputparam_type = SolidityGenerator.statementToCode(block, "type").trim();
  var inputparam_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var storageData = block.getFieldValue("storagedata_values");
  var property_array = SolidityGenerator.statementToCode(block, "arraydimension");
  property_array = String(property_array || "").trim();
  var isReferenceType = esTipoReferencia(block, inputparam_type, property_array);
  var code = inputparam_type;
  if(property_array != ""){
    code += " " + property_array;
  }
  if(isReferenceType && storageData != null && storageData != ""){
    code += " " + storageData;
  }
  code += " " + inputparam_name;
  return code;
};

SolidityGenerator["inputparamshortidentifier"] = function(block) {
  var inputparam_type =  SolidityGenerator.statementToCode(block, "type");
  var inputparam_name =  limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_array =  SolidityGenerator.statementToCode(block,"arraydimension");
  property_array = property_array.trim();
  var code;
  if(property_array != ""){
    code =  inputparam_type + " " + property_array  + " " + inputparam_name;
  }
  else{
    code =  inputparam_type + " " +  inputparam_name;
  }
  return code;
};

SolidityGenerator["outputparam"] = function(block) {
  var outputparam_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var outputparam_type = SolidityGenerator.statementToCode(block,"value_type_outputparam");
  var outputparam_array = SolidityGenerator.statementToCode(block,"arraydimension");
  outputparam_name = String(outputparam_name || "").trim();
  outputparam_type = String(outputparam_type || "").trim();
  outputparam_array = String(outputparam_array || "").trim();
  if(outputparam_type == ""){
    return "";
  }
  var dataLocation = block.getFieldValue("data_location");
  if(dataLocation == null || dataLocation == ""){
    dataLocation = block.getFieldValue("storagedata_values");
  }
  dataLocation = String(dataLocation || "").trim();
  if(dataLocation == "" && esTipoReferencia(block, outputparam_type,outputparam_array)){//PARA COMPROBAR SI ES UN TIPO DE DATO QUE NECESITA MEMORY COMO STRING O UN ARRAY
    dataLocation = "memory";
  }
  var code = outputparam_type;
  if(outputparam_array != ""){
    code += " " + outputparam_array;
  }
  if(dataLocation != ""){
    code += " " + dataLocation;
  }
  if(outputparam_name != ""){
    code += " " + outputparam_name;
  }
  return code;
};

SolidityGenerator["abstract_contract"] = function(block) {
  var contract_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var statements_content = SolidityGenerator.statementToCode(block, "contract_elements");
  var inheritance_contract = SolidityGenerator.statementToCode(block, "namecontractfather");
  inheritance_contract = (inheritance_contract || "").trim();
  var code;
  if (inheritance_contract !== "") {
    code = "abstract contract " + contract_name + " is " + inheritance_contract + " {\n" + statements_content + "}\n";
  } 
  else {
    code = "abstract contract " + contract_name + " {\n" + statements_content + "}\n";
  }

  return code;
};

SolidityGenerator["abstract_clausedeclaration"] = function(block) {
  var function_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams_function").trim();
  var function_visibility = block.getFieldValue("values_visibility").trim();
  var function_state = block.getFieldValue("values_inputmodifier").trim();
  var function_modifiers = SolidityGenerator.statementToCode(block, "modifiers").trim();
  var outputparam = SolidityGenerator.statementToCode(block, "returns_values").trim();
  if (outputparam !== "") {
    outputparam = " returns (" + outputparam + ")";
  }

  var isVirtual = block.getFieldValue("virtual");
  var virtual = "";

  if (isVirtual === "TRUE") {
    virtual = " virtual";
  }
  var code = "function " + function_name + "(" + inputparams_content + ")";
  if (function_visibility !== "") {
    code += " " + function_visibility;
  }
  if (function_state !== "") {
    code += " " + function_state;
  }
  if (function_modifiers !== "") {
    code += " " + function_modifiers;
  }
  code += virtual;
  code += outputparam;
  code += ";\n";
  return code;
};


SolidityGenerator["contract"] = function(block) {
  var contract_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var statements_content = SolidityGenerator.statementToCode(block, "contract_elements");
  var inheritance_contract = SolidityGenerator.statementToCode(block, "namecontractfather");
  var code;
  if(inheritance_contract != ""){
    inheritance_contract = "is " + inheritance_contract;
    code = "contract " + contract_name + " " + inheritance_contract + "{\n" + statements_content + "}\n";
  }
  else{
    code = "contract " + contract_name + " {\n" + statements_content + "}\n";
  }
  return code;
};

SolidityGenerator["contract_father"] = function(block) {
  var contract_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var next_contract = SolidityGenerator.statementToCode(block, "contracts_inherit");
  var contracts_inherit;
  if(next_contract == ""){
    contracts_inherit =  SolidityGenerator.statementToCode(block, "contracts_inherit");
  }
  else{
    contracts_inherit =  ", " + SolidityGenerator.statementToCode(block, "contracts_inherit");   
  }
  var code = contract_name + contracts_inherit;
  return code;
};

SolidityGenerator["contract_constructor"] = function(block) {
  var statements_content = SolidityGenerator.statementToCode(block, "expressions_constructor");
  var inputparams_content = SolidityGenerator.statementToCode(block, "type");
  inputparams_content = (inputparams_content || "").trim();
  var inherance_constructor = SolidityGenerator.statementToCode(block, "inherance");
  inherance_constructor = (inherance_constructor || "").trim();
  var constructor_payable = block.getFieldValue("payable");
  var code = "constructor(" + inputparams_content + ")";
  if(inherance_constructor !== ""){
    code += " " + inherance_constructor;
  }
  if(constructor_payable === "TRUE"){
    code += " payable";
  }
  code += " {\n" + statements_content + "}\n";
  return code;
};

SolidityGenerator["block_constructor_contract_inherance"] = function(block) {
  var constructor_inherance_contract_name = block.getFieldValue("contract_name_inherance");
  var inputparams_content = SolidityGenerator.statementToCode(block, "input_params");
  var code = constructor_inherance_contract_name + "(" + inputparams_content + ")";
  return code;
};

SolidityGenerator["clause"] = function(block) {
  var function_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams_function");
  inputparams_content = inputparams_content.trim();
  var function_visibility = block.getFieldValue("values_visibility");
  function_visibility = function_visibility.trim();
  var function_valuesinputmodifier = block.getFieldValue("values_inputmodifier");
  function_valuesinputmodifier = (function_valuesinputmodifier || "").trim();
  var function_personalizedmodifier = SolidityGenerator.statementToCode(block, "modifiers");
  function_personalizedmodifier = (function_personalizedmodifier || "").trim();
  var outputparam = SolidityGenerator.statementToCode(block, "returns_values");
  outputparam = (outputparam || "").trim();
  if(outputparam !== ""){
    outputparam = " returns (" + outputparam + ")";
  }
  var function_statements_content = SolidityGenerator.statementToCode(block, "elements_function");
  var code;
  if(function_personalizedmodifier === ""){
    code = "function " + function_name + "(" + inputparams_content + ") " +  function_visibility + " " + function_valuesinputmodifier + outputparam + " {\n" + function_statements_content + "}\n";
  } 
  else{
    code = "function " + function_name + "(" + inputparams_content + ") " +  function_visibility + " " + function_valuesinputmodifier + " " + function_personalizedmodifier + outputparam + " {\n" + function_statements_content + "}\n";
  }
  return code;
};

SolidityGenerator["return_clause"] = function(block) {
  var valor = SolidityGenerator.statementToCode(block,"values");
  valor = valor.trim();
  var code = "return "  + valor + ";\n";
  return code;
};

SolidityGenerator["overridemodifier"] = function(block) {
  var valor = SolidityGenerator.statementToCode(block,"inputparams");
  valor = (valor || "").trim();
  if(valor == ""){
    return "override";
  }
  return "override(" + valor + ")";
};

SolidityGenerator["block_inputmodifier"] = function(block) {
  var input_modifier_name = (block.getFieldValue("value") || "").trim();
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams");
  inputparams_content = (inputparams_content || "").trim();
  var next_input_modifier = SolidityGenerator.statementToCode(block, "modifier");
  next_input_modifier = (next_input_modifier || "").trim();
  var code = input_modifier_name;
  if (inputparams_content != "") {
    code += "(" + inputparams_content + ")";
  }
  if (next_input_modifier != "") {
    return code + " " + next_input_modifier;
  }
  return code;
}

SolidityGenerator["receive_function"] = function(block) {
  var visibility = block.getFieldValue("values_visibility");
  var payable = block.getFieldValue("payable");
  var virtualValue = block.getFieldValue("virtual");
  var statements_content = SolidityGenerator.statementToCode(block, "elements_function");
  var code = "receive()";
  if(visibility != null && visibility.trim() != ""){
    code += " " + visibility.trim();
  }
  if(payable == "TRUE"){
    code += " payable";
  }
  if(virtualValue == "TRUE"){
    code += " virtual";
  }
  code += " {\n" + statements_content + "}\n";
  return code;
};

SolidityGenerator["fallback_function"] = function(block) {
  var visibility = block.getFieldValue("values_visibility");
  var payable = block.getFieldValue("payable");
  var virtualValue = block.getFieldValue("virtual");
  var statements_content = SolidityGenerator.statementToCode(block, "elements_function");
  var code = "fallback()";
  if(visibility != null && visibility.trim() != ""){
    code += " " + visibility.trim();
  }
  if(payable == "TRUE"){
    code += " payable";
  }
  if(virtualValue == "TRUE"){
    code += " virtual";
  }
  code += " {\n" + statements_content + "}\n";
  return code;
};

//Generador de propiedades largas
SolidityGenerator["text_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_type = "string";
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension");
  property_array = property_array.trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty");
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
     property_valueproperty = "=" + property_valueproperty;
  }
  else{
    property_valueproperty = "";
  }
  var code;
  if(property_array == "") {
    if(property_constant == "TRUE") {
      code = property_type + " " + property_visibility + " constant " + property_name + " " + property_valueproperty + ";\n";
    } 
    else{
      code = property_type + " " + property_visibility + " " + property_name + " " + property_valueproperty + ";\n";
    }
  } 
  else {
    if(property_constant == "TRUE") {
      code = property_type + " " + property_array + " " + property_visibility + " constant " + property_name + " = " + property_valueproperty + ";\n";
    } 
    else{
      code = property_type + " " + property_array + " " + property_visibility + " " + property_name + " = " + property_valueproperty + ";\n";
    }
  }

  return code;
};

SolidityGenerator["byte_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_type = block.getFieldValue("byte_type");
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = property_type;
  if (property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if (property_constant === "TRUE") {
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){ 
      property_valueproperty = "=" + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["identifier_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_type = block.getFieldValue("type");
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = property_type;
  if(property_array !== ""){
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if(property_constant === "TRUE"){
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
     if(!property_valueproperty.includes("=")){  
      property_valueproperty = "=" + property_valueproperty;
     }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["boolean_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = "bool";
  if (property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if (property_constant === "TRUE") {
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){  
      property_valueproperty = "=" + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["address_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_type = block.getFieldValue("addresstype_values");
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = property_type;
  if(property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if(property_constant === "TRUE"){
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){ 
      property_valueproperty = "=" + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["number_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_type = block.getFieldValue("numbertype_property");
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = property_type;
  if(property_array !== ""){
    code += " " + property_array;
  }
  code += " " + property_visibility;

  if (property_constant === "TRUE") {
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
     if(!property_valueproperty.includes("=")){ 
       property_valueproperty =  property_valueproperty.trim();
     }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["user_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"array_dimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";

  var code = "User";

  if (property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if (property_constant === "TRUE") {
    code += " constant";
  }
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
     if(!property_valueproperty.includes("=")){ 
        property_valueproperty = "=" + property_valueproperty;
     }
  }
  else{
    property_valueproperty = "";
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["company_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_constant = obtenerConstantePropiedad(block);
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var property_array = SolidityGenerator.statementToCode(block,"array_dimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";

  var code = "Company";

  if (property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if (property_constant === "TRUE") {
    code += " constant";
  }
  if(property_valueproperty == null){
    property_valueproperty = "";
  }
  else{
     if(!property_valueproperty.includes("=")){ 
        property_valueproperty = "=" + property_valueproperty; 
     }
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["mapping_property"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_constant = block.getFieldValue("constant");
  var property_visibility = obtenerVisibilidadPropiedad(block);
  var key = SolidityGenerator.statementToCode(block,"key").trim();
  var value = SolidityGenerator.statementToCode(block,"value").trim();
  var property_array = SolidityGenerator.statementToCode(block,"arraydimension").trim();
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var code = "mapping(" + key + " => " + value + ")";
  if (property_array !== "") {
    code += " " + property_array;
  }
  code += " " + property_visibility;
  if(property_valueproperty != null && property_valueproperty.trim() != "" && property_valueproperty != "undefined" && property_valueproperty != "none"){
     if(!property_valueproperty.includes("=")){ 
       property_valueproperty = "=" + property_valueproperty;
     }
  }
  else{
    property_valueproperty = ""; 
  }
  code += " " + property_name + " " + property_valueproperty + ";\n";
  return code;
};

SolidityGenerator["personalized_struct"] = function(block) {
  var struct_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var struct_properties = SolidityGenerator.statementToCode(block, "properties_struct");
  var code = "struct " + struct_name + "{\n" + struct_properties + "}\n";
  return code;
};

SolidityGenerator['enum'] = function(block) {
  var name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var values = SolidityGenerator.statementToCode(block, 'values_enum');
  values = values.trim();
  if(values.endsWith(',')){
    values = values.substring(0, values.length - 1);
  }

  var code = 'enum ' + name + ' {\n' + values + '\n}\n';

  return code;
};

SolidityGenerator['enum_value'] = function(block) {
  var value = block.getFieldValue('value_enum');

  var code = value + ',\n';

  return code;
};
//Generador de propiedades largas

//Generador de propiedades cortas

SolidityGenerator["identifier_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var property_type = String(block.getFieldValue("type") || "").trim();
  var property_array = SolidityGenerator.statementToCode(block, "arraydimension");
  var property_valueproperty = SolidityGenerator.statementToCode(block, "valueproperty");
  property_array = String(property_array || "").trim();
  property_valueproperty = String(property_valueproperty || "").trim();
  var dataLocation = "";
  if(property_type.indexOf("mapping(") == 0){
    dataLocation = "storage";
  }
  else if(esTipoReferencia(block, property_type, property_array)){
    dataLocation = "memory";
  }
  var code = property_type;
  if(property_array != ""){
    code += ' ' + property_array;
  }
  if(dataLocation != ""){
    code += ' ' + dataLocation;
  }
  code += ' ' + property_name;
  if(property_valueproperty != ""){
    if(!property_valueproperty.includes("=")){ 
      code += property_valueproperty =  "=" + property_valueproperty; 
    }
    else{
      code += ' ' + property_valueproperty;
    }
  }
  return code + ";\n";
};

SolidityGenerator["number_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var property_type = block.getFieldValue("numbertype_property");
  var property_array = SolidityGenerator.statementToCode(block, "arraydimension");
  var property_valueproperty = SolidityGenerator.statementToCode(block, "valueproperty");
  property_type = String(property_type || "").trim();
  property_array = String(property_array || "").trim();
  property_valueproperty = String(property_valueproperty || "").trim();
  if(property_valueproperty == "undefined" || property_valueproperty == "none"){
    property_valueproperty = "";
  }
  if(property_valueproperty != ""){
    if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  var code = property_type;
  if(property_array != ""){
    code += " " + property_array;
    code += " memory";
  }
  code += " " + property_name;
  if(property_valueproperty != ""){
    code += " " + property_valueproperty;
  }
  code += ";\n";
  return code;
};

SolidityGenerator["text_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var property_valueproperty = SolidityGenerator.statementToCode(block, "valueproperty");
  var property_type = "string";
  var property_array = SolidityGenerator.statementToCode(block, "arraydimension");
  property_array = String(property_array || "").trim();
  property_valueproperty = String(property_valueproperty || "").trim();
  if(property_valueproperty != "" && property_valueproperty != "undefined" && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  var code = property_type;
  if(property_array != ""){
    code += " " + property_array;
  }
  code += " memory";
  code += " " + property_name;
  if(property_valueproperty != ""){
    code += " " + property_valueproperty;
  }
  code += ";\n";
  return code;
};

SolidityGenerator["boolean_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty");
  var property_type = "";
  property_type = "bool";
  var property_array =  SolidityGenerator.statementToCode(block,"arraydimension");
  property_array = property_array.trim()
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
   if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  var code;
  if(property_array == null){
    code = property_type + ' ' + property_name + ' ' + property_valueproperty +";\n"; 
  }
  else {
    code = property_type + ' ' + property_array  + property_name + ' ' + property_valueproperty +";\n"; 
  }
  return code;
};

SolidityGenerator["address_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue("name"));
  var property_valueproperty = SolidityGenerator.statementToCode(block, "valueproperty");
  var property_type = block.getFieldValue("addresstype_values");
  var property_array = SolidityGenerator.statementToCode(block, "arraydimension");
  property_type = String(property_type || "").trim();
  property_array = String(property_array || "").trim();
  property_valueproperty = String(property_valueproperty || "").trim();
  if(property_valueproperty != "" && property_valueproperty != "undefined" && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  var code = property_type;
  if(property_array != ""){
    code += " " + property_array + " memory";
  }
  code += " " + property_name;
  if(property_valueproperty != ""){
    code += " " + property_valueproperty;
  }
  code += ";\n";
  return code;
};

SolidityGenerator["byte_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto( block.getFieldValue("name"));
  var property_type = String(block.getFieldValue("byte_type") || "").trim();
  var property_array = String(SolidityGenerator.statementToCode(block, "arraydimension") || "").trim();
  var property_valueproperty = String(SolidityGenerator.statementToCode(block, "valueproperty") || "").trim();

  if(property_valueproperty !== "" && property_valueproperty !== "undefined" && property_valueproperty !== "none"){
    if(!property_valueproperty.includes("=")) {
      property_valueproperty = "= " + property_valueproperty;
    }
  } 
  else{
    property_valueproperty = "";
  }
  var code = property_type;
  if(property_array !== ""){
    code += " " + property_array;
  }
  if(esTipoReferencia(block, property_type, property_array)){
    code += " memory";
  }
  code += " " + property_name;
  if(property_valueproperty !== ""){
    code += " " + property_valueproperty;
  }

  return code + ";\n";
};
SolidityGenerator["user_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty");
  var property_array =  SolidityGenerator.statementToCode(block,"array_dimension");
  property_array = property_array.trim()
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
   if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  var code;
  if(property_array == null){
    code = "User" + ' ' + property_name + ' ' + property_valueproperty +";\n"; 
  }
  else {
    code = "User" + ' ' + property_array + " memory " + property_name + ' ' + property_valueproperty +";\n"; 
  }
  return code;
};

SolidityGenerator["company_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty");
  var property_array =  SolidityGenerator.statementToCode(block,"array_dimension");
  property_array = property_array.trim()
  if(property_valueproperty != null && property_valueproperty != "" && property_valueproperty != "undefined"  && property_valueproperty != "none"){
    if(!property_valueproperty.includes("=")){
      property_valueproperty = "= " + property_valueproperty;
    }
  }
  else{
    property_valueproperty = "";
  }
  var code;
  if(property_array == null){
    code = "Company" + ' ' + property_name + ' ' + property_valueproperty +";\n"; 
  }
  else {
    code = "Company" + ' ' + property_array + " memory " + property_name + ' ' + property_valueproperty +";\n"; 
  }; 
  return code;
};

SolidityGenerator["mapping_shortproperty"] = function(block) {
  var property_name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var property_valueproperty = SolidityGenerator.statementToCode(block,"valueproperty") || "";
  var key = SolidityGenerator.statementToCode(block,"key").trim();
  var value = SolidityGenerator.statementToCode(block,"value").trim();
  var property_array = SolidityGenerator.statementToCode(block,"array_dimension");
  property_array = (property_array || "").trim();
  var code = "mapping(" + key + " => " + value + ")";
  if(property_valueproperty != null && property_valueproperty.trim() != "" && property_valueproperty != "undefined" && property_valueproperty != "none"){
    property_valueproperty = "=" + property_valueproperty
  }
  else{
    property_valueproperty = ""; 
  }
  if (property_array !== "") {
    code += ' ' + property_array + " storage";
  }
  code += ' ' + property_name + ' ' + property_valueproperty + ";\n";
  return code;
};
//Generador de propiedades cortas

//Generador de variables predefinidas

SolidityGenerator["blockvariables"] = function(block) {
  var value_block_variable = block.getFieldValue("values_blockvariables");
  var code = value_block_variable;
  return code;
};

SolidityGenerator["msgvariables"] = function(block) {
  var value_msg_variable = block.getFieldValue("msgvariables");
  var code = value_msg_variable.trim();
  return code;
};

SolidityGenerator["txvariables"] = function(block) {
  var value_tx_variable = block.getFieldValue("values_txvariables");
  var code =  value_tx_variable;
  return code;
};

SolidityGenerator["block_this"] = function(block) {  
  var value = block.getFieldValue("thisvalues");
  if(value == null){
    value = "";
  }
  value = value.trim();
  if(value == "balance" || value == "this.balance"){
    return "address(this).balance";
  }
  if(value.indexOf("this.") == 0){
    return value;
  }
  return "this." + value;
};

SolidityGenerator["block_thisexpression"] = function(block) {
  var value = block.getFieldValue("value");
  if(value == null){
    value = "";
  }
  value = value.trim();
  if(value == "balance" || value == "this.balance"){
    return "address(this).balance";
  }
  if(value.indexOf("this.") == 0){
    return value;
  }
  return "this." + value;
};

SolidityGenerator["block_now"] = function(block) {
  var code = "now";
  return code;
};
//Fin Generador de variables predefinidas

//Generador de Expresiones

SolidityGenerator["block_usinglibrary"] = function(block) {
  var name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var alias_for = block.getFieldValue("alias");
  var code = "using " + name + " for " + alias_for + ";\n";
  return code;
};


SolidityGenerator["shift_expression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_shiftexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_shiftexpression");
  var code = expression1 + ' ' + operator + ' ' + expression2;
  return code;
};

SolidityGenerator["time_expression"] = function(block) {
  var time_value = block.getFieldValue("time_value");
  var time_unity = block.getFieldValue("time_unity");
  var code = time_value + ' ' + time_unity;
  return code;
};

SolidityGenerator["coin_expression"] = function(block) {
  var cantidad = block.getFieldValue("amount_coin");
  var unidad = block.getFieldValue("type_coin");
  if(unidad == null){
    unidad = "";
  }
  unidad = unidad.trim();
  var code = cantidad + ' ' + unidad;
  return code;
};



SolidityGenerator["block_unchecked"] = function(block) {
  var statements_content = SolidityGenerator.statementToCode(block, "statements");
  if(statements_content == null){ statements_content = ""; }
  return "unchecked {\n" + statements_content + "}\n";
};

SolidityGenerator["assign_value_expression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_assignexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_assignexpression");
  var code = expression1.trim() + ' ' + operator + ' ' + expression2.trim()+ ";\n";
  return code;
};

SolidityGenerator["assing_value_expression1inputs"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_assignexpression");
  var code = operator + ' ' + expression1;
  return code;
};


SolidityGenerator["bitwise_expression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_bitwiseexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_bitwiseexpression");
  var code = expression1 + ' ' + operator + ' ' + expression2;
  return code;
};

SolidityGenerator["bitwise_expression1inputs"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_shiftexpression");
  var code = operator + ' ' + expression2;
  return code;
};

SolidityGenerator["casting_expression"] = function(block) {
  var type = SolidityGenerator.statementToCode(block, "type");
  type = type.trim();
  var expression = SolidityGenerator.statementToCode(block, "expressioncast");
  expression = expression.trim();
  var code = type + "(" + expression + ")";
  return code;
};

SolidityGenerator["tuple"] = function(block) {
  var values =  SolidityGenerator.statementToCode(block, "values");
  values = (values || "").trim();
  return values;
};


SolidityGenerator["block_assembly"] = function(block) {
  var assembly_statements_content = SolidityGenerator.statementToCode(block,"assembly_values");
  var code = "assembly{\n" + assembly_statements_content + "}\n";
  return code;;
};

SolidityGenerator["block_assignvalue_assemblyexpression"] = function(block) {
  var name_var = block.getFieldValue("name_var");
  var assembly_var_statements_content = SolidityGenerator.statementToCode(block,"expression");
  var code = name_var + " := " + assembly_var_statements_content;
  return code;;
};

SolidityGenerator["block_let_expression"] = function(block) {
  var name_var_let = block.getFieldValue("name_var_let");
  var assembly_let_var_statements_content = SolidityGenerator.statementToCode(block,"expression");
  var code = "let " + name_var_let + " := " + assembly_let_var_statements_content;
  return code;
};

SolidityGenerator["personalized_expression"] = function(block) {
  var text_value = block.getFieldValue("values_expression");
  if(text_value == null){
    return "";
  }
  text_value = text_value.trim();
  if(text_value == "" || text_value == "undefined" || text_value == "none" || text_value.indexOf("Insert here") == 0){
    return "";
  }
  var code = text_value + ";\n";
  return code;
};

SolidityGenerator["personalized_inputexpression"] = function(block) {
  var text_value = block.getFieldValue("values_expression");
  var code = text_value.trim();
  return code;
};

SolidityGenerator["block_number"] = function(block) {
  var text_value = block.getFieldValue("value");
  var code = String(text_value);
  return code;
};

SolidityGenerator["block_positivenumber"] = function(block) {
  var text_value = block.getFieldValue("value");
  var code = String(text_value);
  return code;
};

SolidityGenerator["block_text"] = function(block) {
  var text_value = block.getFieldValue("value");
  if(text_value == null){ 
    text_value = ""; 
  }
  else{
    text_value = ' "' + text_value + '" '
  }
  var code = text_value;
  return code;
};

SolidityGenerator["emit_event"] = function(block) {
  var emit_name_event = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var inputparams_content = SolidityGenerator.statementToCode(block, "inputparams");
  inputparams_content = inputparams_content.trim();
  var code = "emit " + emit_name_event +  "(" + inputparams_content + ");\n"; 
  return code;
};

SolidityGenerator["arithmetical_expression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_arithmeticalexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_arithmeticalexpression");
  var code = expression1.trim() + ' ' + operator + ' ' + expression2.trim();
  return code;
};

//Fin Generador de Expresiones 

//Generador de Funciones Predefinidas 

SolidityGenerator["keccak_function"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "keccak256" + "(" + text_value + ");\n";
  return code;
};

SolidityGenerator["keccak_inputfunction"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "keccak256" + "(" + text_value + ")";
  return code;
};

SolidityGenerator["sha_function"] = function(block) {
  var sha_type = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var text_value = block.getFieldValue("value_parameter");
  var code = sha_type + "(" + text_value + ");\n";
  return code;
};

SolidityGenerator["sha_inputfunction"] = function(block) {
  var sha_type = block.getFieldValue("identifier");
  var text_value = block.getFieldValue("value_parameter");
  var code = sha_type + "(" + text_value + ")";
  return code;
};

SolidityGenerator["abyencode_function"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "abi.encodePacked(" + text_value + ");\n";
  return code;
};

SolidityGenerator["abyencode_inputfunction"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "abi.encodePacked(" + text_value + ")";
  return code;
};

SolidityGenerator["selfdestruct_function"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "selfdestruct(" + text_value + ");\n";
  return code;
};

SolidityGenerator["assert_function"] = function(block) {
  var text_value = block.getFieldValue("value_parameter");
  var code = "assert(" + text_value + ");\n";
  return code;
};

SolidityGenerator["revert_expression"] = function(block) {
  var text_value = block.getFieldValue("value_revertexpression");
  text_value = text_value.trim();
  if(text_value == ""){ 
    return "revert();\n"; 
  }
  if(text_value.endsWith(")")){ 
    return "revert " + text_value + ";\n"; 
  }
  return "revert(" + text_value + ");\n";
};

SolidityGenerator["block_try"] = function(block) {
  var expression = SolidityGenerator.statementToCode(block, "expression");
  var devolucion = SolidityGenerator.statementToCode(block, "returns");
  var actions_try = SolidityGenerator.statementToCode(block, "actions_try");
  expression = String(expression || "").trim();
  devolucion = String(devolucion || "").trim();
  var code = "try " + expression;
  if(devolucion != ""){
    code += " returns (" + devolucion + ")";
  }
  code += " {\n" + actions_try + "}\n";
  return code;
};

SolidityGenerator["block_catch"] = function(block) {
  var catch_type = block.getFieldValue("catch_type");
  var parameter = SolidityGenerator.statementToCode(block, "parameter");
  var actions_catch = SolidityGenerator.statementToCode(block, "actions_catch");
  parameter = String(parameter || "").trim();
  var code = "catch";
  if(catch_type == "Error"){
    code += " Error";
    if(parameter != ""){
      code += "(" + parameter + ")";
    }
  }
  else if(catch_type == "Panic"){
    code += " Panic";
    if(parameter != ""){
      code += "(" + parameter + ")";
    }
  }
  else if(catch_type == "bytes"){
    if(parameter != ""){
      code += " (" + parameter + ")";
    }
  }
  code += " {\n" + actions_catch + "}\n";
  return code;
};

SolidityGenerator["deleteexpression"] = function(block) {
  var text_value = block.getFieldValue("value_deleteexpression");
  var code = "delete " + text_value + ";\n";
  return code;
};

SolidityGenerator["log_function"] = function(block) {
  var log = block.getFieldValue("value_log");
  var text_value = block.getFieldValue("value");
  var code = ' ' + log + text_value + ";\n";
  return code;
};
//Fin Generador de Funciones Predefinidas

//Generador de Expresiones Logicas
SolidityGenerator["block_ifcondition"] = function(block) {
  var condition = SolidityGenerator.statementToCode(block, "condition");
  condition = condition.trim();
  var actionsif = SolidityGenerator.statementToCode(block, "actionsif");
  var code =  "if(" + condition + "){\n" + actionsif + "}\n";
  return code;
};

SolidityGenerator["block_elseifcondition"] = function(block) {
  var condition = SolidityGenerator.statementToCode(block, "condition");
  condition = condition.trim();
  var actionselseif = SolidityGenerator.statementToCode(block, "actionselseif");
  var code =  "else if(" + condition + "){\n" + actionselseif + "}\n";
  return code;
};

SolidityGenerator["block_elsecondition"] = function(block) {
  var expression = SolidityGenerator.statementToCode(block, "actionselse");
  var code =  "else{\n" + expression +  "}\n";
  return code;
};

SolidityGenerator["block_negation"] = function(block) {
  var expression = SolidityGenerator.statementToCode(block, "value");
  expression = expression.trim();
  var code = "!" + expression;
  return code;
};

SolidityGenerator["block_null"] = function(block) {
  var code = "null";
  return code;
};

SolidityGenerator["block_boolean"] = function(block) {
  var boolean_value = block.getFieldValue("values");
  var code = boolean_value;
  return code;
};

SolidityGenerator["comparation_expression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_expression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_expression");
  var code = expression1 + ' ' + operator + ' ' + expression2;
  return code;
};

SolidityGenerator["comparation_arithmeticalexpression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_arithmeticalcomparationexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_arithmeticalcomparationexpression");
  var code = expression1.trim() + ' ' + operator + ' ' + expression2.trim();
  return code;
};

SolidityGenerator["comparation_logicalexpression"] = function(block) {
  var operator = block.getFieldValue("operators");
  var expression1 = SolidityGenerator.statementToCode(block, "value1_logicalexpression");
  var expression2 = SolidityGenerator.statementToCode(block, "value2_logicalexpression");
  var code = expression1.trim() + ' ' + operator + ' ' + expression2.trim();
  return code;
};

SolidityGenerator["parenthesis_expression"] = function(block) {
  var expression = SolidityGenerator.statementToCode(block, "value");
  var code =  "(" + expression + ")";
  return code;
};

//Fin Generador de Expresiones Logicas

//Generador de bucles
SolidityGenerator["block_whileloop"] = function(block) {
  var condition = SolidityGenerator.statementToCode(block, "condition");
  condition = condition.trim();
  var statements_content = SolidityGenerator.statementToCode(block, "elements_while");
  var code = "while(" + condition + "){\n" + statements_content + "}\n";
  return code;
};

SolidityGenerator["block_dowhile"] = function(block) {
  var condition = SolidityGenerator.statementToCode(block, "condition");
  condition = condition.trim();
  var statements_content = SolidityGenerator.statementToCode(block, "elements_dowhile");
  var code = "do{\n" + statements_content + "} while (" + condition + ");\n";
  return code;
};

SolidityGenerator["block_for"] = function(block) {
  var name_counter =  block.getFieldValue("namevariable");
  var initialization_counter =  block.getFieldValue("value");
  var counter =  block.getFieldValue("namevariable2");
  var operatorcomparation =  block.getFieldValue("operatorcomparation");
  var limit =  block.getFieldValue("limit");
  var counter_post =  block.getFieldValue("namevariable3");
  var counter_postoperation =  block.getFieldValue("arithmeticaloperator");
  var statements_content = SolidityGenerator.statementToCode(block, "expressions_for");
  var code = "for(uint256 " + name_counter + " = " + initialization_counter + "; " + counter + ' ' + operatorcomparation + ' ' + limit  + "; " + counter_post + counter_postoperation + "){\n" + statements_content + "}\n"; 
  return code;
};
//Fin Generador de bucles

//Generador de tipos
SolidityGenerator["type_int"] = function(block) {
  var options = block.getFieldValue("int_options");
  var code = options;
  return code;
};

SolidityGenerator["type_uint"] = function(block) {
  var options = block.getFieldValue("uint_options");
  var code = options;
  return code;
};

SolidityGenerator["type_bool"] = function(block) {
  var options = block.getFieldValue("bool_options");
  var code = options;
  return code;
};

SolidityGenerator["type_User"] = function(block) {
  var options = block.getFieldValue("user_options");
  var code = "User";
  return code;
};

SolidityGenerator["block_user"] = function(block) {
  var code = "struct User {\n" + SolidityGenerator.statementToCode(block, "user_values") + "}" + "\n";
  return code;
};

SolidityGenerator["type_Company"] = function(block) {
  var options = block.getFieldValue("companyoptions");
  var code = options;
  return code;
};

SolidityGenerator["block_company"] = function(block) {
  var code = "struct Company {\n" + SolidityGenerator.statementToCode(block, "company_values") + "}" + "\n";
  return code;
};

SolidityGenerator["block_struct"] = function(block) {
  var name = limpiarNombrePorDefecto(block.getFieldValue('name'));
  var code = "struct " + name + "{\n" + SolidityGenerator.statementToCode(block, "struct_values") + "}" + "\n";
  return code;
};


SolidityGenerator["type_address"] = function(block) {
  var options = block.getFieldValue("address_options");
  var code = options;
  return code;
};

SolidityGenerator["type_text"] = function(block) {
  var options = block.getFieldValue("typetext_options");
  var code = options;
  return code;
};

SolidityGenerator["type_identifier"] = function(block) {
  var options = block.getFieldValue("identifier_options");
  var code = options;
  return code;
};

SolidityGenerator["type_byte"] = function(block) {
  var options = block.getFieldValue("bytes_options");
  var code = options;
  return code;
};

SolidityGenerator["type_mapping"] = function(block) {
  var options = SolidityGenerator.statementToCode(block, "key")+ "=>" +SolidityGenerator.statementToCode(block, "value");
  var code = "mapping(" + options + ")";
  return code;
};

SolidityGenerator["block_payable"] = function(block) {
  var code = "payable";
  return code;
};
//Fin generador de tipos

SolidityGenerator["array_property"] = function(block) {
  var static_dimension = block.getFieldValue("cells");
  var next_arraydimension = SolidityGenerator.statementToCode(block, "plus_dimension");
  next_arraydimension = next_arraydimension.trim();
  var code = "[" + static_dimension + "]" + next_arraydimension;
  return code;
};

SolidityGenerator["dynamic_array"] = function(block) {
  var dimension = SolidityGenerator.statementToCode(block, "dimension");
  dimension = dimension.trim();
  var code = "[]" + dimension;
  return code;
};

