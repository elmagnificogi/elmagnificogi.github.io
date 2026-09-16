(function () {
  function viewFor(items, mode) {
    if (mode !== 'route' || !items.length) {
      return { west: 72, south: 8, east: 146, north: 54 };
    }
    var minLng = 180;
    var maxLng = -180;
    var minLat = 90;
    var maxLat = -90;
    for (var i = 0; i < items.length; i++) {
      minLng = Math.min(minLng, items[i].lng);
      maxLng = Math.max(maxLng, items[i].lng);
      minLat = Math.min(minLat, items[i].lat);
      maxLat = Math.max(maxLat, items[i].lat);
    }
    var dLng = Math.max(maxLng - minLng, 0.08);
    var dLat = Math.max(maxLat - minLat, 0.05);
    var lngSpan = Math.max(dLng * 1.28, dLng + 0.18);
    var latSpan = Math.max(dLat * 1.4, dLat + 0.12);
    if (lngSpan < 0.45) lngSpan = 0.45;
    if (latSpan < 0.32) latSpan = 0.32;
    if (lngSpan > latSpan * 1.85) latSpan = lngSpan / 1.85;
    if (latSpan > lngSpan * 1.2) lngSpan = latSpan * 1.2;
    var lngMid = (minLng + maxLng) / 2;
    var latMid = (minLat + maxLat) / 2 - latSpan * 0.04;
    return {
      west: lngMid - lngSpan / 2,
      east: lngMid + lngSpan / 2,
      south: latMid - latSpan / 2,
      north: latMid + latSpan / 2
    };
  }

  function lonScale(view) {
    return Math.max(Math.cos((view.south + view.north) / 2 * Math.PI / 180), 0.25);
  }

  function sizeFor(view) {
    var width = 800;
    var pad = 0.07;
    var k = lonScale(view);
    var geoW = Math.max(view.east - view.west, 0.001) * k;
    var geoH = Math.max(view.north - view.south, 0.001);
    var innerW = width * (1 - pad * 2);
    var height = Math.round(innerW * geoH / geoW / (1 - pad * 2));
    if (height < 300) height = 300;
    if (height > 640) height = 640;
    return { width: width, height: height };
  }

  function projector(width, height, view) {
    var padX = width * 0.07;
    var padY = height * 0.07;
    var innerW = width - padX * 2;
    var innerH = height - padY * 2;
    var k = lonScale(view);
    var geoW = Math.max(view.east - view.west, 0.001) * k;
    var geoH = Math.max(view.north - view.south, 0.001);
    var scale = Math.min(innerW / geoW, innerH / geoH);
    var ox = padX + (innerW - geoW * scale) / 2;
    var oy = padY + (innerH - geoH * scale) / 2;
    return function (lat, lng) {
      return {
        x: ox + (lng - view.west) * k * scale,
        y: oy + (view.north - lat) * scale
      };
    };
  }

  function readData(wrap) {
    var node = wrap.querySelector('script[type="application/json"]');
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (err) {
      return null;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ringPath(ring, proj) {
    var d = '';
    for (var i = 0; i < ring.length; i++) {
      var p = proj(ring[i][1], ring[i][0]);
      d += (i ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
    }
    return d + 'Z';
  }

  function landPaths(proj) {
    var land = window.TRAVEL_LAND || {};
    var html = '';
    function add(rings, className) {
      if (!rings) return;
      for (var i = 0; i < rings.length; i++) {
        html += '<path class="' + className + '" d="' + ringPath(rings[i], proj) + '"></path>';
      }
    }
    add(land.neighbor, 'travel-land travel-land--neighbor');
    add(land.japan, 'travel-land');
    add(land.china, 'travel-land');
    add(land.province, 'travel-land travel-land--province');
    return html;
  }

  function labelEl(item, p) {
    var dx = item.labelDx || 0;
    var dy = item.labelDy != null ? item.labelDy : -10;
    var anchor = item.labelAnchor || 'middle';
    return '<text class="travel-label" x="' + p.x.toFixed(1) + '" y="' + p.y.toFixed(1) +
      '" dx="' + dx + '" dy="' + dy + '" text-anchor="' + anchor + '">' +
      escapeHtml(item.name) + '</text>';
  }

  function shouldLabel(item, mode) {
    if (mode === 'pins') return true;
    return !!item.label;
  }

  function tipHtml(name, url) {
    if (url) return '<a href="' + escapeHtml(url) + '">' + escapeHtml(name) + '</a>';
    return escapeHtml(name);
  }

  function bindPins(wrap, pins, items) {
    var tip = wrap.querySelector('.travel-map-tip');
    var locked = false;

    function placeTip(node) {
      var canvas = wrap.querySelector('.travel-map-canvas');
      var pinBox = node.getBoundingClientRect();
      var box = canvas.getBoundingClientRect();
      tip.style.left = (pinBox.left + pinBox.width / 2 - box.left) + 'px';
      tip.style.top = (pinBox.top - box.top) + 'px';
    }

    function show(node, item, isPopup) {
      tip.innerHTML = tipHtml(item.name, item.url || '');
      tip.hidden = false;
      tip.classList.toggle('is-popup', !!isPopup);
      placeTip(node);
    }

    wrap.addEventListener('click', function () {
      locked = false;
      tip.hidden = true;
      tip.classList.remove('is-popup');
    });

    for (var i = 0; i < pins.length; i++) {
      (function (node, item) {
        node.addEventListener('mouseenter', function () {
          if (!locked) show(node, item, false);
        });
        node.addEventListener('mouseleave', function () {
          if (!locked) {
            tip.hidden = true;
            tip.classList.remove('is-popup');
          }
        });
        node.addEventListener('click', function (event) {
          event.stopPropagation();
          locked = true;
          show(node, item, true);
        });
      }(pins[i], items[i]));
    }
  }

  function draw(wrap, data) {
    var canvas = wrap.querySelector('.travel-map-canvas');
    if (!canvas) return;
    var items = data.mode === 'route' ? (data.stops || []) : (data.places || []);
    var view = viewFor(items, data.mode);
    var size = sizeFor(view);
    var width = size.width;
    var height = size.height;
    var proj = projector(width, height, view);
    var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' +
      (data.mode === 'route' ? '行程路线' : '走过的地方') + '">';
    svg += '<rect class="travel-sea" x="0" y="0" width="' + width + '" height="' + height + '"></rect>';
    svg += landPaths(proj);

    if (data.mode === 'route') {
      var stops = data.stops || [];
      var line = '';
      for (var i = 0; i < stops.length; i++) {
        var p = proj(stops[i].lat, stops[i].lng);
        line += (i ? ' ' : '') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
      }
      if (stops.length > 1) {
        svg += '<polyline class="travel-route" points="' + line + '"></polyline>';
      }
      for (var j = 0; j < stops.length; j++) {
        var q = proj(stops[j].lat, stops[j].lng);
        var r = (j === 0 || j === stops.length - 1 || stops[j].label) ? 5 : 3.5;
        svg += '<circle class="travel-pin" cx="' + q.x.toFixed(1) + '" cy="' + q.y.toFixed(1) +
          '" r="' + r + '" data-index="' + j + '"></circle>';
        if (shouldLabel(stops[j], 'route')) svg += labelEl(stops[j], q);
      }
    } else {
      var places = data.places || [];
      for (var k = 0; k < places.length; k++) {
        var m = proj(places[k].lat, places[k].lng);
        svg += '<circle class="travel-pin" cx="' + m.x.toFixed(1) + '" cy="' + m.y.toFixed(1) +
          '" r="5" data-index="' + k + '"></circle>';
        if (shouldLabel(places[k], 'pins')) svg += labelEl(places[k], m);
      }
    }

    svg += '</svg><div class="travel-map-tip" hidden></div>';
    canvas.innerHTML = svg;

    var pins = canvas.querySelectorAll('.travel-pin');
    bindPins(wrap, pins, items);
  }

  function init() {
    var wraps = document.querySelectorAll('.js-travel-map');
    for (var i = 0; i < wraps.length; i++) {
      var data = readData(wraps[i]);
      if (data) draw(wraps[i], data);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
