package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

/*
INFO: Parser de tipos
*/

public class ParserTipos extends ParserComun {

    private static final String BLOQUE_TYPE_UINT = "type_uint";
    private static final String BLOQUE_PAYABLE = "block_payable";
    private static final String BLOQUE_TYPE_INT = "type_int";
    private static final String BLOQUE_TYPE_BOOL = "type_bool";
    private static final String BLOQUE_TYPE_TEXT = "type_text";
    private static final String BLOQUE_TYPE_ADDRESS = "type_address";
    private static final String BLOQUE_TYPE_BYTE = "type_byte";
    private static final String BLOQUE_TYPE_MAPPING = "type_mapping";
    private static final String BLOQUE_TYPE_USER = "type_User";
    private static final String BLOQUE_TYPE_COMPANY = "type_Company";
    private static final String BLOQUE_TYPE_IDENTIFIER = "type_identifier";

    private static final String CAMPO_UINT = "uint_options";
    private static final String CAMPO_PAYABLE = "payable_options";
    private static final String CAMPO_INT = "int_options";
    private static final String CAMPO_BOOL = "bool_options";
    private static final String CAMPO_TEXT = "typetext_options";
    private static final String CAMPO_ADDRESS = "address_options";
    private static final String CAMPO_BYTES = "bytes_options";
    private static final String CAMPO_USER = "user_options";
    private static final String CAMPO_COMPANY = "company_options";
    private static final String CAMPO_IDENTIFIER = "identifier_options";

    private static final String ENTRADA_KEY = "key";
    private static final String ENTRADA_VALUE = "value";

    public Bloque tipoBloque(JsonNode nodo) {
        String tipo = nombreTipoSeguro(nodo);

        if(tipo.startsWith("uint")){
            return new Bloque(BLOQUE_TYPE_UINT).campo(CAMPO_UINT,tipo);
        }
        else if(tipo.startsWith("payable")){
            return new Bloque(BLOQUE_PAYABLE).campo(CAMPO_PAYABLE,tipo);
        }
        else if(tipo.startsWith("int")){
            return new Bloque(BLOQUE_TYPE_INT).campo(CAMPO_INT,tipo);
        }
        else if(tipo.equals("bool")){
            return new Bloque(BLOQUE_TYPE_BOOL).campo(CAMPO_BOOL,tipo);
        }
        else if(tipo.equals("string") || tipo.equals("char")){
            return tipoLibre(tipo);
        }
        else if(tipo.equals("address")){
            return new Bloque(BLOQUE_TYPE_ADDRESS).campo(CAMPO_ADDRESS,tipo);
        }
        else if(tipo.equals("address payable")){
            return tipoLibre(tipo);
        }
        else if(tipo.equals("bytes") || tipo.startsWith("bytes") || tipo.equals("byte")){
            return new Bloque(BLOQUE_TYPE_BYTE).campo(CAMPO_BYTES,tipo);
        }
        else if(tipo.equals("User")){
            return new Bloque(BLOQUE_TYPE_USER).campo(CAMPO_USER,"User");
        }
        else if(tipo.equals("Company")){
            return new Bloque(BLOQUE_TYPE_COMPANY).campo(CAMPO_COMPANY,"Company");
        }

        String nodeType = txt(nodo,AST_NODE_TYPE);
        if(nodeType.equals(TYPE_MAPPING)){
            Bloque b = new Bloque(BLOQUE_TYPE_MAPPING);
            b.valor(ENTRADA_KEY,tipoBloque(nodo.get(AST_KEY_TYPE)));
            b.valor(ENTRADA_VALUE,tipoBloque(nodo.get(AST_VALUE_TYPE)));
            return b;
        }

        return tipoLibre(tipo);
    }

    public Bloque tipoLibre(String tipo) {
        if(tipo == null){
            tipo = "";
        }

        return new Bloque(BLOQUE_TYPE_IDENTIFIER).campo(CAMPO_IDENTIFIER,tipo);
    }

    /*
PARÁMETRO DE ENTRADA: Nodo JSON que representa un tipo Solidity
DESCRIPCIÓN: Obtiene el nombre del tipo evitando convertir objetos JSON completos a String. Permite detectar tipos definidos por el usuario como enums, structs o contratos
PARÁMETRO DE SALIDA: Nombre del tipo detectado
*/
private String nombreTipoSeguro(JsonNode nodo) {
    if(nodo == null || nodo.isNull()){
        return "";
    }

    String nodeType = txtSeguro(nodo,AST_NODE_TYPE);

    if(nodeType.equals("ElementaryTypeName")){
        return txtSeguro(nodo,"name");
    }
    else if(nodeType.equals("UserDefinedTypeName")){
        String nombre = txtSeguro(nodo,"name");

        if(nombre != null && !nombre.equals("")){
            return nombre;
        }

        JsonNode pathNode = nodo.get("pathNode");

        if(pathNode != null && !pathNode.isNull()){
            nombre = txtSeguro(pathNode,"name");

            if(nombre != null && !nombre.equals("")){
                return nombre;
            }
        }

        JsonNode typeDescriptions = nodo.get("typeDescriptions");

        if(typeDescriptions != null && !typeDescriptions.isNull()){
            nombre = txtSeguro(typeDescriptions,"typeString");

            if(nombre != null && !nombre.equals("")){
                return limpiarTipoDefinido(nombre);
            }
        }

        return "";
    }
    else if(nodeType.equals("Mapping")){
        return "mapping";
    }
    else if(nodeType.equals("ArrayTypeName")){
        return nombreTipoSeguro(nodo.get("baseType")) + "[]";
    }

    String tipo = nombreTipo(nodo);

    if(tipo == null){
        return "";
    }

    return tipo;
}

/*
PARÁMETRO DE ENTRADA: Nodo JSON y nombre del campo que se quiere leer
DESCRIPCIÓN: Lee un campo de texto de forma segura evitando convertir objetos o arrays a String
PARÁMETRO DE SALIDA: Texto del campo o cadena vacía
*/
private String txtSeguro(JsonNode nodo,String campo) {
    if(nodo == null || nodo.isNull()){
        return "";
    }

    if(!nodo.has(campo)){
        return "";
    }

    JsonNode valor = nodo.get(campo);

    if(valor == null || valor.isNull()){
        return "";
    }

    if(valor.isObject() || valor.isArray()){
        return "";
    }

    return valor.asString();
}

/*
PARÁMETRO DE ENTRADA: Texto del tipo devuelto por solc
DESCRIPCIÓN: Limpia nombres de tipos definidos por el usuario para quedarse con el nombre simple
PARÁMETRO DE SALIDA: Nombre limpio del tipo
*/
private String limpiarTipoDefinido(String tipo) {
    if(tipo == null){
        return "";
    }

    if(tipo.startsWith("enum ")){
        return tipo.replace("enum ","").trim();
    }
    else if(tipo.startsWith("struct ")){
        return tipo.replace("struct ","").trim();
    }
    else if(tipo.startsWith("contract ")){
        return tipo.replace("contract ","").trim();
    }

    return tipo.trim();
}

}
