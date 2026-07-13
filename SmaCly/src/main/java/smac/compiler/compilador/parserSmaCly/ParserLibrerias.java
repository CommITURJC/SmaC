package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de librerias
*/

public class ParserLibrerias extends ParserComun {

    private static final String BLOQUE_LIBRARY = "library";
    private static final String ENTRADA_FUNCIONES = "functions_library";

    private static final String AST_FUNCTION = "FunctionDefinition";
    private static final String AST_VARIABLE = "VariableDeclaration";
    private static final String AST_STRUCT = "StructDefinition";
    private static final String AST_ENUM = "EnumDefinition";

    private ParserFunciones parserFunciones = new ParserFunciones();
    private ParserVariables parserVariables = new ParserVariables();
    private ParserStructs parserStructs = new ParserStructs();
    private ParserEnums parserEnums = new ParserEnums();

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_LIBRARY);

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        List<Bloque> elementos = new ArrayList<>();
        JsonNode hijos = nodo.get(AST_NODES);

        if(hijos != null && hijos.isArray()){
            for(JsonNode h:hijos){
                String tipo = txt(h,AST_NODE_TYPE);

                if(tipo.equals(AST_FUNCTION)){
                    Bloque aux = parserFunciones.parsear(h,false,false);
                    if(aux != null){
                        elementos.add(aux);
                    }
                }
                else if(tipo.equals(AST_VARIABLE)){
                    Bloque aux = parserVariables.parsear(h);
                    if(aux != null){
                        elementos.add(aux);
                    }
                }
                else if(tipo.equals(AST_STRUCT)){
                    Bloque aux = parserStructs.parsear(h);
                    if(aux != null){
                        elementos.add(aux);
                    }
                }
                else if(tipo.equals(AST_ENUM)){
                    Bloque aux = parserEnums.parsear(h);
                    if(aux != null){
                        elementos.add(aux);
                    }
                }
            }
        }

        if(elementos.size() > 0){
            b.sentencia(ENTRADA_FUNCIONES,unir(elementos));
        }

        return b;
    }
}
