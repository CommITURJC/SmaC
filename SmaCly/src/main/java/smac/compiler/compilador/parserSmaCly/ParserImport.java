package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

/*
INFO: Parser de imports
*/

public class ParserImport extends ParserComun {

    private static final String BLOQUE_IMPORT = "import";
    private static final String BLOQUE_ALIAS = "alias_import";

    private static final String CAMPO_RUTA = "resource_route";
    private static final String CAMPO_ALIAS = "alias";

    private static final String AST_ABSOLUTE_PATH = "absolutePath";
    private static final String AST_FILE = "file";
    private static final String AST_UNIT_ALIAS = "unitAlias";

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_IMPORT);

        String ruta = txt(nodo,AST_ABSOLUTE_PATH);
        if(ruta.equals("")){
            ruta = txt(nodo,AST_FILE);
        }
        b.campo(CAMPO_RUTA,ruta);
        String alias = txt(nodo,AST_UNIT_ALIAS);
        if(!alias.equals("")){
            Bloque a = new Bloque(BLOQUE_ALIAS);
            a.campo(CAMPO_ALIAS,alias);
            b.valor(CAMPO_ALIAS,a);
        }

        return b;
    }
}
