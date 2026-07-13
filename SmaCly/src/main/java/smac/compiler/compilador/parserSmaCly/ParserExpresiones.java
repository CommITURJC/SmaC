package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

/*
INFO: Parser de expresiones
*/

public class ParserExpresiones extends ParserComun {

    private static final String BLOQUE_INPUT_LIBRE = "personalized_inputexpression";
    private static final String BLOQUE_NUMERO = "block_number";
    private static final String BLOQUE_BOOLEAN = "block_boolean";
    private static final String BLOQUE_TEXTO = "block_text";
    private static final String BLOQUE_ARITMETICA = "arithmetical_expression";
    private static final String BLOQUE_COMPARACION = "comparation_expression";
    private static final String BLOQUE_COMPARACION_ARIT = "comparation_arithmeticalexpression";
    private static final String BLOQUE_LOGICA = "comparation_logicalexpression";
    private static final String BLOQUE_BITWISE = "bitwise_expression";
    private static final String BLOQUE_SHIFT = "shift_expression";
    private static final String BLOQUE_NEGACION = "block_negation";
    private static final String BLOQUE_KECCAK = "keccak_inputfunction";
    private static final String BLOQUE_SHA = "sha_inputfunction";
    private static final String BLOQUE_ABI = "abyencode_inputfunction";
    private static final String BLOQUE_PARENTESIS = "parenthesis_expression";
    private static final String BLOQUE_NEW = "block_new";
    private static final String BLOQUE_COIN = "coin_expression";
    private static final String BLOQUE_TIME = "time_expression";

    private static final String CAMPO_VALUE = "value";
    private static final String CAMPO_VALUES = "values";
    private static final String CAMPO_OPERATORS = "operators";
    private static final String CAMPO_EXPR_LIBRE = "values_expression";
    private static final String CAMPO_PARAMETRO = "value_parameter";
    private static final String CAMPO_AMOUNT_COIN = "amount_coin";
    private static final String CAMPO_TYPE_COIN = "type_coin";
    private static final String CAMPO_TIME_VALUE = "time_value";
    private static final String CAMPO_TIME_UNITY = "time_unity";

    private static final String AST_LITERAL = "Literal";
    private static final String AST_IDENTIFIER = "Identifier";
    private static final String AST_MEMBER = "MemberAccess";
    private static final String AST_BINARY = "BinaryOperation";
    private static final String AST_UNARY = "UnaryOperation";
    private static final String AST_CALL = "FunctionCall";
    private static final String AST_INDEX = "IndexAccess";
    private static final String AST_ASSIGNMENT = "Assignment";
    private static final String AST_TUPLE = "TupleExpression";
    private static final String AST_NEW = "NewExpression";
    private static final String AST_FUNCTION_CALL_OPTIONS = "FunctionCallOptions";
    private static final String AST_ELEMENTARY_TYPE_NAME_EXPRESSION = "ElementaryTypeNameExpression";
    private static final String AST_CONDITIONAL = "Conditional";
    private static final String AST_TYPE_NAME = "typeName";
    private static final String AST_TRUE_EXPRESSION = "trueExpression";
    private static final String AST_FALSE_EXPRESSION = "falseExpression";
    private static final String AST_CONDITION = "condition";
    private static final String AST_OPTIONS = "options";
    private static final String AST_NAMES = "names";
    private static final String AST_TYPE_DESCRIPTIONS = "typeDescriptions";
    private static final String AST_TYPE_STRING = "typeString";

    private static final String AST_KIND = "kind";
    private static final String AST_VALUE = "value";
    private static final String AST_HEX_VALUE = "hexValue";
    private static final String AST_OPERATOR = "operator";
    private static final String AST_LEFT = "leftExpression";
    private static final String AST_RIGHT = "rightExpression";
    private static final String AST_SUB = "subExpression";
    private static final String AST_PREFIX = "prefix";
    private static final String AST_EXPRESSION = "expression";
    private static final String AST_ARGUMENTS = "arguments";
    private static final String AST_MEMBER_NAME = "memberName";
    private static final String AST_BASE_EXPRESSION = "baseExpression";
    private static final String AST_INDEX_EXPRESSION = "indexExpression";
    private static final String AST_LEFT_HAND = "leftHandSide";
    private static final String AST_RIGHT_HAND = "rightHandSide";
    private static final String AST_COMPONENTS = "components";

    public Bloque parsear(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,"");
        }

        String tipo = txt(nodo,AST_NODE_TYPE);

        if(tipo.equals(AST_LITERAL)){
            return literal(nodo);
        }
        else if(tipo.equals(AST_IDENTIFIER)){
            String nombre = txt(nodo,AST_NAME);
            Bloque especial = variableEspecial(nombre);
            if(especial != null){
                return especial;
            }

            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,nombre);
        }
        else if(tipo.equals(AST_MEMBER)){
            String texto = codigo(nodo);
            Bloque especial = variableEspecial(texto);
            if(especial != null){
                return especial;
            }

            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,texto);
        }
        else if(tipo.equals(AST_BINARY)){
            return binaria(nodo);
        }
        else if(tipo.equals(AST_UNARY)){
            return unaria(nodo);
        }
        else if(tipo.equals(AST_CALL)){
            return llamada(nodo,true);
        }
        else if(tipo.equals(AST_INDEX)){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
        }
        else if(tipo.equals(AST_TUPLE)){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
        }
        else if(tipo.equals(AST_FUNCTION_CALL_OPTIONS)){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
        }
        else if(tipo.equals(AST_CONDITIONAL)){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
        }
        else if(tipo.equals(AST_NEW)){
            Bloque b = new Bloque(BLOQUE_NEW);
            b.valor(CAMPO_VALUE,new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo.get(AST_TYPE_NAME))));
            return b;
        }

        return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
    }

    /*
PARÁMETRO DE ENTRADA: Nodo Literal del AST de Solidity
DESCRIPCIÓN: Convierte un literal Solidity en su bloque correspondiente.
Mantiene los literales hexadecimales con su representación original 0x...
para evitar convertir valores bytesN en números decimales.
PARÁMETRO DE SALIDA: Bloque correspondiente al literal
*/
private Bloque literal(JsonNode nodo) {
    String tipo = txt(nodo, AST_KIND);
    String valor = txt(nodo, AST_VALUE);

    if("null".equals(valor)){
        return new Bloque("block_null");
    }

    if("number".equals(tipo)){//SI ES NUMÉRICO HAY QUE CONTROLAR SI FUERA UN VALOR HEXADECIMAL, SI ES UNA EXPRESION DE ENVIO DE DIVISA, SI E SUN NUMERO POSITIVO
        String literalHexadecimal = obtenerLiteralHexadecimal(nodo);//COMPRUEBA QUE LA EXPRESION EMPIEZA POR Ox...
        if(!literalHexadecimal.equals("")){
            return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE, literalHexadecimal);
        }
        String subdenominacion = txt(nodo, "subdenomination");
        if(!subdenominacion.equals("")){
            if(esUnidadMoneda(subdenominacion)){
                return new Bloque(BLOQUE_COIN).campo(CAMPO_AMOUNT_COIN, valor).campo(CAMPO_TYPE_COIN, moneda(subdenominacion));
            }
            return new Bloque(BLOQUE_TIME).campo(CAMPO_TIME_VALUE, valor).campo(CAMPO_TIME_UNITY, subdenominacion);
        }

        if(esPositivo(valor)){//Numero >= 0
            return new Bloque("block_positivenumber").campo(CAMPO_VALUE, valor);
        }
        return new Bloque(BLOQUE_NUMERO).campo(CAMPO_VALUE, valor);
    }

    if("bool".equals(tipo)){//Devuelve bool como salida
        return new Bloque(BLOQUE_BOOLEAN).campo(CAMPO_VALUES, valor);
    }
    if("string".equals(tipo)){//DEVUELVE EL TIPO STRING COMO SALIDA
        return new Bloque(BLOQUE_TEXTO).campo(CAMPO_VALUE, valor);
    }
    return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE, valor);    
    }

    /*
PARÁMETRO DE ENTRADA: Nodo BinaryOperation del AST de Solidity
DESCRIPCIÓN: Convierte una expresión binaria en su bloque correspondiente. En las operaciones aritméticas comprueba los tipos enteros de los operandos e introduce bloques casting_expression cuando Vyper requiere que ambos tipos sean compatibles
PARÁMETRO DE SALIDA: Bloque que representa la expresión binaria
*/
private Bloque binaria(JsonNode nodo) {
    String operador = txt(nodo,AST_OPERATOR);
    JsonNode nodoIzquierdo = nodo.get(AST_LEFT);
    JsonNode nodoDerecho = nodo.get(AST_RIGHT);
    Bloque bloqueIzquierdo = parsear(nodoIzquierdo);
    Bloque bloqueDerecho = parsear(nodoDerecho);
    Bloque bloque;

    if(esAritmetico(operador)){
        String tipoResultado = obtenerTipoEntero(nodo);

        // Si la operación devuelve un entero, se adaptan los operandos al tipo del resultado.
        if(!tipoResultado.equals("")){
            bloqueIzquierdo = convertirEnteroSiEsNecesario(nodoIzquierdo,bloqueIzquierdo,tipoResultado);
            bloqueDerecho = convertirEnteroSiEsNecesario(nodoDerecho,bloqueDerecho,tipoResultado);
        }

        bloque = new Bloque(BLOQUE_ARITMETICA);
        bloque.valor("value1_arithmeticalexpression",bloqueIzquierdo);
        bloque.valor("value2_arithmeticalexpression",bloqueDerecho);
    }
    else if(esLogico(operador)){
        bloque = new Bloque(BLOQUE_LOGICA);
        bloque.valor("value1_logicalexpression",bloqueIzquierdo);
        bloque.valor("value2_logicalexpression",bloqueDerecho);
    }
    else if(esShift(operador)){
        bloque = new Bloque(BLOQUE_SHIFT);
        bloque.valor("value1_shiftexpression",bloqueIzquierdo);
        bloque.valor("value2_shiftexpression",bloqueDerecho);
    }
    else if(esBit(operador)){
        bloque = new Bloque(BLOQUE_BITWISE);
        bloque.valor("value1_bitwiseexpression",bloqueIzquierdo);
        bloque.valor("value2_bitwiseexpression",bloqueDerecho);
    }
    else if(esComparacionArit(operador)){
        bloque = new Bloque(BLOQUE_COMPARACION_ARIT);
        bloque.valor("value1_arithmeticalcomparationexpression",bloqueIzquierdo);
        bloque.valor("value2_arithmeticalcomparationexpression",bloqueDerecho);
    }
    else{
        bloque = new Bloque(BLOQUE_COMPARACION);
        bloque.valor("value1_expression",bloqueIzquierdo);
        bloque.valor("value2_expression",bloqueDerecho);
    }

    bloque.campo(CAMPO_OPERATORS,operador);
    return bloque;
}

/*
PARÁMETRO DE ENTRADA: Nodo del operando, bloque generado para el operando y tipo entero requerido por la operación
DESCRIPCIÓN: Comprueba si un operando entero necesita una conversión de ampliación. Si el tipo del operando tiene menos bits que el tipo requerido, crea un bloque casting_expression para mantener la compatibilidad con Vyper
PARÁMETRO DE SALIDA: Bloque original del operando o bloque casting_expression cuando se necesita una conversión
*/
private Bloque convertirEnteroSiEsNecesario(JsonNode nodoOperando,Bloque bloqueOperando,String tipoDestino) {
    // No se puede analizar ni convertir un nodo o un bloque inexistente.
    if(nodoOperando == null || nodoOperando.isNull() || bloqueOperando == null){
        return bloqueOperando;
    }

    // Si no se ha podido determinar el tipo de destino, se conserva el bloque original.
    if(tipoDestino == null || tipoDestino.equals("")){
        return bloqueOperando;
    }

    // Los literales numéricos no necesitan conversión explícita porque Vyper determina su tipo por el contexto.
    if(esLiteralNumerico(nodoOperando)){
        return bloqueOperando;
    }

    String tipoOrigen = obtenerTipoEntero(nodoOperando);

    // No se realiza ninguna conversión cuando se desconoce el tipo o ambos tipos coinciden.
    if(tipoOrigen.equals("") || tipoOrigen.equals(tipoDestino)){
        return bloqueOperando;
    }

    // No se mezclan automáticamente enteros con signo y enteros sin signo.
    if(!mismaFamiliaEntera(tipoOrigen,tipoDestino)){
        return bloqueOperando;
    }

    int bitsOrigen = obtenerBitsEntero(tipoOrigen);
    int bitsDestino = obtenerBitsEntero(tipoDestino);

    // Una conversión reductora podría perder información, por lo que no se genera automáticamente.
    if(bitsOrigen > bitsDestino){
        return bloqueOperando;
    }

    // Se crea un bloque de casting para ampliar el operando al tipo requerido por la expresión.
    ParserTipos parserTipos = new ParserTipos();
    Bloque bloqueCasting = new Bloque("casting_expression");
    bloqueCasting.valor("type",parserTipos.tipoLibre(tipoDestino));
    bloqueCasting.valor("expressioncast",bloqueOperando);
    return bloqueCasting;
}

    /*
    PARÁMETRO DE ENTRADA: Nodo del AST de Solidity que contiene información de tipos
    DESCRIPCIÓN: Obtiene el tipo entero indicado en typeDescriptions.typeString y normaliza los tipos uint e int sin tamaño como uint256 e int256
    PARÁMETRO DE SALIDA: Tipo entero normalizado o una cadena vacía cuando el nodo no representa un entero
    */
    private String obtenerTipoEntero(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }

        JsonNode descripciones = nodo.get(AST_TYPE_DESCRIPTIONS);

        // Algunos nodos del AST no contienen información de tipo.
        if(descripciones == null || descripciones.isNull()){
            return "";
        }

        String tipo = txt(descripciones,AST_TYPE_STRING);

        if(tipo == null){
            return "";
        }

        tipo = tipo.trim();

        if(tipo.startsWith("uint")){
            return extraerNombreTipoEntero(tipo,"uint");
        }

        // Se excluyen valores internos como int_const utilizados por Solidity para algunos literales.
        if(tipo.startsWith("int") && !tipo.startsWith("int_const")){
            return extraerNombreTipoEntero(tipo,"int");
        }

        return "";
    }

    /*
    PARÁMETRO DE ENTRADA: Descripción completa de un tipo entero y prefijo uint o int
    DESCRIPCIÓN: Extrae el nombre del tipo entero ignorando información adicional incluida en typeString. Si no aparece un tamaño explícito, utiliza 256 bits
    PARÁMETRO DE SALIDA: Tipo entero normalizado, por ejemplo uint64, uint256 o int128
    */
    private String extraerNombreTipoEntero(String tipo,String prefijo) {
        String resultado = prefijo;

        for(int i = prefijo.length();i < tipo.length();i++){
            char caracter = tipo.charAt(i);

            // Solo se añaden los caracteres numéricos que representan el tamaño del entero.
            if(caracter >= '0' && caracter <= '9'){
                resultado += caracter;
            }
            else{
                break;
            }
        }

        if(resultado.equals("uint")){
            return "uint256";
        }

        if(resultado.equals("int")){
            return "int256";
        }

        return resultado;
    }

    /*
    PARÁMETRO DE ENTRADA: Dos tipos enteros
    DESCRIPCIÓN: Comprueba si ambos tipos pertenecen a la misma familia, es decir, si ambos son uint o ambos son int
    PARÁMETRO DE SALIDA: true cuando los tipos pertenecen a la misma familia y false en caso contrario
    */
    private boolean mismaFamiliaEntera(String tipo1,String tipo2) {
        if(tipo1 == null || tipo2 == null){
            return false;
        }

        if(tipo1.startsWith("uint") && tipo2.startsWith("uint")){
            return true;
        }

        if(tipo1.startsWith("int") && tipo2.startsWith("int")){
            return true;
        }

        return false;
    }

    /*
    PARÁMETRO DE ENTRADA: Tipo entero como uint64, uint256, int32 o int
    DESCRIPCIÓN: Extrae el número de bits del tipo entero. Si el tipo no incluye un tamaño explícito, devuelve 256
    PARÁMETRO DE SALIDA: Número de bits del tipo entero
    */
    private int obtenerBitsEntero(String tipo) {
        String numeros = "";

        if(tipo == null){
            return 256;
        }

        for(int i = 0;i < tipo.length();i++){
            char caracter = tipo.charAt(i);

            if(caracter >= '0' && caracter <= '9'){
                numeros += caracter;
            }
        }

        if(numeros.equals("")){
            return 256;
        }

        return Integer.parseInt(numeros);
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo del AST de Solidity
    DESCRIPCIÓN: Comprueba si el nodo representa un literal numérico. Los literales no se convierten explícitamente porque su tipo se determina según el contexto de la expresión
    PARÁMETRO DE SALIDA: true cuando el nodo es un literal numérico y false en caso contrario
    */
    private boolean esLiteralNumerico(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return false;
        }

        if(!txt(nodo,AST_NODE_TYPE).equals(AST_LITERAL)){
            return false;
        }

        return txt(nodo,AST_KIND).equals("number");
    }

    private Bloque unaria(JsonNode nodo) {
        String op = txt(nodo,AST_OPERATOR);

        if(op.equals("!")){
            Bloque b = new Bloque(BLOQUE_NEGACION);
            b.valor(CAMPO_VALUE,parsear(nodo.get(AST_SUB)));
            return b;
        }

        return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
    }

    private Bloque llamada(JsonNode nodo,boolean input) {
        String nombre = codigo(nodo.get(AST_EXPRESSION));
        String kind = txt(nodo,AST_KIND);
        if(kind.equals("typeConversion")){
            Bloque b = new Bloque("casting_expression");
            b.valor("type",tipoCasting(nodo.get(AST_EXPRESSION)));
            JsonNode args = nodo.get(AST_ARGUMENTS);
            if(args != null && args.isArray() && args.size() > 0){
                b.valor("expressioncast",parsear(args.get(0)));
            }

            return b;
        }

        if(nombre.equals("keccak256") || nombre.equals("keccack256")){
            return new Bloque(BLOQUE_KECCAK).campo(CAMPO_PARAMETRO,argsTexto(nodo.get(AST_ARGUMENTS)));
        }
        else if(nombre.equals("sha256") || nombre.equals("sha3")){
            return new Bloque(BLOQUE_SHA).campo(AST_NAME,nombre).campo(CAMPO_PARAMETRO,argsTexto(nodo.get(AST_ARGUMENTS)));
        }
        else if(nombre.equals("abi.encodePacked") || nombre.equals("abi.encode")){
            return new Bloque(BLOQUE_ABI).campo(CAMPO_PARAMETRO,argsTexto(nodo.get(AST_ARGUMENTS)));
        }

        return new Bloque(BLOQUE_INPUT_LIBRE).campo(CAMPO_EXPR_LIBRE,codigo(nodo));
    }

    public Bloque argumentosComoParametros(JsonNode args) {
        List<Bloque> lista = new ArrayList<>();

        if(args != null && args.isArray()){
            for(JsonNode a:args){
                lista.add(parsear(a));
            }
        }

        if(lista.size() == 0){
            return null;
        }

        Bloque padre = new Bloque("inputparam");
        padre.sentencia("inputparams",unir(lista));
        return padre;
    }

    public String argsTexto(JsonNode args) {
        String texto = "";

        if(args != null && args.isArray()){
            for(int i = 0;i < args.size();i++){
                if(i > 0){
                    texto += ", ";
                }

                texto += codigo(args.get(i));
            }
        }

        return texto;
    }

    public String codigo(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }
        String tipo = txt(nodo,AST_NODE_TYPE);
        if(tipo.equals(AST_LITERAL)){
            String kind = txt(nodo, AST_KIND);
            String valor = txt(nodo, AST_VALUE);

            if("string".equals(kind)){
                return "\"" + valor + "\"";
            }
            if("number".equals(kind)){
                String literalHexadecimal = obtenerLiteralHexadecimal(nodo);

                if(!literalHexadecimal.equals("")){
                    return literalHexadecimal;
                }
            }

            String subdenominacion = txt(nodo, "subdenomination");

            if(!subdenominacion.equals("")){
                return valor + " " + subdenominacion;
            }

            return valor;
        }
        else if(tipo.equals(AST_IDENTIFIER)){
            return txt(nodo,AST_NAME);
        }
        else if(tipo.equals(AST_MEMBER)){
            return codigo(nodo.get(AST_EXPRESSION)) + "." + txt(nodo,AST_MEMBER_NAME);
        }
        else if(tipo.equals(AST_BINARY)){
            return codigo(nodo.get(AST_LEFT)) + " " + txt(nodo,AST_OPERATOR) + " " + codigo(nodo.get(AST_RIGHT));
        }
        else if(tipo.equals(AST_UNARY)){
            boolean prefijo = false;

            if(nodo.has(AST_PREFIX)){
                prefijo = nodo.get(AST_PREFIX).asBoolean();
            }

            if(prefijo){
                return txt(nodo,AST_OPERATOR) + codigo(nodo.get(AST_SUB));
            }
            else{
                return codigo(nodo.get(AST_SUB)) + txt(nodo,AST_OPERATOR);
            }
        }
        else if(tipo.equals(AST_CALL)){
            return codigo(nodo.get(AST_EXPRESSION)) + "(" + argsTexto(nodo.get(AST_ARGUMENTS)) + ")";
        }
        else if(tipo.equals(AST_TUPLE)){
            return codigoTupla(nodo);
        }
        else if(tipo.equals(AST_FUNCTION_CALL_OPTIONS)){
            return codigo(nodo.get(AST_EXPRESSION)) + opcionesCallTexto(nodo);
        }
        else if(tipo.equals(AST_FUNCTION_CALL_OPTIONS)){
            return codigo(nodo.get(AST_EXPRESSION)) + opcionesCallTexto(nodo);
        }
        else if(tipo.equals(AST_ELEMENTARY_TYPE_NAME_EXPRESSION)){
            return nombreTipoCasting(nodo);
        }
        else if(tipo.equals(AST_CONDITIONAL)){
            return codigo(nodo.get(AST_CONDITION)) + " ? " + codigo(nodo.get(AST_TRUE_EXPRESSION)) + " : " + codigo(nodo.get(AST_FALSE_EXPRESSION));
        }
        else if(tipo.equals(AST_INDEX)){
            return codigo(nodo.get(AST_BASE_EXPRESSION)) + "[" + codigo(nodo.get(AST_INDEX_EXPRESSION)) + "]";
        }
        else if(tipo.equals(AST_ASSIGNMENT)){
            return codigo(nodo.get(AST_LEFT_HAND)) + " " + txt(nodo,AST_OPERATOR) + " " + codigo(nodo.get(AST_RIGHT_HAND));
        }
        else if(tipo.equals(AST_NEW)){
            return "new " + nombreTipo(nodo.get(AST_TYPE_NAME));
        }

        return "";
    }

    private Bloque variableEspecial(String texto) {
        if(texto.equals("msg.sender") || texto.equals("msg.value") || texto.equals("msg.balance") || texto.equals("msg.gas") || texto.equals("msg.data") || texto.equals("msg.sig")){
            return new Bloque("msgvariables").campo("msgvariables",texto);
        }
        else if(texto.equals("block.difficulty") || texto.equals("block.number") || texto.equals("block.timestamp") || texto.equals("block.coinbase") || texto.equals("block.gaslimit") || texto.equals("block.blockhash")){
            return new Bloque("blockvariables").campo("values_blockvariables",texto);
        }
        else if(texto.equals("tx.origin") || texto.equals("tx.gasprice") || texto.equals("tx.gasleft")){
            return new Bloque("txvariables").campo("values_txvariables",texto);
        }
        else if(texto.equals("now")){
            return new Bloque("block_now");
        }
        else if(texto.equals("this")){
            return new Bloque("block_this").campo("thisvalues",texto);
        }
        else if(empiezaPor(texto,"this.")){
            String valor = "";
            for(int i = 5;i < texto.length();i++){
                valor += texto.charAt(i);
            }
            return new Bloque("block_thisexpression").campo("value",valor);
        }

        return null;
    }

    private boolean esAritmetico(String op) {
        return op.equals("+") || op.equals("-") || op.equals("*") || op.equals("/") || op.equals("%") || op.equals("**");
    }

    private boolean esLogico(String op) {
        return op.equals("&&") || op.equals("||");
    }

    private boolean esShift(String op) {
        return op.equals("<<") || op.equals(">>");
    }

    private boolean esBit(String op) {
        return op.equals("|") || op.equals("&") || op.equals("^");
    }

    private boolean esComparacionArit(String op) {
        return op.equals(">") || op.equals(">=") || op.equals("<") || op.equals("<=");
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa una expresión de tipo tupla
    DESCRIPCIÓN: Convierte una expresión de tupla en texto. Si solo tiene un componente, devuelve ese componente entre paréntesis
    PARÁMETRO DE SALIDA: Texto que representa la expresión de la tupla
    */
    private String codigoTupla(JsonNode nodo) {
        JsonNode componentes = nodo.get(AST_COMPONENTS);

        if(componentes == null || !componentes.isArray()){
            return "";
        }

        if(componentes.size() == 1){
            JsonNode unico = componentes.get(0);

            if(unico == null || unico.isNull()){
                return "";
            }

            return "(" + codigo(unico) + ")";
        }

        String texto = "(";

        for(int i = 0;i < componentes.size();i++){
            if(i > 0){
                texto += ", ";
            }

            JsonNode componente = componentes.get(i);

            if(componente != null && !componente.isNull()){
                texto += codigo(componente);
            }
        }

        texto += ")";

        return texto;
    }


        private Bloque tipoCasting(JsonNode nodo) {
            String tipoCasting = nombreTipoCasting(nodo);
            if(tipoCasting.equals("payable")){
                return new Bloque("block_payable");
            }
            else if(tipoCasting.equals("type")){
                return new Bloque("block_type_casting");
            }

            ParserTipos tipos = new ParserTipos();
            return tipos.tipoLibre(tipoCasting);
        }

        /*
    PARÁMETRO DE ENTRADA: Nodo JSON que representa el tipo usado en un casting
    DESCRIPCIÓN: Obtiene el nombre real del tipo usado en el casting, incluyendo casos especiales como payable
    PARÁMETRO DE SALIDA: Texto con el tipo del casting
    */
    private String nombreTipoCasting(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }

        String tipoNodo = txt(nodo,AST_NODE_TYPE);

        if(tipoNodo.equals(AST_ELEMENTARY_TYPE_NAME_EXPRESSION)){
            String tipoDescripcion = txt(nodo.get(AST_TYPE_DESCRIPTIONS),AST_TYPE_STRING);

            if(contieneTexto(tipoDescripcion,"payable")){
                return "payable";
            }

            String tipoNombre = nombreTipo(nodo.get(AST_TYPE_NAME));

            if(contieneTexto(tipoNombre,"payable")){
                return "payable";
            }

            return tipoNombre;
        }

        String texto = codigo(nodo);

        if(texto == null || texto.equals("")){
            String tipoDescripcion = txt(nodo.get(AST_TYPE_DESCRIPTIONS),AST_TYPE_STRING);

            if(contieneTexto(tipoDescripcion,"payable")){
                return "payable";
            }

            return tipoDescripcion;
        }

        return texto;
    }

    /*
PARÁMETRO DE ENTRADA: Lista de nombres de opciones de una llamada y posición que se quiere leer
DESCRIPCIÓN: Obtiene de forma segura el nombre de una opción de llamada Solidity. Evita usar asString directamente sobre objetos JSON
PARÁMETRO DE SALIDA: Nombre de la opción, por ejemplo value, gas o salt
*/
private String obtenerNombreOpcionCall(JsonNode nombres,int posicion) {
    if(nombres == null || !nombres.isArray() || nombres.size() <= posicion){
        return "";
    }

    JsonNode nombreNodo = nombres.get(posicion);

    if(nombreNodo == null || nombreNodo.isNull()){
        return "";
    }

    String nombre = txt(nombreNodo,AST_NAME);

    if(nombre != null && !nombre.equals("")){
        return nombre;
    }

    nombre = txt(nombreNodo,"name");

    if(nombre != null && !nombre.equals("")){
        return nombre;
    }

    nombre = txt(nombreNodo,"value");

    if(nombre != null && !nombre.equals("")){
        return nombre;
    }

    String tipoNodo = txt(nombreNodo,AST_NODE_TYPE);

    if(tipoNodo.equals(AST_IDENTIFIER)){
        return txt(nombreNodo,AST_NAME);
    }

    return "";
}

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON FunctionCallOptions
    DESCRIPCIÓN: Genera el texto de opciones de una llamada Solidity, por ejemplo {value: wager}
    PARÁMETRO DE SALIDA: Texto con las opciones de la llamada
    */
    private String opcionesCallTexto(JsonNode nodo) {
        JsonNode opciones = nodo.get(AST_OPTIONS);
        JsonNode nombres = nodo.get(AST_NAMES);

        if(opciones == null || !opciones.isArray() || opciones.size() == 0){
            return "";
        }

        String texto = "{";

        for(int i = 0;i < opciones.size();i++){
            if(i > 0){
                texto += ", ";
            }

            String nombreOpcion = obtenerNombreOpcionCall(nombres,i);

            if(nombreOpcion == null || nombreOpcion.equals("")){
                nombreOpcion = "value";
            }

            texto += nombreOpcion + ": " + codigo(opciones.get(i));
        }

        texto += "}";

        return texto;
    }

    /*
    PARÁMETRO DE ENTRADA: Texto principal y texto que se quiere buscar
    DESCRIPCIÓN: Comprueba si un texto contiene otro evitando errores con valores nulos
    PARÁMETRO DE SALIDA: Valor booleano indicando si el texto contiene el valor buscado
    */
    private boolean contieneTexto(String texto,String buscado) {
        if(texto == null || buscado == null){
            return false;
        }

        return texto.contains(buscado);
    }

    private boolean esPositivo(String valor) {
        if(valor == null || valor.equals("")){
            return false;
        }

        for(int i = 0;i < valor.length();i++){
            char c = valor.charAt(i);

            if(c == '-'){
                return false;
            }
        }

        return true;
    }

    private String moneda(String unidad) {
        if(unidad.equals("ether")){
            return "ether_coin";
        }
        else if(unidad.equals("gwei")){
            return "gwei_coin ";
        }
        else if(unidad.equals("pwei")){
            return "pwei_coin";
        }
        else if(unidad.equals("wei")){
            return "wei_coin";
        }
        else if(unidad.equals("szabo")){
            return "szabo_coin";
        }
        else if(unidad.equals("finney")){
            return "finney_coin";
        }

        return unidad;
    }

    private boolean esUnidadMoneda(String unidad) {
        return unidad.equals("ether") || unidad.equals("wei") || unidad.equals("gwei") || unidad.equals("pwei") || unidad.equals("finney") || unidad.equals("szabo");
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo literal del AST
    DESCRIPCIÓN: Recupera el valor hexadecimal original del literal
    PARÁMETRO DE SALIDA: Literal hexadecimal o una cadena vacía
    */
    private String obtenerLiteralHexadecimal(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return "";
        }
        String valor = txt(nodo,AST_VALUE).trim();
        if(valor.startsWith("0x") || valor.startsWith("0X")){
            boolean correcto = valor.length() > 2;
            for(int i = 2;i < valor.length() && correcto;i++){//PARTE DEL SEGUNDO PORQUE NOS INTERESA DESPUES LO DEL 0X
                char caracter = valor.charAt(i);
                if(caracter != '_' && Character.digit(caracter,16) == -1){
                    correcto = false;
                }
            }
            if(correcto){
                return valor;
            }
        }
        String hexValue = txt(nodo,"hexValue").trim();
        if(hexValue.equals("")){
            return "";
        }

        if(hexValue.startsWith("0x") || hexValue.startsWith("0X")){
            boolean correcto = hexValue.length() > 2;
            for(int i = 2;i < hexValue.length() && correcto;i++){
                char caracter = hexValue.charAt(i);
                if(caracter != '_' && Character.digit(caracter,16) == -1){
                    correcto = false;
                }
            }
            if(correcto){
                return hexValue;
            }
            hexValue = hexValue.substring(2);
        }
        if(hexValue.length() % 2 != 0){
            return "";
        }
        String texto = "";
        for(int i = 0;i < hexValue.length();i += 2){
            int primero = Character.digit(hexValue.charAt(i),16);
            int segundo = Character.digit(hexValue.charAt(i + 1),16);
            if(primero == -1 || segundo == -1){
                return "";
            }

            int codigo = primero * 16 + segundo;

            if(codigo < 32 || codigo > 126){
                return "";
            }

            texto += (char) codigo;
        }

        if(!texto.startsWith("0x") && !texto.startsWith("0X")){
            return "";
        }
        if(texto.length() <= 2){
            return "";
        }
        for(int i = 2;i < texto.length();i++){
            char caracter = texto.charAt(i);
            if(caracter != '_' && Character.digit(caracter,16) == -1){
                return "";
            }
        }
        return texto;
    }



    
}
