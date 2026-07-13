package smac.compiler.compilador;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/*
INFO: Clase encargada de gestionar la compilación de contratos Vyper usando el compilador de Vyper
*/

@Service
public class AccionCompilarVyper {

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Value("${compilador.vyper.ruta:vyper}")
    private String rutaVyper;//ESTOS DATOS LOS SACA DEL ARCHIVO APPLICATION.PROPERTIES

    @Value("${compilador.vyper.timeout-segundos:20}")
    private long timeoutSegundos;//ESTOS DATOS LOS SACA DEL ARCHIVO APPLICATION.PROPERTIES

    /*
    PARÁMETRO DE ENTRADA: Un objeto PeticionCompilar con el codigo fuente Vyper y el nombre del archivo
    DESCRIPCIÓN: Ejecuta el compilador de Vyper y guarda el resultado de la compilacion
    PARÁMETRO DE SALIDA: Un objeto SalidaCompilacion con el resultado, los contratos y los mensajes generados
    */
    public SalidaCompilacion compilar(PeticionCompilar solicitud) {

        validarSolicitud(solicitud);

        SalidaCompilacion resultado = new SalidaCompilacion();
        Path archivoTemporal = null;

        try {
            String nombreArchivo = normalizarNombreArchivo(solicitud.getNombreArchivoContrato());
            archivoTemporal = crearArchivoTemporal(solicitud,nombreArchivo);
            String salidaVyper = ejecutarVyper(archivoTemporal);
            List<InformacionCompilacion> informacion = extraerInformacion(salidaVyper);
            List<Contrato> contratos = extraerContratos(salidaVyper,nombreArchivo);
            boolean compilacionCorrecta = true;
            for(InformacionCompilacion info:informacion){
                if("error".equalsIgnoreCase(info.getClaseMensaje())){
                    compilacionCorrecta = false;
                    break;
                }
            }
            resultado.setResultadoCompilacion(compilacionCorrecta);
            resultado.setInformacion(informacion);
            resultado.setContratos(contratos);
            return resultado;

        } 
        catch(Exception excepcion){
            List<InformacionCompilacion> informacion = new ArrayList<>();

            InformacionCompilacion error = new InformacionCompilacion();
            error.setOrigen(normalizarNombreArchivo(solicitud.getNombreArchivoContrato()));
            error.setTipo("ExcepcionBackend");
            error.setClaseMensaje("error");
            error.setMensaje("Internal error while running Vyper: " + excepcion.getMessage());
            informacion.add(error);
            resultado.setResultadoCompilacion(false);
            resultado.setContratos(new ArrayList<>());
            resultado.setInformacion(informacion);

            return resultado;
        }
        finally{
            borrarArchivoTemporal(archivoTemporal);
        }
    }

    /*
    PARÁMETRO DE ENTRADA: Un objeto PeticionCompilar con los datos recibidos del frontend
    DESCRIPCIÓN: Comprueba que la solicitud y el codigo Vyper no esten vacios
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void validarSolicitud(PeticionCompilar solicitud) {
        if(solicitud == null){
            throw new IllegalArgumentException("A null is being sent");
        }
        if(solicitud.getCodigoFuenteContrato() == null || solicitud.getCodigoFuenteContrato().trim().isEmpty()){
            throw new IllegalArgumentException("The contract code field is empty");
        }
    }

    /*
    PARÁMETRO DE ENTRADA: El nombre del archivo recibido desde el frontend
    DESCRIPCIÓN: Limpia el nombre del archivo y se asegura de que tenga extension .vy
    PARÁMETRO DE SALIDA: Un String con el nombre del archivo Vyper
    */
    private String normalizarNombreArchivo(String nombreArchivo) {
        if(nombreArchivo == null || nombreArchivo.trim().isEmpty()){
            return "Contrato.vy";
        }
        String limpio = nombreArchivo.trim();
        if(limpio.endsWith(".sol")){
            limpio = quitarExtensionSolidity(limpio);
        }
        if(!limpio.endsWith(".vy")){
            limpio = limpio + ".vy";
        }
        return limpio;
    }

    /*
    PARÁMETRO DE ENTRADA: El nombre del archivo
    DESCRIPCIÓN: Quita la extension .sol cuando llega por error un nombre de Solidity
    PARÁMETRO DE SALIDA: Nombre del archivo sin la extension .sol
    */
    private String quitarExtensionSolidity(String nombreArchivo) {
        String nuevo = "";
        for(int i = 0;i < nombreArchivo.length() - 4;i++){
            nuevo += nombreArchivo.charAt(i);
        }
        return nuevo;
    }

    /*
    PARÁMETRO DE ENTRADA: La solicitud con el codigo Vyper y el nombre del archivo
    DESCRIPCIÓN: Crea un archivo temporal para que el compilador de Vyper pueda compilarlo
    PARÁMETRO DE SALIDA: La ruta del archivo temporal creado
    */
    private Path crearArchivoTemporal(PeticionCompilar solicitud,String nombreArchivo) throws Exception {
        String sufijo = "_" + nombreArchivo;

        Path archivoTemporal = Files.createTempFile("smacly_vyper_",sufijo);
        Files.writeString(archivoTemporal,solicitud.getCodigoFuenteContrato(),StandardCharsets.UTF_8);

        return archivoTemporal;
    }

    /*
    PARÁMETRO DE ENTRADA: La ruta del archivo temporal con el codigo Vyper
    DESCRIPCIÓN: Ejecuta el compilador de Vyper pidiendo abi, bytecode y bytecode runtime
    PARÁMETRO DE SALIDA: Un String con la salida generada por el compilador
    */
    private String ejecutarVyper(Path archivoTemporal) throws Exception {
        ProcessBuilder processBuilder = new ProcessBuilder(rutaVyper, "-f","abi,bytecode,bytecode_runtime",archivoTemporal.toString());
        processBuilder.redirectErrorStream(true);
        Process proceso = processBuilder.start();
        var executor = java.util.concurrent.Executors.newSingleThreadExecutor();
        try {
            java.util.concurrent.Future<String> salidaFuture = executor.submit(() -> {
                try(InputStream inputStream = proceso.getInputStream()){
                    byte[] bytes = inputStream.readAllBytes();
                    return new String(bytes,StandardCharsets.UTF_8);
                }
            });
            boolean finalizado = proceso.waitFor(timeoutSegundos,TimeUnit.SECONDS);
            if(!finalizado){
                proceso.destroyForcibly();
                throw new RuntimeException("Timeout occurred while invoking vyper");
            }
            String salida = salidaFuture.get(5,TimeUnit.SECONDS);
            if(salida == null || salida.trim().isEmpty()){
                throw new RuntimeException("Vyper did not return any output");
            }
            if(proceso.exitValue() != 0){
                throw new RuntimeException(salida);
            }

            return salida;
        }
        finally{
            executor.shutdownNow();
        }
    }

    /*
    PARÁMETRO DE ENTRADA: La salida generada por el compilador de Vyper
    DESCRIPCIÓN: Crea la lista de mensajes de compilacion. Si Vyper compila bien, normalmente no hay mensajes
    PARÁMETRO DE SALIDA: Lista de InformacionCompilacion
    */
    private List<InformacionCompilacion> extraerInformacion(String salidaVyper) {
        List<InformacionCompilacion> informacion = new ArrayList<>();
        return informacion;
    }

    /*
    PARÁMETRO DE ENTRADA: La salida del compilador Vyper y el nombre del archivo compilado
    DESCRIPCIÓN: Extrae el abi, el bytecode y el bytecode desplegado de la salida del compilador
    PARÁMETRO DE SALIDA: Lista con los contratos compilados
    */
    private List<Contrato> extraerContratos(String salidaVyper,String nombreArchivo) throws Exception {
        List<Contrato> contratos = new ArrayList<>();
        List<String> partes = obtenerPartesSalida(salidaVyper);
        if(partes.size() < 2){
            throw new RuntimeException("It has not been possible to read ABI and bytecode since the release of Vyper: " + salidaVyper);
        }
        String abiTexto = partes.get(0);
        String bytecode = partes.get(1);
        String bytecodeRuntime = "";
        if(partes.size() > 2){
            bytecodeRuntime = partes.get(2);
        }
        Contrato contrato = new Contrato();
        contrato.setNombreContrato(nombreContrato(nombreArchivo));
        contrato.setAbi(jsonMapper.readTree(abiTexto));
        contrato.setBytecode(bytecode);
        contrato.setBytecodeDesplegado(bytecodeRuntime);
        contratos.add(contrato);
        return contratos;
    }

    /*
    PARÁMETRO DE ENTRADA: La salida completa del compilador de Vyper
    DESCRIPCIÓN: Separa la salida en lineas con contenido para poder leer abi y bytecode
    PARÁMETRO DE SALIDA: Lista de Strings con cada parte de la salida
    */
    private List<String> obtenerPartesSalida(String salidaVyper) {
        List<String> partes = new ArrayList<>();

        String actual = "";

        for(int i = 0;i < salidaVyper.length();i++){
            char c = salidaVyper.charAt(i);

            if(c == '\n' || c == '\r'){
                if(!actual.trim().equals("")){
                    partes.add(actual.trim());
                }

                actual = "";
            }
            else{
                actual += c;
            }
        }

        if(!actual.trim().equals("")){
            partes.add(actual.trim());
        }

        return partes;
    }

    /*
    PARÁMETRO DE ENTRADA: Nombre del archivo Vyper
    DESCRIPCIÓN: Saca un nombre de contrato a partir del nombre del archivo
    PARÁMETRO DE SALIDA: Nombre del contrato
    */
    private String nombreContrato(String nombreArchivo) {
        if(nombreArchivo == null || nombreArchivo.trim().isEmpty()){
            return "Contrato";
        }

        if(nombreArchivo.endsWith(".vy")){
            String nombre = "";

            for(int i = 0;i < nombreArchivo.length() - 3;i++){
                nombre += nombreArchivo.charAt(i);
            }

            return nombre;
        }

        return nombreArchivo;
    }

    /*
    PARÁMETRO DE ENTRADA: Ruta del archivo temporal creado para compilar
    DESCRIPCIÓN: Borra el archivo temporal si existe
    PARÁMETRO DE SALIDA: No devuelve nada
    */
    private void borrarArchivoTemporal(Path archivoTemporal) {
        if(archivoTemporal == null){
            return;
        }
        try{
            Files.deleteIfExists(archivoTemporal);
        }
        catch(Exception excepcion){
            System.out.println("The Vyper temporary file could not be deleted: " + excepcion.getMessage());
        }
    }
}