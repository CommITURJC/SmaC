package smac.compiler.compilador.e3value;

public class ValuePort {

    public enum Direction {
        IN, OUT
    }

    private ValueObject valueObject;
    private Direction direction;

    public ValuePort(ValueObject obj, Direction dir) {
        this.valueObject = obj;
        this.direction = dir;
    }

    public ValueObject getValueObject() {
        return valueObject;
    }

    public Direction getDirection() {
        return direction;
    }

    public void setValueObject(ValueObject obj) {
        this.valueObject = obj;
    }

    public void setDirection(Direction dir) {
        this.direction = dir;
    }
}
