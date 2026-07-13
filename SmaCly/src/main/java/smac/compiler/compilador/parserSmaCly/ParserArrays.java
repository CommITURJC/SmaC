package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

/*
INFO: Parser de dimensiones de array
*/

public class ParserArrays extends ParserComun {

    private static final String BLOQUE_DYNAMIC = "dynamic_array";
    private static final String BLOQUE_FIXED = "array_property";

    private static final String CAMPO_CELLS = "cells";

    private static final String ENTRADA_DIMENSION = "dimension";
    private static final String ENTRADA_PLUS_DIMENSION = "plus_dimension";

    private static final String AST_LENGTH = "length";
    private static final String AST_BASE_TYPE = "baseType";

    private ParserExpresiones parserExpresiones = new ParserExpresiones();

    public Bloque dimensiones(JsonNode typeName) {
        if(typeName == null || typeName.isNull()){
            return null;
        }

        String tipo = txt(typeName,AST_NODE_TYPE);
        if(!tipo.equals(TYPE_ARRAY)){
            return null;
        }

        Bloque actual;
        JsonNode length = typeName.get(AST_LENGTH);

        if(length == null || length.isNull()){
            actual = new Bloque(BLOQUE_DYNAMIC);
        }
        else{
            actual = new Bloque(BLOQUE_FIXED);
            actual.campo(CAMPO_CELLS,parserExpresiones.codigo(length));
        }

        Bloque resto = dimensiones(typeName.get(AST_BASE_TYPE));
        if(resto != null){
            if(length == null || length.isNull()){
                actual.valor(ENTRADA_DIMENSION,resto);
            }
            else{
                actual.valor(ENTRADA_PLUS_DIMENSION,resto);
            }
        }

        return actual;
    }

    public JsonNode tipoBase(JsonNode typeName) {
        JsonNode actual = typeName;

        while(actual != null && !actual.isNull() && txt(actual,AST_NODE_TYPE).equals(TYPE_ARRAY)){
            actual = actual.get(AST_BASE_TYPE);
        }

        return actual;
    }
}
