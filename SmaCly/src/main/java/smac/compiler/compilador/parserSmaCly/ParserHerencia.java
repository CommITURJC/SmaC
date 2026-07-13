package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser comun para herencia de contratos e interfaces.
Estos bloques no se encadenan con next, sino con value interno.
*/

public class ParserHerencia extends ParserComun {

    private static final String AST_BASE_CONTRACTS = "baseContracts";
    private static final String AST_BASE_NAME = "baseName";

    private static final String BLOQUE_CONTRACT_FATHER = "contract_father";
    private static final String BLOQUE_INTERFACE_FATHER = "interface_father";

    private static final String ENTRADA_CONTRACTS_INHERIT = "contracts_inherit";
    private static final String ENTRADA_INTERFACE_INHERIT = "interface_inherit";

    public Bloque parsearContratos(JsonNode nodo) {
        List<String> nombres = nombresPadres(nodo);
        return crearCadena(nombres,BLOQUE_CONTRACT_FATHER,ENTRADA_CONTRACTS_INHERIT);
    }

    public Bloque parsearInterfaces(JsonNode nodo) {
        List<String> nombres = nombresPadres(nodo);
        return crearCadena(nombres,BLOQUE_INTERFACE_FATHER,ENTRADA_INTERFACE_INHERIT);
    }

    private List<String> nombresPadres(JsonNode nodo) {
        List<String> lista = new ArrayList<>();

        JsonNode padres = nodo.get(AST_BASE_CONTRACTS);
        if(padres != null && padres.isArray()){
            for(JsonNode p:padres){
                String nombre = nombreTipo(p.get(AST_BASE_NAME));

                if(!nombre.equals("")){
                    lista.add(nombre);
                }
            }
        }

        return lista;
    }

    private Bloque crearCadena(List<String> nombres,String tipoBloque,String entrada) {
        if(nombres == null || nombres.size() == 0){
            return null;
        }

        Bloque primero = null;
        Bloque anterior = null;

        for(int i = 0;i < nombres.size();i++){
            Bloque actual = new Bloque(tipoBloque);
            actual.campo(AST_NAME,nombres.get(i));

            if(primero == null){
                primero = actual;
            }

            if(anterior != null){
                anterior.valor(entrada,actual);
            }

            anterior = actual;
        }

        return primero;
    }
}
