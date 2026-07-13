package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

/*
INFO: Parser de eventos
*/

public class ParserEventos extends ParserComun {

    private static final String BLOQUE_EVENTO = "event";
    private static final String ENTRADA_PARAMS = "inputparams";
    private static final String AST_PARAMETERS = "parameters";

    private ParserParametros parserParametros = new ParserParametros();

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_EVENTO);

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        Bloque params = parserParametros.inputParams(nodo.path(AST_PARAMETERS).path(AST_PARAMETERS));
        if(params != null){
            b.valor(ENTRADA_PARAMS,params);
        }

        return b;
    }
}
