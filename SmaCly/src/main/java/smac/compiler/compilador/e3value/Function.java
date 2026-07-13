package smac.compiler.compilador.e3value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Function {

    private final String name;

    private final List<String> triggeredEvents = new ArrayList<>();
    private String triggeredByActor;

    private final List<String> destinations = new ArrayList<>();
    private final List<String> valueObjects = new ArrayList<>();

    private final Map<String, String> reverseObject = new HashMap<>();

    public Function(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void addTriggeredEvent(String ev) {
        if (!triggeredEvents.contains(ev)) {
            triggeredEvents.add(ev);
        }
    }

    public List<String> getTriggeredEvents() {
        return triggeredEvents;
    }

    public void setTriggeredByActor(String actor) {
        this.triggeredByActor = actor;
    }

    public String getTriggeredByActor() {
        return triggeredByActor;
    }

    public void addDestination(String dst) {
        if (dst != null && !dst.isEmpty() && !destinations.contains(dst)) {
            destinations.add(dst);
        }
    }

    public List<String> getDestinations() {
        return destinations;
    }

    public void addValueObject(String vo) {
        if (vo != null && !vo.isEmpty() && !valueObjects.contains(vo)) {
            valueObjects.add(vo);
        }
    }

    public List<String> getValueObjects() {
        return valueObjects;
    }

    public void setReverseObject(String dst, String obj) {
        reverseObject.put(dst, obj);
    }

    public String getReverseObject(String dst) {
        return reverseObject.get(dst);
    }

    public boolean hasReverseObject(String dst) {
        return reverseObject.containsKey(dst);
    }

}
