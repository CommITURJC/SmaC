package smac.compiler.compilador;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/*
INFO: Clase encargada de gestionar la compilación de contratos Solidity usando solc
*/

@Service
public class AccionCompilarSolidity {

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Value("${compilador.solc.ruta:solc}")
    private String rutaSolc;//ESTOS DATOS LOS SACA DEL ARCHIVO APPLICATION.PROPERTIES

    @Value("${compilador.solc.timeout-segundos:20}")
    private long timeoutSegundos;//ESTOS DATOS LOS SACA DEL ARCHIVO APPLICATION.PROPERTIES

    private final String opcionCompilador = "--standard-json";//TIPO ENTRADA DE INFORMACIÓN QUE VA A RECIBIR SOLC

    /*
    PARÁMETRO DE ENTRADA: EL DTO con los datos del contrato a compilar que se recibe desde el editor de SMACLY
    */
    public SalidaCompilacion compilar(PeticionCompilar solicitud) {

        validarSolicitud(solicitud);
        SalidaCompilacion resultado = new SalidaCompilacion();
        try{
            String nombreArchivo = normalizarNombreArchivo(solicitud.getNombreArchivoContrato());
            String entradaStandardJson = construirEntradaJson(solicitud, nombreArchivo);
            String salidaSolc = ejecutarSolc(entradaStandardJson);
            JsonNode raiz = jsonMapper.readTree(salidaSolc);
            List<InformacionCompilacion> informacion = extraerInformacion(raiz);
            List<Contrato> contratos = extraerContratos(raiz);
            boolean compilacionCorrecta = true;
            for(InformacionCompilacion info : informacion){
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
        catch (Exception excepcion) {
            List<InformacionCompilacion> informacion = new ArrayList<>();
            InformacionCompilacion error = new InformacionCompilacion();
            error.setOrigen(normalizarNombreArchivo(solicitud.getNombreArchivoContrato()));
            error.setTipo("ExcepcionBackend");
            error.setClaseMensaje("error");
            error.setMensaje("Internal error while running solc: " + excepcion.getMessage());
            informacion.add(error);
            resultado.setResultadoCompilacion(false);
            resultado.setContratos(new ArrayList<>());
            resultado.setInformacion(informacion);
            return resultado;
        }
    }

    private void validarSolicitud(PeticionCompilar solicitud) {
        if (solicitud == null) {
            throw new IllegalArgumentException("A null value is being sent");
        }
        if (solicitud.getCodigoFuenteContrato() == null || solicitud.getCodigoFuenteContrato().trim().isEmpty()) {
            throw new IllegalArgumentException("The contract code field is empty");
        }
        if (solicitud.getEjecucionesOptimizador() != null && solicitud.getEjecucionesOptimizador() < 0) {
            throw new IllegalArgumentException("Optimizer executions cannot be negative");
        }
    }
    private String normalizarNombreArchivo(String nombreArchivo) {
        if (nombreArchivo == null || nombreArchivo.trim().isEmpty()) {
            return "Contrato.sol";
        }

        String limpio = nombreArchivo.trim();//Limpiamos para concatenar la extensión de Solidity
        if (!limpio.endsWith(".sol")) {//Si termina con .sol no hace falta añadir de nuevo la extensión
            limpio = limpio + ".sol";
        }

        return limpio;
    }

    /* PARÁMETROS DE ENTRADA: El objeto PeticionCompilar que contiene el código  Solidity, las opciones de configuración del optimizador junto con el texto del nombre del archivo Solidity.
     DESCRIPCIÓN: Construye la entrada JSON para el compilador Solidity que incluye el lenguaje, el código fuente, la configuración del optimizador y los elementos que debe devolver la compilación, como el ABI, los metadatos, el bytecode y el AST
     PARÁMETRO DE SALIDA: Un String que se pasa como entrada al proceso de compilación en formato JSON
      */
    private String construirEntradaJson(PeticionCompilar solicitud, String nombreArchivo) throws Exception {
        ObjectNode raiz = jsonMapper.createObjectNode();
        raiz.put("language", "Solidity");
        ObjectNode sources = jsonMapper.createObjectNode();
        ObjectNode fichero = jsonMapper.createObjectNode();
        fichero.put("content", solicitud.getCodigoFuenteContrato());//SE AÑADE EL CODIGO FUENTE A COMPILAR
        sources.set(nombreArchivo, fichero);
        raiz.set("sources", sources);
        ObjectNode settings = jsonMapper.createObjectNode();
        ObjectNode optimizer = jsonMapper.createObjectNode();
        Boolean optimizadorActivo = solicitud.getOptimizadorActivo();
        Integer ejecuciones = solicitud.getEjecucionesOptimizador();
        if (optimizadorActivo == null) {
            optimizadorActivo = true;
        }
        if (ejecuciones == null) {
            ejecuciones = 200;
        }
        optimizer.put("enabled", optimizadorActivo);
        optimizer.put("runs", ejecuciones);
        settings.set("optimizer", optimizer);
        ObjectNode outputSelection = jsonMapper.createObjectNode();
        ObjectNode todosArchivos = jsonMapper.createObjectNode();
        ArrayNode salidasContrato = jsonMapper.createArrayNode();
        // SE PREPARAN LAS SALIDAS, INFORMACIÓN DERIVADA DE LA COMPILACIÓN DE CADA CONTRATO
        salidasContrato.add("abi");
        salidasContrato.add("metadata");
        salidasContrato.add("evm.bytecode");
        salidasContrato.add("evm.deployedBytecode");
        todosArchivos.set("*", salidasContrato);
        // SE PREPARAN LAS SALIDAS GENERADAS PARA EL ARCHIVO SOLIDITY
        ArrayNode salidasArchivo = jsonMapper.createArrayNode();
        salidasArchivo.add("ast");
        todosArchivos.set("", salidasArchivo);
        outputSelection.set("*", todosArchivos);
        settings.set("outputSelection", outputSelection);
        raiz.set("settings", settings);

        return jsonMapper.writeValueAsString(raiz);//PARA CONVERTIRLO EN JSON Y DEVOLVERLO
    }

    private String ejecutarSolc(String entradaJson) throws Exception {
        ProcessBuilder procesoCompilacion = new ProcessBuilder(rutaSolc,opcionCompilador);//Crea el proceso para la ejecución del compilador. La rutaSolc es donde se encuentra el compilador y la opcionCompilador es como va a recibir el contrato (En este caso JSON)
        procesoCompilacion.redirectErrorStream(true);
        Process proceso = procesoCompilacion.start();//Inicia el proceso de compilacion
        try(BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(proceso.getOutputStream(), StandardCharsets.UTF_8))) {
            writer.write(entradaJson);
            writer.flush();
        }
        var executor = java.util.concurrent.Executors.newSingleThreadExecutor();
        try {
            java.util.concurrent.Future<String> salidaFuture = executor.submit(() -> {
                try(InputStream inputStream = proceso.getInputStream()){
                    byte[] bytes = inputStream.readAllBytes();
                    return new String(bytes, StandardCharsets.UTF_8);
                }
            });
            boolean finalizado = proceso.waitFor(timeoutSegundos, TimeUnit.SECONDS);
            if(!finalizado){
                proceso.destroyForcibly();
                throw new RuntimeException("Timeout occurred when calling solc.");
            }
            String salida = salidaFuture.get(5, TimeUnit.SECONDS);
            if(salida == null || salida.trim().isEmpty()){
                throw new RuntimeException("solc did not return any output.");
            }
            return salida;
        } 
        finally{
            executor.shutdownNow();
        }
     
    }

    private List<InformacionCompilacion> extraerInformacion(JsonNode raiz) {
        List<InformacionCompilacion> informacion = new ArrayList<>();
        JsonNode errores = raiz.get("errors");
        if (errores != null && errores.isArray()) {
            for(JsonNode errorNode : errores){
                InformacionCompilacion info = new InformacionCompilacion();

                JsonNode sourceLocation = errorNode.get("sourceLocation");
                if(sourceLocation != null && sourceLocation.get("file") != null) {
                    info.setOrigen(sourceLocation.get("file").asString());
                } 
                else{
                    info.setOrigen("desconocido");
                }

                info.setTipo(errorNode.has("type") ? errorNode.get("type").asString() : "desconocido");
                info.setClaseMensaje(errorNode.has("severity") ? errorNode.get("severity").asString() : "desconocido");
                info.setMensaje(
                        errorNode.has("formattedMessage")
                                ? errorNode.get("formattedMessage").asString()
                                : "Mensaje no disponible"
                );

                informacion.add(info);
            }
        }

        return informacion;
    }

    private List<Contrato> extraerContratos(JsonNode raiz) {
        List<Contrato> contratos = new ArrayList<>();

        JsonNode contractsNode = raiz.get("contracts");
        if(contractsNode == null || !contractsNode.isObject()) {
            return contratos;
        }

        Iterator<Map.Entry<String, JsonNode>> archivos = contractsNode.properties().iterator();

        while(archivos.hasNext()){
            Map.Entry<String, JsonNode> entradaArchivo = archivos.next();
            JsonNode contratosDelArchivo = entradaArchivo.getValue();
            Iterator<Map.Entry<String, JsonNode>> contratosIterator = contratosDelArchivo.properties().iterator();
            while (contratosIterator.hasNext()) {
                Map.Entry<String, JsonNode> entradaContrato = contratosIterator.next();
                String nombreContrato = entradaContrato.getKey();
                JsonNode nodoContrato = entradaContrato.getValue();
                Contrato contrato = new Contrato();
                contrato.setNombreContrato(nombreContrato);
                if (nodoContrato.has("abi")) {
                    contrato.setAbi(nodoContrato.get("abi"));
                }
                if (nodoContrato.has("metadata")) {
                    contrato.setMetadata(nodoContrato.get("metadata").asString());
                }
                JsonNode evm = nodoContrato.get("evm");
                if (evm != null && evm.isObject()) {

                    JsonNode bytecodeNode = evm.get("bytecode");
                    if(bytecodeNode != null && bytecodeNode.has("object")) {
                        contrato.setBytecode(bytecodeNode.get("object").asString());
                    }

                    JsonNode deployedBytecodeNode = evm.get("deployedBytecode");
                    if(deployedBytecodeNode != null && deployedBytecodeNode.has("object")){
                        contrato.setBytecodeDesplegado(deployedBytecodeNode.get("object").asString());
                    }
                }

                contratos.add(contrato);
            }
        }

        return contratos;
    }

    /*
    PARÁMETRO DE ENTRADA: Un objeto PeticionCompilar con el código fuente Solidity, el nombre del archivo y las opciones del optimizador
    DESCRIPCIÓN: Ejecuta solc usando la misma entrada JSON de la compilación normal y extrae el AST generado para el archivo Solidity indicado
    PARÁMETRO DE SALIDA: Un objeto JsonNode con el AST del contrato Solidity
    */
    public JsonNode obtenerAst(PeticionCompilar solicitud) {
        validarSolicitud(solicitud);
        try {
            String nombreArchivo = normalizarNombreArchivo(solicitud.getNombreArchivoContrato());
            String entradaStandardJson = construirEntradaJson(solicitud, nombreArchivo);
            String salidaSolc = ejecutarSolc(entradaStandardJson);
            JsonNode raiz =  jsonMapper.readTree(salidaSolc);
            JsonNode sources = raiz.get("sources");
            if(sources == null || !sources.isObject()){
                throw new RuntimeException("The compiler did not return any information from the source files");
            }
            JsonNode archivo = sources.get(nombreArchivo);
            if(archivo == null || archivo.get("ast") == null){
                throw new RuntimeException("The compiler did not return the contract's AST");
            }
            return archivo.get("ast");
        } 
        catch (Exception error) {
            throw new RuntimeException("Error retrieving the AST with solc: " + error.getMessage(), error);
        }
    }

    


}