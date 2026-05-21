/* global self */
/**
 * Off-main-thread CJK substring search over sharded compact index.
 * Row: [url, title, searchText] or legacy { u, title, s, t, subtitle }.
 */
(function () {
  var index = null;
  var loading = null;

  function rowUrl(row) {
    return row[0] || row.u || "";
  }

  function rowTitle(row) {
    return row[1] || row.title || rowUrl(row);
  }

  function rowSearch(row) {
    if (Array.isArray(row)) return row[2] || "";
    return [row.title, row.subtitle, row.s, row.t].filter(Boolean).join("\n");
  }

  function loadShards(urls) {
    if (loading) return loading;
    if (!urls || !urls.length) {
      index = [];
      return Promise.resolve(0);
    }
    loading = Promise.all(
      urls.map(function (url) {
        return fetch(url, { cache: "no-store" }).then(function (r) {
          if (!r.ok) throw new Error(url + " HTTP " + r.status);
          return r.json();
        });
      })
    ).then(function (parts) {
      index = [];
      parts.forEach(function (part) {
        if (Array.isArray(part)) index = index.concat(part);
      });
      loading = null;
      return index.length;
    });
    return loading.catch(function (err) {
      loading = null;
      throw err;
    });
  }

  function initRows(rows) {
    index = Array.isArray(rows) ? rows : [];
    loading = null;
    return index.length;
  }

  function substringHits(q, max) {
    var seen = {};
    var ranked = [];
    var limit = max || 8;

    index.forEach(function (row) {
      var u = rowUrl(row);
      if (!u || seen[u]) return;
      var blob = rowSearch(row);
      if (blob.indexOf(q) === -1) return;
      seen[u] = true;
      ranked.push({
        u: u,
        title: rowTitle(row),
        s: blob,
        titleHit: rowTitle(row).indexOf(q) !== -1,
      });
    });

    ranked.sort(function (a, b) {
      return (b.titleHit ? 1 : 0) - (a.titleHit ? 1 : 0);
    });
    return ranked.slice(0, limit);
  }

  self.onmessage = function (ev) {
    var msg = ev.data || {};
    var id = msg.id;

    if (msg.type === "init") {
      try {
        var n = initRows(msg.rows);
        self.postMessage({ type: "loaded", id: id, count: n });
      } catch (err) {
        self.postMessage({ type: "error", id: id, message: err.message });
      }
      return;
    }

    if (msg.type === "load") {
      loadShards(msg.urls || [])
        .then(function (count) {
          self.postMessage({ type: "loaded", id: id, count: count });
        })
        .catch(function (err) {
          self.postMessage({ type: "error", id: id, message: err.message });
        });
      return;
    }

    if (msg.type === "search") {
      if (!index) {
        self.postMessage({ type: "error", id: id, message: "index not loaded" });
        return;
      }
      self.postMessage({ type: "hits", id: id, hits: substringHits(msg.q, msg.max) });
    }
  };
})();
