package smac.compiler.compilador.mongo;

import java.time.Instant;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

@Service
public class AccionRegistroUsuario implements UserDetailsService {
   
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AccionRegistroUsuario( UsuarioRepository usuarioRepository, BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /*
    PARÁMETRO DE ENTRADA:Trae los datos del objeto java intermedio que se ha usado para guardar la informacion proveniente del formulario
    DESCRIPCIÓN: Guarda los datos en la colección "users" de mongodb
    PARÁMETRO DE SALIDA: Devuelve un mensaje simple de operación realizada con éxito o no
    */
    public RespuestaRegistro registrarUsuario(SolicitudRegistroUsuario solicitud) {
        if (solicitud == null) {
            return new RespuestaRegistro(false, "The registration application is invalid");
        }
        if (solicitud.getUser() == null || solicitud.getUser().trim().isEmpty()) {
            return new RespuestaRegistro(false, "A username is required");
        }
        if (solicitud.getEmail() == null || solicitud.getEmail().trim().isEmpty()) {
            return new RespuestaRegistro(false, "Email is required");
        }
        if (solicitud.getPassword() == null || solicitud.getPassword().trim().isEmpty()) {
            return new RespuestaRegistro(false, "Password is required");
        }
        if (usuarioRepository.existsByEmail(solicitud.getEmail())) {
            return new RespuestaRegistro(false, "A user with that email address already exists");
        }
        if (usuarioRepository.existsByUser(solicitud.getUser())) {
            return new RespuestaRegistro(false, "A user with that username already exists");
        }
        Usuario usuario = new Usuario();
        usuario.setUser(solicitud.getUser());
        usuario.setNombre(solicitud.getNombre());
        usuario.setApellido(solicitud.getApellidos());
        if (solicitud.getInstitucion() != null && !solicitud.getInstitucion().trim().isEmpty()) {
            usuario.setInstitucion(solicitud.getInstitucion());
        }
        usuario.setEmail(solicitud.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(solicitud.getPassword()));
        usuario.setCuentaBloqueada(false);
        usuario.setRol("USER");
        usuario.setFechaCreacion(Instant.now());
        usuario.setFechaActualizacion(Instant.now());
        usuarioRepository.save(usuario);
        return new RespuestaRegistro(true, "User successfully registered");
    }

    /*
    PARÁMETRO DE ENTRADA: Un identificador que puede ser el nombre de usuario o el correo electrónico introducido en el formulario de login
    DESCRIPCIÓN: Busca en la colección "users" de MongoDb un usuario que coincida con el identificador, primero por email y si no lo encuentra, por nombre de usuario. Si existe, lo transforma en un objeto compatible con la seguridad de Spring para permitir la autenticación en el sistema
    PARÁMETRO DE SALIDA: Un objeto de tipo UserDetails con la información del usuario autenticado
    */
    @Override
    public UserDetails loadUserByUsername(String identificador) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(identificador).orElse(null);
        if (usuario == null) {
            usuario = usuarioRepository.findByUser(identificador).orElse(null);
        }
        if (usuario == null) {
            throw new UsernameNotFoundException("User not found.");
        }
        return new User(usuario.getEmail(),usuario.getPasswordHash(),!Boolean.TRUE.equals(usuario.getCuentaBloqueada()),true,true,true,List.of(new SimpleGrantedAuthority(usuario.getRol()))
        );
    }

    /*
    PARÁMETRO DE ENTRADA:Ninguno
    DESCRIPCIÓN: Obtener el usuario previamente desde la configuracion de privacidad de Spring y con este, sacarlo desde la colección "users" del mongodb
    PARÁMETRO DE SALIDA: Un objeto de la clase usuario que se obtiene de la colección "users" de MongoDb
    */
    public Usuario obtenerUsuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        String identificador = auth.getName();
        if (identificador == null || identificador.trim().isEmpty()) {
            return null;
        }
        Usuario usuario = usuarioRepository.findByEmail(identificador).orElse(null);
        if (usuario == null) {
            usuario = usuarioRepository.findByUser(identificador).orElse(null);
        }
        return usuario;
    }

    /*
    PARÁMETRO DE ENTRADA:Ninguno
    DESCRIPCIÓN: LLama a obtenerUsuarioAutenticado para obtener el usuario actual que interactua en el sistema
    PARÁMETRO DE SALIDA: Devuelve el id del usuario autenticado en el sistema
    */
    public String obtenerIdUsuarioAutenticado() {
        Usuario usuario = obtenerUsuarioAutenticado();//TRAE EL USUARIO DESDE MONGODB PREVIO PASO DE OBTENERLO MEDIANTE LA CONFIGURACION DE SEGUIRDAD DE SPRING
        if (usuario == null) {
            return null;
        }
        return usuario.getId();
    }

}