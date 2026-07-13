package smac.compiler.compilador.e3value;

import java.util.Objects;

public class Actor {

    private final String name;
    private String role;

    public Actor(String name) {
        this(name, null);
    }

    public Actor(String name, String role) {
        this.name = name;
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Actor)) {
            return false;
        }
        Actor a = (Actor) o;
        return name.equalsIgnoreCase(a.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name.toLowerCase());
    }

    @Override
    public String toString() {
        return role == null ? name : name + " (" + role + ')';
    }
}
