package smac.compiler.compilador.parserSmaCly;


import tools.jackson.databind.JsonNode;

import java.util.List;

/*
INFO: Parser de if, else if y else
*/

public class ParserCondiciones extends ParserComun {

    private static final String BLOQUE_IF = "block_ifcondition";
    private static final String BLOQUE_ELSEIF = "block_elseifcondition";
    private static final String BLOQUE_ELSE = "block_elsecondition";

    private static final String ENTRADA_CONDITION = "condition";
    private static final String ENTRADA_ACTIONS_IF = "actionsif";
    private static final String ENTRADA_ACTIONS_ELSEIF = "actionselseif";
    private static final String ENTRADA_ACTIONS_ELSE = "actionselse";

    private static final String AST_IF = "IfStatement";
    private static final String AST_CONDITION = "condition";
    private static final String AST_TRUE_BODY = "trueBody";
    private static final String AST_FALSE_BODY = "falseBody";
    private static final String AST_STATEMENTS = "statements";

    private ParserSentencias parserSentencias;
    private ParserExpresiones parserExpresiones = new ParserExpresiones();

    public ParserCondiciones(ParserSentencias parserSentencias) {
        this.parserSentencias = parserSentencias;
    }

    public Bloque parsear(JsonNode nodo) {
        if(nodo == null || nodo.isNull()){
            return null;
        }

        Bloque primerBloque = null;
        Bloque ultimoBloque = null;

        JsonNode nodoActual = nodo;
        boolean primerIf = true;

        while(nodoActual != null && !nodoActual.isNull()){
            String tipoNodo = txt(nodoActual, AST_NODE_TYPE);
            Bloque bloqueActual;

            if(AST_IF.equals(tipoNodo)){
                String tipoBloque;
                String entradaAcciones;

                if(primerIf){
                    tipoBloque = BLOQUE_IF;
                    entradaAcciones = ENTRADA_ACTIONS_IF;
                }
                else{
                    tipoBloque = BLOQUE_ELSEIF;
                    entradaAcciones = ENTRADA_ACTIONS_ELSEIF;
                }

                bloqueActual = new Bloque(tipoBloque);
                bloqueActual.valor(ENTRADA_CONDITION,parserExpresiones.parsear(nodoActual.get(AST_CONDITION) ));
                JsonNode cuerpoCondicion =nodoActual.get(AST_TRUE_BODY);
                Bloque cuerpoBloques = null;
                if(cuerpoCondicion != null &&
                !cuerpoCondicion.isNull()){
                    JsonNode statements =cuerpoCondicion.get(AST_STATEMENTS);
                    if(statements != null &&statements.isArray()){
                        List<Bloque> bloques =parserSentencias.parsearLista( statements);
                        if(bloques != null &&!bloques.isEmpty()){
                            cuerpoBloques = unir(bloques);
                        }
                    }
                    else{
                        cuerpoBloques = parserSentencias.parsear(cuerpoCondicion);
                    }
                }

                if(cuerpoBloques != null){
                    bloqueActual.sentencia(entradaAcciones, cuerpoBloques);
                }

                JsonNode falseBody = nodoActual.get(AST_FALSE_BODY);

                System.out.println("TIPO NODO IF: " + tipoNodo);

                if(falseBody == null){
                    System.out.println("FALSE BODY ES NULL");
                }
                else{
                    System.out.println("FALSE BODY:");
                    System.out.println(falseBody.toPrettyString());
                }

                nodoActual = falseBody;
                primerIf = false;
            }
            else{
                bloqueActual =new Bloque(BLOQUE_ELSE);
                Bloque cuerpoElse = null;
                JsonNode statements = nodoActual.get(AST_STATEMENTS);
                if(statements != null && statements.isArray()){
                    List<Bloque> bloques = parserSentencias.parsearLista(statements);
                    if(bloques != null && !bloques.isEmpty()){
                        cuerpoElse = unir(bloques);
                    }
                }
                else{
                    cuerpoElse = parserSentencias.parsear(nodoActual);
                }

                if(cuerpoElse != null){
                    bloqueActual.sentencia(ENTRADA_ACTIONS_ELSE,cuerpoElse);
                }
                nodoActual = null;
            }

            if(primerBloque == null){
                primerBloque = bloqueActual;
            }
            else{
                ultimoBloque.sig(bloqueActual);
            }

            ultimoBloque = bloqueActual;
        }

        return primerBloque;
    }
}
