package smac.compiler.compilador.mongo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class AccionRegistroLogs {

    private final LogsUsuarioRepository logsUsuarioRepository;
    private final AccionRegistroUsuario accionRegistroUsuario;
    private final WorkspaceRepository workspaceRepository;
    private final UsuarioRepository usuarioRepository;

    public AccionRegistroLogs(LogsUsuarioRepository logUsuarioRepository, AccionRegistroUsuario accionRegistroUsuario,WorkspaceRepository workspaceRepository,UsuarioRepository usuarioRepository) {
        this.logsUsuarioRepository = logUsuarioRepository;
        this.accionRegistroUsuario = accionRegistroUsuario;
        this.workspaceRepository = workspaceRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public RespuestaRegistro registrarLogs(SolicitudRegistrarLogs solicitud) {
        if(solicitud == null){
            return new RespuestaRegistro(false, "The application is invalid");
        }
        if(solicitud.getLogs() == null || solicitud.getLogs().isEmpty()){
            return new RespuestaRegistro(false, "There are no logs to save");
        }
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (usuarioActual == null){
            return new RespuestaRegistro(false, "No user is authenticated");
        }

        String workspaceId = solicitud.getWorkspaceId();
        if(workspaceId == null || workspaceId.trim().isEmpty()){
            return new RespuestaRegistro(false, "The workspaceId is required");
        }
        workspaceId = workspaceId.trim();
        Workspace workspace = workspaceRepository.findByIdAndUserId(workspaceId, usuarioActual.getId());
        if (workspace == null){
            return new RespuestaRegistro(false, "The workspace does not exist or does not belong to the authenticated user");
        }
        List<String> clavesCandidatas = new ArrayList<String>();
        List<Map<String, Object>> logsValidos = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> logMapa : solicitud.getLogs()) {
            String sessionId = "";
            String idEvento = "";
            Object valorSessionId = logMapa.get("idSession");
            if(valorSessionId != null){
                sessionId = valorSessionId.toString().trim();
            }
            Object valorIdEvento = logMapa.get("idEvent");
            if(valorIdEvento != null){
                idEvento = valorIdEvento.toString().trim();
            }

            if(sessionId.isEmpty() || idEvento.isEmpty()){
                continue;
            }
            String claveUnica = sessionId + "_" + idEvento;
            clavesCandidatas.add(claveUnica);
            logsValidos.add(logMapa);
        }
        if (clavesCandidatas.isEmpty()) {
            return new RespuestaRegistro(false, "There were no new valid logs to save");
        }
        var existentes = logsUsuarioRepository.findByIdIn(clavesCandidatas);
        var idsExistentes = existentes.stream().map(LogsUsuario::getId).collect(java.util.stream.Collectors.toSet());
        List<LogsUsuario> logsUsuario = new ArrayList<LogsUsuario>();

        for (Map<String, Object> logMapa : logsValidos) {
            String sessionId = logMapa.get("idSession").toString().trim();
            String idEvento = logMapa.get("idEvent").toString().trim();

            String tipoEvento = "desconocido";
            Object valorTipoEvento = logMapa.get("typeEvent");

            if (valorTipoEvento != null && !valorTipoEvento.toString().trim().isEmpty()) {
                tipoEvento = valorTipoEvento.toString().trim();
            }

            String claveUnica = sessionId + "_" + idEvento;

            if (idsExistentes.contains(claveUnica)) {
                continue;
            }

            LogsUsuario log = new LogsUsuario();
            log.setId(claveUnica);
            log.setUserId(usuarioActual.getId());
            log.setWorkspaceId(workspaceId);
            log.setSessionId(sessionId);
            log.setIdEvento(idEvento);
            log.setTipoEvento(tipoEvento);
            log.setFecha(extraerFechaLog(logMapa));
            Map<String, Object> datosLimpios = new HashMap<String, Object>(logMapa);
            datosLimpios.remove("idSession");
            datosLimpios.remove("idEvent");
            datosLimpios.remove("typeEvent");
            datosLimpios.remove("date");
            datosLimpios.remove("timestamp");
            datosLimpios.remove("fecha");
            datosLimpios.remove("time");

            log.setDatos(datosLimpios);
            logsUsuario.add(log);
        }

        if (logsUsuario.isEmpty()) {
            return new RespuestaRegistro(true, "There were no new logs to save");
        }
        logsUsuarioRepository.saveAll(logsUsuario);
        return new RespuestaRegistro( true, "Logs saved correctly. A total of: " + logsUsuario.size());
    }

    public List<LogsUsuario> listarLogsVisibles() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null){
            return List.of();
        }
        List<LogsUsuario> logs = new ArrayList<LogsUsuario>();
        if(esAdmin(usuarioActual)){
            logs = logsUsuarioRepository.findAll();
        } 
        else if(esProfessor(usuarioActual)){
            List<String> idsUsuarios = new ArrayList<String>();
            idsUsuarios.add(usuarioActual.getId());

            List<Usuario> usuariosGestionados = usuarioRepository.findByCreadoPorUserId(usuarioActual.getId());

            for (int i = 0; i < usuariosGestionados.size(); i++) {
                Usuario usuarioGestionado = usuariosGestionados.get(i);
                if (usuarioGestionado != null && usuarioGestionado.getId() != null) {
                    idsUsuarios.add(usuarioGestionado.getId());
                }
            } 
            logs = logsUsuarioRepository.findByUserIdIn(idsUsuarios);
        } 
        else{
            logs = logsUsuarioRepository.findByUserId(usuarioActual.getId());
        }
        rellenarDatosUsuarioLogs(logs);
        return logs;
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todos los logs que el usuario autenticado tiene permiso para gestionar
    PARÁMETRO DE SALIDA: Respuesta con el número de logs eliminados
    */
    public RespuestaRegistro borrarTodosLogsPermitidos() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }

        if(!esProfessor(usuarioActual) && !esAdmin(usuarioActual)) {
            return new RespuestaRegistro(false,"You do not have permission to delete all log records");
        }

        List<String> idsUsuarios = new ArrayList<String>();
        idsUsuarios.add(usuarioActual.getId());
        if(esProfessor(usuarioActual)) {
            List<Usuario> usuariosGestionados =
                usuarioRepository.findByCreadoPorUserIdAndRol(usuarioActual.getId(),"USER");
            for(int i = 0; i < usuariosGestionados.size(); i++) {
                Usuario usuarioGestionado = usuariosGestionados.get(i);
                if(usuarioGestionado != null&& usuarioGestionado.getId() != null && !idsUsuarios.contains(usuarioGestionado.getId())) {
                    idsUsuarios.add(usuarioGestionado.getId());
                }
            }
        }

        if(esAdmin(usuarioActual)){
            List<Usuario> usuarios = usuarioRepository.findByRol("USER");
            List<Usuario> profesores = usuarioRepository.findByRol("PROFESSOR");
            for(int i = 0; i < usuarios.size(); i++){
                Usuario usuario = usuarios.get(i);
                if (usuario != null  && usuario.getId() != null && !idsUsuarios.contains(usuario.getId())) {
                    idsUsuarios.add(usuario.getId());
                }
            }
            for(int i = 0; i < profesores.size(); i++){
                Usuario profesor = profesores.get(i);
                if (profesor != null && profesor.getId() != null && !idsUsuarios.contains(profesor.getId())) {
                    idsUsuarios.add(profesor.getId());
                }
            }
        }

        long logsEliminados = logsUsuarioRepository.deleteByUserIdIn(idsUsuarios);
        if(logsEliminados == 0) {
            return new RespuestaRegistro(true,"There are no log records available to delete");
        }
        return new RespuestaRegistro( true,"All permitted log records were deleted successfully. Logs deleted: " + logsEliminados);
    }

    /*
    PARÁMETRO DE ENTRADA: El id de la sesión cuyos logs se desean eliminar
    DESCRIPCIÓN: Obtiene el usuario autenticado y comprueba si existen logs asociados a la sesión del id que recibía como entrada. Verifica que el usuario tiene permisos para eliminar dichos logs y elimina todos los logs de esa sesión
    PARÁMETRO DE SALIDA: Un objeto de la clase RespuestaRegistro indicando si los logs han sido eliminados correctamente o si ha ocurrido algún error
    */
    public RespuestaRegistro borrarLogsPorSesion(String sessionId) {
        Usuario usuario = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if(usuario == null){
            return new RespuestaRegistro(false, "No user is authenticated");
        }
         if (!esProfessor(usuario) && !esAdmin(usuario)) {//Un usuario con rol USER NO PUEDE BORRAR SUS REGISTROS
            return new RespuestaRegistro(false, "You do not have permission to delete log records");
        }
        if(sessionId == null || sessionId.trim().isEmpty()) {
            return new RespuestaRegistro(false, "ID session is required");
        }
        List<LogsUsuario> logsSesion = logsUsuarioRepository.findBySessionId(sessionId.trim());
        if(logsSesion == null || logsSesion.isEmpty()) {
            return new RespuestaRegistro(false, "No logs were found for that session");
        }
        for (int i = 0; i < logsSesion.size(); i++){
            LogsUsuario log = logsSesion.get(i);

            if(!gestionLogsPermisosUsuario(usuario, log)){
                return new RespuestaRegistro(false, "You do not have permission to delete the logs for this session");
            }
        }
        logsUsuarioRepository.deleteAll(logsSesion);
        return new RespuestaRegistro(true, "Session logs successfully deleted");
    }

    /*
    PARÁMETRO DE ENTRADA: Lista de logs visibles para el usuario autenticado
    DESCRIPCIÓN: Completa cada log con los datos del usuario y el nombre del workspace para mostrarlos en la vista
    PARÁMETRO DE SALIDA: Ninguno
    */
    private void rellenarDatosUsuarioLogs(List<LogsUsuario> logs) {
        Map<String, Usuario> usuariosCache = new HashMap<String, Usuario>();
        Map<String, Workspace> workspacesCache = new HashMap<String, Workspace>();
        for(int i = 0; i < logs.size(); i++) {
            LogsUsuario log = logs.get(i);
            if (log == null) {
                continue;
            }
            String userId = log.getUserId();
            if (userId != null && !userId.trim().isEmpty()) {
                Usuario usuario;
                if(usuariosCache.containsKey(userId)){
                    usuario = usuariosCache.get(userId);
                }
                else{
                    usuario = usuarioRepository.findById(userId).orElse(null);
                    usuariosCache.put(userId, usuario);
                }
                if(usuario != null) {
                    log.setUser(usuario.getUser());
                    log.setEmail(usuario.getEmail());
                    log.setRol(usuario.getRol());
                }
            }
            String workspaceId = log.getWorkspaceId();
            if (workspaceId != null && !workspaceId.trim().isEmpty()) {
                Workspace workspace;
                if (workspacesCache.containsKey(workspaceId)) {
                    workspace = workspacesCache.get(workspaceId);
                }
                else{
                    workspace =workspaceRepository.findById(workspaceId).orElse(null);
                    workspacesCache.put(workspaceId, workspace);
                }

                if(workspace != null){
                    log.setWorkspaceName(workspace.getNombreWorkspace());
                }
                else {
                    log.setWorkspaceName("");
                }
            }
        }
    }

    private Instant extraerFechaLog(Map<String, Object> logMapa) {
        if(logMapa == null){
            return Instant.now();
        }
        Object valorFecha = logMapa.get("date");
        if(valorFecha == null){
            valorFecha = logMapa.get("timestamp");
        }
        if(valorFecha == null){
            valorFecha = logMapa.get("fecha");
        }
        if(valorFecha == null){
            valorFecha = logMapa.get("time");
        }

        if(valorFecha == null){
            return Instant.now();
        }

        try {
            if(valorFecha instanceof Number numero){
                long epoch = numero.longValue();

                if(String.valueOf(Math.abs(epoch)).length() >= 13){
                    return Instant.ofEpochMilli(epoch);
                }

                return Instant.ofEpochSecond(epoch);
            }
            String texto = valorFecha.toString().trim();
            if(texto.isEmpty()){
                return Instant.now();
            }
            return Instant.parse(texto);
        } 
        catch(Exception error){
            return Instant.now();
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Usuario que intenta borrar los logs y log cuyo propietario se quiere comprobar
    DESCRIPCIÓN: Comprueba si un PROFESSOR o ADMIN puede eliminar el log según la propiedad y la relación de creación
    PARÁMETRO DE SALIDA: true cuando puede eliminarlo y false en caso contrario
    */
    private boolean gestionLogsPermisosUsuario( Usuario actor, LogsUsuario log) {
        if (actor == null || log == null) {
            return false;
        }

        if (!esProfessor(actor) && !esAdmin(actor)) {
            return false;
        }

        if (actor.getId() == null || log.getUserId() == null) {
            return false;
        }

        if (actor.getId().equals(log.getUserId())) {
            return true;
        }
        Usuario propietario =usuarioRepository.findById(log.getUserId()).orElse(null);
        if (propietario == null) {
            return false;
        }

        if (esProfessor(actor)) {
            return "USER".equals(propietario.getRol()) && actor.getId().equals(propietario.getCreadoPorUserId());
        }

        if (esAdmin(actor)) {
            return "USER".equals(propietario.getRol())|| "PROFESSOR".equals(propietario.getRol());
        }

        return false;
    }

    private boolean esAdmin(Usuario usuario) {
        return usuario != null && "ADMIN".equals(usuario.getRol());
    }

    private boolean esProfessor(Usuario usuario) {
        return usuario != null && "PROFESSOR".equals(usuario.getRol());
    }
}