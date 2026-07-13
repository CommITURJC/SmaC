package smac.compiler.compilador.mongo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceRepository extends MongoRepository<Workspace, String> {

    List<Workspace> findByUserId(String userId);

    Workspace findByIdAndUserId(String id, String userId);

    Workspace findFirstByUserIdOrderByFechaActualizacionDesc(String userId);
    List<Workspace> findByUserIdAndIsTemplateTrue(String userId);
    List<Workspace> findByUserIdIn(List<String> userIds);
    long deleteByUserId(String userId);//PARA ELIMINAR TODOS LOS WORKSPACES DEL ID DE UN USUARIO PASADO COMO PARAMENTRO DE ENTRADA
    long deleteByUserIdIn(List<String> userIds);//PARA ELIMINAR TODOS LOS WORKSPACES DE LOS IDS DE LOS USUARIOS PASADOS EN LA LISTA
    boolean existsByUserIdAndNombreWorkspace(String userId, String nombreWorkspace);//DEVUELVE UN BOOL SI EXISTE UN WORKSPACE CON EL MISMO NOMBRE PARA UN USUARIO
    Workspace findByUserIdAndNombreWorkspace(String userId, String nombreWorkspace);//PARA ENCONTRAR UN WORKSPACE CON ESE NOMBRE PARA EL USUARIO POR EL QUE SE BUSCA POR SU ID

}