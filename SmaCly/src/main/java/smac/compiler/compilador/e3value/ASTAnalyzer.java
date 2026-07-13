package smac.compiler.compilador.e3value;
import tools.jackson.databind.JsonNode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ASTAnalyzer {

    private static final Set<String> addressIds = new LinkedHashSet<>();
    private static final RoleRegistry roles = new RoleRegistry();

    public static List<String> listContractNames(JsonNode ast) {
        List<String> names = new ArrayList<String>();
        if (ast == null || ast.isMissingNode()) {
            return names;
        }
        for (JsonNode node : ast.path("nodes")) {
            if ("ContractDefinition".equals(node.path("nodeType").asString())) {
                names.add(node.path("name").asString("NO NAME"));
            }
        }
        return names;
    }

    public static Contract analyzeAST(JsonNode combinedJson, String targetContract, String sourceCode) {

        resetState();
        parseNatSpecActors(sourceCode);

        Contract contract = new Contract(targetContract == null ? "DefaultName" : targetContract);

        if (combinedJson == null || combinedJson.isMissingNode()) {
            return contract;
        }

       JsonNode astRoot = combinedJson;

        if (astRoot == null || astRoot.isMissingNode()) {
            return contract;
        }

        for (JsonNode node : astRoot.path("nodes")) {
            if (!"ContractDefinition".equals(node.path("nodeType").asString())) {
                continue;
            }

            String cName = node.path("name").asString("");

            if (targetContract != null && !targetContract.equals(cName)) {
                continue;
            }

            contract.setName(cName.isEmpty() ? "MyContract" : cName);
            for (JsonNode member : node.path("nodes")) {
            switch (member.path("nodeType").asString("")) {
                case "VariableDeclaration":
                    processVariable(member, contract);
                    break;
                case "StructDefinition":
                    processStruct(member, contract);
                    break;
                case "EventDefinition":
                    processEvent(member, contract);
                    break;
                case "FunctionDefinition":
                    processFunction(member, contract);
                    break;
            }
        }
        }
        contract.getFunctions().stream().filter(fn -> !(fn.getTriggeredByActor() == null))
                .forEachOrdered(fn -> {
                    fn.getTriggeredEvents().stream()
                            .map(evName -> contract.getEventByName(evName))
                            .filter(ev -> (ev != null)).forEachOrdered(ev -> {
                        ev.setTriggeredByActor(fn.getTriggeredByActor());
                    });
                });

        addressIds.forEach(v -> contract.addActor(new Actor(v)));
        roles.allActors().forEach(a -> contract.addActor(new Actor(a)));

        System.out.println("=== RESUMEN CONTRATO ===================================");
        contract.getFunctions().forEach(f -> {
            System.out.println("Función: " + f.getName() + " | actor=" + f.getTriggeredByActor() + " | destinos=" + f.getDestinations() + " | objetos=" + f.getValueObjects());
        });
        System.out.println("========================================================");

        return contract;
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON de una variable Solidity y contrato que se está analizando
    DESCRIPCIÓN: Procesa una variable del contrato, la guarda en el modelo interno y, si es de tipo address, la registra como posible actor del modelo e3value
    PARÁMETRO DE SALIDA: Ninguno
    */
    private static void processVariable(JsonNode v, Contract c) {
        String name = v.path("name").asString("");
        String type = detectType(v.path("typeName"));
        c.addVariable(new Variable(name, type));
        if ("address".equalsIgnoreCase(type) && name != null && !name.trim().isEmpty()) {
            addressIds.add(name.trim());
        }

        if ("bytes32".equalsIgnoreCase(type) && name != null && name.endsWith("_ROLE")) {
            roles.register(name, prettifyRoleName(name));
        }
    }

    private static void processEvent(JsonNode eNode, Contract c) {
        String name = eNode.path("name").asString("");
        Event ev = new Event(name);
        eNode.path("parameters").path("parameters").forEach(p -> {
            if (isAddressParam(p)) {
                String param = p.path("name").asString("");
                ev.addActorParameter(param);
                if (ev.getIndexedActorParameter() == null) {
                    ev.setIndexedActorParameter(param);
                }
                addressIds.add(param);
            }
        });
        c.addEvent(ev);
    }

    private static void processFunction(JsonNode fnNode, Contract contract) {
        if (Set.of("constructor", "fallback", "receive")
                .contains(fnNode.path("kind").asString(""))) {
            return;
        }

        String fnName = fnNode.path("name").asString("");
        Function fn = new Function(fnName.isEmpty() ? "anonymous" : fnName);

        fnNode.path("parameters").path("parameters").forEach(p -> {
            if (isAddressParam(p)) {
                addressIds.add(p.path("name").asString());
            }
        });

        fnNode.path("modifiers").forEach(mod -> {
            if ("ModifierInvocation".equals(mod.path("nodeType").asString())
                    && "onlyRole".equals(mod.path("modifierName").path("name").asString())) {
                String roleId = extractIdentifierName(mod.path("arguments").get(0));
                String actor = roles.actorForRole(roleId);
                if (actor != null) {
                    fn.setTriggeredByActor(actor);
                }
            }
        });

        analyzeFunctionBody(fnNode.path("body"), fn, contract);
        contract.addFunction(fn);
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON de un struct Solidity y contrato que se está analizando
    DESCRIPCIÓN: Procesa los campos de un struct y, si alguno es de tipo address, lo registra como posible actor del modelo e3value
    PARÁMETRO DE SALIDA: Ninguno
    */
    private static void processStruct(JsonNode structNode, Contract contract) {
        String nombreStruct = structNode.path("name").asString("");

        for (JsonNode member : structNode.path("members")) {
            String nombreCampo = member.path("name").asString("");
            String tipoCampo = detectType(member.path("typeName"));

            if ("address".equalsIgnoreCase(tipoCampo) && nombreCampo != null && !nombreCampo.trim().isEmpty()) {
                if (nombreStruct != null && !nombreStruct.trim().isEmpty()) {
                    addressIds.add(nombreStruct.trim() + "." + nombreCampo.trim());
                }
                else {
                    addressIds.add(nombreCampo.trim());
                }
            }
        }
    }

    private static void analyzeFunctionBody(JsonNode n, Function fn, Contract c) {
        if (n == null || n.isMissingNode()) {
            return;
        }

        if (n.isObject()) {
            String nodeType = n.path("nodeType").asString();

            if ("EmitStatement".equals(nodeType)) {
                String evName = extractIdentifierName(n.path("eventCall"));
                if (!evName.isEmpty()) {
                    fn.addTriggeredEvent(evName);
                    Event evObj = c.getEventByName(evName);
                    if (evObj != null) {
                        evObj.setOriginFunction(fn.getName());
                    }
                    System.out.println("DEBUG emit encontrado: " + fn.getName() + " → " + evName);
                }
            }

            if ("FunctionCall".equals(nodeType)) {
                String fName = getFunctionCallName(n.path("expression"));
                JsonNode args = n.path("arguments");

                if (Set.of("transfer", "_transfer", "transferFrom").contains(fName) && args.size() >= 2) {
                    String src = extractIdentifierName(args.get(0));
                    String dst = extractIdentifierName(args.get(1));
                    System.out.println("DEBUG transfer " + src + " → " + dst);

                    if (fn.getTriggeredByActor() == null && addressIds.contains(src)) {
                        fn.setTriggeredByActor(src);
                    }
                    if (addressIds.contains(dst) && !dst.equals(fn.getTriggeredByActor())) {
                        fn.addDestination(dst);
                        fn.addValueObject(c.getName());
                    }
                } 
                else if(Set.of("mint", "_mint").contains(fName) && args.size() >= 2) {
                    String dst = extractIdentifierName(args.get(0));
                    System.out.println("DEBUG mint RSU → " + dst);
                    if (addressIds.contains(dst)) {
                        fn.addDestination(dst);
                        fn.addValueObject(c.getName());
                    }
                }
            }
            Iterator<Map.Entry<String, JsonNode>> campos = n.properties().iterator();

            while (campos.hasNext()) {
                Map.Entry<String, JsonNode> campo = campos.next();
                analyzeFunctionBody(campo.getValue(), fn, c);
            }
        } else if (n.isArray()) {
            n.forEach(child -> analyzeFunctionBody(child, fn, c));
        }
    }

    private static boolean isAddressParam(JsonNode p) {
        JsonNode t = p.path("typeName");
        return "VariableDeclaration".equals(p.path("nodeType").asString())
                && "ElementaryTypeName".equals(t.path("nodeType").asString())
                && "address".equalsIgnoreCase(t.path("name").asString());
    }

    /*
    PARÁMETRO DE ENTRADA: Nodo JSON con el tipo de una variable Solidity
    DESCRIPCIÓN: Detecta el tipo de una variable o campo a partir del AST generado por solc
    PARÁMETRO DE SALIDA: Cadena de texto con el tipo detectado
    */
    private static String detectType(JsonNode tn) {
        if (tn == null || tn.isMissingNode()) {
            return "unknown";
        }

        String nodeType = tn.path("nodeType").asString("");

        if ("ElementaryTypeName".equals(nodeType)) {
            return tn.path("name").asString("");
        }

        if ("UserDefinedTypeName".equals(nodeType)) {
            return tn.path("name").asString("");
        }

        if ("Mapping".equals(nodeType)) {
            return "mapping";
        }

        if ("ArrayTypeName".equals(nodeType)) {
            return detectType(tn.path("baseType")) + "[]";
        }

        return "unknown";
    }

    private static String extractIdentifierName(JsonNode n) {
        if (n == null || n.isMissingNode()) {
            return "";
        }
        String nt = n.path("nodeType").asString("");
        if ("Identifier".equals(nt)) {
            return n.path("name").asString("");
        }
        if ("MemberAccess".equals(nt)) {
            return n.path("memberName").asString("");
        }
        if ("FunctionCall".equals(nt)) {
            return getFunctionCallName(n.path("expression"));
        }
        return n.asString();
    }

    private static String getFunctionCallName(JsonNode expr) {
        String name = expr.path("name").asString("");
        if (name.isEmpty() && "MemberAccess".equals(expr.path("nodeType").asString(""))) {
            name = expr.path("memberName").asString("");
        }
        return name;
    }

    private static void parseNatSpecActors(String src) {
        if (src == null) {
            return;
        }
        Matcher m = Pattern.compile("@custom:e3-actor\\s+(\\S+)\\s+(\\S+)", Pattern.CASE_INSENSITIVE).matcher(src);
        while (m.find()) {
            roles.register(m.group(1).trim(), m.group(2).trim());
        }
    }

    private static String prettifyRoleName(String r) {
        return r.replace("_ROLE", "").toLowerCase();
    }

    private static void resetState() {
        addressIds.clear();
        try {
            var f = roles.getClass().getDeclaredField("roleToActor");
            f.setAccessible(true);
            ((Map<?, ?>) f.get(roles)).clear();
        } catch (Exception ignored) {
        }
    }
}
