package smac.compiler.compilador.parserSmaCly;

import java.util.ArrayList;
import java.util.List;

public class ResultadoAnalisisSolidity {

    private Boolean correcto = true;
    private List<MensajeAnalisisSolidity> mensajes = new ArrayList<>();

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Dice si el contrato esta bien para pasarlo a bloques
    PARÁMETRO DE SALIDA: true si esta bien, false si tiene algun problema
    */
    public Boolean getCorrecto() {
        return correcto;
    }

    /*
    PARÁMETRO DE ENTRADA: Recibe un boolean que indica si el elemento esta en el orden correcto o no
    DESCRIPCIÓN: Cambia si el analisis esta bien o no
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setCorrecto(Boolean correcto) {
        this.correcto = correcto;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve los mensajes que se han creado al analizar el contrato
    PARÁMETRO DE SALIDA: Lista de mensajes
    */
    public List<MensajeAnalisisSolidity> getMensajes() {
        return mensajes;
    }

    /*
    PARÁMETRO DE ENTRADA: Lista de mensajes
    DESCRIPCIÓN: Cambia la lista de mensajes del analisis
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setMensajes(List<MensajeAnalisisSolidity> mensajes) {
        this.mensajes = mensajes;
    }

    /*
    PARÁMETRO DE ENTRADA: El elemento que está en una mala posición según el patrón, mensaje y solucion
    DESCRIPCIÓN: Añade un error y marca el analisis como incorrecto
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void addError(String elemento,String mensaje,String solucion) {
        correcto = false;
        mensajes.add(new MensajeAnalisisSolidity("error",elemento,mensaje,solucion));
    }

    /*
    PARÁMETRO DE ENTRADA: El elemento que está en una mala posición según el patrón, mensaje y solucion
    DESCRIPCIÓN: Añade un aviso, pero no bloquea la conversion
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void addWarning(String elemento,String mensaje,String solucion) {
        mensajes.add(new MensajeAnalisisSolidity("warning",elemento,mensaje,solucion));
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Junta todos los mensajes en un solo texto para enseñarlo al usuario
    PARÁMETRO DE SALIDA: Texto con los mensajes
    */
    public String unificarTexto() {
        String mensajeUnificado = "";
        for(MensajeAnalisisSolidity mensaje:mensajes){
            mensajeUnificado += "- " + mensaje.getMensaje();
            if(mensaje.getSolucion() != null && !mensaje.getSolucion().equals("")){
                mensajeUnificado += " SOLUTION : " + mensaje.getSolucion();
            }
            mensajeUnificado += "\n";
        }

        return mensajeUnificado;
    }
}