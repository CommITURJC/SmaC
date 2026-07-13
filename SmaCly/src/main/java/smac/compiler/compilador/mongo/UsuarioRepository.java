package smac.compiler.compilador.mongo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    Optional<Usuario> findByUser(String user);
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByNombreAndApellido(String nombre, String apellido);

    List<Usuario> findByRol(String rol);
    List<Usuario> findByCreadoPorUserId(String creadoPorUserId);

    List<Usuario> findByCreadoPorUserIdAndRol(String creadoPorUserId,String rol);

    long countByCreadoPorUserIdAndRol(String creadoPorUserId,String rol);//INDICE PARA CREAR LOS CAMPOS USER CUANDO SE CARGAN EN EL EXCELL
    long countByCreadoPorUserId(String creadoPorUserId);

    boolean existsByUser(String user);
   boolean existsByEmail(String email);
    boolean existsByNombreAndApellido(String nombre,String apellido);
}