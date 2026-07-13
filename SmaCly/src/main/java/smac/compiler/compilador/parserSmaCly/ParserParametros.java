package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de parametros de entrada y salida
*/

public class ParserParametros extends ParserComun {

    private static final String BLOQUE_INPUTPARAM = "inputparam";
    private static final String BLOQUE_INPUT_PARAM = "input_param";
    private static final String BLOQUE_OUTPUT_PARAM = "outputparam";
    private static final String BLOQUE_TUPLE = "tuple";
    private static final String BLOQUE_PARAM_EXPR = "inputparamshortidentifier";

    private static final String CAMPO_INDEXED = "indexed";
    private static final String CAMPO_STORAGE = "storagedata_values";

    private static final String ENTRADA_INPUTPARAMS = "inputparams";
    private static final String ENTRADA_TYPE = "type";
    private static final String ENTRADA_ARRAY = "arraydimension";
    private static final String ENTRADA_OUTPUT_TYPE = "value_type_outputparam";
    private static final String ENTRADA_VALUES = "values";

    private static final String AST_STORAGE_LOCATION = "storageLocation";

    private ParserTipos parserTipos = new ParserTipos();
    private ParserArrays parserArrays = new ParserArrays();

    public Bloque inputParams(JsonNode params) {
        List<Bloque> lista = new ArrayList<>();

        if(params != null && params.isArray()){
            for(JsonNode p:params){
                Bloque b = new Bloque(BLOQUE_INPUT_PARAM);
                b.campo(CAMPO_INDEXED,"TRUE");
                b.campo(CAMPO_STORAGE,storage(txt(p,AST_STORAGE_LOCATION)));
                b.campo(AST_NAME,txt(p,AST_NAME));

                JsonNode tipoBase = parserArrays.tipoBase(p.get(AST_TYPE_NAME));
                b.valor(ENTRADA_TYPE,parserTipos.tipoBloque(tipoBase));

                Bloque array = parserArrays.dimensiones(p.get(AST_TYPE_NAME));
                if(array != null){
                    b.valor(ENTRADA_ARRAY,array);
                }

                lista.add(b);
            }
        }

        if(lista.size() == 0){
            return null;
        }

        Bloque padre = new Bloque(BLOQUE_INPUTPARAM);
        padre.sentencia(ENTRADA_INPUTPARAMS,unir(lista));

        return padre;
    }

    /*
    PARÁMETRO DE ENTRADA: Lista de parámetros de salida de una función
    DESCRIPCIÓN: Convierte los parámetros de salida en bloques, incluyendo arrays y almacenamiento
    PARÁMETRO DE SALIDA: Bloque con los parámetros de salida
    */
    public Bloque outputParams(JsonNode params) {
        List<Bloque> lista = new ArrayList<>();

        if(params != null && params.isArray()){
            for(JsonNode p:params){
                Bloque b = new Bloque(BLOQUE_OUTPUT_PARAM);

                String almacenamiento = txt(p,AST_STORAGE_LOCATION);

                if(almacenamiento.equals(DEFAULT)){
                    almacenamiento = "";
                }

                b.campo(CAMPO_STORAGE,almacenamiento);
                b.campo(AST_NAME,txt(p,AST_NAME));

                JsonNode tipoNodo = p.get(AST_TYPE_NAME);
                JsonNode tipoBase = parserArrays.tipoBase(tipoNodo);

                b.valor(
                    ENTRADA_OUTPUT_TYPE,
                    parserTipos.tipoBloque(tipoBase)
                );

                Bloque array = parserArrays.dimensiones(tipoNodo);

                if(array != null){
                    b.valor(ENTRADA_ARRAY,array);
                }

                lista.add(b);
            }
        }

        if(lista.size() == 0){
            return null;
        }

        if(lista.size() == 1){
            return lista.get(0);
        }

        Bloque tuple = new Bloque(BLOQUE_TUPLE);
        tuple.sentencia(ENTRADA_VALUES,unir(lista));

        return tuple;
    }

    
    public Bloque argumentos(JsonNode args) {
        List<Bloque> lista = new ArrayList<>();

        if(args != null && args.isArray()){
            ParserTipos tipos = new ParserTipos();
            ParserExpresiones expresiones = new ParserExpresiones();

            for(JsonNode a:args){
                Bloque b = new Bloque(BLOQUE_PARAM_EXPR);
                b.valor(ENTRADA_TYPE,tipos.tipoLibre(""));
                b.campo(AST_NAME,expresiones.codigo(a));
                lista.add(b);
            }
        }

        if(lista.size() == 0){
            return null;
        }

        Bloque padre = new Bloque(BLOQUE_INPUTPARAM);
        padre.sentencia(ENTRADA_INPUTPARAMS,unir(lista));

        return padre;
    }
}
