package smac.compiler.compilador;

import java.util.List;

/*
INFO: Devuelve el resultado de la compilación de los contratos que se han compilado y toda la información generada en el proceso
*/

public class SalidaCompilacion {

    private Boolean resultadoCompilacion; // Indica si la compilación ha sido correcta
    private List<Contrato> contratosCompilados; // Lista de contratos compilados
    private List<InformacionCompilacion> informacion; // Errores y warnings

    public Boolean getResultadoCompilacion() {
        return resultadoCompilacion;
    }

    public void setResultadoCompilacion(Boolean exito) {
        this.resultadoCompilacion = exito;
    }

    public List<Contrato> getContratos() {
        return contratosCompilados;
    }

    public void setContratos(List<Contrato> contratos) {
        this.contratosCompilados = contratos;
    }

    public List<InformacionCompilacion> getInformacion() {
        return informacion;
    }

    public void setInformacion(List<InformacionCompilacion> informacion) {
        this.informacion = informacion;
    }
}