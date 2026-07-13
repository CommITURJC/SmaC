package smac.compiler.compilador.e3value;

public class Variable {

    private String name;
    private String type;

    public Variable(String n, String t) {
        this.name = n;
        this.type = t;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }
}
