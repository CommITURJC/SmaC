package smac.compiler.compilador.parserSmaCly;

import tools.jackson.databind.JsonNode;

import java.util.List;

/*
INFO: Funciones comunes de los parsers
*/

public class ParserComun {

    protected static final String AST_NODE_TYPE = "nodeType";
    protected static final String AST_NAME = "name";
    protected static final String AST_NODES = "nodes";
    protected static final String AST_TYPE_NAME = "typeName";
    protected static final String AST_TYPE_DESCRIPTIONS = "typeDescriptions";
    protected static final String AST_TYPE_STRING = "typeString";
    protected static final String AST_BASE_TYPE = "baseType";
    protected static final String AST_KEY_TYPE = "keyType";
    protected static final String AST_VALUE_TYPE = "valueType";
    protected static final String AST_PATH_NODE = "pathNode";

    protected static final String TYPE_ELEMENTARY = "ElementaryTypeName";
    protected static final String TYPE_USER_DEFINED = "UserDefinedTypeName";
    protected static final String TYPE_ARRAY = "ArrayTypeName";
    protected static final String TYPE_MAPPING = "Mapping";
    protected static final String TYPE_IDENTIFIER_PATH = "IdentifierPath";

    protected static final String DEFAULT = "default";
    protected static final String PUBLIC = "public";
    protected static final String MEMORY = "memory";
    protected static final String NONPAYABLE = "nonpayable";

    protected String txt(JsonNode nodo,String campo) {
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
    
    protected String txtArray(JsonNode nodo,String campo) {
        String texto = "";

        if(nodo == null || nodo.isNull()){
            return texto;
        }

        JsonNode valor = nodo.get(campo);
        if(valor != null && valor.isArray()){
            for(JsonNode n:valor){
                texto += n.asString();
            }
        }

        return texto;
    }

    protected String num(String texto) {
        if(texto == null){
            return "0";
        }

        String limpio = "";

        for(int i = 0;i < texto.length();i++){
            char c = texto.charAt(i);

            if(c >= '0' && c <= '9'){
                limpio += c;
            }
        }

        if(limpio.equals("")){
            return "0";
        }

        return limpio;
    }

    protected String visibilidad(String v) {
        if(v == null || v.equals("") || v.equals(DEFAULT)){
            return PUBLIC;
        }

        return v;
    }

    protected String mutabilidad(String m) {
        if(m == null || m.equals("") || m.equals(NONPAYABLE)){
            return "";
        }

        return m;
    }

    protected String storage(String s) {
        if(s == null || s.equals("") || s.equals(DEFAULT)){
            return MEMORY;
        }

        return s;
    }

    protected Bloque unir(List<Bloque> lista) {
        if(lista == null || lista.size() == 0){
            return null;
        }

        for(int i = 0;i < lista.size() - 1;i++){
            lista.get(i).sig(lista.get(i + 1));
        }

        return lista.get(0);
    }

    protected String nombreTipo(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }
        String tipo = txt(nodo,AST_NODE_TYPE);
        if(tipo.equals(TYPE_ELEMENTARY)){
            return txt(nodo,AST_NAME);
        }
        else if(tipo.equals(TYPE_USER_DEFINED)){
            String nombre = txt(nodo,AST_NAME);

            if(!nombre.equals("")){
                return nombre;
            }

            JsonNode pathNode = nodo.get(AST_PATH_NODE);

            if(pathNode != null && !pathNode.isNull()){
                nombre = txt(pathNode,AST_NAME);

                if(!nombre.equals("")){
                    return nombre;
                }
            }

            JsonNode desc = nodo.get(AST_TYPE_DESCRIPTIONS);

            if(desc != null && desc.has(AST_TYPE_STRING)){
                nombre = desc.get(AST_TYPE_STRING).asString();

                if(empiezaPor(nombre,"contract ")){
                    return quitarInicio(nombre,9);
                }

                return nombre;
            }

            return "";
        }
        else if(tipo.equals(TYPE_ARRAY)){
            return nombreTipo(nodo.get(AST_BASE_TYPE)) + "[]";
        }
        else if(tipo.equals(TYPE_MAPPING)){
            return "mapping(" + nombreTipo(nodo.get(AST_KEY_TYPE)) + " => " + nombreTipo(nodo.get(AST_VALUE_TYPE)) + ")";
        }
        else if(tipo.equals(TYPE_IDENTIFIER_PATH)){
            return txt(nodo,AST_NAME);
        }

        JsonNode desc = nodo.get(AST_TYPE_DESCRIPTIONS);

        if(desc != null && desc.has(AST_TYPE_STRING)){
            return desc.get(AST_TYPE_STRING).asString();
        }

        return "";
    }
    protected boolean empiezaPor(String texto,String inicio) {
        if(texto == null || inicio == null){
            return false;
        }

        if(texto.length() < inicio.length()){
            return false;
        }

        for(int i = 0;i < inicio.length();i++){
            if(texto.charAt(i) != inicio.charAt(i)){
                return false;
            }
        }

        return true;
    }

    protected boolean terminaPor(String texto,String fin) {
        if(texto == null || fin == null){
            return false;
        }

        if(texto.length() < fin.length()){
            return false;
        }

        int pos = texto.length() - fin.length();

        for(int i = 0;i < fin.length();i++){
            if(texto.charAt(pos + i) != fin.charAt(i)){
                return false;
            }
        }

        return true;
    }

    protected String quitarInicio(String texto,int cantidad) {
        String nuevo = "";

        if(texto == null){
            return nuevo;
        }

        for(int i = cantidad;i < texto.length();i++){
            nuevo += texto.charAt(i);
        }

        return nuevo;
    }

    protected String quitarCaracter(String texto,char caracter) {
        String nuevo = "";

        if(texto == null){
            return nuevo;
        }

        for(int i = 0;i < texto.length();i++){
            char c = texto.charAt(i);

            if(c != caracter){
                nuevo += c;
            }
        }

        return nuevo;
    }

    protected String[] partir(String texto,char separador) {
        java.util.ArrayList<String> lista = new java.util.ArrayList<>();
        String actual = "";

        if(texto == null){
            return new String[0];
        }

        for(int i = 0;i < texto.length();i++){
            char c = texto.charAt(i);

            if(c == separador){
                lista.add(actual);
                actual = "";
            }
            else{
                actual += c;
            }
        }

        lista.add(actual);

        String[] salida = new String[lista.size()];
        for(int i = 0;i < lista.size();i++){
            salida[i] = lista.get(i);
        }

        return salida;
    }
}
