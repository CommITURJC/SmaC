package smac.compiler.compilador.e3value;

import java.util.Objects;

public class ValueObject {

    private final String name;
    private final ValueObjectType type;
    private final String detail;

    public ValueObject(String name, ValueObjectType type, String detail) {
        this.name = name;
        this.type = type;
        this.detail = detail;
    }

    public String getName() {
        return name;
    }

    public ValueObjectType getType() {
        return type;
    }

    public String getDetail() {
        return detail;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ValueObject)) {
            return false;
        }
        ValueObject that = (ValueObject) o;
        return Objects.equals(name, that.name)
                && type == that.type
                && Objects.equals(detail, that.detail);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, type, detail);
    }

    @Override
    public String toString() {
        return "ValueObject{"
                + "name='" + name + '\''
                + ", type=" + type
                + (detail != null ? ", detail='" + detail + '\'' : "")
                + '}';
    }
}
