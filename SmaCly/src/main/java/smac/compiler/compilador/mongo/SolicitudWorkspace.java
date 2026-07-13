package smac.compiler.compilador.mongo;

import java.time.Instant;

public class SolicitudWorkspace {

    private String id;
    private String nombreWorkspace;
    private String user;
    private String emailUsuario;
    private Instant fechaCreacion;
    private Instant fechaActualizacion;
    private Boolean isTemplate = false;//Para indicar que es una plantilla

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNombreWorkspace() {
        return nombreWorkspace;
    }

    public void setNombreWorkspace(String nombreWorkspace) {
        this.nombreWorkspace = nombreWorkspace;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getEmailUsuario() {
        return emailUsuario;
    }

    public void setEmailUsuario(String email) {
        this.emailUsuario = email;
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

    public Boolean getIsTemplate() {
        return isTemplate;
    }

    public void setIsTemplate(Boolean isTemplate) {
        this.isTemplate = isTemplate;
    }

}