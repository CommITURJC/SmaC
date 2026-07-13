package smac.compiler.compilador.mongo;


import java.io.InputStream;
import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

//LOS SIGUIENTES IMPORTS SON PARA LA CARGA DESDE EL EXCELL
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.web.multipart.MultipartFile;



import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccionAdministracionUsuario {

    private static final String ROLE_USER = "USER";
    private static final String ROLE_PROFESSOR = "PROFESSOR";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final int MAXIMO_FILAS_EXCEL = 2000;//LÍMITE DE FILAS A PROCESAR POR EL EXCELL
    private UsuarioRepository usuarioRepository;
    private AccionRegistroUsuario accionRegistroUsuario;
    private BCryptPasswordEncoder passwordEncoder;
    private WorkspaceRepository workspaceRepository;//PARA PODER EJECUTAR EL BORRADO DE LOS WORKSPACES ASOCIADOS A EL USUARIO
    private LogsUsuarioRepository logsUsuarioRepository;//PARA PODER EJECUTAR EL BORRADO DE LOS LOGS ASOCIADOS A EL USUARIO

    /*
    PARÁMETROS DE ENTRADA: repositorio de usuarios, servicio de usuario autenticado, codificador de contraseñas
    DESCRIPCIÓN: Constructor de la clase para poder usar repositorio, seguridad y cifrado de password
    SALIDA: Ninguna
    */
    public AccionAdministracionUsuario(UsuarioRepository usuarioRepository,AccionRegistroUsuario accionRegistroUsuario, BCryptPasswordEncoder passwordEncoder, WorkspaceRepository workspaceRepository, LogsUsuarioRepository logsUsuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.accionRegistroUsuario = accionRegistroUsuario;
        this.passwordEncoder = passwordEncoder;
        this.workspaceRepository = workspaceRepository;
        this.logsUsuarioRepository = logsUsuarioRepository;
    }

    /*
    PARÁMETROS DE ENTRADA: solicitud con datos del usuario y rol objetivo
    DESCRIPCIÓN: Crea un nuevo usuario si el usuario autenticado tiene permisos para crear ese rol
    SALIDA: Devuelve una respuesta indicando si se ha creado bien o no
    */
    public RespuestaRegistro crearUsuario(SolicitudRegistroUsuario solicitud, String rol) {
        Usuario usuarioAutenticado = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if (usuarioAutenticado == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }

        if (solicitud == null) {
            return new RespuestaRegistro(false, "The request is invalid");
        }

        rol = normalizarRol(rol);

        if (!esRolValido(rol)) {
            return new RespuestaRegistro(false, "The specified role is invalid");
        }

        if (!puedeCrearRol(usuarioAutenticado, rol)) {
            return new RespuestaRegistro(false, "You do not have permission to create users with that role");
        }

        RespuestaRegistro validacion = validarSolicitudAlta(solicitud);
        if (!validacion.isExito()) {
            return validacion;
        }

        String username = limpiarEspacios(solicitud.getUser());
        String email = limpiarEspacios(solicitud.getEmail());

        if (usuarioRepository.existsByUser(username)) {
            return new RespuestaRegistro(false, "There is already another user with that username");
        }

        if (usuarioRepository.existsByEmail(email)) {
            return new RespuestaRegistro(false, "There is already another user with that email address");
        }

        Usuario usuario = new Usuario();
        usuario.setUser(username);
        usuario.setNombre(limpiarTextoOpcional(solicitud.getNombre()));
        usuario.setApellido(limpiarTextoOpcional(solicitud.getApellidos()));
        usuario.setInstitucion(limpiarTextoOpcional(solicitud.getInstitucion()));
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(solicitud.getPassword()));//HAY QUE CODIFICAR LA CONTRASEÑA PARA QUE NO SE GUARDE PLANA
        usuario.setCuentaBloqueada(false);
        usuario.setRol(rol);
        usuario.setCreadoPorUserId(usuarioAutenticado.getId());
        usuario.setFechaCreacion(Instant.now());
        usuario.setFechaActualizacion(Instant.now());

        usuarioRepository.save(usuario);

        return new RespuestaRegistro(true, "User created successfully");
    }


    /*
    PARÁMETRO DE ENTRADA: Excel enviado desde la pantalla de gestión de usuarios
    DESCRIPCIÓN: Lee el Excel y crea un usuario por cada fila(Los campos name, surname, email y password son obligatorios, user es opcional)
    NOTA:Todos los usuarios se crean con el rol USER.
    PARÁMETRO DE SALIDA:  Devuelve un objeto RespuestaRegistro con el número de usuarios creados y los errores encontrados
    */
    public RespuestaRegistro cargarUsuariosDesdeExcel(MultipartFile archivo) {

        Usuario usuarioAutenticado =accionRegistroUsuario.obtenerUsuarioAutenticado();

        //Solo un usuario autenticado puede realizar la carga
        if(usuarioAutenticado == null) {
            return new RespuestaRegistro(false,"No user is authenticated");
        }
        if(!puedeCrearRol(usuarioAutenticado, ROLE_USER)){//Si tiene el ROL USER
            return new RespuestaRegistro( false,"You do not have permission to import users");
        }

        if(archivo == null || archivo.isEmpty()) {
            return new RespuestaRegistro(false,"You must select an Excel file");
        }

        if(!esArchivoExcel(archivo.getOriginalFilename())) {
            return new RespuestaRegistro(false,"The file must have .xlsx or .xls extension");
        }

        try(InputStream entrada = archivo.getInputStream();Workbook workbook = WorkbookFactory.create(entrada)){
            if(workbook.getNumberOfSheets() == 0){
                return new RespuestaRegistro(false,"The Excel file does not contain any sheet");
            }
            Sheet hoja = workbook.getSheetAt(0);//UNICAMENTE SE PROCESA LA PRIMERA HOJA DEL EXCELL
            int indiceFilaCabecera = hoja.getFirstRowNum();
            Row filaCabecera = hoja.getRow(indiceFilaCabecera);

            if (filaCabecera == null) {
                return new RespuestaRegistro(false,"The Excel file does not contain a header row");
            }
            DataFormatter formateador = new DataFormatter();
            FormulaEvaluator evaluador =  workbook.getCreationHelper().createFormulaEvaluator();

            /*
            Se obtiene la posición de cada columna.
            El orden de las columnas no importa.
            */
            Map<String, Integer> columnas = obtenerColumnasExcel(filaCabecera, formateador, evaluador);
            List<String> columnasFaltantes = obtenerColumnasObligatoriasFaltantes(columnas);
            if (!columnasFaltantes.isEmpty()) {
                return new RespuestaRegistro(false,"Missing required columns: "+ String.join(", ",columnasFaltantes)
                );
            }

            int ultimaFila =hoja.getLastRowNum();
            int numeroPosibleFilas =ultimaFila - indiceFilaCabecera;
            if (numeroPosibleFilas > MAXIMO_FILAS_EXCEL) {
                return new RespuestaRegistro( false,"The Excel file cannot contain more than "  + MAXIMO_FILAS_EXCEL+ " user rows"
                );
            }

            //Se obtiene cuántos usuarios USER ha creado ya el usuario autenticado y se suma 1 al contador por cada usuario nuevo que se procese en esta llamada
            long siguienteNumero = usuarioRepository  .countByCreadoPorUserIdAndRol(usuarioAutenticado.getId(), ROLE_USER)+ 1;
            String nombreCreador = normalizarNombreCreador(usuarioAutenticado.getUser());
            int filasProcesadas = 0;
            int usuariosCreados = 0;
            int filasConError = 0;
            List<String> errores = new ArrayList<String>();

            for (int numeroFila = indiceFilaCabecera + 1; numeroFila <= ultimaFila; numeroFila++ ){
                Row fila = hoja.getRow(numeroFila);
                if (fila == null) {
                    continue;
                }
                if(filaExcelEstaVacia(fila,formateador,evaluador)){
                    continue;
                }
                filasProcesadas++;
                int numeroFilaExcel = numeroFila + 1;// En Java las filas empiezan en cero pero en Excel empiezan en uno
                String nombre = leerCeldaExcel(fila,columnas.get("name"),formateador,evaluador);
                String apellidos = leerCeldaExcel( fila,columnas.get("surname"),formateador,evaluador);
                String email = leerCeldaExcel(fila,columnas.get("email"), formateador,evaluador);
                String password =leerCeldaExcel(fila, columnas.get("password"),formateador, evaluador);
        
                //user es opcional.Si la columna no existe, devuelve una cadena vacía.*/
                String username = leerCeldaExcel(fila,columnas.get("user"), formateador, evaluador);
                String errorCampos = validarCamposObligatoriosExcel(nombre,apellidos,email,password);
                if (errorCampos != null) {
                    filasConError++;
                    errores.add( "Row " + numeroFilaExcel+ ": "+ errorCampos);
                    continue;
                }

                long numeroUsernameGenerado = -1;
                if(username == null|| username.trim().isEmpty()){
                    long numeroCandidato =siguienteNumero;
                    username =construirUsernameAutomatico(numeroCandidato,nombreCreador);
                    while(usuarioRepository.existsByUser(username)){
                        numeroCandidato++;
                        username = construirUsernameAutomatico(numeroCandidato,nombreCreador );
                    }

                    numeroUsernameGenerado =
                        numeroCandidato;

                } 
                else{
                    username = username.trim();
                }
                SolicitudRegistroUsuario solicitud =new SolicitudRegistroUsuario();
                solicitud.setUser(username);
                solicitud.setNombre(nombre);
                solicitud.setApellidos(apellidos);
                solicitud.setEmail(email);
                solicitud.setPassword(password);
                RespuestaRegistro resultadoFila =crearUsuario(solicitud,ROLE_USER);
                if(resultadoFila.isExito()) {
                    usuariosCreados++;
                    if(numeroUsernameGenerado >= 0){
                        siguienteNumero =numeroUsernameGenerado + 1;//SE AUMENTA EL CONTADOR DE USUARIOS GENERADOS POR EL USUARIO ADMIN O PROFESSOR
                    } 
                    else{
                        siguienteNumero++;
                    }

                } 
                else{
                    filasConError++;
                    errores.add("Row " + numeroFilaExcel+ ": "+ resultadoFila.getMensaje());
                }
            }

            if(filasProcesadas == 0){
                return new RespuestaRegistro( false, "The Excel file does not contain user rows" );
            }

            StringBuilder mensaje = new StringBuilder();
            mensaje.append("Excel processed. Users created: "  );

            mensaje.append(usuariosCreados);
            mensaje.append( ". Rows with errors: ");
            mensaje.append(filasConError);
            mensaje.append(".");
            //solo se incluyen los primeros 25 errores
            int limiteErrores = Math.min(errores.size(), 25);
            if(limiteErrores > 0){
                mensaje.append(" Errors: ");
                for(int i = 0;i < limiteErrores;i++) {
                    if(i > 0){
                        mensaje.append(" | ");
                    }
                    mensaje.append(errores.get(i));
                }
            }

            if(errores.size() > limiteErrores){
                mensaje.append(" | Additional errors not shown: ");
                mensaje.append(errores.size() - limiteErrores);
                mensaje.append(".");
            }

            boolean exitoGeneral = usuariosCreados > 0;
            return new RespuestaRegistro(exitoGeneral,mensaje.toString() );
        } 
        catch(Exception error){
            error.printStackTrace();
            String detalleError = error.getMessage();
            if (detalleError == null || detalleError.trim().isEmpty()){
                detalleError = "No additional information";
            }
            return new RespuestaRegistro( false,"Error processing Excel: " + error.getClass().getSimpleName() + " - " + detalleError);
        }
    }


    
    /*
    PARÁMETROS DE ENTRADA: id del usuario a editar, solicitud con los nuevos datos y nuevo rol
    DESCRIPCIÓN: Modifica un usuario existente si el uusuario o el usuario profesor tiene permiso sobre ese usuario (ADMIN TIENE SIEMPRE)
    SALIDA: Devuelve una respuesta indicando si la edición fue correcta o no
    */
    public RespuestaRegistro editarUsuario(String idUsuarioObjetivo, SolicitudRegistroUsuario solicitud, String nuevoRol) {
        Usuario actor = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if(actor == null){
            return new RespuestaRegistro(false, "No user is authenticated");
        }
        if(idUsuarioObjetivo == null || idUsuarioObjetivo.trim().isEmpty()) {
            return new RespuestaRegistro(false, "The target user ID is required.");
        }
        if(solicitud == null){
            return new RespuestaRegistro(false, "The request is invalid");
        }
        Optional<Usuario> objetivoOpt = usuarioRepository.findById(idUsuarioObjetivo.trim());//devuelve el usuario con el id traido de la coleccion users
        if(objetivoOpt.isEmpty()){
            return new RespuestaRegistro(false, "Target user not found");
        }
        Usuario objetivo = objetivoOpt.get();

        if(!puedeGestionarUsuario(actor, objetivo)){
            return new RespuestaRegistro(false, "You do not have permission to edit this user");
        }
        nuevoRol = normalizarRol(nuevoRol);
        boolean cambiarRol = nuevoRol != null && !nuevoRol.isEmpty();

        if (cambiarRol) {
            if(!esRolValido(nuevoRol)) {
                return new RespuestaRegistro(false, "The new role is invalid");
            }

            if(!puedeAsignarNuevoRol(actor, objetivo, nuevoRol)) {
                return new RespuestaRegistro(false, "You do not have permission to assign that role");
            }
        }

        String nuevoUsername = limpiarEspacios(solicitud.getUser());
        String nuevoEmail = limpiarEspacios(solicitud.getEmail());

        if(nuevoUsername.isEmpty()) {
            return new RespuestaRegistro(false, "Username is required");
        }

        if(nuevoEmail.isEmpty()) {
            return new RespuestaRegistro(false, "Email is required");
        }

        if(!objetivo.getUser().equals(nuevoUsername) && usuarioRepository.existsByUser(nuevoUsername)) {
            return new RespuestaRegistro(false, "There is already another user with that username");
        }

        if(!objetivo.getEmail().equals(nuevoEmail) && usuarioRepository.existsByEmail(nuevoEmail)) {
            return new RespuestaRegistro(false, "There is already another user with that email address");
        }

        objetivo.setUser(nuevoUsername);
        objetivo.setNombre(limpiarTextoOpcional(solicitud.getNombre()));
        objetivo.setApellido(limpiarTextoOpcional(solicitud.getApellidos()));
        objetivo.setInstitucion(limpiarTextoOpcional(solicitud.getInstitucion()));
        objetivo.setEmail(nuevoEmail);

        if(solicitud.getPassword() != null && !solicitud.getPassword().trim().isEmpty()) {
            objetivo.setPasswordHash(passwordEncoder.encode(solicitud.getPassword()));
        }
        if(cambiarRol){
            objetivo.setRol(nuevoRol);
            objetivo.setCreadoPorUserId(actor.getId());
        }
        objetivo.setFechaActualizacion(Instant.now());
        usuarioRepository.save(objetivo);
        return new RespuestaRegistro(true, "User successfully edited");
    }

    /*
    PARÁMETROS DE ENTRADA: id del usuario objetivo y valor booleano para bloquear o desbloquear.
    DESCRIPCIÓN: Cambia el estado de bloqueo de un usuario si el actor tiene permisos.
    SALIDA: Devuelve una respuesta indicando si se bloqueó o desbloqueó correctamente.
    */
    public RespuestaRegistro cambiarBloqueoUsuario(String idUsuarioObjetivo, boolean bloqueada) {
        Usuario actor = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if(actor == null){
            return new RespuestaRegistro(false, "No user is authenticated");
        }
        if(idUsuarioObjetivo == null || idUsuarioObjetivo.trim().isEmpty()) {
            return new RespuestaRegistro(false, "The target user ID is required");
        }
        Optional<Usuario> objetivoOpt = usuarioRepository.findById(idUsuarioObjetivo.trim());
        if(objetivoOpt.isEmpty()) {
            return new RespuestaRegistro(false, "Target user not found");
        }

        Usuario objetivo = objetivoOpt.get();

        if(!puedeGestionarUsuario(actor, objetivo)) {
            return new RespuestaRegistro(false, "You do not have permission to edit this user");
        }

        if(Objects.equals(actor.getId(), objetivo.getId()) && esAdmin(objetivo) && bloqueada) {
            return new RespuestaRegistro(false, "You cannot block yourself if you are an ADMIN");
        }

        objetivo.setCuentaBloqueada(bloqueada);
        objetivo.setFechaActualizacion(Instant.now());
        usuarioRepository.save(objetivo);
        if(bloqueada){
            return new RespuestaRegistro(true, "User successfully blocked");
        } 
        else{
            return new RespuestaRegistro(true, "User successfully unlocked");
        }
    }

    /*
    PARÁMETROS DE ENTRADA: id del usuario objetivo.
    DESCRIPCIÓN: Borra un usuario de la base de datos si el actor tiene permisos sobre él.
    SALIDA: Devuelve una respuesta indicando si el borrado fue correcto o no.
    */
    public RespuestaRegistro borrarUsuario(String idUsuarioObjetivo) {
        Usuario actor = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (actor == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }
        if (idUsuarioObjetivo == null || idUsuarioObjetivo.trim().isEmpty()) {
            return new RespuestaRegistro(false, "The target user ID is required");
        }
        Optional<Usuario> objetivoOpt = usuarioRepository.findById(idUsuarioObjetivo.trim());
        if (objetivoOpt.isEmpty()) {
            return new RespuestaRegistro(false, "Target user not found");
        }
        Usuario objetivo = objetivoOpt.get();
        if(!puedeBorrarUsuario(actor, objetivo)) {
            return new RespuestaRegistro(false, "You do not have permission to delete this user");
        }
        long usuariosGestionados = usuarioRepository.countByCreadoPorUserId(objetivo.getId());
        if(esProfessor(objetivo) && usuariosGestionados > 0) {
            return new RespuestaRegistro(false, "This professor cannot be deleted because they still have managed users"
            );
        }
        List<Workspace> workspacesUsuario = workspaceRepository.findByUserId(objetivo.getId());
        List<String> idsWorkspaces = new ArrayList<String>();
        for(int i = 0; i < workspacesUsuario.size(); i++){
            Workspace workspaceUsuario = workspacesUsuario.get(i);
            if (workspaceUsuario != null && workspaceUsuario.getId() != null && !workspaceUsuario.getId().trim().isEmpty()) {
                idsWorkspaces.add(workspaceUsuario.getId());
            }
        }

        long logsEliminadosPorUsuario =logsUsuarioRepository.deleteByUserId(objetivo.getId());
        long logsEliminadosPorWorkspace = 0;

        if(!idsWorkspaces.isEmpty()){
            logsEliminadosPorWorkspace =logsUsuarioRepository.deleteByWorkspaceIdIn(idsWorkspaces);
        }

        long workspacesEliminados = workspaceRepository.deleteByUserId(objetivo.getId());
        usuarioRepository.delete(objetivo);
        long totalLogsEliminados = logsEliminadosPorUsuario + logsEliminadosPorWorkspace;
        return new RespuestaRegistro( true,"User deleted successfully. Workspaces deleted: " + workspacesEliminados+ ". Logs deleted: "+ totalLogsEliminados);
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todas las cuentas creadas por el usuario autenticado que tiene permiso para borrar, junto con sus workspaces, plantillas y logs
    PARÁMETRO DE SALIDA: Respuesta con el resultado y la cantidad de registros eliminados
    */
    public RespuestaRegistro borrarTodosUsuariosPermitidos() {
        Usuario actor = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (actor == null) {
            return new RespuestaRegistro(false, "No user is authenticated");
        }

        if (!esProfessor(actor) && !esAdmin(actor)) {
            return new RespuestaRegistro(false,"You do not have permission to delete user records");
        }

        List<Usuario> usuariosCreados = usuarioRepository.findByCreadoPorUserId(actor.getId());
        List<Usuario> usuariosEliminables = new ArrayList<Usuario>();
        int profesoresBloqueados = 0;
        for (int i = 0; i < usuariosCreados.size(); i++) {
            Usuario objetivo = usuariosCreados.get(i);
            if(objetivo == null){
                continue;
            }
            if(!puedeBorrarUsuario(actor, objetivo)){
                continue;
            }
            if(esProfessor(objetivo) && usuarioRepository.countByCreadoPorUserId(objetivo.getId()) > 0){
                profesoresBloqueados++;
                continue;
            }
            usuariosEliminables.add(objetivo);
        }

        if (usuariosEliminables.isEmpty()) {
            if (profesoresBloqueados > 0) {
                return new RespuestaRegistro( false,"No users were deleted. Professors blocked because they still manage users: " + profesoresBloqueados);
            }

            return new RespuestaRegistro(true,"There are no user records available to delete");
        }
        List<String> idsUsuarios = new ArrayList<String>();
        for(int i = 0; i < usuariosEliminables.size(); i++){
            Usuario usuario = usuariosEliminables.get(i);
            if(usuario.getId() != null  && !usuario.getId().trim().isEmpty()){
                idsUsuarios.add(usuario.getId());
            }
        }

        List<Workspace> workspaces = workspaceRepository.findByUserIdIn(idsUsuarios);
        List<String> idsWorkspaces = new ArrayList<String>();
        for(int i = 0; i < workspaces.size(); i++) {
            Workspace workspace = workspaces.get(i);
            if (workspace != null  && workspace.getId() != null && !workspace.getId().trim().isEmpty()){
                idsWorkspaces.add(workspace.getId());
            }
        }
        long logsEliminados =logsUsuarioRepository.deleteByUserIdIn(idsUsuarios);
        if (!idsWorkspaces.isEmpty()) {
            logsEliminados += logsUsuarioRepository.deleteByWorkspaceIdIn(idsWorkspaces);
        }

        long workspacesEliminados =workspaceRepository.deleteByUserIdIn(idsUsuarios);
        usuarioRepository.deleteAll(usuariosEliminables);
        String mensaje = "Users deleted successfully: " + usuariosEliminables.size() + ". Workspaces and templates deleted: " + workspacesEliminados+ ". Logs deleted: "+ logsEliminados;
        if (profesoresBloqueados > 0) {
            mensaje +=". Professors not deleted because they still manage users: " + profesoresBloqueados;
        }
        return new RespuestaRegistro(true, mensaje);
    }


    /*
    PARÁMETROS DE ENTRADA: Ninguno
    DESCRIPCIÓN: Obtiene la lista de usuarios que el usuario autenticado puede gestionar (SI ES ADMIN PUEDE TRAERSE TODOS)
    SALIDA: Devuelve una lista de usuarios gestionables
    */
    public List<Usuario> listarUsuariosGestionables() {
        Usuario usuarioAutenticadoAccion = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if(usuarioAutenticadoAccion == null) {
            return List.of();
        }
        List<Usuario> usuariosModificables = new ArrayList<Usuario>();
        if(esAdmin(usuarioAutenticadoAccion)) {
            usuariosModificables = new ArrayList<Usuario>(usuarioRepository.findAll());
            usuariosModificables.removeIf(u -> esAdmin(u) && !Objects.equals(usuarioAutenticadoAccion.getId(), u.getId()));
        } 
        else if (esProfessor(usuarioAutenticadoAccion)) {
            usuariosModificables = new ArrayList<Usuario>(usuarioRepository.findByCreadoPorUserId(usuarioAutenticadoAccion.getId()));
            usuariosModificables.removeIf(u -> !esUser(u));
        }
        usuariosModificables.sort(Comparator.comparing(Usuario::getFechaActualizacion,Comparator.nullsLast(Comparator.reverseOrder())));

        return usuariosModificables;
    }

    /*
    PARÁMETROS DE ENTRADA: id del usuario objetivo.
    DESCRIPCIÓN: Busca un usuario concreto y comprueba si el actor puede gestionarlo.
    SALIDA: Devuelve un Optional con el usuario si se puede gestionar, o vacío si no.
    */
    public Optional<Usuario> obtenerUsuarioGestionable(String idUsuarioObjetivo) {
        Usuario usuarioAutenticadoAccion = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if (usuarioAutenticadoAccion == null) {
            return Optional.empty();
        }

        if (idUsuarioObjetivo == null || idUsuarioObjetivo.trim().isEmpty()) {
            return Optional.empty();
        }

        Optional<Usuario> usuarioEncontradoBD = usuarioRepository.findById(idUsuarioObjetivo.trim());

        if (usuarioEncontradoBD.isEmpty()) {
            return Optional.empty();
        }

        Usuario usuarioModificar = usuarioEncontradoBD.get();

        if (!puedeGestionarUsuario(usuarioAutenticadoAccion, usuarioModificar)) {
            return Optional.empty();
        }

        return Optional.of(usuarioModificar);
    }

        /*
    PARÁMETROS DE ENTRADA: solicitud con los nuevos datos del perfil.
    DESCRIPCIÓN: Modifica los datos del usuario autenticado. Si llega password con valor, actualiza también la contraseña.
    SALIDA: Devuelve una respuesta indicando si la edición del perfil fue correcta o no.
    */
    public RespuestaRegistro editarMiPerfil(SolicitudRegistroUsuario solicitud) {
        Usuario usuarioAutenticado = accionRegistroUsuario.obtenerUsuarioAutenticado();

        if(usuarioAutenticado == null){
            return new RespuestaRegistro(false, "No user is authenticated");
        }

        if(solicitud == null) {
            return new RespuestaRegistro(false, "The request is invalid");
        }

        String nuevoUser = limpiarEspacios(solicitud.getUser());
        String nuevoEmail = limpiarEspacios(solicitud.getEmail());      

        if(nuevoUser.isEmpty()){
          return new RespuestaRegistro(false, "Username is required");
        }

        if(nuevoEmail.isEmpty()){
           return new RespuestaRegistro(false, "Email is required");
        }

        if(!usuarioAutenticado.getUser().equals(nuevoUser) && usuarioRepository.existsByUser(nuevoUser)) {
          return new RespuestaRegistro(false, "There is already another user with that username");
        }

        if (!usuarioAutenticado.getEmail().equals(nuevoEmail) && usuarioRepository.existsByEmail(nuevoEmail)) {
            return new RespuestaRegistro(false, "There is already another user with that email address");
        }

        usuarioAutenticado.setUser(nuevoUser);
        usuarioAutenticado.setNombre(limpiarTextoOpcional(solicitud.getNombre()));
        usuarioAutenticado.setApellido(limpiarTextoOpcional(solicitud.getApellidos()));
        usuarioAutenticado.setInstitucion(limpiarTextoOpcional(solicitud.getInstitucion()));
        usuarioAutenticado.setEmail(nuevoEmail);

        if(solicitud.getPassword() != null && !solicitud.getPassword().trim().isEmpty()) {
            usuarioAutenticado.setPasswordHash(passwordEncoder.encode(solicitud.getPassword()));
        }
        usuarioAutenticado.setFechaActualizacion(Instant.now());
        usuarioRepository.save(usuarioAutenticado);//Se guarda el usuario en la colección users
        return new RespuestaRegistro(true, "Profile updated successfully");
    }

    /*
    PARÁMETROS DE ENTRADA: solicitud con datos del alta.
    DESCRIPCIÓN: Comprueba que la solicitud tenga los campos obligatorios para crear un usuario.
    SALIDA: Devuelve el mensaje de si la validacion de la solicitud fue exitosa o no.
    */
    private RespuestaRegistro validarSolicitudAlta(SolicitudRegistroUsuario solicitud) {
        if (limpiarEspacios(solicitud.getUser()).isEmpty()) {
            return new RespuestaRegistro(false, "Username is required");
        }

        if (limpiarEspacios(solicitud.getEmail()).isEmpty()) {
            return new RespuestaRegistro(false, "Email is required");
        }

        if (solicitud.getPassword() == null || solicitud.getPassword().trim().isEmpty()) {
            return new RespuestaRegistro(false, "Password is required");
        }

        return new RespuestaRegistro(true, "Valid request");
    }

    /*
    PARÁMETROS DE ENTRADA: usuario.
    DESCRIPCIÓN: Comprueba si un usuario tiene rol ADMIN.
    SALIDA: Devuelve true si es ADMIN y false si no.
    */
    private boolean esAdmin(Usuario usuario) {
        return usuario != null && ROLE_ADMIN.equals(usuario.getRol());
    }

    /*
    PARÁMETROS DE ENTRADA: Un usuario.
    DESCRIPCIÓN: Comprueba si un usuario tiene rol PROFESSOR.
    SALIDA: Devuelve true si es PROFESSOR y false si no.
    */
    private boolean esProfessor(Usuario usuario) {
        return usuario != null && ROLE_PROFESSOR.equals(usuario.getRol());
    }

    /*
    PARÁMETROS DE ENTRADA: Un usuasuario.
    DESCRIPCIÓN: Comprueba si un usuario tiene rol USER.
    SALIDA: Devuelve true si es USER y false si no.
    */
    private boolean esUser(Usuario usuario) {
        return usuario != null && ROLE_USER.equals(usuario.getRol());
    }

    /*
    PARÁMETROS DE ENTRADA: rol.
    DESCRIPCIÓN: Comprueba si el rol recibido está permitido en el sistema.
    SALIDA: Devuelve true si el rol es válido y false si no.
    */
    private boolean esRolValido(String rol) {
        if (ROLE_USER.equals(rol)) {
            return true;
        }
        if (ROLE_PROFESSOR.equals(rol)) {
            return true;
        }
        if (ROLE_ADMIN.equals(rol)) {
            return true;
        }
        return false;
    }

    /*
    PARÁMETROS DE ENTRADA: El rol del usuario
    DESCRIPCIÓN: Normaliza el nombre del rol recibido para que quede con el formato del sistema.
    SALIDA: Devuelve el rol normalizado.
    */
    private String normalizarRol(String _rol) {
        if (_rol == null) {
            return null;
        }
        String rol = _rol.trim().toUpperCase();
        if (rol.equals("USER") || rol.equals("ROLE_USER")) {
            return ROLE_USER;
        }
        if (rol.equals("PROFESSOR") || rol.equals("ROLE_PROFESSOR")) {
            return ROLE_PROFESSOR;
        }
        if (rol.equals("ADMIN") || rol.equals("ROLE_ADMIN")) {
            return ROLE_ADMIN;
        }
        return rol;
    }

    /*
    PARÁMETROS DE ENTRADA: rol.
    DESCRIPCIÓN: Da un nivel numérico a cada rol para compararlos.
    SALIDA: Devuelve un número según la jerarquía del rol.
    */
    private int nivelRol(String rol) {
        String rolNormalizado = normalizarRol(rol);
        if(ROLE_USER.equals(rolNormalizado)){
            return 1;
        }
        if(ROLE_PROFESSOR.equals(rolNormalizado)){
            return 2;
        }
        if(ROLE_ADMIN.equals(rolNormalizado)){
            return 3;
        }
        return 0;
    }

    /*
    PARÁMETROS DE ENTRADA: usuario y rol requerido.
    DESCRIPCIÓN: Comprueba si el usuario tiene un nivel igual o superior al rol indicado.
    SALIDA: Devuelve true si cumple la jerarquía y false si no.
    */
    private boolean tieneNivelIgualOSuperior(Usuario usuario, String rolRequerido) {
        if(usuario == null){
            return false;
        }
        if(usuario.getRol() == null || rolRequerido == null){
            return false;
        }
        return nivelRol(usuario.getRol()) >= nivelRol(rolRequerido);
    }

    /*
    PARÁMETROS DE ENTRADA: usuario actor y rol objetivo.
    DESCRIPCIÓN: Comprueba si el actor puede crear usuarios con el rol indicado.
    SALIDA: Devuelve true si puede crear ese rol y false si no.
    */
    private boolean puedeCrearRol(Usuario actor, String rolObjetivo) {
        if(actor == null || rolObjetivo == null){
            return false;
        }

        if(esAdmin(actor)){
            return esRolValido(rolObjetivo);
        }

        if(esProfessor(actor)){
            return ROLE_USER.equals(rolObjetivo);
        }
        return false;
    }

    /*
    PARÁMETROS DE ENTRADA: usuario actor y usuario objetivo sobre el que se desea realziar algun tipo de accion
    DESCRIPCIÓN: Comprueba si el actor puede gestionar al usuario 
    SALIDA: Devuelve true si puede gestionarlo y false si no
    */
    private boolean puedeGestionarUsuario(Usuario actor, Usuario objetivo) {
        if (actor == null || objetivo == null) {
            return false;
        }
        if (esAdmin(objetivo) && !esAdmin(actor)) {
            return false;
        }
        if(esAdmin(actor)) {
            return true;
        }
        if(esProfessor(actor)) {
            return esUser(objetivo) && actor.getId() != null && actor.getId().equals(objetivo.getCreadoPorUserId());
        }

        return false;
    }

    /*
    PARÁMETROS DE ENTRADA: Usuario que realiza el borrado y usuario que se quiere borrar
    DESCRIPCIÓN: Comprueba si el actor puede borrar al usuario objetivo según su rol y la relación de creación
    PARÁMETRO DE SALIDA: true si puede borrarlo y false en caso contrario
    */
    private boolean puedeBorrarUsuario(Usuario actor, Usuario objetivo) {
        if (actor == null || objetivo == null) {
            return false;
        }

        if (actor.getId() == null || objetivo.getId() == null) {
            return false;
        }

        if (Objects.equals(actor.getId(), objetivo.getId())) {
            return false;
        }

        if (esProfessor(actor)) {
            return esUser(objetivo) && actor.getId().equals(objetivo.getCreadoPorUserId());
        }

        if (esAdmin(actor)){
            boolean rolPermitido = esUser(objetivo) || esProfessor(objetivo);
            return rolPermitido && actor.getId().equals(objetivo.getCreadoPorUserId());
        }

        return false;
    }


    /*
    PARÁMETROS DE ENTRADA: usuario actor, usuario objetivo y nuevo rol.
    DESCRIPCIÓN: Comprueba si el actor puede cambiar el rol del usuario objetivo.
    SALIDA: Devuelve true si puede asignar el nuevo rol y false si no.
    */
    private boolean puedeAsignarNuevoRol(Usuario actor, Usuario objetivo, String nuevoRol) {
        if (actor == null || objetivo == null || nuevoRol == null) {
            return false;
        }
        if (!esRolValido(nuevoRol)) {
            return false;
        }
        if (esProfessor(actor)) {
            return false;
        }
        if (esAdmin(actor)) {
            return true;
        }
        return false;
    }

        /*
    PARÁMETROS DE ENTRADA: id del usuario objetivo.
    DESCRIPCIÓN: Busca un usuario por su id y devuelve null si no existe o si no se puede gestionar.
    SALIDA: Devuelve el usuario encontrado o null.
    */
    public Usuario obtenerUsuarioGestionableDirecto(String idUsuarioObjetivo) {
        Optional<Usuario> usuarioOpt = obtenerUsuarioGestionable(idUsuarioObjetivo);
        if (usuarioOpt.isEmpty()) {
            return null;
        }
        return usuarioOpt.get();
    }

    /*
    PARÁMETROS DE ENTRADA: Ninguno.
    DESCRIPCIÓN: Comprueba si el usuario autenticado actual tiene rol ADMIN.
    SALIDA: Devuelve un false si el usuario no tiene rol ADMIN, en caso contrario, devuelve true
    */
    public boolean usuarioAutenticadoEsAdmin() {
        Usuario usuarioAutenticado = accionRegistroUsuario.obtenerUsuarioAutenticado();
        if (usuarioAutenticado == null) {
            return false;
        }
        if (esAdmin(usuarioAutenticado)) {
            return true;
        }
        return false;
    }

    /*
    PARÁMETROS DE ENTRADA: Una cadena de texto.
    DESCRIPCIÓN: Limpia espacios de un texto y evita null devolviendo cadena vacía.
    SALIDA: Devuelve el texto limpio.
    */
    private String limpiarEspacios(String texto) {
        if(texto == null){
            return "";
        }
        return texto.trim();
    }

    /*
    PARÁMETROS DE ENTRADA: Una cadena de texto
    DESCRIPCIÓN: Limpia un texto opcional y si queda vacío devuelve null
    SALIDA: Devuelve el texto limpio o null
    */
    private String limpiarTextoOpcional(String texto) {
        String textoLimpio = limpiarEspacios(texto);
        if(textoLimpio.isEmpty()){
            return null;
        }
        return textoLimpio;
    }

    //DESCRIPCIÓN:Comprueba que el archivo tenga una extensión de Excel
    private boolean esArchivoExcel(String nombreArchivo) {
        if(nombreArchivo == null|| nombreArchivo.trim().isEmpty()){
            return false;
        }
        String nombreMinusculas = nombreArchivo.trim().toLowerCase(Locale.ROOT);
        return nombreMinusculas.endsWith(".xlsx")|| nombreMinusculas.endsWith(".xls");
    }

    //DESCRIPCIÓN:Relaciona cada nombre de columna con su posición.El orden de las columnas dentro del Excel no importa
    private Map<String, Integer> obtenerColumnasExcel(Row filaCabecera,DataFormatter formateador,FormulaEvaluator evaluador){
        Map<String, Integer> columnas =new HashMap<String, Integer>();
        short ultimaCelda =filaCabecera.getLastCellNum();
        if(ultimaCelda < 0){
            return columnas;
        }
        for(int indice = 0; indice < ultimaCelda; indice++){
            String cabecera = leerCeldaExcel(filaCabecera,indice,formateador,evaluador);
            cabecera = cabecera.replace("\uFEFF", "") .trim().toLowerCase(Locale.ROOT);
            if (!cabecera.isEmpty()) {
                columnas.put(cabecera,indice);
            }
        }
        return columnas;
    }

    //DESCRIPCIÓN:Devuelve las columnas obligatorias que faltan.La columna user no es obligatoria
    private List<String> obtenerColumnasObligatoriasFaltantes(Map<String, Integer> columnas) {
        List<String> faltantes =new ArrayList<String>();
        if(!columnas.containsKey("name")){
            faltantes.add("name");
        }
        if(!columnas.containsKey("surname")){
            faltantes.add("surname");
        }
        if(!columnas.containsKey("email")){
            faltantes.add("email");
        }
        if(!columnas.containsKey("password")) {
            faltantes.add("password");
        }
        return faltantes;
    }

    // DESCRIPCIÓN:Lee una celda y devuelve su contenido como texto. Si la celda o la columna no existen, devuelve texto vacío
    private String leerCeldaExcel( Row fila, Integer indiceColumna, DataFormatter formateador, FormulaEvaluator evaluador) {
        if(fila == null|| indiceColumna == null) {
            return "";
        }
        Cell celda = fila.getCell(indiceColumna);
        if (celda == null) {
            return "";
        }
        return formateador.formatCellValue(celda,evaluador).trim();
    }

    //DESCRIPCIÓN:Comprueba si una fila completa está vacía
    private boolean filaExcelEstaVacia(Row fila,DataFormatter formateador,FormulaEvaluator evaluador) {
        if(fila == null) {
            return true;
        }
        short primeraCelda =fila.getFirstCellNum();
        short ultimaCelda =fila.getLastCellNum();

        if(primeraCelda < 0|| ultimaCelda < 0) {
            return true;
        }
        for(int indice = primeraCelda;indice < ultimaCelda;indice++){
            Cell celda = fila.getCell(indice);
            if(celda == null) {
                continue;
            }
            String valor =formateador.formatCellValue(celda, evaluador).trim();
            if (!valor.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    //DESCRIPCIÓN:Valida los campos obligatorios de cada fila del Excel.
    private String validarCamposObligatoriosExcel( String nombre,String apellidos,String email,String password) {
        if(nombre == null|| nombre.trim().isEmpty()){
            return "name is required";
        }
        if(apellidos == null|| apellidos.trim().isEmpty()){
            return "surname is required";
        }
        if(email == null|| email.trim().isEmpty()){
            return "email is required";
        }
        if(password == null || password.trim().isEmpty()) {
            return "password is required";
        }
        if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return "the email format is invalid";
        }
        return null;
    }

    //DESCRIPCIÓN:Construye el username automático
    private String construirUsernameAutomatico(long numero,String nombreCreador) {
        return "user_" + numero+ "_"+ nombreCreador;
    }

    /*DESCRIPCIÓN: Prepara el username del profesor o administrador para utilizarlo dentro del username automático. Elimina:
    - espacios
    - acentos
    - puntos
    - guiones
    - caracteres especiales*/
    private String normalizarNombreCreador(String nombreCreador){
        if(nombreCreador == null|| nombreCreador.trim().isEmpty()) {
            return "creator";
        }
        String textoNormalizado = Normalizer.normalize(nombreCreador.trim(),Normalizer.Form.NFD);
        textoNormalizado = textoNormalizado.replaceAll("\\p{M}","");
        textoNormalizado =textoNormalizado.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]","");
        if(textoNormalizado.isEmpty()){
            return "creator";
        }
        return textoNormalizado;
    }


} 
