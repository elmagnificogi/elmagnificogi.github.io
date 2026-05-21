/**
 * Substring fallback for Chinese queries when Pagefind splits terms (e.g. 限宽墩 -> 限+宽+墩).
 * Requires /search-index.json from scripts/build-search-index.mjs
 */
(function () {
  var INDEX_URL = "/search-index.json";
  var indexPromise = null;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL, { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("search-index.json missing");
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

  function excerptAround(text, q, len) {
    var i = text.indexOf(q);
    if (i < 0) return text.slice(0, len) + (text.length > len ? "…" : "");
    var start = Math.max(0, i - Math.floor(len / 2));
    return (start > 0 ? "…" : "") + text.slice(start, start + len) + "…";
  }

  function substringHits(q, index) {
    return index
      .filter(function (e) {
        return e.t && e.t.indexOf(q) !== -1;
      })
      .slice(0, 8);
  }

  function ensureExtraContainer(modal) {
    var root = modal.shadowRoot;
    if (!root) return null;
    var body =
      root.querySelector("pagefind-modal-body") ||
      root.querySelector(".pf-modal-body") ||
      root.querySelector('[class*="modal-body"]');
    if (!body) return null;
    var extra = root.querySelector(".pf-cjk-extra");
    if (!extra) {
      extra = document.createElement("div");
      extra.className = "pf-cjk-extra";
      extra.setAttribute("data-cjk-fallback", "true");
      body.insertBefore(extra, body.firstChild);
    }
    return extra;
  }

  function renderExtra(modal, q, hits) {
    var extra = ensureExtraContainer(modal);
    if (!extra) return;

    if (!hits.length) {
      extra.innerHTML = "";
      extra.hidden = true;
      return;
    }

    extra.hidden = false;
    var html =
      '<p class="pf-cjk-extra-label">包含「' +
      escapeHtml(q) +
      "」的精确匹配（" +
      hits.length +
      "）</p><ul class="pf-cjk-extra-list">';
    hits.forEach(function (h) {
      html +=
        '<li><a class="pf-cjk-extra-link" href="' +
        escapeHtml(h.u) +
        '"><strong>' +
        escapeHtml(h.title || h.u) +
        "</strong><span>" +
        escapeHtml(excerptAround(h.t, q, 80)) +
        "</span></a></li>";
    });
    html += "</ul>";
    extra.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hookModalInput(modal) {
    var root = modal.shadowRoot;
    if (!root) return false;
    var input =
      root.querySelector('input[type="search"]') ||
      root.querySelector("input.pf-input") ||
      root.querySelector("input");
    if (!input || input.dataset.cjkHook) return !!input.dataset.cjkHook;
    input.dataset.cjkHook = "1";

    var timer;
    input.addEventListener("input", function () {
      var q = input.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!isCjkQuery(q)) {
          renderExtra(modal, q, []);
          return;
        }
        loadIndex().then(function (index) {
          renderExtra(modal, q, substringHits(q, index));
        });
      }, 220);
    });
    return true;
  }

  function tryHook() {
    var modal = document.querySelector("pagefind-modal");
    if (!modal) return;
    hookModalInput(modal);
  }

  var searchLink = document.getElementById("blog-nav-search");
  if (searchLink) {
    searchLink.addEventListener("click", function () {
      [80, 300, 800].forEach(function (ms) {
        setTimeout(tryHook, ms);
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      [80, 300, 800].forEach(function (ms) {
        setTimeout(tryHook, ms);
      });
    }
  });
})();
