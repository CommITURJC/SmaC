package smac.compiler.compilador.mongo;

/*
INFO: Esta clase es la que recibe los datos del formulario de registro, hace de intermediario para traer los datos antes de crear
un objeto de la clase Usuario
*/
public class SolicitudRegistroUsuario {
    
    private String user;
    private String nombre;
    private String apellido;
    private String institucion;
    private String email;
    private String password;

    public String getUser() {
        return user;
    }

    public void setUser(String username) {
        this.user = username;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setApellidos(String apellidos) {
        this.apellido = apellidos;
    }

    public String getApellidos() {
        return apellido;
    }

    public void setInstitucion(String institucion) {
        this.institucion = institucion;
    }

    public String getInstitucion() {
        return institucion;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

}
