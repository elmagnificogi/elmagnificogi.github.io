/**
 * CJK substring fallback — same card UI as Pagefind; also matches titles.
 * Requires /search-index.json from _plugins/search_index_generator.rb
 */
(function () {
  var INDEX_URL = "/search-index.json";
  var indexPromise = null;
  var INJECTED_CLASS = "pf-cjk-injected";
  var shadowStyleDone = false;

  function injectShadowStyles(shadowRoot) {
    if (!shadowRoot || shadowStyleDone || shadowRoot.getElementById("pf-cjk-style")) return;
    var style = document.createElement("style");
    style.id = "pf-cjk-style";
    style.textContent =
      ".pf-cjk-injected .pf-result-excerpt{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:unset}";
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
    if (s.length < 2) return false;
    return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(s);
  }

  function searchableText(entry) {
    return [entry.title, entry.subtitle, entry.s, entry.t]
      .filter(Boolean)
      .join("\n");
  }

  function matchesQuery(entry, q) {
    var blob = searchableText(entry);
    return blob.indexOf(q) !== -1;
  }

  function substringHits(q, index) {
    var seen = {};
    var hits = [];
    index.forEach(function (e) {
      if (!matchesQuery(e, q) || seen[e.u]) return;
      seen[e.u] = true;
      var titleHit = (e.title || "").indexOf(q) !== -1;
      hits.push({ entry: e, titleHit: titleHit });
    });
    hits.sort(function (a, b) {
      if (a.titleHit !== b.titleHit) return a.titleHit ? -1 : 1;
      return 0;
    });
    return hits.slice(0, 8).map(function (h) {
      return h.entry;
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
    if (i < 0) return highlightText(entry.t || "", q);
    return highlightText(blob.slice(Math.max(0, i - 20), i + q.length + 80), q);
  }

  function buildResultCard(entry, q) {
    var li = document.createElement("li");
    li.className = "pf-result " + INJECTED_CLASS;
    li.innerHTML =
      '<div class="pf-result-card">' +
      '<div class="pf-result-content">' +
      '<p class="pf-result-title"><a class="pf-result-link" href="' +
      escapeHtml(entry.u) +
      '">' +
      highlightText(entry.title || entry.u, q) +
      "</a></p>" +
      '<p class="pf-result-excerpt">' +
      excerptFor(entry, q) +
      "</p>" +
      "</div></div>";
    return li;
  }

  function findModalParts(modal) {
    var root = modal.shadowRoot || modal;
    injectShadowStyles(modal.shadowRoot);
    var resultsRoot =
      root.querySelector("pagefind-results") ||
      root.querySelector(".pf-results") ||
      root.querySelector('[class*="results"]');
    var resultsList =
      (resultsRoot && resultsRoot.querySelector(".pf-results")) ||
      resultsRoot;
    var input =
      root.querySelector('input[type="search"]') ||
      root.querySelector("input.pf-input") ||
      root.querySelector('input[placeholder*="搜"]') ||
      root.querySelector("input");
    return { root: root, resultsList: resultsList, input: input };
  }

  function clearInjected(resultsList) {
    if (!resultsList) return;
    resultsList.querySelectorAll("." + INJECTED_CLASS).forEach(function (el) {
      el.remove();
    });
    var legacy = resultsList.parentElement && resultsList.parentElement.querySelector(".pf-cjk-extra");
    if (legacy) legacy.remove();
  }

  function renderInjected(modal, q, hits) {
    var parts = findModalParts(modal);
    if (!parts.resultsList) return;

    clearInjected(parts.resultsList);

    if (!hits.length) return;

    var frag = document.createDocumentFragment();
    hits.forEach(function (entry) {
      frag.appendChild(buildResultCard(entry, q));
    });
    parts.resultsList.insertBefore(frag, parts.resultsList.firstChild);
  }

  function filterNoisyPagefindResults(modal, q) {
    var parts = findModalParts(modal);
    if (!parts.resultsList || !q) return;

    parts.resultsList.querySelectorAll(".pf-result").forEach(function (el) {
      if (el.classList.contains(INJECTED_CLASS)) {
        el.style.display = "";
        return;
      }
      var text = (el.textContent || "").replace(/\s+/g, "");
      var needle = q.replace(/\s+/g, "");
      var ok = text.indexOf(needle) !== -1;
      el.style.display = ok ? "" : "none";
    });

    var chips = parts.resultsList.querySelectorAll(".pf-heading-chip");
    chips.forEach(function (chip) {
      var parentResult = chip.closest(".pf-result");
      if (parentResult && parentResult.classList.contains(INJECTED_CLASS)) return;
      var text = (chip.textContent || "").replace(/\s+/g, "");
      var needle = q.replace(/\s+/g, "");
      chip.style.display = text.indexOf(needle) !== -1 ? "" : "none";
    });
  }

  function runSearch(modal, q) {
    if (!isCjkQuery(q)) {
      var parts = findModalParts(modal);
      clearInjected(parts.resultsList);
      filterNoisyPagefindResults(modal, "");
      return;
    }
    loadIndex().then(function (index) {
      var hits = substringHits(q, index);
      renderInjected(modal, q, hits);
      filterNoisyPagefindResults(modal, q);
      setTimeout(function () {
        filterNoisyPagefindResults(modal, q);
      }, 450);
    });
  }

  function hookModalInput(modal) {
    var parts = findModalParts(modal);
    if (!parts.input || parts.input.dataset.cjkHook) {
      return !!parts.input && !!parts.input.dataset.cjkHook;
    }
    parts.input.dataset.cjkHook = "1";

    var timer;
    parts.input.addEventListener("input", function () {
      var q = parts.input.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () {
        runSearch(modal, q);
      }, 200);
    });

    if (parts.resultsList && typeof MutationObserver !== "undefined") {
      var obs = new MutationObserver(function () {
        var q = parts.input.value.trim();
        if (isCjkQuery(q)) filterNoisyPagefindResults(modal, q);
      });
      obs.observe(parts.resultsList, { childList: true, subtree: true });
    }

    return true;
  }

  function tryHook() {
    var modal = document.querySelector("pagefind-modal");
    if (!modal) return false;
    return hookModalInput(modal);
  }

  function scheduleHook() {
    [50, 150, 400, 900, 1500].forEach(function (ms) {
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
    var openObs = new MutationObserver(function () {
      if (modal.hasAttribute("open") || modal.classList.contains("open")) {
        scheduleHook();
      }
    });
    openObs.observe(modal, { attributes: true, attributeFilter: ["open", "class"] });
  }

  loadIndex();
})();
