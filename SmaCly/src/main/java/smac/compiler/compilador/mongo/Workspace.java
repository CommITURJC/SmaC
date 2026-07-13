package smac.compiler.compilador.mongo;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "workspaces")
public class Workspace {

    @Id
    private String id;//Id del workspace
    private String userId;//ID DEL USUARIO que crea el workspace
    private String nombreWorkspace;//nombre único del workspace (SOLO POR USUARIO)
    private String xml;//El xml de los bloques
    private String codigoSolidity;//El código Solidity que generan los bloques, tiene que activar el check a la hora de guardar el workspace
    private String codigoVyper;//El código Vyper que generan los bloques, tiene que activar el check a la hora de guardar el workspace
    private Instant fechaCreacion;
    private Instant fechaActualizacion;
    private Boolean isTemplate = false;//Para indicar que es una plantilla
    @Transient
    private Boolean templateCopy = false; //Para indicar que se esta cargando una copia de un workspace que es plantilla (ESTO SE HACE PARA NO TOCAR EL ORIGINAL)
    @Transient
    private String user;

    @Transient
    private String email;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNombreWorkspace() {
        return nombreWorkspace;
    }

    public void setNombreWorkspace(String nombreWorkspace) {
        this.nombreWorkspace = nombreWorkspace;
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

    public Instant getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Instant fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Instant getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(Instant fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getIsTemplate() {
        return isTemplate;
    }

    public void setIsTemplate(Boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

    public Boolean getTemplateCopy() {
        return templateCopy;
    }

    public void setTemplateCopy(Boolean templateCopy) {
        this.templateCopy = templateCopy;
    }

}