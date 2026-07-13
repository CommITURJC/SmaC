package smac.compiler.compilador.mongo;

public class SolicitudRegistroWorkspace {

    private String nombreWorkspace;
    private String workspaceId;
    private String xml;
    private String codigoSolidity;
    private String codigoVyper;
    private String idioma;
    private Boolean isTemplate;

     public String getNombreWorkspace() {
        return nombreWorkspace;
    }

    public void setNombreWorkspace(String nombreWorkspace) {
        this.nombreWorkspace = nombreWorkspace;
    }
    
    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getXml() {
        return xml;
    }

    public void setXml(String xml) {
        this.xml = xml;
    }

    public String getCodigoSolidity() {
        return codigoSolidity;
    }

    public void setCodigoSolidity(String _codigoSolidity) {
        this.codigoSolidity = _codigoSolidity;
    }

    public String getCodigoVyper() {
        return codigoVyper;
    }

    public void setCodigoVyper(String _codigoVyper) {
        this.codigoVyper = _codigoVyper;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public Boolean getIsTemplate() {
        return isTemplate;
    }

    public void setIsTemplate(Boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

} 
