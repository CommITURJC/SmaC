package smac.compiler.compilador.parserSmaCly;

import org.springframework.stereotype.Service;

import smac.compiler.compilador.parserSmaCly.AnalizadorSolidity;
import smac.compiler.compilador.parserSmaCly.ResultadoAnalisisSolidity;
import smac.compiler.compilador.AccionCompilarSolidity;
import smac.compiler.compilador.PeticionCompilar;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser principal de Solidity a XML Blockly
*/

@Service
public class ParserSolidity extends ParserComun {

    private static final String XML_INICIO = "<xml xmlns=\"https://developers.google.com/blockly/xml\">\n";
    private static final String XML_FIN = "</xml>";

    private static final String BLOQUE_FILE = "file";
    private static final String BLOQUE_VERSION = "version";
    private static final String BLOQUE_RANGE_VERSION = "range_version";

    private static final String CAMPO_SYMBOL_VERSION = "symbolversion";
    private static final String CAMPO_SYMBOL_COMPARATION = "symbolcomparation";
    private static final String CAMPO_VALUE_1 = "value1version";
    private static final String CAMPO_VALUE_2 = "value2version";
    private static final String CAMPO_VALUE_3 = "value3version";
    private static final String CAMPO_VALUE_1_OPTIONAL = "value1versionoptional";
    private static final String CAMPO_VALUE_2_OPTIONAL = "value2versionoptional";
    private static final String CAMPO_VALUE_3_OPTIONAL = "value3versionoptional";

    private static final String ENTRADA_VERSION_FILE = "version_file";
    private static final String ENTRADA_ELEMENTS_FILE = "elements_file";

    private static final String AST_PRAGMA = "PragmaDirective";
    private static final String AST_IMPORT = "ImportDirective";
    private static final String AST_CONTRACT = "ContractDefinition";
    private static final String AST_LITERALS = "literals";

    private final AccionCompilarSolidity compilador;
    private final AnalizadorSolidity analizadorSolidity;
    private ParserImport parserImport = new ParserImport();
    private ParserContratos parserContratos = new ParserContratos();

    public ParserSolidity(AccionCompilarSolidity compilador,AnalizadorSolidity analizadorSolidity) {
        this.compilador = compilador;
        this.analizadorSolidity = analizadorSolidity;
    }

    public RespuestaParser parsear(PeticionCompilar peticion) {
        try{
            JsonNode ast = compilador.obtenerAst(peticion);
            ResultadoAnalisisSolidity analisis = analizadorSolidity.analizar(ast);//Llamada al método que comprueba si sigue el patrón definido en SmaC
            if(!analisis.getCorrecto()){
                return new RespuestaParser(false,"",analisis.unificarTexto());//En caso de no serlo salta y no genera la transformación del código Solidity a bloques
            }
            Bloque fichero = new Bloque(BLOQUE_FILE);//Se crea el bloque padre contenedor que contiene el nombre del fichero y tiene como entrada la versión
            fichero.campo(AST_NAME,nombreArchivo(peticion.getNombreArchivoContrato()));//Se añade al campo nombre del bloque el valor del campo name del nodo y el nombre del contro
            Bloque version = null;
            List<Bloque> elementos = new ArrayList<>();
            JsonNode nodos = ast.get(AST_NODES);//Obtenemos en formato Json los nodos del arbol del contrato compilado
            if(nodos != null && nodos.isArray()){
                for(JsonNode nodo:nodos){
                    String tipo = txt(nodo,AST_NODE_TYPE);
                    if(tipo.equals(AST_PRAGMA)){
                        version = pragma(nodo);
                    }
                    else if(tipo.equals(AST_IMPORT)){
                        elementos.add(parserImport.parsear(nodo));
                    }
                    else if(tipo.equals(AST_CONTRACT)){
                        Bloque b = parserContratos.parsear(nodo);
                        if(b != null){
                            elementos.add(b);
                        }
                    }
                }
            }

            if(version != null){
                fichero.valor(ENTRADA_VERSION_FILE,version);
            }

            if(elementos.size() > 0){
                fichero.sentencia(ENTRADA_ELEMENTS_FILE,unir(elementos));
            }
            String xml = XML_INICIO;
            xml += fichero.xml(2);
            xml += XML_FIN;
            return new RespuestaParser(true,xml,"Contrato convertido correctamente");
        }
        catch(Exception e){
            return new RespuestaParser(false,"","Error al convertir el contrato: " + e.getMessage());
        }
    }

    private Bloque pragma(JsonNode nodo) {
        String texto = txtArray(nodo,AST_LITERALS).trim();

        String simbolo = "greater_equal";
        String comparacion = "";
        String v1 = "0";
        String v2 = "8";
        String v3 = "0";
        String ov1 = "0";
        String ov2 = "0";
        String ov3 = "0";

        if(empiezaPor(texto,">=")){
            simbolo = "greater_equal";
            texto = quitarInicio(texto,2);
        }
        else if(empiezaPor(texto,">")){
            simbolo = "greater";
            texto = quitarInicio(texto,1);
        }
        else if(empiezaPor(texto,"^")){
            simbolo = "greater_equal";
            texto = quitarInicio(texto,1);
        }

        String[] trozos = partirPorEspacio(texto);

        if(trozos.length > 0){
            String[] partes = partir(quitarCaracter(trozos[0],'='),'.');

            if(partes.length > 0){
                v1 = num(partes[0]);
            }
            if(partes.length > 1){
                v2 = num(partes[1]);
            }
            if(partes.length > 2){
                v3 = num(partes[2]);
            }
        }

        if(trozos.length > 1){
            String segundo = trozos[1];

            if(empiezaPor(segundo,"<=")){
                comparacion = "less_equal";
                segundo = quitarInicio(segundo,2);
            }
            else if(empiezaPor(segundo,"<")){
                comparacion = "less";
                segundo = quitarInicio(segundo,1);
            }

            String[] partes2 = partir(segundo,'.');
            if(partes2.length > 0){
                ov1 = num(partes2[0]);
            }
            if(partes2.length > 1){
                ov2 = num(partes2[1]);
            }
            if(partes2.length > 2){
                ov3 = num(partes2[2]);
            }
        }

        Bloque b;

        if(comparacion.equals("")){
            b = new Bloque(BLOQUE_VERSION);
        }
        else{
            b = new Bloque(BLOQUE_RANGE_VERSION);
            b.campo(CAMPO_SYMBOL_COMPARATION,comparacion);
            b.campo(CAMPO_VALUE_1_OPTIONAL,ov1);
            b.campo(CAMPO_VALUE_2_OPTIONAL,ov2);
            b.campo(CAMPO_VALUE_3_OPTIONAL,ov3);
        }

        b.campo(CAMPO_SYMBOL_VERSION,simbolo);
        b.campo(CAMPO_VALUE_1,v1);
        b.campo(CAMPO_VALUE_2,v2);
        b.campo(CAMPO_VALUE_3,v3);

        return b;
    }

    private String[] partirPorEspacio(String texto) {
        ArrayList<String> lista = new ArrayList<>();
        String actual = "";

        for(int i = 0;i < texto.length();i++){
            char c = texto.charAt(i);

            if(c == ' '){
                if(!actual.equals("")){
                    lista.add(actual);
                    actual = "";
                }
            }
            else{
                actual += c;
            }
        }

        if(!actual.equals("")){
            lista.add(actual);
        }

        String[] salida = new String[lista.size()];
        for(int i = 0;i < lista.size();i++){
            salida[i] = lista.get(i);
        }

        return salida;
    }

    private String nombreArchivo(String nombre) {
        if(nombre == null || nombre.equals("")){
            return "ContratoImportado";
        }

        String salida = nombre;

        if(terminaPor(salida,".sol")){
            salida = "";
            for(int i = 0;i < nombre.length() - 4;i++){
                salida += nombre.charAt(i);
            }
        }

        return salida;
    }
}
