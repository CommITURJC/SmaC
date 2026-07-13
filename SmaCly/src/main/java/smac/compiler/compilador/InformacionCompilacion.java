package smac.compiler.compilador;

/*
INFO: Clase para guardar los mensajes de errores y los warnings que genera el compilador tras compilar el contrato
*/

public class InformacionCompilacion {

    private String origen; // Archivo o fuente del mensaje
    private String tipo; // Tipo interno del compilador
    private String claseMensaje; // error / warning / info
    private String mensajeFormateado; // Mensaje completo formateado

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getClaseMensaje() {
        return claseMensaje;
    }

    public void setClaseMensaje(String claseMensaje) {
        this.claseMensaje = claseMensaje;
    }

    public String getMensaje() {
        return mensajeFormateado;
    }

    public void setMensaje(String mensajeFormateado) {
        this.mensajeFormateado = mensajeFormateado;
    }
}