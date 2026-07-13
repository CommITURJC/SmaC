package smac.compiler.compilador.mongo;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")//Le dice que tiene que ir a la colección users
public class Usuario {
    
    @Id
    private String id;//Tiene que haber un campo ID para hacer coincidir el _id de los JSON de MongoDB
    private String user;
    private String nombre;
    private String apellido;
    private String institucion;
    private String email;
    private String passwordHash;
    private Boolean cuentaBloqueada;
    private String rol;
    private String creadoPorUserId;//Por si el usuario se ha creado por un usuario con roles ADMIN o PROFESSOR
    private Instant fechaCreacion;
    private Instant fechaActualizacion;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getUser() {
        return user;
    }
    public void setUser(String user) {
        this.user = user;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getApellido() {
        return apellido;
    }
    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getInstitucion() {
        return institucion;
    }
    public void setInstitucion(String institucion) {
        this.institucion = institucion;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPasswordHash() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    public Boolean getCuentaBloqueada() {
        return cuentaBloqueada;
    }
    public void setCuentaBloqueada(Boolean cuentaBloqueada) {
        this.cuentaBloqueada = cuentaBloqueada;
    }
    public String getRol() {
        return rol;
    }
    public void setRol(String roles) {
        this.rol = roles;
    }

    public String getCreadoPorUserId() {
        return creadoPorUserId;
    }

    public void setCreadoPorUserId(String id) {
        this.creadoPorUserId = id;
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

}
