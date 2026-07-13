package smac.compiler.compilador;

/*
INFO: Clase para guardar de forma temporal los datos del contrato ya compilado 
*/

public class Contrato {

    private String nombre; //NOMBRE DEL CONTRATO
    private Object abicode; //PARA GUARDAR LA INFO DEL CONTRATO DE CARA A OTRAS APPS PARA QUE HAGAN USO DE EL 
    private String bytecode; //CODIGO DEL CONTRATO POST-COMPILADO
    private String bytecodeDesplegado; //CODIGO DEL CONTRATO DESPLEGADO
    private String metadata;

    public String getNombreContrato() {
        return nombre;
    }

    public void setNombreContrato(String nombreContrato) {
        this.nombre = nombreContrato;
    }

    public Object getAbi() {
        return abicode;
    }

    public void setAbi(Object abi) {
        this.abicode = abi;
    }

    public String getBytecode() {
        return bytecode;
    }

    public void setBytecode(String bytecode) {
        this.bytecode = bytecode;
    }

    public String getBytecodeDesplegado() {
        return bytecodeDesplegado;
    }

    public void setBytecodeDesplegado(String bytecodeDesplegado) {
        this.bytecodeDesplegado = bytecodeDesplegado;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
}
