package smac.compiler.compilador.e3value;

import java.util.HashMap;
import java.util.Map;

public class RoleRegistry {

    private final Map<String, String> roleToActor = new HashMap<>();

    public void register(String roleId, String actorName) {
        roleToActor.putIfAbsent(roleId, actorName);
    }

    public String actorForRole(String roleId) {
        return roleToActor.get(roleId);
    }

    public Iterable<String> allActors() {
        return roleToActor.values();
    }
}
