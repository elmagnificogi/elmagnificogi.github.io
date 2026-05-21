/**
 * CJK exact-phrase fallback: sharded index + Web Worker (keeps UI thread free).
 */
(function () {
  var MANIFEST_URL = "/search-index/manifest.json";
  var LEGACY_INDEX_URL = "/search-index.json";
  var WORKER_URL = "/js/search-cjk-worker.js";
  var HOST_CLASS = "pf-cjk-results";
  var INJECTED_CLASS = "pf-cjk-injected";

  var shadowStyleDone = false;
  var mergeTimer = null;
  var hookedModal = null;
  var worker = null;
  var workerReady = false;
  var workerLoading = false;
  var pendingSearch = null;
  var searchSeq = 0;

  function injectShadowStyles(shadowRoot) {
    if (!shadowRoot || shadowStyleDone || shadowRoot.getElementById("pf-cjk-style")) return;
    var style = document.createElement("style");
    style.id = "pf-cjk-style";
    style.textContent =
      "." +
      HOST_CLASS +
      "{list-style:none;padding:0;margin:0 0 8px;display:flex;flex-direction:column;gap:8px}" +
      "." +
      HOST_CLASS +
      ":empty{display:none;margin:0}" +
      "." +
      HOST_CLASS +
      " .pf-cjk-label{font-size:12px;color:var(--pf-muted,#888);margin:0 0 4px;padding:0 4px}" +
      ".pf-cjk-injected .pf-result-excerpt{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}";
    shadowRoot.appendChild(style);
    shadowStyleDone = true;
  }

  function isCjkQuery(q) {
    var s = (q || "").trim();
    return s.length >= 2 && /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(s);
  }

  function getWorker() {
    if (worker) return worker;
    if (typeof Worker === "undefined") return null;
    try {
      worker = new Worker(WORKER_URL);
      worker.onmessage = onWorkerMessage;
      worker.onerror = function () {
        console.warn("[search-cjk] worker failed");
        worker = null;
        workerReady = false;
      };
    } catch (_e) {
      worker = null;
    }
    return worker;
  }

  function resolveManifest() {
    return fetch(MANIFEST_URL, { cache: "no-store" })
      .then(function (r) {
        if (r.ok) return r.json();
        return fetch(LEGACY_INDEX_URL, { cache: "no-store" }).then(function (r2) {
          if (!r2.ok) throw new Error("search index HTTP " + r2.status);
          return r2.json();
        });
      })
      .then(function (data) {
        if (data && data.manifest) {
          return fetch(data.manifest, { cache: "no-store" }).then(function (r) {
            return r.json();
          });
        }
        if (data && data.shards) return data;
        return { legacy: true, rows: Array.isArray(data) ? data : [] };
      });
  }

  function shardUrls(manifest) {
    if (manifest.legacy) return null;
    return (manifest.shards || []).map(function (s) {
      return s.u;
    });
  }

  function ensureIndexLoaded() {
    if (workerReady || workerLoading) return;
    var w = getWorker();
    if (!w) return;

    workerLoading = true;
    resolveManifest()
      .then(function (manifest) {
        if (manifest.legacy) {
          w.postMessage({ type: "init", id: "legacy", rows: manifest.rows });
          return;
        }
        var urls = shardUrls(manifest);
        if (!urls || !urls.length) throw new Error("empty manifest");
        w.postMessage({ type: "load", id: "shards", urls: urls });
      })
      .catch(function (err) {
        workerLoading = false;
        console.warn("[search-cjk]", err.message);
      });
  }

  function onWorkerMessage(ev) {
    var msg = ev.data || {};
    if (msg.type === "loaded") {
      workerReady = true;
      workerLoading = false;
      if (pendingSearch) {
        var p = pendingSearch;
        pendingSearch = null;
        runWorkerSearch(p.modal, p.q, p.id);
      }
      return;
    }
    if (msg.type === "hits") {
      var active = pendingSearch;
      if (!active || msg.id !== active.id) return;
      renderCjkResults(active.modal, active.q, msg.hits || []);
      pendingSearch = null;
      return;
    }
    if (msg.type === "error") {
      workerLoading = false;
      console.warn("[search-cjk]", msg.message);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightText(text, q) {
    var i = text.indexOf(q);
    if (i < 0) return escapeHtml(text.slice(0, 120)) + (text.length > 120 ? "…" : "");
    var start = Math.max(0, i - 36);
    var end = Math.min(text.length, i + q.length + 60);
    var chunk = text.slice(start, end);
    var out = "";
    var pos = 0;
    while (pos < chunk.length) {
      var hit = chunk.indexOf(q, pos);
      if (hit < 0) {
        out += escapeHtml(chunk.slice(pos));
        break;
      }
      out += escapeHtml(chunk.slice(pos, hit));
      out += "<mark>" + escapeHtml(q) + "</mark>";
      pos = hit + q.length;
    }
    return (start > 0 ? "…" : "") + out + (end < text.length ? "…" : "");
  }

  function buildResultCard(entry, q) {
    var href = entry.u || "";
    if (href.indexOf("//") === 0) href = href.replace(/^\/+/, "/");

    var li = document.createElement("li");
    li.className = "pf-result " + INJECTED_CLASS;
    li.innerHTML =
      '<div class="pf-result-card"><div class="pf-result-content">' +
      '<p class="pf-result-title"><a class="pf-result-link" href="' +
      escapeHtml(href) +
      '">' +
      highlightText(entry.title || href, q) +
      "</a></p>" +
      '<p class="pf-result-excerpt">' +
      highlightText(entry.s || "", q) +
      "</p></div></div>";
    return li;
  }

  function findModalParts(modal) {
    var root = modal.shadowRoot || modal;
    injectShadowStyles(modal.shadowRoot);
    var resultsPane =
      root.querySelector("pagefind-results") ||
      root.querySelector("pagefind-modal-body") ||
      root;
    return {
      resultsPane: resultsPane,
      pagefindList: resultsPane ? resultsPane.querySelector(".pf-results") : null,
      input:
        root.querySelector('input[type="search"]') ||
        root.querySelector("input.pf-input") ||
        root.querySelector("input"),
    };
  }

  function ensureHost(parts) {
    if (!parts.resultsPane) return null;
    var host = parts.resultsPane.querySelector("." + HOST_CLASS);
    if (host) return host;

    host = document.createElement("ol");
    host.className = "pf-results " + HOST_CLASS;
    host.setAttribute("aria-label", "精确匹配");

    var list = parts.pagefindList;
    if (list && list.parentNode === parts.resultsPane) {
      parts.resultsPane.insertBefore(host, list);
    } else {
      parts.resultsPane.appendChild(host);
    }
    return host;
  }

  function renderCjkResults(modal, q, hits) {
    if (!modal) return;
    var parts = findModalParts(modal);
    var host = ensureHost(parts);
    if (!host) return;

    host.innerHTML = "";

    if (!isCjkQuery(q) || !hits || !hits.length) {
      host.hidden = true;
      return;
    }

    host.hidden = false;
    var label = document.createElement("p");
    label.className = "pf-cjk-label";
    label.textContent = "精确匹配（" + hits.length + "）";
    host.appendChild(label);

    var frag = document.createDocumentFragment();
    hits.forEach(function (entry) {
      frag.appendChild(buildResultCard(entry, q));
    });
    host.appendChild(frag);
  }

  function runWorkerSearch(modal, q, id) {
    var w = getWorker();
    if (!w) return;
    w.postMessage({ type: "search", id: id, q: q, max: 8 });
  }

  function mergeResults(modal, q) {
    if (!isCjkQuery(q)) {
      renderCjkResults(modal, q, []);
      return;
    }

    var w = getWorker();
    if (!w) return;

    searchSeq += 1;
    var id = searchSeq;
    pendingSearch = { modal: modal, q: q, id: id };

    if (!workerReady) {
      ensureIndexLoaded();
      return;
    }

    runWorkerSearch(modal, q, id);
  }

  function scheduleMerge(modal, q) {
    clearTimeout(mergeTimer);
    mergeTimer = setTimeout(function () {
      mergeResults(modal, q);
    }, 280);
  }

  function hookModalInput(modal) {
    if (hookedModal === modal) return true;
    var parts = findModalParts(modal);
    if (!parts.input) return false;

    hookedModal = modal;
    var inputTimer;
    parts.input.addEventListener("input", function () {
      var q = parts.input.value.trim();
      if (!isCjkQuery(q)) renderCjkResults(modal, q, []);
      clearTimeout(inputTimer);
      inputTimer = setTimeout(function () {
        scheduleMerge(modal, q);
      }, 120);
    });

    return true;
  }

  function onSearchOpen() {
    tryHook();
    ensureIndexLoaded();
    [100, 400].forEach(function (ms) {
      setTimeout(tryHook, ms);
    });
  }

  function tryHook() {
    var modal = document.querySelector("pagefind-modal");
    return modal ? hookModalInput(modal) : false;
  }

  var searchLink = document.getElementById("blog-nav-search");
  if (searchLink) searchLink.addEventListener("click", onSearchOpen);

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") onSearchOpen();
  });

  var modal = document.querySelector("pagefind-modal");
  if (modal && typeof MutationObserver !== "undefined") {
    new MutationObserver(function () {
      if (modal.hasAttribute("open") || modal.classList.contains("open")) {
        onSearchOpen();
      }
    }).observe(modal, { attributes: true, attributeFilter: ["open", "class"] });
  }
})();
