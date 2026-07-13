package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

/*
INFO: Parser de using for
*/

public class ParserUsing extends ParserComun {

    private static final String AST_LIBRARY_NAME = "libraryName";

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque("block_usinglibrary");

        b.campo(AST_NAME,nombreTipo(nodo.get(AST_LIBRARY_NAME)));

        String tipo = nombreTipo(nodo.get(AST_TYPE_NAME));
        if(tipo.equals("")){
            tipo = "*";
        }

        b.campo("alias",tipo);

        return b;
    }
}
