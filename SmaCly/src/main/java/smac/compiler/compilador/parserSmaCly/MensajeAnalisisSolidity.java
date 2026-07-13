package smac.compiler.compilador.parserSmaCly;

public class MensajeAnalisisSolidity {

    private String tipo = "";
    private String elemento = "";
    private String mensaje = "";
    private String solucion = "";

    public MensajeAnalisisSolidity() {
    }

    /*
    PARÁMETRO DE ENTRADA: Tipo de mensaje, elemento, mensaje y la posible solucion planteada
    DESCRIPCIÓN: Crea un mensaje para indicar algo que se ha visto mal o raro en el contrato
    PARÁMETRO DE SALIDA: Ninguno
    */
    public MensajeAnalisisSolidity(String tipo,String elemento,String mensaje,String solucion) {
        this.tipo = tipo;
        this.elemento = elemento;
        this.mensaje = mensaje;
        this.solucion = solucion;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve el tipo de mensaje
    PARÁMETRO DE SALIDA: Tipo del mensaje
    */
    public String getTipo() {
        return tipo;
    }

    /*
    PARÁMETRO DE ENTRADA: Tipo del mensaje
    DESCRIPCIÓN: Modifica el tipo del que es el mensaje
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve el elemento que ha disparado el mensaje
    PARÁMETRO DE SALIDA: Elemento del contrato
    */
    public String getElemento() {
        return elemento;
    }

    /*
    PARÁMETRO DE ENTRADA: Elemento del contrato
    DESCRIPCIÓN: Devuelve el elemento que ha disparado el mensaje
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setElemento(String elemento) {
        this.elemento = elemento;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve el texto del mensaje
    PARÁMETRO DE SALIDA: Mensaje guardado
    */
    public String getMensaje() {
        return mensaje;
    }

    /*
    PARÁMETRO DE ENTRADA: Texto del mensaje
    DESCRIPCIÓN: Cambia el texto del mensaje
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve el mensaje con la solucion propuesta
    PARÁMETRO DE SALIDA: La solución propuesta
    */
    public String getSolucion() {
        return solucion;
    }

    /*
    PARÁMETRO DE ENTRADA: Recibe ubna solución propuesta
    DESCRIPCIÓN: Cambia la solución que se propone
    PARÁMETRO DE SALIDA: Ninguno
    */
    public void setSolucion(String solucion) {
        this.solucion = solucion;
    }
}