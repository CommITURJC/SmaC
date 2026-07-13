package smac.compiler.compilador.mongo;

import java.util.List;
import java.util.Map;

public class SolicitudRegistrarLogs {

    private String workspaceId;
    private List<Map<String, Object>> logs;

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public List<Map<String, Object>> getLogs() {
        return logs;
    }

    public void setLogs(List<Map<String, Object>> logs) {
        this.logs = logs;
    }
}

