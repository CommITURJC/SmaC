package smac.compiler.compilador;

/*
INFO: Clase para guardar la entrada (el contrato) en formato JSON que se va pasar para compilar
*/


public class PeticionCompilar {

    private String codigoFuenteContrato;
    private String nombreArchivoContrato;
    private Boolean optimizadorActivo;
    private Integer ejecucionesOptimizador;

    public String getCodigoFuenteContrato() {
        return codigoFuenteContrato;
    }

    public void setCodigoFuenteContrato(String codigoFuenteContrato) {
        this.codigoFuenteContrato = codigoFuenteContrato;
    }

    public String getNombreArchivoContrato() {
        return nombreArchivoContrato;
    }

    public void setNombreArchivoContrato(String nombreArchivo) {
        this.nombreArchivoContrato = nombreArchivo;
    }

    public Boolean getOptimizadorActivo() {
        return optimizadorActivo;
    }

    public void setOptimizadorActivo(Boolean optimizadorActivo) {
        this.optimizadorActivo = optimizadorActivo;
    }

    public Integer getEjecucionesOptimizador() {
        return ejecucionesOptimizador;
    }

    public void setEjecucionesOptimizador(Integer ejecucionesOptimizador) {
        this.ejecucionesOptimizador = ejecucionesOptimizador;
    }
}
