package smac.compiler.compilador.mongo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogsUsuarioRepository extends MongoRepository<LogsUsuario, String> {
    List<LogsUsuario> findByUserIdIn(List<String> userIds);

    List<LogsUsuario> findByUserId(String userId);

    List<LogsUsuario> findByWorkspaceId(String workspaceId);

    List<LogsUsuario> findBySessionId(String sessionId);

    List<LogsUsuario> findByIdIn(List<String> ids);

    long deleteByUserId(String userId);//BORRADO DE LOGS ASOCIADOS A UN USUARIO
    long deleteByUserIdIn(List<String> userIds);//BORRADO DE LOGS ASOCIADO A UNA LISTA DE USUARIOS
    long deleteByWorkspaceId(String workspaceId);//BORRADO DE LOGS ASOCIADOS A UN WORKSPACE
    long deleteByWorkspaceIdIn(List<String> workspaceIds);//BORRADO DE LOGS ASOCIADO A UNA LISTA DE WORKSPACES

}

