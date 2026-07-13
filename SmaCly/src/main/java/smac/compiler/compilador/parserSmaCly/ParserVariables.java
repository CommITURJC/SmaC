package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

/*
INFO: Parser de propiedades y variables
*/

public class ParserVariables extends ParserComun {

    private static final String AST_VISIBILITY = "visibility";
    private static final String AST_CONSTANT = "constant";
    private static final String AST_VALUE = "value";

    private static final String ENTRADA_ARRAY = "arraydimension";
    private static final String ENTRADA_VALUE_PROPERTY = "valueproperty";
    private static final String ENTRADA_ASSIGN = "value1_assignexpression";
    private static final String ENTRADA_KEY = "key";
    private static final String ENTRADA_VALUE = "value";

    private ParserExpresiones parserExpresiones = new ParserExpresiones();
    private ParserArrays parserArrays = new ParserArrays();
    private ParserTipos parserTipos = new ParserTipos();

    public Bloque parsear(JsonNode nodo) {
        JsonNode tipoNodo = nodo.get(AST_TYPE_NAME);
        JsonNode tipoBaseNodo = parserArrays.tipoBase(tipoNodo);
        String tipo = nombreTipoSeguro(tipoBaseNodo);
        String nombre = txt(nodo,AST_NAME);

        Bloque b;

        if(tipo.startsWith("uint") || tipo.startsWith("int")){
            b = new Bloque("number_property").campo("numbertype_property",normalizarNumero(tipo));
        }
        else if(tipo.equals("bool")){
            b = new Bloque("boolean_property");
        }
        else if(tipo.equals("string")){
            b = new Bloque("text_property").campo("type","string_type");
        }
        else if(tipo.startsWith("address")){
            b = new Bloque("address_property").campo("addresstype_values",tipo);
        }
        else if(tipo.startsWith("bytes") || tipo.equals("byte")){
            b = new Bloque("byte_property").campo("byte_type",tipo);
        }
        else if(txt(tipoBaseNodo,AST_NODE_TYPE).equals(TYPE_MAPPING)){
            b = new Bloque("mapping_property");
            b.valor(ENTRADA_KEY,parserTipos.tipoBloque(tipoBaseNodo.get(AST_KEY_TYPE)));
            b.valor(ENTRADA_VALUE,parserTipos.tipoBloque(tipoBaseNodo.get(AST_VALUE_TYPE)));
        }
        else if(tipo.equals("User")){
            b = new Bloque("user_property");
        }
        else if(tipo.equals("Company")){
            b = new Bloque("company_property");
        }
        else{
            b = new Bloque("identifier_property").campo("type",tipo);
        }

        b.campo(AST_NAME,nombre);
        b.campo("values_visibility",visibilidad(txt(nodo,AST_VISIBILITY)));

        if(nodo.has(AST_CONSTANT) && nodo.get(AST_CONSTANT).asBoolean()){
            b.campo("constant","TRUE");
        }
        else{
            b.campo("constant","FALSE");
        }

        Bloque array = parserArrays.dimensiones(tipoNodo);
        if(array != null){
            if(tipo.equals("User") || tipo.equals("Company")){
                b.valor("array_dimension",array);
            }
            else{
                b.valor(ENTRADA_ARRAY,array);
            }
        }

        JsonNode valor = nodo.get(AST_VALUE);
        if(valor != null && !valor.isNull()){
            Bloque asignacion = new Bloque("assing_value_expression1inputs");
            asignacion.campo("operators","=");
            asignacion.valor(ENTRADA_ASSIGN,parserExpresiones.parsear(valor));
            b.valor(ENTRADA_VALUE_PROPERTY,asignacion);
        }

        return b;
    }


    public Bloque parsearLocal(JsonNode nodo) {
        JsonNode tipoNodo = nodo.get(AST_TYPE_NAME);
        JsonNode tipoBaseNodo = parserArrays.tipoBase(tipoNodo);
        String tipo = nombreTipoSeguro(tipoBaseNodo);
        String nombre = txt(nodo,AST_NAME);

        Bloque b;

        if(tipo.startsWith("uint") || tipo.startsWith("int")){
            b = new Bloque("number_shortproperty").campo("numbertype_property",normalizarNumero(tipo));
        }
        else if(tipo.equals("bool")){
            b = new Bloque("boolean_shortproperty");
        }
        else if(tipo.equals("string")){
            b = new Bloque("text_shortproperty").campo("type","string_type");
        }
        else if(tipo.startsWith("address")){
            b = new Bloque("address_shortproperty").campo("addresstype_values",tipo);
        }
        else if(tipo.startsWith("bytes") || tipo.equals("byte")){
            b = new Bloque("byte_shortproperty").campo("byte_type",tipo);
        }
        else if(txt(tipoBaseNodo,AST_NODE_TYPE).equals(TYPE_MAPPING)){
            b = new Bloque("mapping_shortproperty");
            b.valor(ENTRADA_KEY,parserTipos.tipoBloque(tipoBaseNodo.get(AST_KEY_TYPE)));
            b.valor(ENTRADA_VALUE,parserTipos.tipoBloque(tipoBaseNodo.get(AST_VALUE_TYPE)));
        }
        else if(tipo.equals("User")){
            b = new Bloque("user_shortproperty");
        }
        else if(tipo.equals("Company")){
            b = new Bloque("company_shortproperty");
        }
        else{
            b = new Bloque("identifier_shortproperty").campo("type",tipo);
        }

        b.campo(AST_NAME,nombre);

        Bloque array = parserArrays.dimensiones(tipoNodo);
        if(array != null){
            b.valor(ENTRADA_ARRAY,array);
        }

        return b;
    }

    /*
    PARÁMETRO DE ENTRADA: Tipo numérico detectado en el AST
    DESCRIPCIÓN: Devuelve el tipo numérico sin perder el tamaño indicado en Solidity, por ejemplo uint64, uint128 o int256
    PARÁMETRO DE SALIDA: Tipo numérico que se usará en el bloque
    */
    private String normalizarNumero(String tipo) {
        if(tipo == null || tipo.equals("")){
            return "uint";
        }

        return tipo;
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

        String tipo = nombreTipoSeguro(nodo);

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
