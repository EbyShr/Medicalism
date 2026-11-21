/**
 * MEDICALISM ALBORZ — EXPERIMENTAL DIRECT BRUSH HIGHLIGHTER
 * Lazy-loaded only when Brush Mode (حالت ماژیک مستقیم) is enabled on study pages.
 * Suppresses native OS/browser selection popups cleanly while supporting:
 *  - Mouse & Stylus drag highlighting via caretRangeFromPoint / caretPositionFromPoint
 *  - Touch tap sentence highlighting (< 10px, < 350ms) preserving native vertical scroll
 *  - Tap/click or Eraser sweep removal synced to medicalism_highlights_v1
 */
(function () {
  'use strict';

  var TOOL_KEY = 'med_brush_active_tool';
  var VALID_TOOLS = { yellow: 'زرد', green: 'سبز', pink: 'صورتی', blue: 'آبی', eraser: 'پاک‌کن' };
  var COLOR_ITEMS = [
    { id: 'yellow', emoji: '🟡', label: 'زرد' },
    { id: 'green', emoji: '🟢', label: 'سبز' },
    { id: 'pink', emoji: '🩷', label: 'صورتی' },
    { id: 'blue', emoji: '🔵', label: 'آبی' }
  ];

  var READING_SELECTOR = '#chapterContentArea, #main-content, .chapter-content';
  var BLOCK_SELECTOR = 'p, li, td, th, dd, dt, blockquote, .v2-callout-body, .v2-callout-text, .v2-osce-scenario, .v2-tl-summary, .v2-stat-note, .callout-content, .card-content, h2, h3, h4';
  var SKIP_SELECTOR = 'a, button, input, select, textarea, label, summary, .v2-tl-node, .v2-score-cell-btn, .v2-order-item, .v2-nav-card, .btn-bookmark, .btn-toggle-chapter-completed, #v2CompleteChapterBtn, #highlightPopover, #v2BrushPalette, .v2-quick-dock, .v2-settings-dialog, .v2-btn-outline';

  var isActive = false;
  var listenersBound = false;
  var activeTool = loadSavedTool();
  var drag = null;
  var dragErase = false;
  var touchTap = null;

  function loadSavedTool() {
    try {
      var v = localStorage.getItem(TOOL_KEY);
      return VALID_TOOLS[v] ? v : 'yellow';
    } catch (e) {
      return 'yellow';
    }
  }

  function saveTool(t) {
    try { localStorage.setItem(TOOL_KEY, t); } catch (e) {}
  }

  function getReadingContainer() {
    return document.querySelector(READING_SELECTOR);
  }

  function getAdapter() {
    if (window.CourseEngineV2 && typeof window.CourseEngineV2.createHighlightFromRange === 'function') {
      return window.CourseEngineV2;
    }
    if (window.StudyFeatures && typeof window.StudyFeatures.createHighlightFromRange === 'function') {
      return window.StudyFeatures;
    }
    return null;
  }

  function announce(msg) {
    var el = document.getElementById('v2BrushLiveStatus');
    if (el) el.textContent = msg;
  }

  /* ========================================================================
   * 1. FLOATING PALETTE STYLES & ACCESSIBLE TOOLBAR DOM
   * ======================================================================== */
  function injectStyles() {
    if (document.getElementById('v2BrushPaletteStyles') || !document.head) return;
    var st = document.createElement('style');
    st.id = 'v2BrushPaletteStyles';
    st.textContent =
      '#v2BrushPreviewLayer{position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;}' +
      '.v2-brush-preview-rect{position:fixed;border-radius:4px;pointer-events:none;opacity:.52;}' +
      '.v2-brush-preview-rect[data-color="yellow"]{background:#fef08a;}' +
      '.v2-brush-preview-rect[data-color="green"]{background:#bbf7d0;}' +
      '.v2-brush-preview-rect[data-color="pink"]{background:#fbcfe8;}' +
      '.v2-brush-preview-rect[data-color="blue"]{background:#bae6fd;}' +
      '#v2BrushPalette{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10003;max-width:calc(100vw - 16px);display:none;flex-direction:column;align-items:center;gap:6px;padding:8px 12px;border-radius:20px;background:var(--bg-surface-elevated,rgba(255,255,255,.96));border:1px solid var(--border-default,rgba(15,23,42,.16));box-shadow:var(--shadow-lg,0 12px 30px rgba(0,0,0,.22));backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);direction:rtl;font-family:var(--font-current,inherit);user-select:none;-webkit-user-select:none;}' +
      '[data-theme="dark"] #v2BrushPalette{background:rgba(19,28,49,.94);border-color:rgba(148,163,184,.24);box-shadow:0 16px 36px rgba(2,6,23,.72);}' +
      '#v2BrushPalette.is-open{display:flex;}' +
      '.v2-brush-caption{font-size:11px;font-weight:700;color:var(--text-muted);text-align:center;line-height:1.4;max-width:100%;}' +
      '.v2-brush-row{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;}' +
      '.v2-brush-group{display:inline-flex;align-items:center;flex-wrap:wrap;gap:5px;}' +
      '.v2-brush-sep{display:inline-block;width:0;height:22px;border-inline-start:1px solid var(--border-default,rgba(15,23,42,.2));margin-inline:2px;}' +
      '.v2-brush-btn{min-inline-size:32px;min-block-size:32px;padding:5px 10px;border-radius:9999px;border:1px solid var(--border-subtle,rgba(15,23,42,.14));background:var(--bg-surface-secondary,rgba(248,250,252,.9));color:var(--text-primary);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px;line-height:1;}' +
      '.v2-brush-btn[aria-pressed="true"]{background:var(--accent-primary-subtle,rgba(13,148,136,.16));color:var(--accent-primary,#0d9488);border-color:var(--accent-primary,#0d9488);box-shadow:0 0 0 2px var(--accent-primary,#0d9488);font-weight:800;}' +
      '.v2-brush-btn:focus-visible{outline:3px solid var(--accent-primary,#0d9488);outline-offset:2px;}' +
      '.v2-brush-exit{background:var(--state-danger-bg,rgba(220,38,38,.1));color:var(--state-danger,#dc2626);border-color:var(--state-danger-border,rgba(220,38,38,.28));font-weight:800;}' +
      '@media (pointer:coarse){.v2-brush-btn{min-inline-size:38px;min-block-size:38px;padding:6px 11px;font-size:12.5px;}}' +
      '@media (hover:hover){.v2-brush-btn:hover{border-color:var(--accent-primary,#0d9488);transform:translateY(-1px);}}' +
      '@media (prefers-reduced-motion:no-preference){@keyframes v2BrushIn{from{opacity:0;transform:translate(-50%,16px);}to{opacity:1;transform:translate(-50%,0);}}#v2BrushPalette.is-open{animation:v2BrushIn 180ms cubic-bezier(.16,1,.3,1);}.v2-brush-btn{transition:transform 130ms ease,background-color 130ms ease,border-color 130ms ease,box-shadow 130ms ease;}}' +
      '@media (forced-colors:active){.v2-brush-btn[aria-pressed="true"]{outline:2px solid Highlight;background:Highlight;color:HighlightText;}.v2-brush-sep{border-inline-start-color:ButtonText;}}' +
      '#v2BrushLiveStatus{position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}';
    document.head.appendChild(st);
  }

  function ensurePaletteDom() {
    injectStyles();
    if (!document.getElementById('v2BrushPreviewLayer') && document.body) {
      var prev = document.createElement('div');
      prev.id = 'v2BrushPreviewLayer';
      prev.setAttribute('aria-hidden', 'true');
      document.body.appendChild(prev);
    }
    if (!document.getElementById('v2BrushLiveStatus') && document.body) {
      var live = document.createElement('div');
      live.id = 'v2BrushLiveStatus';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    var pal = document.getElementById('v2BrushPalette');
    if (pal) return pal;

    pal = document.createElement('div');
    pal.id = 'v2BrushPalette';
    pal.setAttribute('role', 'toolbar');
    pal.setAttribute('focusgroup', 'toolbar wrap');
    pal.setAttribute('aria-label', 'پالت ماژیک هایلایت مستقیم');
    var targetEl = getReadingContainer();
    if (targetEl && targetEl.id) pal.setAttribute('aria-controls', targetEl.id);

    var colorBtns = COLOR_ITEMS.map(function (c) {
      return '<button type="button" class="v2-brush-btn" data-brush-tool="' + c.id + '" aria-pressed="' + (activeTool === c.id ? 'true' : 'false') + '" aria-label="ماژیک ' + c.label + '" title="ماژیک ' + c.label + '">' +
        '<span aria-hidden="true">' + c.emoji + '</span><span>' + c.label + '</span></button>';
    }).join('');

    pal.innerHTML =
      '<div class="v2-brush-caption">کشیدن ماوس/قلم یا لمس هر جمله برای هایلایت</div>' +
      '<div class="v2-brush-row">' +
        '<div class="v2-brush-group" role="group" aria-label="رنگ ماژیک">' + colorBtns + '</div>' +
        '<span class="v2-brush-sep" role="separator" aria-orientation="vertical"></span>' +
        '<button type="button" class="v2-brush-btn" data-brush-tool="eraser" aria-pressed="' + (activeTool === 'eraser' ? 'true' : 'false') + '" aria-label="پاککن هایلایت" title="حذف هایلایت با لمس یا کشیدن">' +
          '<span aria-hidden="true">🧹</span><span>پاککن</span></button>' +
        '<span class="v2-brush-sep" role="separator" aria-orientation="vertical"></span>' +
        '<button type="button" class="v2-brush-btn v2-brush-exit" id="v2BrushExitBtn" aria-label="خروج از حالت ماژیک مستقیم" title="خروج و بازگشت به انتخاب عادی متن">✕</button>' +
      '</div>';

    document.body.appendChild(pal);

    pal.querySelectorAll('[data-brush-tool]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTool(btn.getAttribute('data-brush-tool'));
      });
    });

    var exitBtn = pal.querySelector('#v2BrushExitBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', function () {
        if (window.MedicalismShell && typeof window.MedicalismShell.setBrushMode === 'function') {
          window.MedicalismShell.setBrushMode(false);
        } else {
          deactivate();
        }
      });
    }

    // Roving tabindex fallback only when native focusgroup is unsupported
    if (!('focusGroup' in HTMLElement.prototype)) {
      var items = Array.prototype.slice.call(pal.querySelectorAll('button'));
      items.forEach(function (b, i) { b.tabIndex = i === 0 ? 0 : -1; });
      pal.addEventListener('focusin', function (e) {
        if (items.indexOf(e.target) !== -1) {
          items.forEach(function (b) { b.tabIndex = b === e.target ? 0 : -1; });
        }
      });
      pal.addEventListener('keydown', function (e) {
        var idx = items.indexOf(document.activeElement);
        if (idx === -1) return;
        var rtl = getComputedStyle(pal).direction === 'rtl';
        var step = 0;
        if (e.key === 'ArrowRight') step = rtl ? -1 : 1;
        else if (e.key === 'ArrowLeft') step = rtl ? 1 : -1;
        else if (e.key === 'Home') step = -idx;
        else if (e.key === 'End') step = (items.length - 1) - idx;
        else return;
        e.preventDefault();
        var nextIdx = (idx + step + items.length) % items.length;
        items[nextIdx].focus();
      });
    }

    syncToolUi();
    return pal;
  }

  function syncToolUi() {
    if (document.body) {
      if (isActive) document.body.dataset.brushTool = activeTool;
      else delete document.body.dataset.brushTool;
    }
    var pal = document.getElementById('v2BrushPalette');
    if (!pal) return;
    pal.querySelectorAll('[data-brush-tool]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-brush-tool') === activeTool ? 'true' : 'false');
    });
  }

  function setTool(tool) {
    if (!VALID_TOOLS[tool]) return activeTool;
    activeTool = tool;
    saveTool(tool);
    syncToolUi();
    announce('ابزار فعال: ' + VALID_TOOLS[tool]);
    return activeTool;
  }

  /* ========================================================================
   * 2. CARET RESOLUTION, WORD / SENTENCE BOUNDARIES & LIVE PREVIEW
   * ======================================================================== */
  function clearPreview() {
    var layer = document.getElementById('v2BrushPreviewLayer');
    if (layer) layer.innerHTML = '';
  }

  function renderPreview(range, color) {
    var layer = document.getElementById('v2BrushPreviewLayer');
    if (!layer) return;
    layer.innerHTML = '';
    if (!range || range.collapsed) return;
    var rects = range.getClientRects();
    var frag = document.createDocumentFragment();
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (r.width < 1 || r.height < 1) continue;
      var box = document.createElement('div');
      box.className = 'v2-brush-preview-rect';
      box.setAttribute('data-color', color || 'yellow');
      box.style.left = r.left + 'px';
      box.style.top = r.top + 'px';
      box.style.width = r.width + 'px';
      box.style.height = r.height + 'px';
      frag.appendChild(box);
    }
    layer.appendChild(frag);
  }

  function resolveTextNodeAtPoint(el, x, y) {
    if (!el) return null;
    if (el.nodeType === 3) return { node: el, offset: 0 };
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var best = null, bestDist = Infinity, tn;
    while ((tn = walker.nextNode())) {
      if (!tn.nodeValue || !tn.nodeValue.trim()) continue;
      var r = document.createRange();
      r.selectNodeContents(tn);
      var rect = r.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      var dx = x < rect.left ? rect.left - x : (x > rect.right ? x - rect.right : 0);
      var dy = y < rect.top ? rect.top - y : (y > rect.bottom ? y - rect.bottom : 0);
      var d = dx + dy * 3;
      if (d < bestDist) {
        bestDist = d;
        best = tn;
      }
    }
    return best ? { node: best, offset: 0 } : null;
  }

  function getCaretPoint(x, y) {
    var node = null, offset = 0;
    if (typeof document.caretRangeFromPoint === 'function') {
      var range = document.caretRangeFromPoint(x, y);
      if (range) {
        node = range.startContainer;
        offset = range.startOffset;
      }
    } else if (typeof document.caretPositionFromPoint === 'function') {
      var pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        node = pos.offsetNode;
        offset = pos.offset;
      }
    }
    if (!node) return null;
    if (node.nodeType === 3) return { node: node, offset: offset };
    return resolveTextNodeAtPoint(node, x, y);
  }

  function resolveReadableBlock(node, container) {
    var el = node && node.nodeType === 1 ? node : (node ? node.parentElement : null);
    if (!el || !container || !container.contains(el)) return null;
    var blk = el.closest(BLOCK_SELECTOR);
    if (blk && container.contains(blk)) return blk;
    return container;
  }

  function collectTextSegments(root) {
    var segments = [];
    var total = 0;
    var parts = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && n.parentElement.closest('script, style')) continue;
      var txt = n.nodeValue || '';
      if (!txt.length) continue;
      segments.push({ node: n, start: total, end: total + txt.length, text: txt });
      parts.push(txt);
      total += txt.length;
    }
    return { segments: segments, fullText: parts.join('') };
  }

  function domPointToFlatOffset(segments, node, offset) {
    for (var i = 0; i < segments.length; i++) {
      if (segments[i].node === node) {
        return segments[i].start + Math.max(0, Math.min(offset, segments[i].text.length));
      }
    }
    return -1;
  }

  function flatRangeToDomRange(segments, startOff, endOff) {
    if (!segments.length || startOff >= endOff) return null;
    var sNode = null, sOff = 0, eNode = null, eOff = 0;
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      if (!sNode && seg.end > startOff) {
        sNode = seg.node;
        sOff = Math.max(0, startOff - seg.start);
      }
      if (sNode && seg.end >= endOff) {
        eNode = seg.node;
        eOff = Math.max(0, endOff - seg.start);
        break;
      }
    }
    if (!sNode || !eNode) return null;
    var r = document.createRange();
    r.setStart(sNode, sOff);
    r.setEnd(eNode, eOff);
    return r;
  }

  function isWordChar(ch) {
    if (!ch) return false;
    if (ch === '\u200C') return true; // Keep Persian ZWNJ inside compound words
    return !/[\s\u200B\uFEFF.,،؛:؟!?\(\)\[\]{}«»"'\u2018-\u201F\/\\|<>+*~=`]/u.test(ch);
  }

  function expandToWordBounds(text, a, b) {
    var lo = Math.max(0, Math.min(a, b));
    var hi = Math.min(text.length, Math.max(a, b));
    while (lo < hi && /\s/.test(text[lo])) lo++;
    while (hi > lo && /\s/.test(text[hi - 1])) hi--;
    if (lo === hi) {
      if (lo < text.length && isWordChar(text[lo])) hi = lo + 1;
      else if (lo > 0 && isWordChar(text[lo - 1])) lo--;
      else return [0, 0];
    }
    while (lo > 0 && isWordChar(text[lo - 1])) lo--;
    while (hi < text.length && isWordChar(text[hi])) hi++;
    while (lo < hi && text[lo] === '\u200C') lo++;
    while (hi > lo && text[hi - 1] === '\u200C') hi--;
    return [lo, hi];
  }

  function isSentenceDelimiter(text, idx) {
    var ch = text[idx];
    if (ch === '\n' || ch === '\r' || ch === '؛' || ch === '؟' || ch === '!' || ch === '?' || ch === ':') {
      // Preserve time/ratio digits like 1:100 or 12:30
      if (ch === ':' && idx > 0 && idx + 1 < text.length && /[0-9۰-۹]/.test(text[idx - 1]) && /[0-9۰-۹]/.test(text[idx + 1])) {
        return false;
      }
      return true;
    }
    if (ch === '.') {
      // Preserve decimal numbers such as 0.4 or 33.6
      if (idx > 0 && idx + 1 < text.length && /[0-9۰-۹]/.test(text[idx - 1]) && /[0-9۰-۹]/.test(text[idx + 1])) {
        return false;
      }
      return true;
    }
    return false;
  }

  function expandToSentenceBounds(text, pointOff) {
    if (!text || !text.trim()) return [0, 0];
    var seed = Math.max(0, Math.min(pointOff, text.length - 1));
    if (/\s/.test(text[seed]) || isSentenceDelimiter(text, seed)) {
      var found = -1;
      for (var d = 1; d <= 4; d++) {
        if (seed - d >= 0 && !/\s/.test(text[seed - d]) && !isSentenceDelimiter(text, seed - d)) { found = seed - d; break; }
        if (seed + d < text.length && !/\s/.test(text[seed + d]) && !isSentenceDelimiter(text, seed + d)) { found = seed + d; break; }
      }
      if (found === -1) return [0, 0];
      seed = found;
    }
    var lo = seed;
    while (lo > 0 && !isSentenceDelimiter(text, lo - 1)) lo--;
    var hi = seed + 1;
    while (hi < text.length && !isSentenceDelimiter(text, hi)) hi++;
    while (lo < hi && /[\s\u200B\uFEFF]/.test(text[lo])) lo++;
    while (hi > lo && /[\s\u200B\uFEFF]/.test(text[hi - 1])) hi--;
    return [lo, hi];
  }

  function commitFlatRange(block, startOff, endOff, color) {
    var adapter = getAdapter();
    if (!adapter || !block || startOff >= endOff) return null;
    var collected = collectTextSegments(block);
    var domRange = flatRangeToDomRange(collected.segments, startOff, endOff);
    if (!domRange) return null;

    var marks = block.querySelectorAll('mark.user-highlight');
    var overlapping = [];
    for (var i = 0; i < marks.length; i++) {
      try {
        if (domRange.intersectsNode(marks[i])) overlapping.push(marks[i]);
      } catch (e) {}
    }
    for (var j = 0; j < overlapping.length; j++) {
      adapter.deleteHighlightMark(overlapping[j], { silent: true });
    }
    if (overlapping.length) {
      collected = collectTextSegments(block);
      domRange = flatRangeToDomRange(collected.segments, startOff, endOff);
      if (!domRange) return null;
    }

    var created = adapter.createHighlightFromRange(domRange, color, { silent: true });
    if (created) {
      try { if (window.getSelection) window.getSelection().removeAllRanges(); } catch (e) {}
      announce('هایلایت با رنگ ' + (VALID_TOOLS[color] || color) + ' ذخیره شد');
    }
    return created;
  }

  function removeMark(mark) {
    var adapter = getAdapter();
    if (!adapter || !mark) return false;
    var ok = adapter.deleteHighlightMark(mark, { silent: true });
    if (ok) announce('هایلایت حذف شد');
    return ok;
  }

  /* ========================================================================
   * 3. DELEGATED POINTER / TOUCH / CONTEXTMENU HANDLERS
   * ======================================================================== */
  function isSkippedTarget(target, container) {
    if (!target || !container || !container.contains(target)) return true;
    var el = target.nodeType === 1 ? target : target.parentElement;
    if (!el) return true;
    return Boolean(el.closest(SKIP_SELECTOR));
  }

  function onPointerDown(e) {
    if (!isActive) return;
    var container = getReadingContainer();
    if (!container || isSkippedTarget(e.target, container)) return;

    if (e.pointerType === 'touch') {
      // Do NOT preventDefault on touch so native vertical scroll remains smooth
      touchTap = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        moved: false,
        target: e.target
      };
      return;
    }

    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    var el = e.target.nodeType === 1 ? e.target : e.target.parentElement;
    var hitMark = el ? el.closest('mark.user-highlight') : null;

    if (activeTool === 'eraser') {
      dragErase = true;
      drag = { pointerId: e.pointerId };
      if (hitMark && container.contains(hitMark)) removeMark(hitMark);
      return;
    }

    var pt = getCaretPoint(e.clientX, e.clientY);
    if (!pt) return;
    var block = resolveReadableBlock(pt.node, container);
    if (!block) return;

    var collected = collectTextSegments(block);
    var startOff = domPointToFlatOffset(collected.segments, pt.node, pt.offset);
    if (startOff === -1) return;

    drag = {
      pointerId: e.pointerId,
      block: block,
      segments: collected.segments,
      fullText: collected.fullText,
      startOff: startOff,
      curOff: startOff,
      downX: e.clientX,
      downY: e.clientY,
      startMark: hitMark
    };
  }

  function onPointerMove(e) {
    if (!isActive) return;
    if (touchTap && e.pointerType === 'touch' && e.pointerId === touchTap.pointerId) {
      if (Math.abs(e.clientX - touchTap.startX) >= 10 || Math.abs(e.clientY - touchTap.startY) >= 10) {
        touchTap.moved = true;
      }
      return;
    }

    if (!drag || e.pointerId !== drag.pointerId) return;
    if (dragErase) {
      var container = getReadingContainer();
      var under = document.elementFromPoint(e.clientX, e.clientY);
      var m = under && under.closest ? under.closest('mark.user-highlight') : null;
      if (m && container && container.contains(m)) removeMark(m);
      return;
    }

    var pt = getCaretPoint(e.clientX, e.clientY);
    if (!pt || !drag.block.contains(pt.node)) return;
    var off = domPointToFlatOffset(drag.segments, pt.node, pt.offset);
    if (off === -1) return;
    drag.curOff = off;

    var bounds = expandToWordBounds(drag.fullText, drag.startOff, drag.curOff);
    if (bounds[1] > bounds[0]) {
      renderPreview(flatRangeToDomRange(drag.segments, bounds[0], bounds[1]), activeTool);
    } else {
      clearPreview();
    }
  }

  function onPointerUp(e) {
    if (!isActive) return;

    if (touchTap && e.pointerType === 'touch' && e.pointerId === touchTap.pointerId) {
      var tap = touchTap;
      touchTap = null;
      var dist = Math.hypot(e.clientX - tap.startX, e.clientY - tap.startY);
      var dur = Date.now() - tap.startTime;
      if (tap.moved || dist >= 10 || dur >= 350) return;

      var container = getReadingContainer();
      var elAt = document.elementFromPoint(e.clientX, e.clientY) || tap.target;
      if (!container || isSkippedTarget(elAt, container)) return;

      var el = elAt.nodeType === 1 ? elAt : elAt.parentElement;
      var existingMark = el ? el.closest('mark.user-highlight') : null;
      if (existingMark && container.contains(existingMark)) {
        removeMark(existingMark);
        return;
      }
      if (activeTool === 'eraser') return;

      var pt = getCaretPoint(e.clientX, e.clientY);
      if (!pt) return;
      var block = resolveReadableBlock(pt.node, container);
      if (!block) return;

      var collected = collectTextSegments(block);
      var off = domPointToFlatOffset(collected.segments, pt.node, pt.offset);
      if (off === -1) return;

      var sent = expandToSentenceBounds(collected.fullText, off);
      if (sent[1] - sent[0] >= 2) {
        commitFlatRange(block, sent[0], sent[1], activeTool);
      }
      return;
    }

    if (!drag || e.pointerId !== drag.pointerId) return;
    var d = drag;
    var wasErase = dragErase;
    drag = null;
    dragErase = false;
    clearPreview();
    if (wasErase) return;

    var adapter = getAdapter();
    var moveDist = Math.hypot(e.clientX - d.downX, e.clientY - d.downY);
    if (moveDist < 6 && d.startMark) {
      var curCol = d.startMark.getAttribute('data-color');
      if (curCol === activeTool) removeMark(d.startMark);
      else if (adapter && adapter.recolorHighlightMark) {
        adapter.recolorHighlightMark(d.startMark, activeTool, { silent: true });
        announce('رنگ هایلایت به ' + VALID_TOOLS[activeTool] + ' تغییر یافت');
      }
      return;
    }

    if (moveDist < 4) return;
    var bounds = expandToWordBounds(d.fullText, d.startOff, d.curOff);
    if (bounds[1] - bounds[0] >= 1) {
      commitFlatRange(d.block, bounds[0], bounds[1], activeTool);
    }
  }

  function onPointerCancel() {
    drag = null;
    dragErase = false;
    touchTap = null;
    clearPreview();
  }

  function onContextMenu(e) {
    if (!isActive) return;
    var container = getReadingContainer();
    if (container && container.contains(e.target)) {
      e.preventDefault();
    }
  }

  function onKeyDown(e) {
    if (!isActive || e.key !== 'Escape') return;
    if (document.querySelector('dialog[open], .v2-modal-backdrop.is-active, .modal-backdrop.is-active')) return;
    if (window.MedicalismShell && typeof window.MedicalismShell.setBrushMode === 'function') {
      window.MedicalismShell.setBrushMode(false);
    } else {
      deactivate();
    }
  }

  function bindGlobalListeners() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerCancel, true);
    document.addEventListener('contextmenu', onContextMenu, true);
    document.addEventListener('keydown', onKeyDown);
  }

  function activate() {
    isActive = true;
    bindGlobalListeners();
    var pal = ensurePaletteDom();
    pal.classList.add('is-open');
    syncToolUi();
    try { if (window.getSelection) window.getSelection().removeAllRanges(); } catch (e) {}
    var adapter = getAdapter();
    if (adapter && adapter.hideHighlightPopover) adapter.hideHighlightPopover();
    announce('حالت ماژیک مستقیم فعال شد');
  }

  function deactivate() {
    isActive = false;
    drag = null;
    dragErase = false;
    touchTap = null;
    clearPreview();
    var pal = document.getElementById('v2BrushPalette');
    if (pal) pal.classList.remove('is-open');
    syncToolUi();
    announce('حالت ماژیک مستقیم غیرفعال شد');
  }

  window.MedicalismBrushEngine = {
    activate: activate,
    deactivate: deactivate,
    setTool: setTool,
    getTool: function () { return activeTool; },
    isActive: function () { return isActive; }
  };
})();
