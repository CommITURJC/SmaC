// Contract.java
package smac.compiler.compilador.e3value;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Contract {

    private String name;
    private List<Function> functions = new ArrayList<>();
    private List<Variable> variables = new ArrayList<>();
    private List<Event> events = new ArrayList<>();
    private Map<Event, EventType> eventTypeMap;
    private Set<Actor> actors = new HashSet<>();

    public Contract(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void addFunction(Function f) {
        functions.add(f);
    }

    public List<Function> getFunctions() {
        return functions;
    }

    public void addVariable(Variable v) {
        variables.add(v);
    }

    public List<Variable> getVariables() {
        return variables;
    }

    public void addEvent(Event e) {
        events.add(e);
    }

    public List<Event> getEvents() {
        return events;
    }

    public Map<Event, EventType> getEventTypeMap() {
        return eventTypeMap;
    }

    public void setEventTypeMap(Map<Event, EventType> map) {
        if (map == null) {
            return;
        }
        for (Map.Entry<Event, EventType> e : map.entrySet()) {
            Event ev = e.getKey();
            EventType t = e.getValue();
            if (ev != null && t != null) {
                ev.setType(t);
            }
        }
    }

    public void addActor(Actor a) {
        actors.add(a);
    }

    public Set<Actor> getActors() {
        return actors;
    }

    public Event getEventByName(String eventName) {
        for (Event e : events) {
            if (e.getName().equals(eventName)) {
                return e;
            }
        }
        return null;
    }
}
