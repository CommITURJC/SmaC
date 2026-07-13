package smac.compiler.compilador;


import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import smac.compiler.compilador.parserSmaCly.ParserSolidity;
import smac.compiler.compilador.parserSmaCly.RespuestaParser;
import smac.compiler.compilador.e3value.AccionConvertirE3Value;
import smac.compiler.compilador.e3value.SolicitudConvertirE3Value;
import smac.compiler.compilador.mongo.AccionAdministracionUsuario;
import smac.compiler.compilador.mongo.AccionRegistroLogs;
import smac.compiler.compilador.mongo.AccionRegistroUsuario;
import smac.compiler.compilador.mongo.SolicitudRegistroUsuario;
import smac.compiler.compilador.mongo.RespuestaRegistro;
import smac.compiler.compilador.mongo.SolicitudRegistrarLogs;
import smac.compiler.compilador.mongo.AccionWorkspace;
import smac.compiler.compilador.mongo.LogsUsuario;
import smac.compiler.compilador.mongo.SolicitudWorkspace;
import smac.compiler.compilador.mongo.SolicitudRegistroWorkspace;
import smac.compiler.compilador.mongo.Usuario;
import smac.compiler.compilador.mongo.Workspace;
import org.springframework.web.multipart.MultipartFile;

/*
INFO: Controlador REST encargado de dar altas, modificaciones y borrados de usuarios, workspace y logs y de compilaciones de los smart contracts
*/

@RestController
public class Controlador {

    private final AccionCompilarSolidity compilarSolidity;
    private final AccionRegistroUsuario registrarUsuario;
    private final AccionRegistroLogs registrarLogs;
    private final AccionWorkspace operarWorkspace;
    private final AccionAdministracionUsuario administrarUsuario;
    private final AccionConvertirE3Value convertirE3Value;
    private final ParserSolidity convertirSolidity_Bloques;
    private final AccionCompilarVyper compilarVyper;

    public Controlador(AccionCompilarSolidity compilarSolidity, AccionRegistroUsuario registrarUsuario, AccionRegistroLogs registrarLogs, AccionWorkspace operarWorkspace, 
        AccionAdministracionUsuario administrarUsuario, AccionConvertirE3Value convertirE3Value, ParserSolidity parserSolidity, AccionCompilarVyper _compilarVyper) {
        this.compilarSolidity = compilarSolidity;
        this.registrarUsuario = registrarUsuario;
        this.registrarLogs = registrarLogs;
        this.operarWorkspace = operarWorkspace;
        this.administrarUsuario = administrarUsuario;
        this.convertirE3Value = convertirE3Value;
        this.convertirSolidity_Bloques = parserSolidity;
        this.compilarVyper = _compilarVyper;
    }

    @GetMapping("/api/prueba")
    public String prueba() {
        return "FUNCIONA";
    }

    /*
    PARÁMETRO DE ENTRADA: Un objeto solicitud que viene del JSON con el nombre del contrato, el codigo de este y el optimizador
    */
    @PostMapping("/api/compilarSolidity")
    public SalidaCompilacion compilarContratoSolidity(@RequestBody PeticionCompilar solicitud) {
        return compilarSolidity.compilar(solicitud);
    }

      /*
    PARÁMETRO DE ENTRADA: Un objeto solicitud que viene del JSON con el nombre del contrato, el codigo de este y el optimizador
    */
    @PostMapping("/api/compilarVyper")
    public SalidaCompilacion compilarContratoVyper(@RequestBody PeticionCompilar solicitud) {
        return compilarVyper.compilar(solicitud);
    }

    /*
    PARÁMETRO DE ENTRADA: Un objeto solicitud que viene JSON con el nombre del contrato, el codigo de este y el optimizador
    */
    @PostMapping("/api/registrarUsuario")
    public RespuestaRegistro registrar(@RequestBody SolicitudRegistroUsuario solicitud) {
        return registrarUsuario.registrarUsuario(solicitud);
    }

    @PostMapping("/api/admin/usuarios")
    public RespuestaRegistro crearUsuario(@RequestBody SolicitudRegistroUsuario solicitud,@RequestParam String rol) {
        return administrarUsuario.crearUsuario(solicitud, rol);
    }

    @PostMapping("/api/admin/usuarios/carga-masiva")
    public RespuestaRegistro cargarUsuariosMasivos( @RequestParam("archivo")MultipartFile archivo) {
        return administrarUsuario.cargarUsuariosDesdeExcel(archivo);
    }

    @PutMapping("/api/admin/usuarios/{id}")
    public RespuestaRegistro editarUsuario(@PathVariable String id, @RequestBody SolicitudRegistroUsuario solicitud, @RequestParam String rol) {
        return administrarUsuario.editarUsuario(id, solicitud, rol);
    }

    @DeleteMapping("/api/admin/usuarios/{id}")
    public RespuestaRegistro borrarUsuario(@PathVariable String id) {
        return administrarUsuario.borrarUsuario(id);
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todas las cuentas que el usuario autenticado tiene permiso para borrar
    PARÁMETRO DE SALIDA: Respuesta indicando el resultado del borrado masivo
    */
    @DeleteMapping("/api/admin/usuarios")
    public RespuestaRegistro borrarTodosUsuariosPermitidos() {
        return administrarUsuario.borrarTodosUsuariosPermitidos();
    }

    @PatchMapping("/api/admin/usuarios/{id}/bloqueo")
    public RespuestaRegistro cambiarBloqueoUsuario(@PathVariable String id, @RequestBody Map<String, Boolean> solicitud) {
        Boolean bloqueada = solicitud.get("bloqueada");
        if(bloqueada == null){
            return new RespuestaRegistro(false, "Debe indicarse si el usuario queda bloqueado o desbloqueado");
        }
        return administrarUsuario.cambiarBloqueoUsuario(id, bloqueada);
    }

    @GetMapping("/api/admin/usuarios/gestionables")
    public List<Usuario> listarUsuariosGestionables() {
        return administrarUsuario.listarUsuariosGestionables();
    }

    @GetMapping("/api/miPerfil")
    public Usuario obtenerMiPerfil() {
        return registrarUsuario.obtenerUsuarioAutenticado();
    }

    @PutMapping("/api/miPerfil")
    public RespuestaRegistro guardarMiPerfil(@RequestBody SolicitudRegistroUsuario solicitud) {
        return administrarUsuario.editarMiPerfil(solicitud);
    }

    @PostMapping("/api/registrarLogs")
    public RespuestaRegistro registrarLogs(@RequestBody SolicitudRegistrarLogs solicitud) {
        return registrarLogs.registrarLogs(solicitud);
    }

    @PostMapping("/api/crearWorkspace")
    public RespuestaRegistro crearWorkspace(@RequestBody SolicitudWorkspace solicitud) {
        return operarWorkspace.crearWorkspace(solicitud);
    }

    /*
    
    PARÁMTETRO DE SALIDA: Devuelve el workspace entero
    */
    @PostMapping("/api/registrarWorkspace")
    public Workspace registrarWorkspace(@RequestBody SolicitudRegistroWorkspace solicitud) {
        return operarWorkspace.registrarWorkspace(solicitud);
    }

    @PostMapping("/api/cargarWorkspace")
    public Workspace cargarWorkspace(@RequestBody String workspaceId) {
        return operarWorkspace.cargarWorkspace(workspaceId.replace("\"", ""));
    }

    @GetMapping("/api/listarWorkspaces")
    public List<Workspace> listarWorkspaces() {
        return operarWorkspace.listarWorkspacesUsuario();
    }

    @GetMapping("/api/workspaces/visibles")
    public List<Workspace> listarWorkspacesVisibles() {
        return operarWorkspace.listarWorkspacesVisibles();
    }

    @GetMapping("/api/ultimoWorkspace")
    public Workspace obtenerUltimoWorkspace() {
        return operarWorkspace.obtenerUltimoWorkspaceUsuario();
    }

    @DeleteMapping("/api/workspaces/{id}")
    public RespuestaRegistro borrarWorkspace(@PathVariable String id) {
        return operarWorkspace.borrarWorkspace(id);
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todos los workspaces y plantillas que puede gestionar el usuario autenticado
    PARÁMETRO DE SALIDA: Respuesta indicando el resultado del borrado masivo
    */
    @DeleteMapping("/api/workspaces")
    public RespuestaRegistro borrarTodosWorkspacesPermitidos() {
        return operarWorkspace.borrarTodosWorkspacesPermitidos();
    }

    @GetMapping("/api/logs/mostrarLogs")
    public List<LogsUsuario> mostrarLogs() {
        return registrarLogs.listarLogsVisibles();
    }

    /*
    PARÁMETRO DE ENTRADA: El id de la sesión cuyos logs se desean eliminar
    DESCRIPCIÓN: Recibe el id de una sesión y se procede con la eliminación de todos los logs asociados a dicha sesión
    PARÁMETRO DE SALIDA: Un objeto de la clase RespuestaRegistro indicando si la operación se ha realizado correctamente o no
    */
    @DeleteMapping("/api/logs/sesion/{sessionId}")
    public RespuestaRegistro borrarLogsPorSesion(@PathVariable String sessionId) {
        return registrarLogs.borrarLogsPorSesion(sessionId);
    }

    /*
    PARÁMETRO DE ENTRADA: Ninguno
    DESCRIPCIÓN: Elimina todos los logs que puede gestionar el usuario autenticado
    PARÁMETRO DE SALIDA: Respuesta indicando el resultado del borrado masivo
    */
    @DeleteMapping("/api/logs")
    public RespuestaRegistro borrarTodosLogsPermitidos() {
        return registrarLogs.borrarTodosLogsPermitidos();
    }

    /*
    PARÁMETRO DE ENTRADA: Recibe el codigo Solidity que se quiere transformar a bloques
    DESCRIPCIÓN: Convierte el contrato Solidity en XML de Blockly usando el parser Java
    PARÁMETRO DE SALIDA: RespuestaParser con el XML generado o el error
    */
    @PostMapping("/api/parsearSolidity")
    public RespuestaParser parsearSolidity(@RequestBody PeticionCompilar peticion) {
        return convertirSolidity_Bloques.parsear(peticion);
    }


    //-------PARTE DE E3VALUE--------------

    @PostMapping("/api/e3value/contratos")
    public List<String> obtenerContratosE3Value(@RequestBody SolicitudConvertirE3Value solicitud) {
        return convertirE3Value.obtenerContratos(solicitud);
    }

    @PostMapping("/api/e3value/eventos")
    public List<String> obtenerEventosE3Value(@RequestBody SolicitudConvertirE3Value solicitud) {
        return convertirE3Value.obtenerEventos(solicitud);
    }

    @PostMapping("/api/e3value/convertirE3Value")
    public Map<String, String> convertirE3Value(@RequestBody SolicitudConvertirE3Value solicitud) {
        String xml = convertirE3Value.convertir(solicitud);
        Map<String, String> respuesta = new java.util.HashMap<String, String>();
        respuesta.put("xml", xml);
        return respuesta;
    }

    /*
    PARÁMETRO DE ENTRADA: Una solicitud con el código Solidity y el contrato elegido
    DESCRIPCIÓN: Comprueba si el contrato seleccionado tiene los elementos mínimos necesarios para generar un modelo e3value
    PARÁMETRO DE SALIDA: Un mapa con el resultado de la validación y los elementos que faltan
    */
    @PostMapping("/api/e3value/validar")
    public Map<String, Object> validarE3Value(@RequestBody SolicitudConvertirE3Value solicitud) {
        return convertirE3Value.validarComponentesMinimos(solicitud);
    }

    @PostMapping("/api/e3value/preguntasObjetos")
    public List<Map<String, String>> obtenerPreguntasObjetosE3Value(@RequestBody SolicitudConvertirE3Value solicitud) {
        return convertirE3Value.obtenerPreguntasObjetosValor(solicitud);
    }


}