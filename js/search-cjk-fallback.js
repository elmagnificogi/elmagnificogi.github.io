/**
 * Substring fallback for Chinese queries when Pagefind splits terms (e.g. 限宽墩 -> 限+宽+墩).
 * Requires /search-index.json (built by _plugins/search_index_generator.rb on jekyll build).
 */
(function () {
  var INDEX_URL = "/search-index.json";
  var indexPromise = null;
  var styleInjected = false;

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(INDEX_URL, { cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("search-index.json missing (HTTP " + r.status + ")");
          return r.json();
        })
        .then(function (data) {
          if (!Array.isArray(data) || !data.length) {
            console.warn("[search-cjk] search-index.json is empty — rebuild site (jekyll build)");
          }
          return data;
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

  function injectShadowStyles(root) {
    if (!root || styleInjected) return;
    var link = document.querySelector('link[href*="search-cjk-fallback.css"]');
    if (!link) return;
    var style = document.createElement("style");
    style.textContent =
      ".pf-cjk-extra{margin:0 0 1rem;padding:.75rem 1rem;border-radius:8px;background:#e8f6f9;border:1px solid #b8dde6}" +
      ".pf-cjk-extra-label{margin:0 0 .5rem;font-size:.85rem;color:#006d85;font-weight:600}" +
      ".pf-cjk-extra-list{margin:0;padding:0;list-style:none}" +
      ".pf-cjk-extra-link{display:block;padding:.5rem 0;color:#404040;text-decoration:none;border-top:1px solid #d0e8ee}" +
      ".pf-cjk-extra-link:first-child{border-top:none}" +
      ".pf-cjk-extra-link:hover{color:#0085a1}" +
      ".pf-cjk-extra-link strong{display:block;font-size:1rem;margin-bottom:.2rem}" +
      ".pf-cjk-extra-link span{display:block;font-size:.85rem;color:#666;line-height:1.4}";
    root.appendChild(style);
    styleInjected = true;
  }

  function findModalParts(modal) {
    var root = modal.shadowRoot || modal;
    injectShadowStyles(modal.shadowRoot);
    var body =
      root.querySelector("pagefind-modal-body") ||
      root.querySelector(".pf-modal-body") ||
      root.querySelector('[class*="modal-body"]') ||
      root.querySelector('[class*="results"]') ||
      root;
    var input =
      root.querySelector('input[type="search"]') ||
      root.querySelector("input.pf-input") ||
      root.querySelector('input[placeholder*="搜"]') ||
      root.querySelector("input");
    return { root: root, body: body, input: input };
  }

  function ensureExtraContainer(modal) {
    var parts = findModalParts(modal);
    if (!parts.body) return null;
    var extra = parts.root.querySelector(".pf-cjk-extra");
    if (!extra) {
      extra = document.createElement("div");
      extra.className = "pf-cjk-extra";
      extra.setAttribute("data-cjk-fallback", "true");
      parts.body.insertBefore(extra, parts.body.firstChild);
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
      "）</p><ul class=\"pf-cjk-extra-list\">";
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
    var parts = findModalParts(modal);
    if (!parts.input || parts.input.dataset.cjkHook) return !!parts.input && !!parts.input.dataset.cjkHook;
    parts.input.dataset.cjkHook = "1";

    var timer;
    parts.input.addEventListener("input", function () {
      var q = parts.input.value.trim();
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
    if (!modal) return false;
    return hookModalInput(modal);
  }

  function scheduleHook() {
    [50, 150, 400, 900, 1500].forEach(function (ms) {
      setTimeout(tryHook, ms);
    });
  }

  var searchLink = document.getElementById("blog-nav-search");
  if (searchLink) {
    searchLink.addEventListener("click", scheduleHook);
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      scheduleHook();
    }
  });

  var modal = document.querySelector("pagefind-modal");
  if (modal && typeof MutationObserver !== "undefined") {
    var obs = new MutationObserver(function () {
      if (modal.hasAttribute("open") || modal.classList.contains("open")) {
        scheduleHook();
      }
    });
    obs.observe(modal, { attributes: true, attributeFilter: ["open", "class"] });
  }

  loadIndex();
})();
