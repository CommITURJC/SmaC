package smac.compiler.compilador.e3value;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class E3ValueMXGraphGenerator {

    private static final int BOX_W = 100, BOX_H = 100;
    private static final int CX = 400, CY = 220, R = 300;

    private static final int GAP = 70;
    private static final int EV_SPACING = 40;

    private static class VI {
        int viId, inPort, outPort, dotPort;
        int rot, relX, relY;
        boolean hasEvent = false;
    }

    private static String activityKey(String a, String b, String act) {
        return a + "→" + b + "→" + act;
    }

    public static String generate(Contract contract) {

        StringBuilder sb = new StringBuilder();
        sb.append("<mxGraphModel gridColor=\"#e0e0e0\" dx=\"800\" dy=\"600\" grid=\"1\" gridSize=\"10\" ")
                .append("pageFormattedText=\"false\" page=\"1\" pageScale=\"1\" pageWidth=\"827\" pageHeight=\"1169\" ")
                .append("file-version=\"1.8.61\" background=\"FFFFFF\">\n")
                .append("<root>\n  <mxCell id=\"0\"/>\n  <mxCell id=\"1\" parent=\"0\"/>\n");
        AtomicInteger id = new AtomicInteger(2);
        Map<String, Integer> ifCount = new HashMap<>();
        Set<String> counted = new HashSet<>();
        for (Function fn : contract.getFunctions()) {
            String src = fn.getTriggeredByActor();
            for (String dst : fn.getDestinations()) {
                if (src == null || src.equals(dst)) {
                    continue;
                }
                if (counted.add(src + "→" + fn.getName())) {
                    ifCount.merge(src, 1, Integer::sum);
                }
                if (counted.add(dst + "→" + fn.getName())) {
                    ifCount.merge(dst, 1, Integer::sum);
                }
            }
        }

        Map<String, Integer> boxId = new HashMap<>();
        Map<String, Integer> rot = new HashMap<>();
        Map<String, int[]> relPos = new HashMap<>();
        Map<String, int[]> actorGeo = new HashMap<>();

        List<Actor> actors = new ArrayList<>(contract.getActors());
        actors.sort(Comparator.comparing(Actor::getName));

        for (int i = 0; i < actors.size(); i++) {
            Actor a = actors.get(i);
            int[] p = pos(actors.size(), i);
            int ax = p[0], ay = p[1];

            int r, rx, ry;
            if (ax < CX - 50){
                r = 180;
                rx = 88;
                ry = 19;
            } 
            else if (ax > CX + 50){
                r = 0;
                rx = -12;
                ry = 26;
            } 
            else if (ay < CY - 50){
                r = 270;
                rx = 38;
                ry = 76;
            } 
            else{
                r = 90;
                rx = 39;
                ry = -24;
            }

            int n = ifCount.getOrDefault(a.getName(), 1);
            int w = BOX_W, h = BOX_H;
            if (r == 0 || r == 180) {
                h += (n - 1) * GAP;
            } else {
                w += (n - 1) * GAP;
            }

            int bid = id.getAndIncrement();
            sb.append(actorCell(bid, a.getName(), ax, ay, w, h));

            boxId.put(a.getName(), bid);
            rot.put(a.getName(), r);
            relPos.put(a.getName(), new int[]{rx, ry});
            actorGeo.put(a.getName(), new int[]{ax, ay, w, h});
        }

        Map<String, List<VI>> actorVI = new HashMap<>();
        Map<String, VI> pairCache = new HashMap<>();
        Map<String, VI> viByActFunc = new HashMap<>();
        Map<VI, String> funcOfVI = new HashMap<>();
        Set<String> doneEdge = new HashSet<>();

        contract.getFunctions().forEach(fn -> {
            String src = fn.getTriggeredByActor();
            if (!(src == null)) {
                fn.getDestinations().stream().filter(dst -> !(src.equals(dst))).forEachOrdered(dst -> {
                    String key = activityKey(src, dst, fn.getName());
                    VI srcVI, dstVI;
                    if (!pairCache.containsKey(key)) {
                        srcVI = createVI(src, id, sb, boxId, rot, relPos, actorGeo, actorVI, ifCount.getOrDefault(src, 1));
                        dstVI = createVI(dst, id, sb, boxId, rot, relPos, actorGeo, actorVI, ifCount.getOrDefault(dst, 1));
                        pairCache.put(key, srcVI);
                        pairCache.put("REV:" + key, dstVI);
                        
                        viByActFunc.put(src + "→" + fn.getName(), srcVI);
                        viByActFunc.put(dst + "→" + fn.getName(), dstVI);
                        funcOfVI.put(srcVI, fn.getName());
                        funcOfVI.put(dstVI, fn.getName());
                    } 
                    else{
                        srcVI = pairCache.get(key);
                        dstVI = pairCache.get("REV:" + key);
                    }
                    if(doneEdge.add(key)){
                        String lbl = fn.getValueObjects().isEmpty() ? fn.getName() : fn.getValueObjects().get(0);
                        sb.append(valueTransfer(id.getAndIncrement(), srcVI.outPort, dstVI.inPort, lbl));
                    }
                    if(fn.hasReverseObject(dst)){
                        String bk = "B:" + key;
                        if (doneEdge.add(bk)) {
                            sb.append(valueTransfer(id.getAndIncrement(), dstVI.outPort, srcVI.inPort,
                                    fn.getReverseObject(dst)));
                        }
                    }
                });
            }
        });

        for (Event ev : contract.getEvents()) {
            EventType et = ev.getType();
            boolean isStart = et == EventType.INITIAL;
            boolean isEnd = et == EventType.FINAL;
            if (!isStart && !isEnd) {
                continue;
            }

            String actor = ev.getTriggeredByActor();
            if (actor == null) {
                continue;
            }
            VI target = viByActFunc.get(actor + "→" + ev.getOriginFunction());
            if (target == null) {
                List<VI> vis = actorVI.get(actor);
                if (vis == null || vis.isEmpty()) {
                    continue;
                }
                target = vis.get(0);
            }
            addEventNode(isStart, false, target,
                    boxId.get(actor), actorGeo.get(actor), id, sb);
            target.hasEvent = true;
        }

        for (Map.Entry<VI, String> e : funcOfVI.entrySet()) {
            VI v = e.getKey();
            if (v.hasEvent) {
                continue;
            }
            int actorBox = -1;
            int[] g = null;
            for (Map.Entry<String, List<VI>> ent : actorVI.entrySet()) {
                if (ent.getValue().contains(v)) {
                    actorBox = boxId.get(ent.getKey());
                    g = actorGeo.get(ent.getKey());
                    break;
                }
            }
            if (actorBox == -1 || g == null) {
                continue;
            }
            String lbl = e.getValue() + "Finished";
            addEventNode(false, true, v, actorBox, g, id, sb);
            v.hasEvent = true;
        }

        sb.append("</root>\n</mxGraphModel>");
        return sb.toString();
    }

    private static VI createVI(String actor, AtomicInteger id, StringBuilder sb,
            Map<String, Integer> boxId, Map<String, Integer> rot,
            Map<String, int[]> rel, Map<String, int[]> geom,
            Map<String, List<VI>> cache, int total) {
        List<VI> list = cache.computeIfAbsent(actor, k -> new ArrayList<>());
        int idx = list.size();
        int r = rot.get(actor);
        int[] offs = rel.get(actor);
        int[] g = geom.get(actor);

        int dx = offs[0], dy = offs[1];
        if (r == 180) {
            dx = g[2] - 12;
        } 
        else if(r == 270){
            dy = g[3] - 24;
        } 
        else if(r == 90){
            dy = -24;
        }

        if(r == 0 || r == 180){
            dy += (total - 1 - idx) * GAP;
        } 
        else{
            dx += (total - 1 - idx) * GAP;
        }

        VI v = new VI();
        v.rot = r;
        v.relX = dx;
        v.relY = dy;

        v.viId = id.getAndIncrement();
        sb.append(valueInterface(v.viId, boxId.get(actor), r, dx, dy));

        v.dotPort = id.getAndIncrement();
        sb.append(portDot(v.dotPort, v.viId, r));
        v.inPort = id.getAndIncrement();
        sb.append(portIn(v.inPort, v.viId, r));
        v.outPort = id.getAndIncrement();
        sb.append(portOut(v.outPort, v.viId, r));

        list.add(v);
        return v;
    }

    private static void addEventNode(boolean isStart, boolean isBoundary,
            VI vi, int actorBoxId, int[] geom,
            AtomicInteger id, StringBuilder sb) {

        int aw = geom[2], ah = geom[3];
        int rot = vi.rot;

        int offX = aw / 2 - 15;
        int offY = ah / 2 - 15;

        if(rot == 0 || rot == 180){
            offY += (isStart ? -EV_SPACING : EV_SPACING);
        } 
        else{
            offX += (isStart ? -EV_SPACING : EV_SPACING);
        }


        String style = isBoundary
                ? "shape=mxgraph.tve.boundary_element;strokeWidth=3;fixed=1;labelMovable=1;"
                + "fillColor=#ffffff;strokeColor=#6fc6e8;"
                : "shape=mxgraph.tve.customer_need;strokeWidth=3;fixed=1;labelMovable=1;"
                + "fillColor=#ffffff;strokeColor=#6fc6e8;";

        int evId = id.getAndIncrement();
        sb.append(String.format(
                "<mxCell id=\"%d\" value=\"%s\" style=\"%s\" vertex=\"1\" parent=\"%d\">"
                + "<mxGeometry x=\"%d\" y=\"%d\" width=\"30\" height=\"30\" as=\"geometry\"/></mxCell>\n",
                evId, "", style, actorBoxId, offX, offY));

        int depId = id.getAndIncrement();
        sb.append("<dependency-path id=\"" + depId + "\">\n");
        sb.append(String.format(
                "<mxCell style=\"html=0;strokeWidth=2;dashed=1;strokeColor=#3399FF;"
                + "dashPattern=1 1;noLabel=1;\" edge=\"1\" parent=\"%d\" source=\"%d\" target=\"%d\">"
                + "<mxGeometry relative=\"1\" as=\"geometry\"/></mxCell>\n",
                actorBoxId, (isStart ? evId : vi.dotPort), (isStart ? vi.dotPort : evId)));
        sb.append("</dependency-path>\n");
    }

    private static int[] pos(int n, int k) {
        if (n == 1) {
            return new int[]{CX - 50, CY - 50};
        }
        if (n == 2) {
            return (k == 0) ? new int[]{CX - 250, CY} : new int[]{CX + 150, CY};
        }
        if (n == 3) {
            if (k == 0) {
                return new int[]{CX - 50, CY - 230};
            }
            if (k == 1) {
                return new int[]{CX - 270, CY + 90};
            }
            return new int[]{CX + 170, CY + 90};
        }
        if (n == 4) {
            if (k == 0) {
                return new int[]{CX - 50, CY - 230};
            }
            if (k == 1) {
                return new int[]{CX - 350, CY + 20};
            }
            if (k == 2) {
                return new int[]{CX + 250, CY + 20};
            }
            return new int[]{CX - 50, CY + 210};
        }
        double ang = 2 * Math.PI * k / n;
        return new int[]{(int) (CX + R * Math.cos(ang)) - 50, (int) (CY + R * Math.sin(ang)) - 50};
    }

    private static String actorCell(int id, String label, int x, int y, int w, int h) {
        return String.format( "<mxCell id=\"%d\" value=\"%s\" style=\"shape=mxgraph.tve.actor;html=0;\" vertex=\"1\" parent=\"1\">" + "<mxGeometry x=\"%d\" y=\"%d\" width=\"%d\" height=\"%d\" as=\"geometry\"/></mxCell>\n", id, esc(label), x, y, w, h);
    }

    private static String valueInterface(int id, int parent, int rot, int rx, int ry) {
        return String.format( "<mxCell id=\"%d\" style=\"shape=mxgraph.tve.value_interface;rotation=%d;html=0;\" vertex=\"1\" parent=\"%d\">"+ "<mxGeometry x=\"%d\" y=\"%d\" width=\"24\" height=\"48\" as=\"geometry\"/></mxCell>\n",id, rot, parent, rx, ry);
    }

    private static int[] dotPos(int rot) {
        switch (rot) {
            case 0:
                return new int[]{21, 21};
            case 180:
                return new int[]{-3, 21};
            case 270:
                return new int[]{9, 9};
            default:
                return new int[]{9, 33};
        }
    }

    private static int[] inPos(int rot) {
        switch (rot) {
            case 0:
                return new int[]{7, 10};
            case 180:
                return new int[]{7, 28};
            case 270:
                return new int[]{-2, 19};
            default:
                return new int[]{16, 19};
        }
    }

    private static int[] outPos(int rot) {
        switch (rot) {
            case 0:
                return new int[]{7, 28};
            case 180:
                return new int[]{7, 10};
            case 270:
                return new int[]{16, 19};
            default:
                return new int[]{-2, 19};
        }
    }

    private static String portDot(int id, int parent, int rot) {
        int[] p = dotPos(rot);
        return String.format(
                "<mxCell id=\"%d\" style=\"ellipse;html=0;strokeWidth=1;fixed=1;fillColor=#6fc6e8;strokeColor=#6fc6e8;rotation=%d;\" vertex=\"1\" parent=\"%d\">"
                + "<mxGeometry x=\"%d\" y=\"%d\" width=\"6\" height=\"6\" as=\"geometry\"/></mxCell>\n",
                id, rot, parent, p[0], p[1]);
    }

    private static String portIn(int id, int parent, int rot) {
        int[] p = inPos(rot);
        return String.format(
                "<mxCell id=\"%d\" style=\"shape=mxgraph.tve.east_triangle;html=0;strokeWidth=1;fillColor=#6fc6e8;strokeColor=#6fc6e8;rotation=%d;\" vertex=\"1\" parent=\"%d\">"
                + "<mxGeometry x=\"%d\" y=\"%d\" width=\"10\" height=\"10\" as=\"geometry\"/></mxCell>\n",
                id, rot, parent, p[0], p[1]);
    }

    private static String portOut(int id, int parent, int rot) {
        int[] p = outPos(rot);
        return String.format(
                "<mxCell id=\"%d\" style=\"shape=mxgraph.tve.west_triangle;html=0;strokeWidth=0;fillColor=#6fc6e8;strokeColor=#6fc6e8;rotation=%d;\" vertex=\"1\" parent=\"%d\">"
                + "<mxGeometry x=\"%d\" y=\"%d\" width=\"10\" height=\"10\" as=\"geometry\"/></mxCell>\n",
                id, rot, parent, p[0], p[1]);
    }

    private static String valueTransfer(int id, int src, int dst, String label) {
        return String.format(
                "<mxCell id=\"%d\" value=\"%s\" edge=\"1\" style=\"html=0;strokeWidth=2;strokeColor=#6fc6e8;\" parent=\"1\" source=\"%d\" target=\"%d\">"
                + "<mxGeometry relative=\"1\" as=\"geometry\"/></mxCell>\n",
                id, esc(label), src, dst);
    }

    private static String esc(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
