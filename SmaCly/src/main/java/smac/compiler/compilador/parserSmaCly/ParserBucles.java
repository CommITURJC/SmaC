package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.List;

/*
INFO: Parser de bucles
*/

public class ParserBucles extends ParserComun {

    private static final String BLOQUE_WHILE = "block_whileloop";
    private static final String BLOQUE_DO_WHILE = "block_dowhile";
    private static final String BLOQUE_FOR = "block_for";

    private static final String ENTRADA_CONDITION = "condition";
    private static final String ENTRADA_ELEMENTS_WHILE = "elements_while";
    private static final String ENTRADA_ELEMENTS_DO = "elements_dowhile";
    private static final String ENTRADA_EXPRESSIONS_FOR = "expressions_for";

    private static final String CAMPO_NAME_VARIABLE = "namevariable";
    private static final String CAMPO_VALUE = "value";
    private static final String CAMPO_NAME_VARIABLE_2 = "namevariable2";
    private static final String CAMPO_OPERATOR_COMPARATION = "operatorcomparation";
    private static final String CAMPO_LIMIT = "limit";
    private static final String CAMPO_NAME_VARIABLE_3 = "namevariable3";
    private static final String CAMPO_ARITH_OPERATOR = "arithmeticaloperator";

    private static final String AST_WHILE = "WhileStatement";
    private static final String AST_DO_WHILE = "DoWhileStatement";
    private static final String AST_FOR = "ForStatement";
    private static final String AST_CONDITION = "condition";
    private static final String AST_BODY = "body";
    private static final String AST_STATEMENTS = "statements";
    private static final String AST_INIT = "initializationExpression";
    private static final String AST_LOOP = "loopExpression";
    private static final String AST_DECLARATIONS = "declarations";
    private static final String AST_INITIAL_VALUE = "initialValue";
    private static final String AST_EXPRESSION = "expression";
    private static final String AST_LEFT = "leftExpression";
    private static final String AST_RIGHT = "rightExpression";
    private static final String AST_OPERATOR = "operator";
    private static final String AST_NAME = "name";
    private static final String AST_SUB = "subExpression";

    private ParserSentencias parserSentencias;
    private ParserExpresiones parserExpresiones = new ParserExpresiones();

    public ParserBucles(ParserSentencias parserSentencias) {
        this.parserSentencias = parserSentencias;
    }

    public Bloque parsear(JsonNode nodo) {
        String tipo = txt(nodo,AST_NODE_TYPE);

        if(tipo.equals(AST_WHILE)){
            return whileBloque(nodo);
        }
        else if(tipo.equals(AST_DO_WHILE)){
            return doWhileBloque(nodo);
        }
        else if(tipo.equals(AST_FOR)){
            return forBloque(nodo);
        }

        return null;
    }

    private Bloque whileBloque(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_WHILE);

        b.valor(ENTRADA_CONDITION,parserExpresiones.parsear(nodo.get(AST_CONDITION)));

        List<Bloque> dentro = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
        if(dentro.size() > 0){
            b.sentencia(ENTRADA_ELEMENTS_WHILE,unir(dentro));
        }

        return b;
    }

    private Bloque doWhileBloque(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_DO_WHILE);

        List<Bloque> dentro = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
        if(dentro.size() > 0){
            b.sentencia(ENTRADA_ELEMENTS_DO,unir(dentro));
        }

        b.valor(ENTRADA_CONDITION,parserExpresiones.parsear(nodo.get(AST_CONDITION)));

        return b;
    }

    private Bloque forBloque(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_FOR);

        b.campo(CAMPO_NAME_VARIABLE,"i");
        b.campo(CAMPO_VALUE,"0");
        b.campo(CAMPO_NAME_VARIABLE_2,"i");
        b.campo(CAMPO_OPERATOR_COMPARATION,"<");
        b.campo(CAMPO_LIMIT,"limit");
        b.campo(CAMPO_NAME_VARIABLE_3,"i");
        b.campo(CAMPO_ARITH_OPERATOR,"++");

        completarFor(nodo,b);

        List<Bloque> dentro = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
        if(dentro.size() > 0){
            b.sentencia(ENTRADA_EXPRESSIONS_FOR,unir(dentro));
        }

        return b;
    }

    private void completarFor(JsonNode nodo,Bloque b) {
        JsonNode init = nodo.get(AST_INIT);

        if(init != null && !init.isNull()){
            JsonNode decs = init.get(AST_DECLARATIONS);

            if(decs != null && decs.isArray() && decs.size() > 0){
                String nombre = txt(decs.get(0),AST_NAME);
                if(!nombre.equals("")){
                    b.campo(CAMPO_NAME_VARIABLE,nombre);
                    b.campo(CAMPO_NAME_VARIABLE_2,nombre);
                    b.campo(CAMPO_NAME_VARIABLE_3,nombre);
                }
            }

            JsonNode valor = init.get(AST_INITIAL_VALUE);
            if(valor != null && !valor.isNull()){
                b.campo(CAMPO_VALUE,parserExpresiones.codigo(valor));
            }
        }

        JsonNode condicion = nodo.get(AST_CONDITION);
        if(condicion != null && !condicion.isNull()){
            b.campo(CAMPO_OPERATOR_COMPARATION,txt(condicion,AST_OPERATOR));

            JsonNode izq = condicion.get(AST_LEFT);
            if(izq != null && !izq.isNull()){
                b.campo(CAMPO_NAME_VARIABLE_2,parserExpresiones.codigo(izq));
            }

            JsonNode der = condicion.get(AST_RIGHT);
            if(der != null && !der.isNull()){
                b.campo(CAMPO_LIMIT,parserExpresiones.codigo(der));
            }
        }

        JsonNode loop = nodo.get(AST_LOOP);
        if(loop != null && !loop.isNull()){
            JsonNode expr = loop.get(AST_EXPRESSION);
            if(expr != null && !expr.isNull()){
                b.campo(CAMPO_ARITH_OPERATOR,txt(expr,AST_OPERATOR));

                JsonNode sub = expr.get(AST_SUB);
                if(sub != null && !sub.isNull()){
                    b.campo(CAMPO_NAME_VARIABLE_3,parserExpresiones.codigo(sub));
                }
            }
        }
    }
}
