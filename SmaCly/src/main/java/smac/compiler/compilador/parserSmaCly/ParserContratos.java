package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

/*
INFO: Decide si el ContractDefinition es contrato, interfaz o libreria
*/

public class ParserContratos extends ParserComun {

    private static final String AST_CONTRACT_KIND = "contractKind";
    private static final String AST_INTERFACE = "interface";
    private static final String AST_LIBRARY = "library";
    private static final String AST_ABSTRACT = "abstract";

    private ParserInterfaces parserInterfaces = new ParserInterfaces();
    private ParserLibrerias parserLibrerias = new ParserLibrerias();
    private ParserContratoNormal parserContratoNormal = new ParserContratoNormal();

    public Bloque parsear(JsonNode nodo) {
        String tipo = txt(nodo,AST_CONTRACT_KIND);

        if(tipo.equals(AST_INTERFACE)){
            return parserInterfaces.parsear(nodo);
        }
        else if(tipo.equals(AST_LIBRARY)){
            return parserLibrerias.parsear(nodo);
        }
        else{
            boolean abs = false;

            if(nodo.has(AST_ABSTRACT)){
                abs = nodo.get(AST_ABSTRACT).asBoolean();
            }

            if(abs){
                return parserContratoNormal.parsear(nodo,true);
            }
            else{
                return parserContratoNormal.parsear(nodo,false);
            }
        }
    }
}
