package smac.compiler.compilador.mongo;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class AccionWorkspace {

    private final WorkspaceRepository workspaceRepository;
    private final AccionRegistroUsuario accionRegistroUsuario;
    private final UsuarioRepository usuarioRepository;
    private final LogsUsuarioRepository logsUsuarioRepository;

    
    /*
    PARÁMETRO DE ENTRADA: Repositorios de workspaces, logs y usuarios, y servicio del usuario autenticado
    DESCRIPCIÓN: Inicializa las dependencias necesarias para gestionar workspaces y eliminar sus logs relacionados
    PARÁMETRO DE SALIDA: Ninguno
    */
    public AccionWorkspace(WorkspaceRepository workspaceRepository,AccionRegistroUsuario accionRegistroUsuario,UsuarioRepository usuarioRepository,LogsUsuarioRepository logsUsuarioRepository) {
        this.workspaceRepository = workspaceRepository;
        this.logsUsuarioRepository = logsUsuarioRepository;
        this.accionRegistroUsuario = accionRegistroUsuario;
        this.usuarioRepository = usuarioRepository;
    }

    public RespuestaRegistro crearWorkspace(SolicitudWorkspace solicitud) {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null){
            return new RespuestaRegistro(false, "No authenticated user.");
        }
        Workspace workspace = new Workspace();
        workspace.setUserId(usuarioActual.getId());

        if(solicitud.getNombreWorkspace() == null || solicitud.getNombreWorkspace().trim().isEmpty()) {
            workspace.setNombreWorkspace("Unnamed Workspace");
        } 
        else{
            workspace.setNombreWorkspace(solicitud.getNombreWorkspace().trim());
        }

        workspace.setXml("");
        workspace.setCodigoSolidity("");
        workspace.setCodigoVyper("");
        workspace.setIsTemplate(false);//Por defecto, el workspace no es una plantilla que puedan usar otros usuarios creados por un usuario con rol USER o ADMIN
        workspace.setFechaCreacion(Instant.now());
        workspace.setFechaActualizacion(Instant.now());
        workspaceRepository.save(workspace);
        return new RespuestaRegistro( true,"Workspace " + workspace.getNombreWorkspace() + " created successfully with ID: " + workspace.getId());
    }

    public Workspace registrarWorkspace(SolicitudRegistroWorkspace solicitud) {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if(usuarioActual == null){
            return null;
        }

        if(solicitud == null){
            return null;
        }
        String nombreWorkspace = null;
        if(solicitud.getNombreWorkspace() != null){
            nombreWorkspace = solicitud.getNombreWorkspace().trim();
        }

        if(nombreWorkspace == null || nombreWorkspace.isEmpty()){
            nombreWorkspace = "Unnamed Workspace";
        }

        Workspace workspace = null;

        if(solicitud.getWorkspaceId() != null && !solicitud.getWorkspaceId().trim().isEmpty()) {
            workspace = workspaceRepository.findByIdAndUserId(solicitud.getWorkspaceId(), usuarioActual.getId());
            if (workspace == null) {
                return null;
            }
            Workspace workspaceMismoNombre = workspaceRepository.findByUserIdAndNombreWorkspace(usuarioActual.getId(), nombreWorkspace);
            if (workspaceMismoNombre != null && !workspaceMismoNombre.getId().equals(workspace.getId())) {
                return null;
            }
        } 
        else{
            Workspace workspaceMismoNombre = workspaceRepository.findByUserIdAndNombreWorkspace(usuarioActual.getId(), nombreWorkspace);
            if (workspaceMismoNombre != null) {
                return null;
            }
            workspace = new Workspace();
            workspace.setUserId(usuarioActual.getId());
            workspace.setFechaCreacion(Instant.now());
        }

        workspace.setNombreWorkspace(nombreWorkspace);
        workspace.setXml(solicitud.getXml());
        workspace.setCodigoSolidity(solicitud.getCodigoSolidity());
        workspace.setCodigoVyper(solicitud.getCodigoVyper());
        boolean solicitaPlantilla = Boolean.TRUE.equals(solicitud.getIsTemplate());//Obtiene el check de que el workspace es una plantilla
        boolean puedeCrearPlantillas = esAdmin(usuarioActual)|| esProfessor(usuarioActual);//Para identificar si el actor que guarda el workspace puede crear plantillas
        workspace.setIsTemplate(solicitaPlantilla && puedeCrearPlantillas);//Si las dos condiciones se cumplen se guarda como plantilla
        workspace.setFechaActualizacion(Instant.now());
        workspaceRepository.save(workspace);
        rellenarDatosUsuarioWorkspace(workspace);
        return workspace;
    }

    /*
    PARÁMETROS DE ENTRADA: El ID del workspace que se quiere cargar
    DESCRIPCIÓN: Carga un workspace si el usuario autenticado tiene permisos para verlo
    SALIDA: Devuelve el workspace o null si no puede cargarlo
    */
    public Workspace cargarWorkspace(String workspaceId) {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null){
            return null;
        }
        if(workspaceId == null || workspaceId.trim().isEmpty()){
            return null;
        }
        Workspace workspace = workspaceRepository.findById(workspaceId).orElse(null);
        if(workspace == null){
            return null;
        }
        if(esAdmin(usuarioActual)){//PUEDE CARGAR TODOS
            rellenarDatosUsuarioWorkspace(workspace);
            return workspace;
        }
        //SI NO ES ADMIN SE COMPRUEBA SI EL ID GUARDADO EN EL WORKSPACE ES IGUAL AL ID DEL USUARIO ACTUAL
        if(workspace.getUserId() != null && workspace.getUserId().equals(usuarioActual.getId())){
            rellenarDatosUsuarioWorkspace(workspace);
            return workspace;
        }
        if(esProfessor(usuarioActual)){
            List<Usuario> usuariosGestionados = usuarioRepository.findByCreadoPorUserId(usuarioActual.getId());
            for(int i = 0; i < usuariosGestionados.size(); i++){
                Usuario usuarioGestionado = usuariosGestionados.get(i);
                if(usuarioGestionado != null && usuarioGestionado.getId() != null){
                    if(usuarioGestionado.getId().equals(workspace.getUserId())){
                        rellenarDatosUsuarioWorkspace(workspace);
                        return workspace;
                    }
                }
            }
        }
        if (esUser(usuarioActual) && Boolean.TRUE.equals(workspace.getIsTemplate()) && usuarioActual.getCreadoPorUserId() != null&& usuarioActual.getCreadoPorUserId().equals(workspace.getUserId())) {
            return crearCopiaTemporalPlantilla(workspace, usuarioActual);
        }
        return null;
    }

    /*
    PARÁMETROS DE ENTRADA: Ninguno
    DESCRIPCIÓN: Obtiene el usuario autenticado y busca en Mongo los workspaces asociados a este usuario
    SALIDA: Devuelve una lista de workspaces asociados al usuario para mostrarlos en la tabla
    */    
    public List<Workspace> listarWorkspacesUsuario() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null){
            return List.of();
        }
        return workspaceRepository.findByUserId(usuarioActual.getId());
    }

    

    /*
    PARÁMETROS DE ENTRADA: Ninguno
    DESCRIPCIÓN: Obtiene el último workspace actualizado del usuario autenticado
    SALIDA: Devuelve el workspace más reciente o null si no existe
    */
    public Workspace obtenerUltimoWorkspaceUsuario() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (usuarioActual == null){
            return null;
        }
        Workspace ultimoWorkspace = workspaceRepository.findFirstByUserIdOrderByFechaActualizacionDesc(usuarioActual.getId());
        if (ultimoWorkspace == null){
            return null;
        }
        rellenarDatosUsuarioWorkspace(ultimoWorkspace);
        return ultimoWorkspace;
    }

    /*
    PARAMETRO DE ENTRADA: UN WORKSPACE QUE SE VA A CARGAR
    DESCRIPCIÓN: AÑADE EL USUARIO Y EL EMAIL DEL WORKSPACE
    */
    private void rellenarDatosUsuarioWorkspace(Workspace workspace) {
        if(workspace == null || workspace.getUserId() == null){
            return;
        }
        Usuario usuarioDueno = usuarioRepository.findById(workspace.getUserId()).orElse(null);
        if(usuarioDueno != null){
            workspace.setUser(usuarioDueno.getUser());
            workspace.setEmail(usuarioDueno.getEmail());
        }
    }

    /*
    PARÁMETROS DE ENTRADA: Ninguno
    DESCRIPCIÓN: Devuelve los workspaces visibles según el rol del usuario autenticado
    SALIDA: Devuelve una lista de workspaces
    */
    public List<Workspace> listarWorkspacesVisibles() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioActual == null){
            return List.of();
        }
        List<Workspace> workspaces;//WORKSPACES A CARGAR
        if(esAdmin(usuarioActual)){//SI ES ADMIN HAY QUE CARGAR TODOS LOS WORKSPACES ALOJADOS EN LA COLECCIÓNB
            workspaces = workspaceRepository.findAll();
        } 
        else if(esProfessor(usuarioActual)){//SI ES PROFE LOS SUYOS Y LOS DE LOS USUARIOS CREADOS POR EL
            List<String> idsUsuarios = new ArrayList<String>();
            idsUsuarios.add(usuarioActual.getId());
            List<Usuario> usuariosGestionados = usuarioRepository.findByCreadoPorUserId(usuarioActual.getId());
            for(int i = 0; i < usuariosGestionados.size(); i++){//SE RECORREN TODOS LOS USUARIOS CREADOS POR EL
                Usuario usuarioGestionado = usuariosGestionados.get(i);
                if(usuarioGestionado != null && usuarioGestionado.getId() != null){
                    idsUsuarios.add(usuarioGestionado.getId());
                }
            }

            workspaces = workspaceRepository.findByUserIdIn(idsUsuarios);
        } 
        else{
            workspaces = new ArrayList<Workspace>();
            // PRIMERO SE BUSCAN LOS WORKSPACES DEL PROPIO USUARIO (LOS CREADOS POR EL)
            List<Workspace> workspacesPropios = workspaceRepository.findByUserId(usuarioActual.getId());
            workspaces.addAll(workspacesPropios);

            //PARA OBTENER LAS PLANTILLAS, ES NECESARIO SACAR EL USUARIO QUE CREÓ A DICHO USUARIO, PORQUE SOLO PUEDE VER LAS PLANTILLAS DE ESTE
            String idCreador =  usuarioActual.getCreadoPorUserId();
            if( idCreador != null && !idCreador.trim().isEmpty()){
                List<Workspace> plantillas = workspaceRepository.findByUserIdAndIsTemplateTrue(idCreador);
                workspaces.addAll(plantillas);
            }
        }
        for(int i = 0; i < workspaces.size(); i++) {
            rellenarDatosUsuarioWorkspace(workspaces.get(i));//AÑADE EL USUARIO Y EL EMAIL DEL CREADOR DEL WORKSPACE
        }
        return workspaces;
    }


    /*
    PARÁMETRO DE ENTRADA: Usuario que intenta realizar el borrado y workspace que se quiere borrar
    DESCRIPCIÓN: Comprueba si el usuario tiene permiso para borrar el workspace o plantilla según su rol y propiedad
    PARÁMETRO DE SALIDA: true cuando puede borrarlo y false cuando no puede
    */
    private boolean puedeBorrarWorkspace(Usuario actor, Workspace workspace) {
        if(actor == null || workspace == null) {
            return false;
        }
        if(actor.getId() == null || workspace.getUserId() == null) {
            return false;
        }
        boolean esPropietario = actor.getId().equals(workspace.getUserId());
        if (esUser(actor)) {
            return esPropietario && !Boolean.TRUE.equals(workspace.getIsTemplate());
        }
        if(esProfessor(actor)) {
            if (esPropietario) {
                return true;
            }
            Usuario propietario = usuarioRepository.findById(workspace.getUserId()).orElse(null);
            return propietario != null && "USER".equals(propietario.getRol()) && actor.getId().equals(propietario.getCreadoPorUserId());
        }

        if(esAdmin(actor)) {
            if (esPropietario) {
                return true;
            }
            Usuario propietario = usuarioRepository.findById(workspace.getUserId()).orElse(null);
            if (propietario == null) {
                return false;
            }
            return "USER".equals(propietario.getRol())|| "PROFESSOR".equals(propietario.getRol());
        }
        return false;
    }

    /*
    PARÁMETRO DE ENTRADA: Identificador del workspace que se quiere eliminar
    DESCRIPCIÓN: Comprueba los permisos y elimina el workspace junto con todos sus logs relacionados
    PARÁMETRO DE SALIDA: Respuesta indicando el resultado del borrado
    */
    public RespuestaRegistro borrarWorkspace(String workspaceId) {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (usuarioActual == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }
        if (workspaceId == null || workspaceId.trim().isEmpty()) {
            return new RespuestaRegistro(false, "The workspace ID is required");
        }
        Workspace workspace = workspaceRepository.findById(workspaceId.trim()).orElse(null);
        if (workspace == null) {
            return new RespuestaRegistro(false, "Workspace not found");
        }
        if (!puedeBorrarWorkspace(usuarioActual, workspace)) {
            return new RespuestaRegistro(false, "You do not have permission to delete this workspace");
        }

        long logsEliminados = logsUsuarioRepository.deleteByWorkspaceId(workspace.getId());
        workspaceRepository.delete(workspace);
        return new RespuestaRegistro( true,"Workspace deleted successfully. Logs deleted: " + logsEliminados);
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todos los workspaces y plantillas que el usuario autenticado tiene permiso para gestionar
    PARÁMETRO DE SALIDA: Respuesta con el número de workspaces y logs eliminados
    */
    public RespuestaRegistro borrarTodosWorkspacesPermitidos() {
        Usuario usuarioActual = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (usuarioActual == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }
        List<Workspace> todosWorkspaces = workspaceRepository.findAll();
        List<Workspace> workspacesPermitidos = new ArrayList<Workspace>();
        List<String> idsWorkspaces = new ArrayList<String>();
        for (int i = 0; i < todosWorkspaces.size(); i++) {
            Workspace workspace = todosWorkspaces.get(i);
            if (workspace != null && puedeBorrarWorkspace(usuarioActual, workspace)) {
                workspacesPermitidos.add(workspace);
                if (workspace.getId() != null && !workspace.getId().trim().isEmpty()) {
                    idsWorkspaces.add(workspace.getId());
                }
            }
        }
        if (workspacesPermitidos.isEmpty()) {
            return new RespuestaRegistro(true,"There are no workspaces or templates available to delete");
        }
        long logsEliminados = 0;
        if (!idsWorkspaces.isEmpty()) {
            logsEliminados = logsUsuarioRepository.deleteByWorkspaceIdIn(idsWorkspaces);
        }

        workspaceRepository.deleteAll(workspacesPermitidos);
        return new RespuestaRegistro(true,"All permitted records were deleted successfully. Workspaces deleted: "+ workspacesPermitidos.size()+ ". Logs deleted: "+ logsEliminados);
    }


    /* PARÁMETROS DE ENTRADA:Plantilla original y usuario que la está utilizando
    DESCRIPCIÓN: Crea una copia temporal de la plantilla. La copia no se guarda todavía en MongoDB.  No contiene el ID de la plantilla original.
    SALIDA: Workspace preparado para que el usuario trabaje sobre él como un workspace nuevo.
    */
    private Workspace crearCopiaTemporalPlantilla( Workspace plantilla,Usuario usuarioActual){
        Workspace copia = new Workspace();
        copia.setId(null);
        copia.setUserId(usuarioActual.getId());//Se asigna al usuario la copia 
        copia.setNombreWorkspace(plantilla.getNombreWorkspace());
        copia.setXml(plantilla.getXml());
        copia.setCodigoSolidity(plantilla.getCodigoSolidity());
        copia.setCodigoVyper(plantilla.getCodigoVyper());
        copia.setIsTemplate(false);// LA COPIA NO ES UNA PLANTILLA Y NO PUEDE SERLO
        copia.setTemplateCopy(true);
        copia.setFechaCreacion(null);
        copia.setFechaActualizacion(null);
        copia.setUser(usuarioActual.getUser());
        copia.setEmail(usuarioActual.getEmail());
        return copia;
    }



    /*
    PARÁMETROS DE ENTRADA: El usuario autenticado en el sistema
    DESCRIPCIÓN: Comprueba el rol del usuario autenticado en el sistema para obtener los workspaces que puede visualizar o no. Como es admin, puede visualizar todos
    SALIDA: Un booleano que es true si es admin
    */
    private boolean esAdmin(Usuario usuario) {
        return usuario != null && "ADMIN".equals(usuario.getRol());
    }

    /*
    PARÁMETROS DE ENTRADA: El usuario autenticado en el sistema
    DESCRIPCIÓN: Comprueba el rol del usuario autenticado en el sistema para obtener los workspaces que puede visualizar o no. Si es PROFESSOR puede ver los workspaces de los usuarios creados por el
    SALIDA: Un booleano que es true si es admin
    */
    private boolean esProfessor(Usuario usuario) {
        return usuario != null && "PROFESSOR".equals(usuario.getRol());
    }

    /*
    PARÁMETROS DE ENTRADA: El usuario autenticado en el sistema
    DESCRIPCIÓN: Comprueba el rol del usuario autenticado en el sistema para obtener los workspaces que puede visualizar o no. Si es USER puede ver sus workspaces y los workspaces que son PLANTILLA que ha creado el usuario que también creo su cuenta.
    SALIDA: Un booleano que es true si es admin
    */
    private boolean esUser(Usuario usuario) {
        return usuario != null && "USER".equals( usuario.getRol());
    }

} 
