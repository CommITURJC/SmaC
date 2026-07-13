package smac.compiler.compilador.e3value;
import smac.compiler.compilador.PeticionCompilar;
import java.util.Map;

public class SolicitudConvertirE3Value extends PeticionCompilar {

    private String contratoElegido;
    private Map<String, String> tiposEventos;
    private Map<String, String> objetosValorVuelta;

    public String getContratoElegido() {
        return contratoElegido;
    }

    public void setContratoElegido(String contratoElegido) {
        this.contratoElegido = contratoElegido;
    }

    public Map<String, String> getTiposEventos() {
        return tiposEventos;
    }

    public void setTiposEventos(Map<String, String> tiposEventos) {
        this.tiposEventos = tiposEventos;
    }

    public Map<String, String> getObjetosValorVuelta() {
        return objetosValorVuelta;
    }

    public void setObjetosValorVuelta(Map<String, String> objetosValorVuelta) {
        this.objetosValorVuelta = objetosValorVuelta;
    }
}