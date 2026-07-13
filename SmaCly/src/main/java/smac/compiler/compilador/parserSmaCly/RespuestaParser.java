package smac.compiler.compilador.parserSmaCly;


/*
INFO: Respuesta que devuelve el parser de Solidity a Blockly
*/

public class RespuestaParser {

    private Boolean correcto;
    private String xml;
    private String mensaje;

    public RespuestaParser() {
    }

    public RespuestaParser(Boolean correcto,String xml,String mensaje) {
        this.correcto = correcto;
        this.xml = xml;
        this.mensaje = mensaje;
    }

    public Boolean getCorrecto() {
        return correcto;
    }

    public void setCorrecto(Boolean correcto) {
        this.correcto = correcto;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
