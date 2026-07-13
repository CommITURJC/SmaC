package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de structs
*/

public class ParserStructs extends ParserComun {

    private static final String AST_MEMBERS = "members";
    private static final String BLOQUE_USER = "block_user";
    private static final String BLOQUE_COMPANY = "block_company";

    private ParserVariables parserVariables = new ParserVariables();

    public Bloque parsear(JsonNode nodo) {
        String nombre = txt(nodo,AST_NAME);

        if(nombre.equals("User")){
            return predefinido(nodo,BLOQUE_USER,"user_personalized_values");
        }
        else if(nombre.equals("Company")){
            return predefinido(nodo,BLOQUE_COMPANY,"company_personalized_values");
        }

        Bloque b = new Bloque("personalized_struct");

        b.campo(AST_NAME,nombre);

        List<Bloque> props = propiedades(nodo);

        if(props.size() > 0){
            b.sentencia("properties_struct",unir(props));
        }

        return b;
    }

    private Bloque predefinido(JsonNode nodo,String tipoBloque,String entrada) {
        Bloque b = new Bloque(tipoBloque);

        List<Bloque> props = propiedades(nodo);

        if(props.size() > 0){
            b.sentencia(entrada,unir(props));
        }

        return b;
    }

    private List<Bloque> propiedades(JsonNode nodo) {
        List<Bloque> props = new ArrayList<>();
        JsonNode miembros = nodo.get(AST_MEMBERS);

        if(miembros != null && miembros.isArray()){
            for(JsonNode m:miembros){
                Bloque aux = parserVariables.parsear(m);
                if(aux != null){
                    props.add(aux);
                }
            }
        }

        return props;
    }
}
