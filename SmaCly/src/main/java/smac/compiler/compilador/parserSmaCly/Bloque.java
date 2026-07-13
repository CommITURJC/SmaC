package smac.compiler.compilador.parserSmaCly;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Clase para crear la estructura XML de un bloque para SmaCly. 
*/

public class Bloque {

    private String tipo;//TIPPO DEL BLOQUE QUE SE ESTÁ PROCESANDO
    private List<Campo> campos = new ArrayList<>();//LOS CAMPOS DEL BLOQUE QUE ES DONDE SE METE EL TEXTO
    private List<Entrada> entradas = new ArrayList<>();
    private Bloque siguiente;

    public Bloque(String tipo) {
        this.tipo = tipo;
    }

    public Bloque campo(String nombre,String valor) {
        if(valor == null){
            valor = "";
        }
        campos.add(new Campo(nombre,valor));
        return this;
    }

    public Bloque valor(String nombre,Bloque bloque) {
        if(bloque != null){
            entradas.add(new Entrada("value",nombre,bloque));
        }
        return this;
    }

    /*
    PARÁMETRO DE ENTRADA: El nombre del bloque contenido dentro del CONTENEDOR que se encuentra procesando en ese momento y el bloque contenido (hijo) que se procesa como sentencia
    DESCRIPCIÓN: Añade al bloque el contenedor
    */
    public Bloque sentencia(String nombre,Bloque bloque) {
        if(bloque != null){
            entradas.add(new Entrada("statement",nombre,bloque));
        }

        return this;
    }

    /*
    PARÁMETRO DE ENTRADA: El bloque siguiente que conecta al bloque que se está procesando
    DESCRIPCIÓN: Añade a la propiedad siguiente el bloque que le sucede (El que se engancha con este)
    */
    public Bloque sig(Bloque bloque) {
        siguiente = bloque;
        return this;
    }

    public String xml(int espacios) {
        String tab = espacios(espacios);
        String tab2 = espacios(espacios + 2);

        StringBuilder s = new StringBuilder();

        s.append(tab).append("<block type=\"").append(parsearCaracteresXML(tipo)).append("\">\n");

        for(Campo c:campos){
            s.append(tab2)
             .append("<field name=\"")
             .append(parsearCaracteresXML(c.nombre))
             .append("\">")
             .append(parsearCaracteresXML(c.valor))
             .append("</field>\n");
        }

        for(Entrada e:entradas){
            s.append(tab2)
             .append("<")
             .append(e.tipo)
             .append(" name=\"")
             .append(parsearCaracteresXML(e.nombre))
             .append("\">\n");

            s.append(e.bloque.xml(espacios + 4));

            s.append(tab2)
             .append("</")
             .append(e.tipo)
             .append(">\n");
        }

        if(siguiente != null){
            s.append(tab2).append("<next>\n");
            s.append(siguiente.xml(espacios + 4));
            s.append(tab2).append("</next>\n");
        }

        s.append(tab).append("</block>\n");

        return s.toString();
    }

    private String espacios(int n) {
        String texto = "";
        for(int i = 0;i < n;i++){
            texto += " ";
        }
        return texto;
    }

    private String parsearCaracteresXML(String texto) {
        if(texto == null){
            return "";
        }
        String nuevo = "";
        for(int i = 0;i < texto.length();i++){
            char c = texto.charAt(i);
            if(c == '&'){
                nuevo += "&amp;";
            }
            else if(c == '"'){
                nuevo += "&quot;";
            }
            else if(c == '<'){
                nuevo += "&lt;";
            }
            else if(c == '>'){
                nuevo += "&gt;";
            }
            else{
                nuevo += c;
            }
        }
        return nuevo;
    }

    private static class Campo {
        String nombre;
        String valor;
        Campo(String nombre,String valor) {
            this.nombre = nombre;this.valor = valor;
        }
    }

    private static class Entrada {
        String tipo;
        String nombre;
        Bloque bloque;
        Entrada(String tipo,String nombre,Bloque bloque) {
            this.tipo = tipo;
            this.nombre = nombre;
            this.bloque = bloque;
        }
    }
}
