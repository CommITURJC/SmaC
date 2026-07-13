package smac.compiler.compilador.e3value;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import smac.compiler.compilador.AccionCompilarSolidity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import smac.compiler.compilador.e3value.Function;

@Service
public class AccionConvertirE3Value {

    private final AccionCompilarSolidity compilarSolidity;
    private final int NUMERO_MINIMO_ACTORES_E3VALUE= 2;
    private final int NUMERO_MINIMO_CONTRATOS_E3VALUE= 1;
    private final int NUMERO_MINIMO_FUNCIONES_E3VALUE= 1;
    private final int NUMERO_MINIMO_EVENTOS_E3VALUE= 1;
    private final int NUMERO_MINIMO_OBJETOS_VALOR_E3VALUE= 1;

    public AccionConvertirE3Value(AccionCompilarSolidity compilarSolidity) {
        this.compilarSolidity = compilarSolidity;
    }
        
    public List<String> obtenerContratos(SolicitudConvertirE3Value solicitud) {
        JsonNode ast = compilarSolidity.obtenerAst(solicitud);
        return ASTAnalyzer.listContractNames(ast);
    }

    public List<String> obtenerEventos(SolicitudConvertirE3Value solicitud) {
        Contract contrato = obtenerContratoAnalizado(solicitud);

        List<String> eventos = new ArrayList<String>();

        for (Event evento : contrato.getEvents()) {
            eventos.add(evento.getName());
        }

        return eventos;
    }

    public String convertir(SolicitudConvertirE3Value solicitud) {
        Contract contrato = obtenerContratoAnalizado(solicitud);
        List<String> errores = validarContratoParaE3Value(contrato);
        if (!errores.isEmpty()) {
            throw new IllegalArgumentException(String.join(" | ", errores));
        }
        Map<Event, EventType> tiposEventos = new HashMap<Event, EventType>();
        if (solicitud.getTiposEventos() != null) {
            for (Event evento : contrato.getEvents()) {
                String tipo = solicitud.getTiposEventos().get(evento.getName());
                if ("FINAL".equals(tipo)) {
                    tiposEventos.put(evento, EventType.FINAL);
                } else {
                    tiposEventos.put(evento, EventType.INITIAL);
                }
            }
        }

        contrato.setEventTypeMap(tiposEventos);
        if (solicitud.getObjetosValorVuelta() != null) {
            for (Function funcion : contrato.getFunctions()) {
                String origen = funcion.getTriggeredByActor();

                if (origen == null) {
                    continue;
                }

                for (String destino : funcion.getDestinations()) {
                    String clave = origen + "→" + destino + "→" + funcion.getName();
                    String objetoValor = solicitud.getObjetosValorVuelta().get(clave);

                    if (objetoValor != null && !objetoValor.trim().isEmpty()) {
                        funcion.setReverseObject(destino, objetoValor.trim());
                    }
                }
            }
        }
        return E3ValueMXGraphGenerator.generate(contrato);
    }

    private Contract obtenerContratoAnalizado(SolicitudConvertirE3Value solicitud) {
        JsonNode ast = compilarSolidity.obtenerAst(solicitud);
        return ASTAnalyzer.analyzeAST( ast,solicitud.getContratoElegido(), solicitud.getCodigoFuenteContrato());
    }
 
    public List<Map<String, String>> obtenerPreguntasObjetosValor(SolicitudConvertirE3Value solicitud) {
        Contract contrato = obtenerContratoAnalizado(solicitud);

        List<Map<String, String>> preguntas = new ArrayList<Map<String, String>>();

        for (Function funcion : contrato.getFunctions()) {
            String origen = funcion.getTriggeredByActor();

            if (origen == null) {
                continue;
            }

            for (String destino : funcion.getDestinations()) {
                Map<String, String> pregunta = new HashMap<String, String>();
                pregunta.put("origen", origen);
                pregunta.put("destino", destino);
                pregunta.put("actividad", funcion.getName());
                pregunta.put("clave", origen + "→" + destino + "→" + funcion.getName());

                preguntas.add(pregunta);
            }
        }

        return preguntas;
    }


    /*
    PARÁMETRO DE ENTRADA: Una solicitud con el código Solidity y el contrato elegido
    DESCRIPCIÓN: Analiza el contrato seleccionado y comprueba si tiene los componentes mínimos para generar un modelo e3value
    PARÁMETRO DE SALIDA: Un mapa con el resultado de la validación, los elementos encontrados y los errores detectados
    */
    public Map<String, Object> validarComponentesMinimos(SolicitudConvertirE3Value solicitud) {
        Contract contrato = obtenerContratoAnalizado(solicitud);
        Map<String, Object> resultado = new HashMap<String, Object>();
        List<String> errores = validarContratoParaE3Value(contrato);
        resultado.put("valido", errores.isEmpty());
        resultado.put("errores", errores);
        resultado.put("numeroActores", obtenerNumeroActores(contrato));
        resultado.put("numeroEventos", obtenerNumeroEventos(contrato));
        resultado.put("numeroFunciones", obtenerNumeroFunciones(contrato));
        resultado.put("numeroRelacionesValor", obtenerNumeroRelacionesValor(contrato));
        return resultado;
    }

    /*
    PARÁMETRO DE ENTRADA: Contrato analizado que se quiere convertir a e3value
    DESCRIPCIÓN: Comprueba si el contrato tiene los componentes mínimos para generar un modelo e3value útil
    PARÁMETRO DE SALIDA: Una lista de errores encontrados durante la validación
    */
    private List<String> validarContratoParaE3Value(Contract contrato) {
        List<String> errores = new ArrayList<String>();
        if(obtenerNumeroActores(contrato) < NUMERO_MINIMO_ACTORES_E3VALUE) {
            errores.add("El contrato debe tener al menos dos actores. Puedes definirlos mediante variables o parámetros de tipo address");
        }
        if(obtenerNumeroEventos(contrato) < NUMERO_MINIMO_EVENTOS_E3VALUE){
            errores.add("El contrato debe tener al menos un evento Solidity");
        }
        if(obtenerNumeroFunciones(contrato) < NUMERO_MINIMO_FUNCIONES_E3VALUE) {
            errores.add("El contrato debe tener al menos una función");
        }
        if(obtenerNumeroRelacionesValor(contrato) < NUMERO_MINIMO_OBJETOS_VALOR_E3VALUE) {
            errores.add("El contrato debe tener al menos una relación de valor entre actores. Por ejemplo, una transferencia, mint o acción equivalente");
        }
        return errores;
    }

    private int obtenerNumeroActores(Contract contrato) {
        if (contrato == null || contrato.getActors() == null) {
            return 0;
        }
        return contrato.getActors().size();
    }

    private int obtenerNumeroEventos(Contract contrato) {
        if (contrato == null || contrato.getEvents() == null) {
            return 0;
        }
        return contrato.getEvents().size();
    }

    private int obtenerNumeroFunciones(Contract contrato) {
        if (contrato == null || contrato.getFunctions() == null) {
            return 0;
        }
        return contrato.getFunctions().size();
    }

    private int obtenerNumeroRelacionesValor(Contract contrato) {
        int numeroRelacionesValor = 0;
        if (contrato == null || contrato.getFunctions() == null) {
            return 0;
        }
        for (Function funcion : contrato.getFunctions()) {
            if (funcion.getDestinations() != null) {
                numeroRelacionesValor = numeroRelacionesValor + funcion.getDestinations().size();
            }
        }
        return numeroRelacionesValor;
    }

}    