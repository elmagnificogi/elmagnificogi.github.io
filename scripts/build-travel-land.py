# -*- coding: utf-8 -*-
"""Build js/travel-map-land.js from Natural Earth 50m countries and China provinces."""
import json
import math
import sys
import urllib.request
from pathlib import Path

sys.setrecursionlimit(20000)

COUNTRIES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson"
PROVINCES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "travel-map-land.js"

CHINA = {"CHN", "TWN"}
JAPAN = {"JPN"}
NEIGHBOR = {"NPL", "BTN", "MMR", "IND", "LAO", "VNM", "KHM", "THA", "KOR", "PRK", "MNG", "BGD"}


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


def ring_area(ring):
    area = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        area += x1 * y2 - x2 * y1
    return abs(area) * 0.5


def exteriors(geom):
    gtype = geom["type"]
    if gtype == "Polygon":
        return [geom["coordinates"][0]]
    if gtype == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return []


def ring_bbox(ring):
    lngs = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return min(lngs), min(lats), max(lngs), max(lats)


def in_east_asia(ring):
    west, south, east, north = ring_bbox(ring)
    return not (east < 70 or west > 150 or north < 7 or south > 55)


def round_ring(ring):
    out = []
    for lng, lat in ring:
        pt = [round(lng, 3), round(lat, 3)]
        if not out or out[-1] != pt:
            out.append(pt)
    if len(out) > 2 and out[0] != out[-1]:
        out.append(out[0][:])
    return out


def iso_of(props):
    for key in ("ADM0_A3", "adm0_a3", "ISO_A3", "ADM0_A3_US", "ISO_A3_EH"):
        val = props.get(key)
        if val and val != "-99":
            return str(val).upper()
    return None


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "travel-map-builder"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))


def collect_rings(features, codes, min_area, epsilon, east_asia_only=False):
    rings = []
    for feat in features:
        code = iso_of(feat.get("properties") or {})
        if codes and code not in codes:
            continue
        for ring in exteriors(feat["geometry"]):
            pts = [(float(p[0]), float(p[1])) for p in ring]
            if ring_area(pts) < min_area:
                continue
            if east_asia_only and not in_east_asia(pts):
                continue
            simple = rdp(pts, epsilon)
            if len(simple) < 4:
                continue
            rings.append(round_ring(simple))
    return rings


def main():
    countries = fetch_json(COUNTRIES_URL)["features"]
    provinces = fetch_json(PROVINCES_URL)["features"]

    groups = {
        "china": collect_rings(countries, CHINA, 0.04, 0.012),
        "japan": collect_rings(countries, JAPAN, 0.03, 0.02, True),
        "neighbor": collect_rings(countries, NEIGHBOR, 0.08, 0.035, True),
        "province": collect_rings(provinces, {"CHN"}, 0.08, 0.028),
    }

    payload = json.dumps(groups, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text("window.TRAVEL_LAND=" + payload + ";\n", encoding="utf-8")
    sizes = {k: (len(v), sum(len(r) for r in v)) for k, v in groups.items()}
    print("wrote", OUT, "bytes", OUT.stat().st_size, "rings", sizes)


if __name__ == "__main__":
    main()
