package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de contratos normales y abstractos
*/

public class ParserContratoNormal extends ParserComun {

    private static final String BLOQUE_CONTRACT = "contract";
    private static final String BLOQUE_ABSTRACT = "abstract_contract";
    private static final String BLOQUE_PADRE = "contract_father";

    private static final String ENTRADA_PADRES = "namecontractfather";
    private static final String ENTRADA_ELEMENTOS = "contract_elements";

    private static final String AST_FUNCTION = "FunctionDefinition";
    private static final String AST_VARIABLE = "VariableDeclaration";
    private static final String AST_ERROR_DEFINITION = "ErrorDefinition";
    private static final String AST_EVENT = "EventDefinition";
    private static final String AST_MODIFIER = "ModifierDefinition";
    private static final String AST_STRUCT = "StructDefinition";
    private static final String AST_ENUM = "EnumDefinition";
    private static final String AST_USING = "UsingForDirective";

    private ParserHerencia parserHerencia = new ParserHerencia();
    private ParserFunciones parserFunciones = new ParserFunciones();
    private ParserVariables parserVariables = new ParserVariables();
    private ParserEventos parserEventos = new ParserEventos();
    private ParserModificadores parserModificadores = new ParserModificadores();
    private ParserStructs parserStructs = new ParserStructs();
    private ParserEnums parserEnums = new ParserEnums();
    private ParserUsing parserUsing = new ParserUsing();
    private ParserParametros parserParametros = new ParserParametros();
    private static final String ENTRADA_PARAMS = "inputparams";
    private static final String AST_PARAMETERS = "parameters";

    public Bloque parsear(JsonNode nodo,boolean abstracto) {
        Bloque b;

        if(abstracto){
            b = new Bloque(BLOQUE_ABSTRACT);
        }
        else{
            b = new Bloque(BLOQUE_CONTRACT);
        }

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        Bloque padres = parserHerencia.parsearContratos(nodo);
        if(padres != null){
            b.valor(ENTRADA_PADRES,padres);
        }

        List<Bloque> elementos = new ArrayList<>();
        JsonNode hijos = nodo.get(AST_NODES);

        if(hijos != null && hijos.isArray()){
            for(JsonNode h:hijos){
                Bloque aux = elemento(h,abstracto);
                if(aux != null){
                    elementos.add(aux);
                }
            }
        }

        if(elementos.size() > 0){
            b.sentencia(ENTRADA_ELEMENTOS,unir(elementos));
        }

        return b;
    }

    private Bloque elemento(JsonNode nodo,boolean abstracto) {
        String tipo = txt(nodo,AST_NODE_TYPE);

        if(tipo.equals(AST_FUNCTION)){
            return parserFunciones.parsear(nodo,false,abstracto);
        }
        else if(tipo.equals(AST_VARIABLE)){
            return parserVariables.parsear(nodo);
        }
        else if(tipo.equals(AST_EVENT)){
            return parserEventos.parsear(nodo);
        }
        else if(tipo.equals(AST_MODIFIER)){
            return parserModificadores.parsear(nodo);
        }
        else if(tipo.equals(AST_STRUCT)){
            return parserStructs.parsear(nodo);
        }
        else if(tipo.equals(AST_ENUM)){
            return parserEnums.parsear(nodo);
        }
        else if(tipo.equals(AST_USING)){
            return parserUsing.parsear(nodo);
        }
        else if(tipo.equals(AST_ERROR_DEFINITION)){
            return errorDefinition(nodo);
        }

        return null;
    }

    private Bloque errorDefinition(JsonNode nodo){
        Bloque bloque = new Bloque("error_definition");
        bloque.campo("name", txt(nodo, AST_NAME));
        JsonNode parametros = nodo.get("parameters");
        if(parametros != null && !parametros.isNull()){
             Bloque params = parserParametros.inputParams(nodo.path(AST_PARAMETERS).path(AST_PARAMETERS));
                if(params != null){
                    bloque.valor(ENTRADA_PARAMS,params);
                }
        }
        return bloque;
    }
}
