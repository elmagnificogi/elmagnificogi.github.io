# -*- coding: utf-8 -*-
"""Build js/travel-map-paths.js from travel_routes.yml via OSRM (roads, not straight lines)."""
import json
import math
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ROUTES = ROOT / "_data" / "travel_routes.yml"
OUT = ROOT / "js" / "travel-map-paths.js"

FLIGHT = {"vietnam"}
FOOT = {"chongqing", "yangzhou", "tianjin"}

OSRM = {
    "driving": [
        "https://router.project-osrm.org/route/v1/driving/{coord}",
        "https://routing.openstreetmap.de/routed-car/route/v1/driving/{coord}",
    ],
    "foot": [
        "https://routing.openstreetmap.de/routed-foot/route/v1/driving/{coord}",
        "https://router.project-osrm.org/route/v1/driving/{coord}",
    ],
}
UA = "elmagnificogi.github.io travel-map (+https://elmagnifico.tech)"
CTX = ssl.create_default_context()

sys.setrecursionlimit(20000)


def load_yaml(path):
    text = path.read_text(encoding="utf-8")
    try:
        import yaml
        return yaml.safe_load(text)
    except ImportError:
        pass
    # tiny subset: route_id: then "- name:" maps
    data = {}
    route = None
    item = None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        if not line.startswith(" ") and line.endswith(":"):
            route = line[:-1].strip()
            data[route] = []
            item = None
            continue
        if route is None:
            continue
        stripped = line.strip()
        if stripped.startswith("- "):
            item = {}
            data[route].append(item)
            stripped = stripped[2:]
        if item is None or ":" not in stripped:
            continue
        key, val = stripped.split(":", 1)
        key = key.strip()
        val = val.strip()
        if val in ("true", "false"):
            item[key] = val == "true"
        else:
            try:
                item[key] = float(val) if "." in val else int(val)
            except ValueError:
                item[key] = val.strip("'\"")
    return data


def perp_dist(pt, start, end):
    x, y = pt
    x1, y1 = start
    x2, y2 = end
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(x - x1, y - y1)
    t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))


def rdp(points, epsilon):
    if len(points) < 3:
        return points[:]
    start, end = points[0], points[-1]
    idx, dist = 0, 0.0
    for i in range(1, len(points) - 1):
        d = perp_dist(points[i], start, end)
        if d > dist:
            idx, dist = i, d
    if dist > epsilon:
        left = rdp(points[: idx + 1], epsilon)
        right = rdp(points[idx:], epsilon)
        return left[:-1] + right
    return [start, end]


def simplify(points, max_pts=650):
    if len(points) <= max_pts:
        return round_pts(points)
    lo, hi = 0.00012, 0.08
    best = points
    for _ in range(18):
        mid = (lo + hi) / 2
        cand = rdp(points, mid)
        if len(cand) > max_pts:
            lo = mid
        else:
            best = cand
            hi = mid
    return round_pts(best)


def round_pts(points):
    out = []
    for lng, lat in points:
        pt = [round(lng, 5), round(lat, 5)]
        if not out or out[-1] != pt:
            out.append(pt)
    return out


def to_xyz(lng, lat):
    rlat = math.radians(lat)
    rlng = math.radians(lng)
    c = math.cos(rlat)
    return c * math.cos(rlng), c * math.sin(rlng), math.sin(rlat)


def from_xyz(x, y, z):
    return math.degrees(math.atan2(y, x)), math.degrees(math.atan2(z, math.hypot(x, y)))


def geodesic(a, b, n=18):
    x1, y1, z1 = to_xyz(a[0], a[1])
    x2, y2, z2 = to_xyz(b[0], b[1])
    dot = max(-1.0, min(1.0, x1 * x2 + y1 * y2 + z1 * z2))
    omega = math.acos(dot)
    pts = [a]
    if omega < 1e-8:
        pts.append(b)
        return pts
    sin_o = math.sin(omega)
    for i in range(1, n):
        t = i / n
        s1 = math.sin((1 - t) * omega) / sin_o
        s2 = math.sin(t * omega) / sin_o
        pts.append(list(from_xyz(s1 * x1 + s2 * x2, s1 * y1 + s2 * y2, s1 * z1 + s2 * z2)))
    pts.append(b)
    return pts


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40, context=CTX) as resp:
        return json.loads(resp.read().decode("utf-8"))


def osrm_leg(a, b, profile):
    coord = "{:.5f},{:.5f};{:.5f},{:.5f}".format(a[0], a[1], b[0], b[1])
    last = None
    for base in OSRM.get(profile) or OSRM["driving"]:
        url = base.format(coord=coord) + "?overview=full&geometries=geojson"
        try:
            data = fetch_json(url)
            routes = data.get("routes") or []
            if not routes:
                last = "no route"
                continue
            geom = routes[0].get("geometry") or {}
            coords = geom.get("coordinates") or []
            if len(coords) >= 2:
                return coords
            last = "short geometry"
        except Exception as exc:
            last = str(exc)
            time.sleep(0.4)
    raise RuntimeError(last or "osrm failed")


def stitch(legs):
    out = []
    for leg in legs:
        if not leg:
            continue
        if out and abs(out[-1][0] - leg[0][0]) < 1e-5 and abs(out[-1][1] - leg[0][1]) < 1e-5:
            out.extend(leg[1:])
        else:
            out.extend(leg)
    return out


def path_for(stops, kind):
    pts = [[float(s["lng"]), float(s["lat"])] for s in stops]
    if len(pts) < 2:
        return pts
    if kind == "flight":
        legs = [geodesic(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
        return simplify(stitch(legs), 180)
    profile = "foot" if kind == "foot" else "driving"
    legs = []
    for i in range(len(pts) - 1):
        try:
            legs.append(osrm_leg(pts[i], pts[i + 1], profile))
            time.sleep(0.25)
        except Exception as exc:
            print("  fallback geodesic {} -> {}: {}".format(i, i + 1, exc), flush=True)
            if profile == "foot":
                try:
                    legs.append(osrm_leg(pts[i], pts[i + 1], "driving"))
                    time.sleep(0.25)
                    continue
                except Exception:
                    pass
            legs.append(geodesic(pts[i], pts[i + 1], 8))
    return simplify(stitch(legs))


def kind_of(route_id):
    if route_id in FLIGHT:
        return "flight"
    if route_id in FOOT:
        return "foot"
    return "drive"


def main():
    routes = load_yaml(ROUTES)
    paths = {}
    for route_id, stops in routes.items():
        if not isinstance(stops, list) or len(stops) < 2:
            continue
        kind = kind_of(route_id)
        print("route", route_id, kind, len(stops), "stops", flush=True)
        coords = path_for(stops, kind)
        paths[route_id] = {"kind": kind, "coords": coords}
        print("  ->", len(coords), "pts", flush=True)
    payload = json.dumps(paths, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text("window.TRAVEL_PATHS=" + payload + ";\n", encoding="utf-8")
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
