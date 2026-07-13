package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de enums
*/

public class ParserEnums extends ParserComun {

    private static final String AST_MEMBERS = "members";

    public Bloque parsear(JsonNode nodo) {
        Bloque b = new Bloque("enum");

        b.campo(AST_NAME,txt(nodo,AST_NAME));

        List<Bloque> valores = new ArrayList<>();
        JsonNode miembros = nodo.get(AST_MEMBERS);

        if(miembros != null && miembros.isArray()){
            for(JsonNode m:miembros){
                valores.add(new Bloque("enum_value").campo("value_enum",txt(m,AST_NAME)));
            }
        }

        if(valores.size() > 0){
            b.sentencia("values_enum",unir(valores));
        }

        return b;
    }
}
