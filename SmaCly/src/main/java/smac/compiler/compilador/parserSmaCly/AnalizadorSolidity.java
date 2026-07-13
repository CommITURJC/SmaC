
package smac.compiler.compilador.parserSmaCly;

import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

/*
INFO: Revisa el código Solidity antes de intentar crear los bloques
*/

@Service
public class AnalizadorSolidity {

    private static final String AST_NODES = "nodes";
    private static final String AST_NODE_TYPE = "nodeType";
    private static final String AST_NAME = "name";

    private static final String AST_PRAGMA = "PragmaDirective";
    private static final String AST_IMPORT = "ImportDirective";
    private static final String AST_CONTRACT = "ContractDefinition";

    private static final String AST_CONTRACT_KIND = "contractKind";
    private static final String AST_ABSTRACT = "abstract";
    private static final String AST_KIND = "kind";

    private static final String KIND_LIBRARY = "library";
    private static final String KIND_INTERFACE = "interface";
    private static final String KIND_CONSTRUCTOR = "constructor";

    private static final String NODE_VARIABLE = "VariableDeclaration";
    private static final String NODE_STRUCT = "StructDefinition";
    private static final String NODE_ENUM = "EnumDefinition";
    private static final String NODE_USING = "UsingForDirective";
    private static final String NODE_FUNCTION = "FunctionDefinition";
    private static final String NODE_MODIFIER = "ModifierDefinition";
    private static final String NODE_EVENT = "EventDefinition";
    private static final String NODE_ERROR = "ErrorDefinition";
    private static final int ORDEN_PATRON_VERSION = 1;
    private static final int ORDEN_PATRON_IMPORTS = 2;
    private static final int ORDEN_PATRON_LIBRARIES = 3;
    private static final int ORDEN_PATRON_INTERFACES = 4;
    private static final int ORDEN_PATRON_ABSTRACT_CONTRACTS = 5;
    private static final int ORDEN_PATRON_CONTRACTS = 6;
    private static final int ORDEN_PATRON_PROPERTIES = 7;
    private static final int ORDEN_PATRON_CONSTRUCTORS = 8;
    private static final int ORDEN_PATRON_MODIFIERS = 9;
    private static final int ORDEN_PATRON_EVENTS = 10;
    private static final int ORDEN_PATRON_ERRORS = 11;
    private static final int ORDEN_PATRON_CLAUSES = 12;

    /*
    PARÁMETRO DE ENTRADA: AST del contrato recién compilado
    DESCRIPCIÓN: Mira si el contrato tiene el orden que necesita el editor para poder pintarlo en bloques
    PARÁMETRO DE SALIDA: Resultado del analisis
    */
    public ResultadoAnalisisSolidity analizar(JsonNode ast) {
        ResultadoAnalisisSolidity resultado = new ResultadoAnalisisSolidity();
        if(ast == null || ast.isNull()){
            resultado.addError("AST","Unable to analyze the contract because the AST is empty since it does not compile","The contract must be compiled");
            return resultado;
        }
        analizarArchivo(ast,resultado);
        return resultado;
    }

    /*
    PARÁMETRO DE ENTRADA: AST del fichero y resultado donde se guardan los errores
    DESCRIPCIÓN: Revisa el orden general del fichero Solidity
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void analizarArchivo(JsonNode ast,ResultadoAnalisisSolidity resultado) {
        JsonNode nodos = ast.get(AST_NODES);
        if(nodos == null || !nodos.isArray()){
            resultado.addError("file","The AST has no root nodes","Check the Solidity code—there must be a problem with it");
            return;
        }
        boolean versionEncontradaContrato = false;
        boolean contratoEncontrado = false;
        int ordenActual = 0;
        for(JsonNode nodo:nodos){
            String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);
            int ordenElemento = ordenElementoArchivo(nodo);
            if(tipo.equals(AST_PRAGMA)){
                versionEncontradaContrato = true;
            }
            if(tipo.equals(AST_CONTRACT)){
                String contractKind = comprobacionValorTextoNodo(nodo,AST_CONTRACT_KIND);
                if(!contractKind.equals(KIND_LIBRARY) && !contractKind.equals(KIND_INTERFACE) && !esAbstracto(nodo)){
                    contratoEncontrado = true;
                }
                analizarDentroContrato(nodo,resultado);
            }
            if(ordenElemento == 0){
                continue;
            }
            if(ordenElemento < ordenActual){
                resultado.addError(nombreElementoArchivo(nodo), "The element '" + nombreElementoArchivo(nodo) + "' it is out of the expected order", solucionArchivo(ordenElemento,ordenActual));
            }
            else{
                ordenActual = ordenElemento;
            }
        }

        if(!versionEncontradaContrato){
            resultado.addError( "version","The compiler version could not be found","Add the 'pragma solidity' statement at the beginning of the contract" );
        }

        if(!contratoEncontrado){
            resultado.addError("contract","No standard contract was found","There must be at least one contract");
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo del AST
    DESCRIPCIÓN: Devuelve el orden que tiene ese elemento en el patron general
    PARÁMETRO DE SALIDA: Numero de orden del elemento en el archivo (FUERA DEL CONTRATO)
    */
    private int ordenElementoArchivo(JsonNode nodo) {
        String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);
        if(tipo.equals(AST_PRAGMA)){
            return ORDEN_PATRON_VERSION;
        }
        else if(tipo.equals(AST_IMPORT)){
            return ORDEN_PATRON_IMPORTS;
        }
        else if(tipo.equals(AST_CONTRACT)){
            String kind = comprobacionValorTextoNodo(nodo,AST_CONTRACT_KIND);

            if(kind.equals(KIND_LIBRARY)){
                return ORDEN_PATRON_LIBRARIES;
            }
            else if(kind.equals(KIND_INTERFACE)){
                return ORDEN_PATRON_INTERFACES;
            }
            else if(esAbstracto(nodo)){
                return ORDEN_PATRON_ABSTRACT_CONTRACTS;
            }
            else{
                return ORDEN_PATRON_CONTRACTS;
            }
        }

        return 0;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo de un contrato y resultado donde guardar mensajes
    DESCRIPCIÓN: Revisa el orden de las partes internas de un contrato
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void analizarDentroContrato(JsonNode contrato,ResultadoAnalisisSolidity resultado) {
        String nombreContrato = comprobacionValorTextoNodo(contrato,AST_NAME);
        String kind = comprobacionValorTextoNodo(contrato,AST_CONTRACT_KIND);
        if(kind.equals(KIND_LIBRARY)){
            analizarLibrary(contrato,resultado);
            return;
        }
        if(kind.equals(KIND_INTERFACE)){
            analizarInterface(contrato,resultado);
            return;
        }
        JsonNode nodos = contrato.get(AST_NODES);
        if(nodos == null || !nodos.isArray()){
            return;
        }
        int ordenActual = 0;
        for(JsonNode nodo:nodos){
            int ordenElemento = ordenElementoContrato(nodo);
            if(ordenElemento == 0){
                continue;
            }
            if(ordenElemento < ordenActual){
                resultado.addError( nombreElementoContrato(nodo,nombreContrato),"The element'" + nombreElementoContrato(nodo,nombreContrato) + "' it is out of the expected order inside the contract element '" + nombreContrato + "'.", solucionContrato(ordenElemento,ordenActual));
            }
            else{
                ordenActual = ordenElemento;
            }
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo de una libreria y resultado donde guardar mensajes
    DESCRIPCIÓN: Revisa cosas de la libreria que pueden no encajar con los bloques
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void analizarLibrary(JsonNode library,ResultadoAnalisisSolidity resultado) {
        JsonNode nodos = library.get(AST_NODES);

        if(nodos == null || !nodos.isArray()){
            return;
        }

        for(JsonNode nodo:nodos){
            String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);

            if(tipo.equals(NODE_EVENT)){
                resultado.addWarning("library","An event has been found within the library", "If you run into problems when breaking it down into blocks, move the event to a contract" );
            }
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo de una interfaz y resultado donde guardar mensajes
    DESCRIPCIÓN: Comprueba que la interfaz tenga solo funciones declaradas o eventos
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void analizarInterface(JsonNode interfaz,ResultadoAnalisisSolidity resultado) {
        JsonNode nodos = interfaz.get(AST_NODES);
        if(nodos == null || !nodos.isArray()){
            return;
        }
        for(JsonNode nodo:nodos){
            String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);
            if(!tipo.equals(NODE_FUNCTION) && !tipo.equals(NODE_EVENT)){
                resultado.addError("interface", "The interface contains an element that is neither a function nor an event","Leave only declared functions and events in the interface");
            }
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo interno de un contrato
    DESCRIPCIÓN: Devuelve el orden que tiene ese elemento dentro del contrato
    PARÁMETRO DE SALIDA: Numero de orden del elemento
    */
    private int ordenElementoContrato(JsonNode nodo) {
        String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);

        if(esPropiedad(tipo)){
            return ORDEN_PATRON_PROPERTIES;
        }
        else if(tipo.equals(NODE_FUNCTION)){
            String kind = comprobacionValorTextoNodo(nodo,AST_KIND);

            if(kind.equals(KIND_CONSTRUCTOR)){
                return ORDEN_PATRON_CONSTRUCTORS;
            }
            else{
                return ORDEN_PATRON_CLAUSES;
            }
        }
        else if(tipo.equals(NODE_MODIFIER)){
            return ORDEN_PATRON_MODIFIERS;
        }
        else if(tipo.equals(NODE_EVENT)){
            return ORDEN_PATRON_EVENTS;
        }
        else if(tipo.equals(NODE_ERROR)){
            return ORDEN_PATRON_ERRORS;
        }

        return 0;
    }

    /*
    PARÁMETRO DE ENTRADA: Tipo del nodo
    DESCRIPCIÓN: Mira si el nodo se puede considerar una propiedad del contrato
    PARÁMETRO DE SALIDA: true si es propiedad y false si no lo es
    */
    private boolean esPropiedad(String tipo) {
        if(tipo.equals(NODE_VARIABLE)){
            return true;
        }
        else if(tipo.equals(NODE_STRUCT)){
            return true;
        }
        else if(tipo.equals(NODE_ENUM)){
            return true;
        }
        else if(tipo.equals(NODE_USING)){
            return true;
        }

        return false;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo del contrato
    DESCRIPCIÓN: Mira si el contrato es abstracto
    PARÁMETRO DE SALIDA: true si es abstracto y false si no
    */
    private boolean esAbstracto(JsonNode nodo) {
        if(nodo.has(AST_ABSTRACT)){
          return nodo.get(AST_ABSTRACT).asBoolean();
        }
        return false;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo principal del fichero
    DESCRIPCIÓN: Devuelve un nombre entendible del elemento para mostrarlo en un mensaje
    PARÁMETRO DE SALIDA: Nombre del elemento
    */
    private String nombreElementoArchivo(JsonNode nodo) {
        String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);

        if(tipo.equals(AST_PRAGMA)){
            return "version";
        }
        else if(tipo.equals(AST_IMPORT)){
            return "import";
        }
        else if(tipo.equals(AST_CONTRACT)){
            String kind = comprobacionValorTextoNodo(nodo,AST_CONTRACT_KIND);
            String nombre = comprobacionValorTextoNodo(nodo,AST_NAME);

            if(kind.equals(KIND_LIBRARY)){
                return "library " + nombre;
            }
            else if(kind.equals(KIND_INTERFACE)){
                return "interface " + nombre;
            }
            else if(esAbstracto(nodo)){
                return "abstract contract " + nombre;
            }
            else{
                return "contract " + nombre;
            }
        }

        return tipo;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo interno y nombre del contrato
    DESCRIPCIÓN: Devuelve un nombre entendible del elemento interno
    PARÁMETRO DE SALIDA: Nombre del elemento
    */
    private String nombreElementoContrato(JsonNode nodo,String contrato) {
        String tipo = comprobacionValorTextoNodo(nodo,AST_NODE_TYPE);
        String nombre = comprobacionValorTextoNodo(nodo,AST_NAME);

        if(esPropiedad(tipo)){
            return "property " + nombre;
        }
        else if(tipo.equals(NODE_FUNCTION)){
            String kind = comprobacionValorTextoNodo(nodo,AST_KIND);

            if(kind.equals(KIND_CONSTRUCTOR)){
                return "constructor " + contrato;
            }
            else{
                return "function " + nombre;
            }
        }
        else if(tipo.equals(NODE_MODIFIER)){
            return "modifier " + nombre;
        }
        else if(tipo.equals(NODE_EVENT)){
            return "event " + nombre;
        }

        return tipo;
    }

    /*
    PARÁMETRO DE ENTRADA: Orden del elemento y orden donde estaba el analisis
    DESCRIPCIÓN: Crea una ayuda para ordenar bien los elementos del fichero
    PARÁMETRO DE SALIDA: comprobacionValorTextoNodo con la solucion
    */
    private String solucionArchivo(int ordenElemento,int ordenActual) {
        return "Place element " + nombreOrdenArchivo(ordenElemento) + "  before " + nombreOrdenArchivo(ordenActual) + 
        ". The expected order is: version, imports, libraries, interfaces, abstract contracts, and contracts. If this order is NOT followed, the blocks will NOT be generated.";
    }

    /*
    PARÁMETRO DE ENTRADA: Orden del elemento principal
    DESCRIPCIÓN: Pasa el numero del orden a comprobacionValorTextoNodo
    PARÁMETRO DE SALIDA: comprobacionValorTextoNodo del elemento del fichero
    */
    private String nombreOrdenArchivo(int orden) {
        if(orden == ORDEN_PATRON_VERSION){
            return "the compiler version";
        }
        else if(orden == ORDEN_PATRON_IMPORTS){
            return "the imports";
        }
        else if(orden == ORDEN_PATRON_LIBRARIES){
            return "the libraries";
        }
        else if(orden == ORDEN_PATRON_INTERFACES){
            return "the interfaces";
        }
        else if(orden == ORDEN_PATRON_ABSTRACT_CONTRACTS){
            return "the abstract contracts";
        }
        else if(orden == ORDEN_PATRON_CONTRACTS){
            return "the contracts";
        }

        return "the element";
    }
    /*
    PARÁMETRO DE ENTRADA: Recibe el orden del elemento y el orden donde estaba el analisis
    DESCRIPCIÓN: Crea una ayuda para ordenar bien los elementos dentro del contrato
    PARÁMETRO DE SALIDA: El mensaje indicando al usuario donde debe colocar el elemento que esta en posicion errónea
    */
    private String solucionContrato(int ordenElemento,int ordenActual) {
        return "Place element " + nombreOrdenContrato(ordenElemento) + " before " + nombreOrdenContrato(ordenActual) + 
        ". The expected order within the contract is: properties, constructors, modifiers, events, errors and functions. If this order is NOT followed, the blocks are NOT generated.";
    }

    /*
    PARÁMETRO DE ENTRADA: Orden del elemento interno
    DESCRIPCIÓN: Pasa el numero del orden interno a comprobacionValorTextoNodo
    PARÁMETRO DE SALIDA: Devuelve un string con el texto en base al orden actual donde debería situarse el elemento en el contrato 
     */
    private String nombreOrdenContrato(int orden) {
        if(orden == ORDEN_PATRON_PROPERTIES){
            return "the variables";
        }
        else if(orden == ORDEN_PATRON_CONSTRUCTORS){
            return "the constructors";
        }
        else if(orden == ORDEN_PATRON_MODIFIERS){
            return "the modifiers";
        }
        else if(orden == ORDEN_PATRON_EVENTS){
            return "the events";
        }
        else if(orden == ORDEN_PATRON_ERRORS){
            return "the custom errors";
        }
        else if(orden == ORDEN_PATRON_CLAUSES){
            return "the clauses/functions";
        }
        return "the element";
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo y campo que se va leer
    DESCRIPCIÓN: Se comprueba el valor del campo del nodo para que no que falle si no existe
    PARÁMETRO DE SALIDA: comprobacionValorTextoNodo del campo o vacio
    */
    private String comprobacionValorTextoNodo(JsonNode nodo,String campo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }
        JsonNode valor = nodo.get(campo);
        if(valor == null || valor.isNull()){
            return "";
        }
        return valor.asString();
    }
}