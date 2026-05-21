/**
 * CJK substring fallback — injects into a sibling list Pagefind will not overwrite.
 * Matches title + body via search-index.json.
 */
(function () {
  var INDEX_URL = "/search-index.json";
  var indexPromise = null;
  var INJECTED_CLASS = "pf-cjk-injected";
  var HOST_CLASS = "pf-cjk-results";
  var shadowStyleDone = false;
  var mergeTimer = null;

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
      ".pf-cjk-injected .pf-result-excerpt{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}";
    shadowRoot.appendChild(style);
    shadowStyleDone = true;
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL, { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("search-index.json missing (HTTP " + r.status + ")");
          return r.json();
        })
        .catch(function (err) {
          console.warn("[search-cjk]", err.message);
          return [];
        });
    }
    return indexPromise;
  }

  function isCjkQuery(q) {
    var s = (q || "").trim();
    return s.length >= 2 && /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(s);
  }

  function searchableText(entry) {
    return [entry.title, entry.subtitle, entry.s, entry.t].filter(Boolean).join("\n");
  }

  function matchesQuery(entry, q) {
    return searchableText(entry).indexOf(q) !== -1;
  }

  function substringHits(q, index) {
    var seen = {};
    var ranked = [];
    index.forEach(function (e) {
      if (!matchesQuery(e, q) || seen[e.u]) return;
      seen[e.u] = true;
      ranked.push({
        entry: e,
        titleHit: (e.title || "").indexOf(q) !== -1,
      });
    });
    ranked.sort(function (a, b) {
      return (b.titleHit ? 1 : 0) - (a.titleHit ? 1 : 0);
    });
    return ranked.slice(0, 8).map(function (x) {
      return x.entry;
    });
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

  function excerptFor(entry, q) {
    var blob = searchableText(entry);
    var i = blob.indexOf(q);
    var slice =
      i >= 0 ? blob.slice(Math.max(0, i - 20), i + q.length + 80) : entry.t || "";
    return highlightText(slice, q);
  }

  function buildResultCard(entry, q) {
    var li = document.createElement("li");
    li.className = "pf-result " + INJECTED_CLASS;
    li.innerHTML =
      '<div class="pf-result-card"><div class="pf-result-content">' +
      '<p class="pf-result-title"><a class="pf-result-link" href="' +
      escapeHtml(entry.u) +
      '">' +
      highlightText(entry.title || entry.u, q) +
      "</a></p>" +
      '<p class="pf-result-excerpt">' +
      excerptFor(entry, q) +
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
    var pagefindList = resultsPane.querySelector(".pf-results");
    var input =
      root.querySelector('input[type="search"]') ||
      root.querySelector("input.pf-input") ||
      root.querySelector("input");
    return {
      root: root,
      resultsPane: resultsPane,
      pagefindList: pagefindList,
      input: input,
    };
  }

  function ensureHost(parts) {
    if (!parts.resultsPane) return null;
    var host = parts.resultsPane.querySelector("." + HOST_CLASS);
    if (!host) {
      host = document.createElement("ol");
      host.className = "pf-results " + HOST_CLASS;
      if (parts.pagefindList) {
        parts.resultsPane.insertBefore(host, parts.pagefindList);
      } else {
        parts.resultsPane.appendChild(host);
      }
    }
    return host;
  }

  function renderCjkResults(modal, q, hits) {
    var parts = findModalParts(modal);
    var host = ensureHost(parts);
    if (!host) return;

    host.innerHTML = "";

    if (!isCjkQuery(q) || !hits.length) {
      host.hidden = true;
      return;
    }

    host.hidden = false;
    var frag = document.createDocumentFragment();
    hits.forEach(function (entry) {
      frag.appendChild(buildResultCard(entry, q));
    });
    host.appendChild(frag);
  }

  function mergeResults(modal, q) {
    if (!isCjkQuery(q)) {
      renderCjkResults(modal, q, []);
      return;
    }
    loadIndex().then(function (index) {
      renderCjkResults(modal, q, substringHits(q, index));
    });
  }

  function scheduleMerge(modal, q) {
    clearTimeout(mergeTimer);
    mergeTimer = setTimeout(function () {
      mergeResults(modal, q);
    }, 380);
    setTimeout(function () {
      mergeResults(modal, q);
    }, 750);
  }

  function hookModalInput(modal) {
    var parts = findModalParts(modal);
    if (!parts.input || parts.input.dataset.cjkHook) {
      return !!parts.input && !!parts.input.dataset.cjkHook;
    }
    parts.input.dataset.cjkHook = "1";

    var inputTimer;
    parts.input.addEventListener("input", function () {
      var q = parts.input.value.trim();
      clearTimeout(inputTimer);
      inputTimer = setTimeout(function () {
        scheduleMerge(modal, q);
      }, 120);
    });

    if (parts.pagefindList && typeof MutationObserver !== "undefined") {
      var moTimer;
      var obs = new MutationObserver(function () {
        var q = parts.input.value.trim();
        if (!isCjkQuery(q)) return;
        clearTimeout(moTimer);
        moTimer = setTimeout(function () {
          mergeResults(modal, q);
        }, 200);
      });
      obs.observe(parts.pagefindList, { childList: true, subtree: true });
    }

    return true;
  }

  function tryHook() {
    var modal = document.querySelector("pagefind-modal");
    return modal ? hookModalInput(modal) : false;
  }

  function scheduleHook() {
    [50, 200, 500, 1200].forEach(function (ms) {
      setTimeout(tryHook, ms);
    });
  }

  var searchLink = document.getElementById("blog-nav-search");
  if (searchLink) searchLink.addEventListener("click", scheduleHook);

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") scheduleHook();
  });

  var modal = document.querySelector("pagefind-modal");
  if (modal && typeof MutationObserver !== "undefined") {
    new MutationObserver(function () {
      if (modal.hasAttribute("open") || modal.classList.contains("open")) {
        scheduleHook();
      }
    }).observe(modal, { attributes: true, attributeFilter: ["open", "class"] });
  }

  loadIndex();
})();
