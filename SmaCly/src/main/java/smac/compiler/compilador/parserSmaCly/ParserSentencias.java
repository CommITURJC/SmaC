package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de sentencias
*/

public class ParserSentencias extends ParserComun {

    private static final String BLOQUE_RETURN = "return_clause";
    private static final String BLOQUE_RESTRICTION = "restriction_clause";
    private static final String BLOQUE_RESTRICTION_COMMENT = "restriction_clausecomment";
    private static final String BLOQUE_PERSONALIZADA = "personalized_expression";
    private static final String BLOQUE_ASSIGN = "assign_value_expression";
    private static final String BLOQUE_ASSIGN_ONE = "assing_value_expression1inputs";
    private static final String BLOQUE_EMIT = "emit_event";
    private static final String BLOQUE_ASSERT = "assert_function";
    private static final String BLOQUE_REVERT = "revert_expression";
    private static final String BLOQUE_DELETE = "deleteexpression";
    private static final String BLOQUE_UNCHECKED = "block_unchecked";
    private static final String BLOQUE_TRY = "block_try";
    private static final String BLOQUE_CATCH = "block_catch";
    private static final String CAMPO_VALUES_EXPR = "values_expression";
    private static final String CAMPO_OPERATORS = "operators";
    private static final String CAMPO_COMMENT = "comment";
    private static final String CAMPO_PARAM = "value_parameter";
    private static final String CAMPO_REVERT = "value_revertexpression";
    private static final String CAMPO_DELETE = "value_deleteexpression";

    private static final String ENTRADA_VALUES = "values";
    private static final String ENTRADA_CONDITION = "condition";
    private static final String ENTRADA_VALUE_1_ASSIGN = "value1_assignexpression";
    private static final String ENTRADA_VALUE_2_ASSIGN = "value2_assignexpression";
    private static final String ENTRADA_INPUTPARAMS = "inputparams";
    private static final String ENTRADA_UNCHECKED = "statements";
    private static final String ENTRADA_TRY_EXPRESSION = "expression";
    private static final String ENTRADA_TRY_RETURNS = "returns";
    private static final String ENTRADA_TRY_ACTIONS = "actions_try";
    private static final String ENTRADA_CATCH_PARAMETER = "parameter";
    private static final String ENTRADA_CATCH_ACTIONS = "actions_catch";

    private static final String AST_RETURN = "Return";
    private static final String AST_EXPR_STATEMENT = "ExpressionStatement";
    private static final String AST_VAR_STATEMENT = "VariableDeclarationStatement";
    private static final String AST_IF = "IfStatement";
    private static final String AST_WHILE = "WhileStatement";
    private static final String AST_FOR = "ForStatement";
    private static final String AST_DO_WHILE = "DoWhileStatement";
    private static final String AST_EMIT = "EmitStatement";
    private static final String AST_PLACEHOLDER = "PlaceholderStatement";
    private static final String AST_CALL = "FunctionCall";
    private static final String AST_ASSIGNMENT = "Assignment";
    private static final String AST_UNARY = "UnaryOperation";
    private static final String AST_TYPE_NAME = "typeName";
    private static final String AST_EXPRESSION = "expression";
    private static final String AST_EVENT_CALL = "eventCall";
    private static final String AST_ARGUMENTS = "arguments";
    private static final String AST_DECLARATIONS = "declarations";
    private static final String AST_INITIAL_VALUE = "initialValue";
    private static final String AST_OPERATOR = "operator";
    private static final String AST_LEFT_HAND = "leftHandSide";
    private static final String AST_RIGHT_HAND = "rightHandSide";
    private static final String AST_SUB_EXPRESSION = "subExpression";
    private static final String AST_REVERT = "RevertStatement";
    private static final String AST_ERROR_CALL = "errorCall";
    private static final String AST_UNCHECKED = "UncheckedBlock";
    private static final String AST_STATEMENTS = "statements";
  
    private static final String AST_TRY = "TryStatement";
    private static final String AST_EXTERNAL_CALL = "externalCall";
    private static final String AST_CLAUSES = "clauses";
    private static final String AST_ERROR_NAME = "errorName";
    private static final String AST_PARAMETERS = "parameters";
    private static final String AST_BLOCK = "block";

    private static final String CAMPO_CATCH_TYPE = "catch_type";
    private ParserExpresiones parserExpresiones = new ParserExpresiones();
    private ParserVariables parserVariables = new ParserVariables();
    private ParserParametros parserParametros = new ParserParametros();

    public List<Bloque> parsearLista(JsonNode nodos) {
        List<Bloque> lista = new ArrayList<>();

        if(nodos != null && nodos.isArray()){
            for(int i = 0;i < nodos.size();i++){
                JsonNode n = nodos.get(i);
                Bloque b;

                if(txt(n,AST_NODE_TYPE).equals(AST_PLACEHOLDER)){
                    if(i == nodos.size() - 1){
                        b = new Bloque("closemodifier");
                    }
                    else{
                        b = new Bloque("markmodifier");
                    }
                }
                else{
                    b = parsear(n);
                }

                if(b != null){
                    lista.add(b);
                }
            }
        }

        return lista;
    }

    public Bloque parsear(JsonNode nodo) {
        String tipo = txt(nodo,AST_NODE_TYPE);

        if(tipo.equals(AST_RETURN)){
            return retorno(nodo);
        }
        else if(tipo.equals(AST_EXPR_STATEMENT)){
            return exprStatement(nodo);
        }
        else if(tipo.equals(AST_VAR_STATEMENT)){
            return varLocal(nodo);
        }
        else if(tipo.equals(AST_IF)){
            return new ParserCondiciones(this).parsear(nodo);
        }
        else if(tipo.equals(AST_WHILE) || tipo.equals(AST_FOR) || tipo.equals(AST_DO_WHILE)){
            return new ParserBucles(this).parsear(nodo);
        }
        else if(tipo.equals(AST_EMIT)){
            return emit(nodo.get(AST_EVENT_CALL));
        }
        else if(tipo.equals(AST_REVERT)){
            JsonNode errorCall = nodo.get(AST_ERROR_CALL);
            String contenido = "";
            if(errorCall != null && !errorCall.isNull()){
                contenido = parserExpresiones.codigo(errorCall);
            }
            return new Bloque(BLOQUE_REVERT).campo(CAMPO_REVERT, contenido);
        }
        else if(tipo.equals(AST_UNCHECKED)){
            Bloque bloqueUnchecked = new Bloque(BLOQUE_UNCHECKED);
            JsonNode statements = nodo.get(AST_STATEMENTS);
            if(statements != null && statements.isArray()){
                List<Bloque> bloques = parsearLista(statements);
                if(bloques != null && !bloques.isEmpty()){
                    bloqueUnchecked.sentencia(ENTRADA_UNCHECKED,unir(bloques));
                }
            }
            return bloqueUnchecked;
        }
        else if(tipo.equals(AST_TRY)){
            return tryCatch(nodo);
        }
        else if(tipo.equals(AST_PLACEHOLDER)){
            return new Bloque("markmodifier");
        }
        
        return personalizada(nodo);
    }

    private Bloque retorno(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_RETURN);

        JsonNode expr = nodo.get(AST_EXPRESSION);
        if(expr != null && !expr.isNull()){
            b.valor(ENTRADA_VALUES,parserExpresiones.parsear(expr));
        }

        return b;
    }

    private Bloque exprStatement(JsonNode nodo) {
        JsonNode expr = nodo.get(AST_EXPRESSION);

        if(expr == null || expr.isNull()){
            return null;
        }

        String tipo = txt(expr,AST_NODE_TYPE);

        if(tipo.equals(AST_CALL)){
            String nombre = parserExpresiones.codigo(expr.get(AST_EXPRESSION));

            if(nombre.equals("require")){
                return requireBloque(expr);
            }
            else if(nombre.equals("assert")){
                return new Bloque(BLOQUE_ASSERT).campo(CAMPO_PARAM,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("revert")){
                return new Bloque(BLOQUE_REVERT).campo(CAMPO_REVERT,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("delete")){
                return new Bloque(BLOQUE_DELETE).campo(CAMPO_DELETE,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("selfdestruct")){
                return new Bloque("selfdestruct_function").campo(CAMPO_PARAM,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("keccak256") || nombre.equals("keccack256")){
                return new Bloque("keccak_function").campo(CAMPO_PARAM,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("sha256") || nombre.equals("sha3")){
                return new Bloque("sha_function").campo("name","sha256").campo(CAMPO_PARAM,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            else if(nombre.equals("abi.encodePacked") || nombre.equals("abi.encode")){
                return new Bloque("abyencode_function").campo(CAMPO_PARAM,parserExpresiones.argsTexto(expr.get(AST_ARGUMENTS)));
            }
            Bloque b = new Bloque(BLOQUE_PERSONALIZADA);
            b.campo(
                CAMPO_VALUES_EXPR,
                parserExpresiones.codigo(expr)
            );

            return b;
        }
        else if(tipo.equals(AST_ASSIGNMENT)){
            Bloque b = new Bloque(BLOQUE_ASSIGN);
            b.campo(CAMPO_OPERATORS,txt(expr,AST_OPERATOR));
            b.valor(ENTRADA_VALUE_1_ASSIGN, parserExpresiones.parsear(expr.get(AST_LEFT_HAND)));
            b.valor(ENTRADA_VALUE_2_ASSIGN, parserExpresiones.parsear(expr.get(AST_RIGHT_HAND)) );
            return b;
        }
        else if(tipo.equals(AST_UNARY)){
            String operador = txt(expr,AST_OPERATOR);
            JsonNode subExpresion = expr.get(AST_SUB_EXPRESSION);
            if(subExpresion == null || subExpresion.isNull()){
                subExpresion = expr.get("expression");
            }
            if(operador.equals("delete")){
                String valorDelete = "";
                if(subExpresion != null && !subExpresion.isNull()){
                    valorDelete = parserExpresiones.codigo(subExpresion);
                }
                if(valorDelete == null || valorDelete.trim().equals("")){
                    valorDelete = parserExpresiones.codigo(expr);

                    if(valorDelete != null && valorDelete.startsWith("delete ")){
                        valorDelete = valorDelete.substring(7);
                    }
                }

                return new Bloque(BLOQUE_DELETE).campo(CAMPO_DELETE, valorDelete);
            }
            Bloque b = new Bloque(BLOQUE_PERSONALIZADA);
            b.campo(CAMPO_VALUES_EXPR,parserExpresiones.codigo(expr));
            return b;
        }

        return personalizada(expr);
    }

    private Bloque requireBloque(JsonNode expr) {
        JsonNode args = expr.get(AST_ARGUMENTS);

        Bloque b;

        if(args != null && args.isArray() && args.size() > 1){
            b = new Bloque(BLOQUE_RESTRICTION_COMMENT);
            b.campo(CAMPO_COMMENT,quitarComillas(parserExpresiones.codigo(args.get(1))));
        }
        else{
            b = new Bloque(BLOQUE_RESTRICTION);
        }

        if(args != null && args.isArray() && args.size() > 0){
            b.valor(ENTRADA_CONDITION,parserExpresiones.parsear(args.get(0)));
        }

        return b;
    }

    private Bloque emit(JsonNode call) {
        if(call == null || call.isNull()){
            return null;
        }

        Bloque b = new Bloque(BLOQUE_EMIT);
        b.campo(AST_NAME,parserExpresiones.codigo(call.get(AST_EXPRESSION)));

        Bloque params = parserParametros.argumentos(call.get(AST_ARGUMENTS));
        if(params != null){
            b.valor(ENTRADA_INPUTPARAMS,params);
        }

        return b;
    }

 
    /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa una declaración local dentro de una función
    DESCRIPCIÓN: Si la declaración viene de una tupla como (bool success,) la transforma en una asignación de valor usando la tupla completa como expresión personalizada
    PARÁMETRO DE SALIDA: Bloque que representa la declaración o asignación local
    */
    private Bloque varLocal(JsonNode nodo) {
        JsonNode decs = nodo.get(AST_DECLARATIONS);
        JsonNode valor = nodo.get(AST_INITIAL_VALUE);

        if(decs != null && decs.isArray() && decs.size() > 0){

            if(decs.size() > 1){
                String textoTupla = "(";

                for(int i = 0;i < decs.size();i++){
                    if(i > 0){
                        textoTupla += ", ";
                    }

                    JsonNode declaracion = decs.get(i);

                    if(declaracion != null && !declaracion.isNull()){
                        String tipoVariable = "";

                        JsonNode tipoNodo = declaracion.get("typeName");

                        if(tipoNodo != null && !tipoNodo.isNull()){
                            tipoVariable = nombreTipo(tipoNodo);
                        }

                        if(tipoVariable == null || tipoVariable.trim().equals("")){
                            JsonNode typeDescriptions = declaracion.get("typeDescriptions");

                            if(typeDescriptions != null && !typeDescriptions.isNull()){
                                tipoVariable = txt(typeDescriptions,"typeString");
                            }
                        }

                        String nombre = txt(declaracion,AST_NAME);

                        if(tipoVariable != null && !tipoVariable.trim().equals("")){
                            textoTupla += tipoVariable.trim();
                        }

                        if(nombre != null && !nombre.trim().equals("")){
                            if(tipoVariable != null && !tipoVariable.trim().equals("")){
                                textoTupla += " ";
                            }

                            textoTupla += nombre.trim();
                        }
                    }
                }

                textoTupla += ")";

                Bloque b = new Bloque(BLOQUE_ASSIGN);
                b.campo(CAMPO_OPERATORS,"=");

                b.valor(
                    ENTRADA_VALUE_1_ASSIGN,
                    new Bloque("personalized_inputexpression").campo(CAMPO_VALUES_EXPR,textoTupla)
                );

                if(valor != null && !valor.isNull()){
                    b.valor(ENTRADA_VALUE_2_ASSIGN,parserExpresiones.parsear(valor));
                }
                else{
                    b.valor(
                        ENTRADA_VALUE_2_ASSIGN,
                        new Bloque("personalized_inputexpression").campo(CAMPO_VALUES_EXPR,"")
                    );
                }

                return b;
            }

            Bloque b = parserVariables.parsearLocal(decs.get(0));

            if(valor != null && !valor.isNull()){
                Bloque asignacion = new Bloque(BLOQUE_ASSIGN_ONE);
                asignacion.campo(CAMPO_OPERATORS,"=");
                asignacion.valor(ENTRADA_VALUE_1_ASSIGN,parserExpresiones.parsear(valor));
                b.valor("valueproperty",asignacion);
            }

            return b;
        }

        return null;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa una sentencia try --> catch
    DESCRIPCIÓN: Transforma una sentencia try ->catch de Solidity en un bloque try seguido de uno o varios bloques catch
    PARÁMETRO DE SALIDA: Bloque try con sus bloques catch encadenados
    */
    private Bloque tryCatch(JsonNode nodo) {
        Bloque bloqueTry = new Bloque(BLOQUE_TRY);
        JsonNode llamada = nodo.get(AST_EXTERNAL_CALL);
        if(llamada != null && !llamada.isNull()){
            bloqueTry.valor(ENTRADA_TRY_EXPRESSION,parserExpresiones.parsear(llamada));
        }
        JsonNode clausulas = nodo.get(AST_CLAUSES);
        Bloque ultimo = bloqueTry;
        if(clausulas != null && clausulas.isArray()){
            for(int i = 0;i < clausulas.size();i++){
                JsonNode clausula = clausulas.get(i);
                String nombreError = txt(clausula,AST_ERROR_NAME);
                JsonNode parametrosNodo = clausula.path(AST_PARAMETERS).path(AST_PARAMETERS);
                JsonNode sentenciasNodo = clausula.path(AST_BLOCK).path(AST_STATEMENTS);
                if(i == 0 && nombreError.equals("")){
                    Bloque returns = parserParametros.inputParams(parametrosNodo);
                    if(returns != null){
                        bloqueTry.valor(ENTRADA_TRY_RETURNS,returns);
                    }

                    List<Bloque> accionesTry = parsearLista(sentenciasNodo);
                    if(!accionesTry.isEmpty()){
                        bloqueTry.sentencia(ENTRADA_TRY_ACTIONS,unir(accionesTry));
                    }
                }
                else{
                    Bloque bloqueCatch = new Bloque(BLOQUE_CATCH);
                    String tipoCatch = "generic";

                    if(nombreError.equals("Error")){
                        tipoCatch = "Error";
                    }
                    else if(nombreError.equals("Panic")){
                        tipoCatch = "Panic";
                    }
                    else if(parametrosNodo != null && parametrosNodo.isArray() && parametrosNodo.size() > 0){
                        tipoCatch = "bytes";
                    }

                    bloqueCatch.campo(CAMPO_CATCH_TYPE,tipoCatch);

                    Bloque parametro = parserParametros.inputParams(parametrosNodo);
                    if(parametro != null){
                        bloqueCatch.valor(ENTRADA_CATCH_PARAMETER,parametro);
                    }

                    List<Bloque> accionesCatch = parsearLista(sentenciasNodo);
                    if(!accionesCatch.isEmpty()){
                        bloqueCatch.sentencia(ENTRADA_CATCH_ACTIONS,unir(accionesCatch));
                    }
                    ultimo.sig(bloqueCatch);
                    ultimo = bloqueCatch;
                }
            }
        }

        return bloqueTry;
    }

    private Bloque personalizada(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_PERSONALIZADA);
        b.campo(CAMPO_VALUES_EXPR,parserExpresiones.codigo(nodo));
        return b;
    }

    private String quitarComillas(String texto) {
        return quitarCaracter(texto,'"');
    }
}
