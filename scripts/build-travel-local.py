# -*- coding: utf-8 -*-
"""Build js/travel-map-local.js from Geofabrik OSM shapefiles (city-scale water/roads)."""
import json
import ssl
import urllib.request
import zipfile
from pathlib import Path

import shapefile

ROOT = Path(__file__).resolve().parent.parent
ROUTES = ROOT / "_data" / "travel_routes.yml"
OUT = ROOT / "js" / "travel-map-local.js"
CACHE = Path(__file__).resolve().parent / ".cache"
UA = "elmagnificogi.github.io travel-map (+https://elmagnifico.tech)"
CTX = ssl.create_default_context()

# city walking maps that otherwise sit on a blank land fill
EXTRACT = {
    "chongqing": "china/chongqing",
    "yangzhou": "china/jiangsu",
    "tianjin": "china/tianjin",
}

ROAD_KEEP = {
    "motorway", "trunk", "primary", "secondary", "tertiary",
    "motorway_link", "trunk_link", "primary_link", "secondary_link",
}
ROAD_SMALL = ROAD_KEEP | {"residential", "unclassified"}
WATERWAY_KEEP = {"river", "canal", "stream"}
WATER_KEEP = {"water", "reservoir", "river", "lake", "pond", "oxbow"}


def load_builder():
    from importlib.machinery import SourceFileLoader
    return SourceFileLoader(
        "build_travel_paths",
        str(Path(__file__).with_name("build-travel-paths.py")),
    ).load_module()


def bbox_of(stops):
    lngs = [float(s["lng"]) for s in stops]
    lats = [float(s["lat"]) for s in stops]
    return min(lngs), min(lats), max(lngs), max(lats)


def padded_bbox(west, south, east, north):
    d_lng = max(east - west, 0.08)
    d_lat = max(north - south, 0.05)
    lng_span = max(d_lng * 1.28, d_lng + 0.18, 0.45)
    lat_span = max(d_lat * 1.4, d_lat + 0.12, 0.32)
    if lng_span > lat_span * 1.85:
        lat_span = lng_span / 1.85
    if lat_span > lng_span * 1.2:
        lng_span = lat_span * 1.2
    mid_lng = (west + east) / 2
    mid_lat = (north + south) / 2
    pad_lng = lng_span * 0.52
    pad_lat = lat_span * 0.52
    return mid_lng - pad_lng, mid_lat - pad_lat, mid_lng + pad_lng, mid_lat + pad_lat


def fetch_zip(extract):
    CACHE.mkdir(parents=True, exist_ok=True)
    name = extract.replace("/", "-")
    zpath = CACHE / (name + "-free.shp.zip")
    dest = CACHE / name
    if not zpath.exists():
        url = "https://download.geofabrik.de/asia/{}-latest-free.shp.zip".format(extract)
        print("download", url, flush=True)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=180, context=CTX) as resp:
            zpath.write_bytes(resp.read())
        print("  saved", zpath.stat().st_size, "bytes", flush=True)
    if not dest.exists():
        dest.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(zpath) as zf:
            zf.extractall(dest)
    return dest


def find_shp(folder, prefix):
    matches = list(folder.glob(prefix + "*.shp"))
    if not matches:
        matches = list(folder.rglob(prefix + "*.shp"))
    if not matches:
        raise FileNotFoundError(prefix + " in " + str(folder))
    return matches[0]


def field_index(reader, name):
    names = [f[0] for f in reader.fields[1:]]
    for i, item in enumerate(names):
        if item.lower() == name:
            return i
    return None


def overlap(a, b):
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])


def simplify_line(rdp, pts, epsilon):
    simple = rdp(pts, epsilon) if len(pts) >= 3 else pts[:]
    out = []
    for lng, lat in simple:
        pt = [round(float(lng), 5), round(float(lat), 5)]
        if not out or out[-1] != pt:
            out.append(pt)
    return out


def budget(lines, max_pts):
    if sum(len(p) for p in lines) <= max_pts:
        return lines
    ranked = sorted(lines, key=len, reverse=True)
    out, n = [], 0
    for line in ranked:
        if n >= max_pts:
            break
        out.append(line)
        n += len(line)
    return out


def iter_clipped(shp_path, bbox, keep):
    reader = shapefile.Reader(str(shp_path), encoding="utf-8")
    fclass_i = field_index(reader, "fclass")
    count = len(reader)
    for i in range(count):
        try:
            sr = reader.shapeRecord(i)
            shape = sr.shape
        except Exception:
            continue
        if fclass_i is not None:
            try:
                fclass = str(sr.record[fclass_i] or "").lower()
            except Exception:
                continue
            if keep is not None and fclass not in keep:
                continue
        sb = getattr(shape, "bbox", None)
        if not sb or len(sb) < 4 or not overlap(sb, bbox):
            continue
        points = shape.points or []
        parts = list(shape.parts or [0]) + [len(points)]
        for j in range(len(parts) - 1):
            pts = [(float(p[0]), float(p[1])) for p in points[parts[j]:parts[j + 1]]]
            if len(pts) >= 2:
                yield pts
    reader.close()


def collect(folder, bbox, span, rdp):
    eps_water = max(span * 0.0007, 0.0001)
    eps_road = max(span * 0.001, 0.00015)
    roads_keep = ROAD_SMALL if span < 0.28 else ROAD_KEEP
    water, river, road, rail = [], [], [], []

    water_shp = find_shp(folder, "gis_osm_water_a_free")
    for pts in iter_clipped(water_shp, bbox, WATER_KEEP):
        ring = simplify_line(rdp, pts, eps_water)
        if len(ring) >= 4:
            water.append(ring)

    waterway_shp = find_shp(folder, "gis_osm_waterways_free")
    for pts in iter_clipped(waterway_shp, bbox, WATERWAY_KEEP):
        line = simplify_line(rdp, pts, eps_water)
        if len(line) >= 2:
            river.append(line)

    road_shp = find_shp(folder, "gis_osm_roads_free")
    for pts in iter_clipped(road_shp, bbox, roads_keep):
        line = simplify_line(rdp, pts, eps_road)
        if len(line) >= 2:
            road.append(line)

    try:
        rail_shp = find_shp(folder, "gis_osm_railways_free")
        for pts in iter_clipped(rail_shp, bbox, {"rail"}):
            line = simplify_line(rdp, pts, eps_road)
            if len(line) >= 2:
                rail.append(line)
    except FileNotFoundError:
        pass

    return {
        "water": budget(water, 1200),
        "river": budget(river, 600),
        "road": budget(road, 1800),
        "rail": budget(rail, 280),
    }


def main():
    builder = load_builder()
    routes = builder.load_yaml(ROUTES)
    local = {}
    folders = {}
    for route_id, extract in EXTRACT.items():
        stops = routes.get(route_id)
        if not isinstance(stops, list) or len(stops) < 2:
            continue
        west, south, east, north = bbox_of(stops)
        qwest, qsouth, qeast, qnorth = padded_bbox(west, south, east, north)
        bbox = (qwest, qsouth, qeast, qnorth)
        qspan = max(qeast - qwest, qnorth - qsouth)
        print("local", route_id, extract, "span", round(qspan, 3), flush=True)
        if extract not in folders:
            folders[extract] = fetch_zip(extract)
        packed = collect(folders[extract], bbox, qspan, builder.rdp)
        counts = {k: (len(v), sum(len(p) for p in v)) for k, v in packed.items()}
        print("  ", counts, flush=True)
        local[route_id] = packed
        payload = json.dumps(local, ensure_ascii=False, separators=(",", ":"))
        OUT.write_text("window.TRAVEL_LOCAL=" + payload + ";\n", encoding="utf-8")
    payload = json.dumps(local, ensure_ascii=False, separators=(",", ":"))
    OUT.write_text("window.TRAVEL_LOCAL=" + payload + ";\n", encoding="utf-8")
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
