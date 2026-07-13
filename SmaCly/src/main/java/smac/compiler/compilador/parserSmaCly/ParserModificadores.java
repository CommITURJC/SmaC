package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

import java.util.List;

/*
INFO: Parser de modifiers
*/

public class ParserModificadores extends ParserComun {

    private static final String BLOQUE_MODIFIER = "modifier";

    private static final String ENTRADA_PARAMS = "inputparams";
    private static final String ENTRADA_RESTRICCIONES = "restrictions_modifier";

    private static final String AST_PARAMETERS = "parameters";
    private static final String AST_BODY = "body";
    private static final String AST_STATEMENTS = "statements";

    private ParserParametros parserParametros = new ParserParametros();
    private ParserSentencias parserSentencias = new ParserSentencias();

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_MODIFIER);

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        Bloque params = parserParametros.inputParams(nodo.path(AST_PARAMETERS).path(AST_PARAMETERS));
        if(params != null){
            b.valor(ENTRADA_PARAMS,params);
        }

        List<Bloque> sentencias = parserSentencias.parsearLista(nodo.path(AST_BODY).path(AST_STATEMENTS));
        if(sentencias.size() > 0){
            b.sentencia(ENTRADA_RESTRICCIONES,unir(sentencias));
        }

        return b;
    }
}
