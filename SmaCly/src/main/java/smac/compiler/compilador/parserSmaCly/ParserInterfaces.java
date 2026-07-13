package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de interfaces
*/

public class ParserInterfaces extends ParserComun {

    private static final String BLOQUE_INTERFACE = "interface";
    private static final String BLOQUE_PADRE = "interface_father";

    private static final String ENTRADA_PADRES = "nameinterfacefather";
    private static final String ENTRADA_FUNCIONES = "interface_functions";

    private static final String AST_FUNCTION = "FunctionDefinition";
    private static final String AST_EVENT = "EventDefinition";

    private ParserHerencia parserHerencia = new ParserHerencia();
    private ParserFunciones parserFunciones = new ParserFunciones();
    private ParserEventos parserEventos = new ParserEventos();

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque(BLOQUE_INTERFACE);

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        Bloque padres = parserHerencia.parsearInterfaces(nodo);
        if(padres != null){
            b.valor(ENTRADA_PADRES,padres);
        }

        List<Bloque> elementos = new ArrayList<>();
        JsonNode hijos = nodo.get(AST_NODES);

        if(hijos != null && hijos.isArray()){
            for(JsonNode h:hijos){
                String tipo = txt(h,AST_NODE_TYPE);

                if(tipo.equals(AST_FUNCTION)){
                    Bloque aux = parserFunciones.parsear(h,true,false);
                    if(aux != null){
                        elementos.add(aux);
                    }
                }
                else if(tipo.equals(AST_EVENT)){
                    Bloque aux = parserEventos.parsear(h);
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
