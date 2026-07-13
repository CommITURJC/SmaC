package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de funciones y constructores
*/

public class ParserFunciones extends ParserComun {

    private static final String BLOQUE_CLAUSE = "clause";
    private static final String BLOQUE_INTERFACE_CLAUSE = "interface_clausedeclaration";
    private static final String BLOQUE_ABSTRACT_CLAUSE = "abstract_clausedeclaration";
    private static final String BLOQUE_CONSTRUCTOR = "contract_constructor";
    private static final String BLOQUE_INPUT_MODIFIER = "block_inputmodifier";
    private static final String BLOQUE_OVERRIDE = "overridemodifier";
    private static final String BLOQUE_CONSTRUCTOR_INHERANCE = "block_constructor_contract_inherance";
    private static final String BLOQUE_RECEIVE = "receive_function";
    private static final String BLOQUE_FALLBACK = "fallback_function";

    private static final String CAMPO_VISIBILITY = "values_visibility";
    private static final String CAMPO_INPUT_MODIFIER = "values_inputmodifier";
    private static final String CAMPO_PAYABLE = "payable";
    private static final String CAMPO_VALUE = "value";
    private static final String CAMPO_VIRTUAL = "virtual";
    private static final String CAMPO_CONTRACT_INHERANCE = "contract_name_inherance";

    private static final String ENTRADA_INPUTS = "inputparams_function";
    private static final String ENTRADA_RETURNS = "returns_values";
    private static final String ENTRADA_ELEMENTS = "elements_function";
    private static final String ENTRADA_TYPE = "type";
    private static final String ENTRADA_CONSTRUCTOR_EXPRESSIONS = "expressions_constructor";
    private static final String ENTRADA_MODIFIERS = "modifiers";
    private static final String ENTRADA_INHERANCE = "inherance";
    private static final String ENTRADA_INPUT_PARAMS = "input_params";
    private static final String ENTRADA_INPUTPARAMS = "inputparams";

    private static final String AST_KIND = "kind";
    private static final String AST_CONSTRUCTOR = "constructor";
    private static final String AST_IMPLEMENTED = "implemented";
    private static final String AST_VIRTUAL = "virtual";
    private static final String AST_VISIBILITY = "visibility";
    private static final String AST_STATE_MUTABILITY = "stateMutability";
    private static final String AST_PAYABLE = "payable";
    private static final String AST_PARAMETERS = "parameters";
    private static final String AST_RETURN_PARAMETERS = "returnParameters";
    private static final String AST_BODY = "body";
    private static final String AST_STATEMENTS = "statements";
    private static final String AST_MODIFIERS = "modifiers";
    private static final String AST_MODIFIER_NAME = "modifierName";
    private static final String AST_ARGUMENTS = "arguments";
    private static final String AST_RECEIVE = "receive";
    private static final String AST_FALLBACK = "fallback";

    private ParserParametros parserParametros = new ParserParametros();
    private ParserSentencias parserSentencias = new ParserSentencias();
    private ParserExpresiones parserExpresiones = new ParserExpresiones();

    public Bloque parsear(JsonNode nodo,boolean interfaz,boolean abstracto) {
       String kind = txt(nodo,AST_KIND);

        if(kind.equals(AST_CONSTRUCTOR)){
            return constructor(nodo);
        }
        else if(kind.equals(AST_RECEIVE)){
            return receive(nodo);
        }
        else if(kind.equals(AST_FALLBACK)){
            return fallback(nodo);
        }

        boolean implementada = true;
        if(nodo.has(AST_IMPLEMENTED)){
            implementada = nodo.get(AST_IMPLEMENTED).asBoolean();
        }

        boolean virtual = false;
        if(nodo.has(AST_VIRTUAL)){
            virtual = nodo.get(AST_VIRTUAL).asBoolean();
        }

        Bloque b;

        if(interfaz){
            b = new Bloque(BLOQUE_INTERFACE_CLAUSE);
        }
        else if(abstracto && !implementada){
            b = new Bloque(BLOQUE_ABSTRACT_CLAUSE);
            if(virtual){
                b.campo(CAMPO_VIRTUAL,"TRUE");
            }
        }
        else{
            b = new Bloque(BLOQUE_CLAUSE);
        }

        b.campo(AST_NAME,txt(nodo,AST_NAME));
        b.campo(CAMPO_VISIBILITY,visibilidad(txt(nodo,AST_VISIBILITY)));
        b.campo(CAMPO_INPUT_MODIFIER,mutabilidad(txt(nodo,AST_STATE_MUTABILITY)));

        Bloque params = parserParametros.inputParams(nodo.path(AST_PARAMETERS).path(AST_PARAMETERS));
        if(params != null){
            b.valor(ENTRADA_INPUTS,params);
        }

        Bloque returns = parserParametros.outputParams(nodo.path(AST_RETURN_PARAMETERS).path(AST_PARAMETERS));
        if(returns != null){
            b.valor(ENTRADA_RETURNS,returns);
        }

        Bloque mods = modificadores(nodo.get(AST_MODIFIERS));
        if(mods != null){
            b.valor(ENTRADA_MODIFIERS,mods);
        }

        if(implementada){
            List<Bloque> sentencias = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
            if(sentencias.size() > 0){
                b.sentencia(ENTRADA_ELEMENTS,unir(sentencias));
            }
        }

        return b;
    }

    private Bloque constructor(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_CONSTRUCTOR);

        if(txt(nodo,AST_STATE_MUTABILITY).equals(AST_PAYABLE)){
            b.campo(CAMPO_PAYABLE,"TRUE");
        }
        else{
            b.campo(CAMPO_PAYABLE,"FALSE");
        }

        Bloque params = parserParametros.inputParams(nodo.path(AST_PARAMETERS).path(AST_PARAMETERS));
        if(params != null){
            b.valor(ENTRADA_TYPE,params);
        }

        Bloque inh = constructorInherance(nodo.get(AST_MODIFIERS));
        if(inh != null){
            b.valor(ENTRADA_INHERANCE,inh);
        }

        List<Bloque> sentencias = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
        if(sentencias.size() > 0){
            b.sentencia(ENTRADA_CONSTRUCTOR_EXPRESSIONS,unir(sentencias));
        }

        return b;
    }


    private Bloque constructorInherance(JsonNode mods) {
        if(mods != null && mods.isArray()){
            for(JsonNode m:mods){
                String nombre = nombreTipo(m.get(AST_MODIFIER_NAME));

                if(!nombre.equals("") && !nombre.equals("override")){
                    Bloque b = new Bloque(BLOQUE_CONSTRUCTOR_INHERANCE);
                    b.campo(CAMPO_CONTRACT_INHERANCE,nombre);

                    Bloque params = parserParametros.argumentos(m.get(AST_ARGUMENTS));
                    if(params != null){
                        b.valor(ENTRADA_INPUT_PARAMS,params);
                    }

                    return b;
                }
            }
        }

        return null;
    }
    
    /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa una función receive de Solidity
    DESCRIPCIÓN: Convierte una función receive en un bloque específico receive_function, manteniendo visibilidad, payable, virtual y sentencias internas
    PARÁMETRO DE SALIDA: Bloque receive_function
    */
    private Bloque receive(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_RECEIVE);

        b.campo(CAMPO_VISIBILITY,visibilidad(txt(nodo,AST_VISIBILITY)));

        if(txt(nodo,AST_STATE_MUTABILITY).equals(AST_PAYABLE)){
            b.campo(CAMPO_PAYABLE,"TRUE");
        }
        else{
            b.campo(CAMPO_PAYABLE,"FALSE");
        }

        if(nodo.has(AST_VIRTUAL) && nodo.get(AST_VIRTUAL).asBoolean()){
            b.campo(CAMPO_VIRTUAL,"TRUE");
        }
        else{
            b.campo(CAMPO_VIRTUAL,"FALSE");
        }

        List<Bloque> sentencias = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));

        if(sentencias.size() > 0){
            b.sentencia(ENTRADA_ELEMENTS,unir(sentencias));
        }

        return b;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa una función fallback de Solidity
    DESCRIPCIÓN: Convierte una función fallback en un bloque específico fallback_function, manteniendo visibilidad, payable, virtual y sentencias internas
    PARÁMETRO DE SALIDA: Bloque fallback_function
    */
    private Bloque fallback(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_FALLBACK);

        b.campo(CAMPO_VISIBILITY,visibilidad(txt(nodo,AST_VISIBILITY)));

        if(txt(nodo,AST_STATE_MUTABILITY).equals(AST_PAYABLE)){
            b.campo(CAMPO_PAYABLE,"TRUE");
        }
        else{
            b.campo(CAMPO_PAYABLE,"FALSE");
        }

        if(nodo.has(AST_VIRTUAL) && nodo.get(AST_VIRTUAL).asBoolean()){
            b.campo(CAMPO_VIRTUAL,"TRUE");
        }
        else{
            b.campo(CAMPO_VIRTUAL,"FALSE");
        }

        List<Bloque> sentencias = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));

        if(sentencias.size() > 0){
            b.sentencia(ENTRADA_ELEMENTS,unir(sentencias));
        }

        return b;
    }
    private Bloque modificadores(JsonNode mods) {
        Bloque primero = null;
        Bloque anterior = null;

        if(mods != null && mods.isArray()){
            for(JsonNode m:mods){
                String nombre = nombreTipo(m.get(AST_MODIFIER_NAME));

                if(nombre.equals("override")){
                    if(primero == null){
                        Bloque over = new Bloque(BLOQUE_OVERRIDE);
                        Bloque params = parserParametros.argumentos(m.get(AST_ARGUMENTS));

                        if(params != null){
                            over.valor(ENTRADA_INPUTPARAMS,params);
                        }

                        primero = over;
                    }
                }
                else if(!nombre.equals("")){
                    Bloque b = new Bloque(BLOQUE_INPUT_MODIFIER);
                    b.campo(CAMPO_VALUE,nombre);

                    Bloque params = parserParametros.argumentos(m.get(AST_ARGUMENTS));
                    if(params != null){
                        b.valor(ENTRADA_INPUTPARAMS,params);
                    }

                    if(primero == null){
                        primero = b;
                    }

                    if(anterior != null){
                        anterior.valor("modifier",b);
                    }

                    anterior = b;
                }
            }
        }

        return primero;
    }
}
