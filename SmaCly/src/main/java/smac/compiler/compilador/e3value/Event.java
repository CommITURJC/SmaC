package smac.compiler.compilador.e3value;

import java.util.ArrayList;
import java.util.List;

public class Event {

    private String name;
    private List<String> actorParameters = new ArrayList<>();
    private String indexedActorParameter;
    private String triggeredByActor;
    private EventType type;
    private String originFunction;

    public Event(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void addActorParameter(String param) {
        actorParameters.add(param);
    }

    public String getIndexedActorParameter() {
        return indexedActorParameter;
    }

    public void setIndexedActorParameter(String p) {
        this.indexedActorParameter = p;
    }

    public String getTriggeredByActor() {
        return triggeredByActor;
    }

    public void setTriggeredByActor(String a) {
        this.triggeredByActor = a;
    }

    public EventType getType() {
        return type;
    }

    public void setType(EventType t) {
        this.type = t;
    }

    public String getOriginFunction() {
        return originFunction;
    }

    public void setOriginFunction(String f) {
        this.originFunction = f;
    }
}
