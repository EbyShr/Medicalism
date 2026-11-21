/**
 * MEDICALISM ALBORZ — GOODNOTES INK & HANDWRITTEN NOTES LABS (ISOLATED MODULE)
 * Self-contained opt-in vector handwriting & dotted sketchpad system.
 * Storage strictly isolated to `medicalism_ink_labs_v1` (never touches `medicalism_highlights_v1`).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'medicalism_ink_labs_v1';
  var PALM_KEY = 'med_ink_palm_rejection';
  var READING_SELECTOR = '#chapterContentArea, #main-content, .chapter-content';
  var SECTION_SELECTOR = '.v2-section, .section-card';
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var COLORS = [
    { id: 'auto', label: 'خودکار (تیره/روشن)' },
    { id: 'blue', label: 'آبی رویال' },
    { id: 'red', label: 'قرمز زرشکی' },
    { id: 'green', label: 'سبز زمردی' },
    { id: 'amber', label: 'زرد هایلایتر' }
  ];
  var WIDTHS = [
    { val: 2, label: 'نازک' },
    { val: 4, label: 'متوسط' },
    { val: 7, label: 'ضخیم' }
  ];

  var enabled = false;
  var mode = 'pen'; // 'scroll' | 'pen' | 'highlighter' | 'eraser'
  var color = 'auto';
  var width = 4;
  var hidden = false;
  var palmRejection = loadPalmPref();

  var store = loadStore();
  var undoStack = [];
  var redoStack = [];
  var observers = [];
  var activeDraw = null;
  var activeErase = null;
  var globalListenersBound = false;

  function loadPalmPref() {
    try { return localStorage.getItem(PALM_KEY) !== 'false'; } catch (e) { return true; }
  }

  function savePalmPref(val) {
    try { localStorage.setItem(PALM_KEY, val ? 'true' : 'false'); } catch (e) {}
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { schemaVersion: '1.0', chapters: {} };
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.chapters && typeof parsed.chapters === 'object') {
        return { schemaVersion: '1.0', chapters: parsed.chapters };
      }
    } catch (e) {}
    return { schemaVersion: '1.0', chapters: {} };
  }

  function pruneAndSaveStore() {
    var chMap = store.chapters || {};
    Object.keys(chMap).forEach(function (cid) {
      var ch = chMap[cid];
      if (!ch || typeof ch !== 'object') { delete chMap[cid]; return; }
      var ov = ch.overlays || {};
      Object.keys(ov).forEach(function (sid) {
        if (!ov[sid] || !Array.isArray(ov[sid].strokes) || ov[sid].strokes.length === 0) delete ov[sid];
      });
      var sp = ch.sketchpads || {};
      Object.keys(sp).forEach(function (sid) {
        if (!Array.isArray(sp[sid]) || sp[sid].length === 0) delete sp[sid];
      });
      if (Object.keys(ov).length === 0 && Object.keys(sp).length === 0) delete chMap[cid];
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: '1.0', chapters: chMap }));
    } catch (e) {
      console.warn('Ink Labs save error:', e);
    }
  }

  function ensureChapterEntry(chId) {
    if (!store.chapters[chId]) store.chapters[chId] = { overlays: {}, sketchpads: {} };
    if (!store.chapters[chId].overlays) store.chapters[chId].overlays = {};
    if (!store.chapters[chId].sketchpads) store.chapters[chId].sketchpads = {};
    return store.chapters[chId];
  }

  function getStrokeList(target) {
    var ch = store.chapters[target.chId];
    if (!ch) return null;
    if (target.kind === 'overlay') {
      var ov = ch.overlays && ch.overlays[target.secId];
      return ov && Array.isArray(ov.strokes) ? ov.strokes : null;
    }
    var pads = ch.sketchpads && ch.sketchpads[target.secId];
    if (!Array.isArray(pads)) return null;
    var pad = pads.find(function (p) { return p && p.id === target.padId; });
    return pad && Array.isArray(pad.strokes) ? pad.strokes : null;
  }

  function getOrCreateStrokeList(target, defaultVh) {
    var ch = ensureChapterEntry(target.chId);
    if (target.kind === 'overlay') {
      if (!ch.overlays[target.secId]) {
        ch.overlays[target.secId] = { vw: 1000, vh: defaultVh || 500, strokes: [] };
      }
      if (!Array.isArray(ch.overlays[target.secId].strokes)) ch.overlays[target.secId].strokes = [];
      return ch.overlays[target.secId].strokes;
    }
    var pads = ch.sketchpads[target.secId] || [];
    var pad = pads.find(function (p) { return p && p.id === target.padId; });
    if (!pad) return null;
    if (!Array.isArray(pad.strokes)) pad.strokes = [];
    return pad.strokes;
  }

  function announce(msg) {
    var el = document.getElementById('v2InkLiveStatus');
    if (el) el.textContent = msg;
  }

  function rnd1(n) {
    return Math.round(n * 10) / 10;
  }

  /* ========================================================================
   * 1. QUADRATIC BEZIER VECTOR SMOOTHING & GEOMETRIC ERASER HIT TEST
   * ======================================================================== */
  function buildQuadraticPath(pts) {
    if (!pts || pts.length === 0) return '';
    if (pts.length === 1) {
      var x = rnd1(pts[0][0]), y = rnd1(pts[0][1]);
      return 'M ' + x + ' ' + y + ' L ' + rnd1(x + 0.2) + ' ' + y;
    }
    if (pts.length === 2) {
      return 'M ' + rnd1(pts[0][0]) + ' ' + rnd1(pts[0][1]) + ' L ' + rnd1(pts[1][0]) + ' ' + rnd1(pts[1][1]);
    }
    var parts = ['M ' + rnd1(pts[0][0]) + ' ' + rnd1(pts[0][1])];
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = rnd1((pts[i][0] + pts[i + 1][0]) / 2);
      var my = rnd1((pts[i][1] + pts[i + 1][1]) / 2);
      parts.push('Q ' + rnd1(pts[i][0]) + ' ' + rnd1(pts[i][1]) + ' ' + mx + ' ' + my);
    }
    var last = pts[pts.length - 1];
    parts.push('L ' + rnd1(last[0]) + ' ' + rnd1(last[1]));
    return parts.join(' ');
  }

  function pointToSegDistSq(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    var lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return (px - ax) * (px - ax) + (py - ay) * (py - ay);
    var t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    var cx = ax + t * dx, cy = ay + t * dy;
    return (px - cx) * (px - cx) + (py - cy) * (py - cy);
  }

  function hitTestStroke(stroke, x, y, extraTol) {
    var pts = stroke && stroke.points;
    if (!Array.isArray(pts) || pts.length === 0) return false;
    var tol = Math.max(16, (stroke.width || 4) + (extraTol || 14));
    var tolSq = tol * tol;
    if (pts.length === 1) {
      var dx = x - pts[0][0], dy = y - pts[0][1];
      return (dx * dx + dy * dy) <= tolSq;
    }
    for (var i = 0; i < pts.length - 1; i++) {
      if (pointToSegDistSq(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) <= tolSq) {
        return true;
      }
    }
    return false;
  }

  function toSvgPoint(svg, clientX, clientY) {
    var rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    var vh = parseFloat(svg.getAttribute('data-vh')) || 420;
    var x = rnd1(((clientX - rect.left) / rect.width) * 1000);
    var y = rnd1(((clientY - rect.top) / rect.height) * vh);
    var pxScale = 1000 / Math.max(1, rect.width);
    return { x: x, y: y, minStepSq: Math.pow(2 * pxScale, 2) };
  }

  function createPathEl(stroke) {
    var p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', 'ink-stroke');
    p.setAttribute('data-stroke-id', stroke.id);
    p.setAttribute('data-ink-color', stroke.color || 'auto');
    p.setAttribute('d', stroke.d || buildQuadraticPath(stroke.points));
    p.setAttribute('stroke-width', String(stroke.width || 4));
    if (stroke.opacity !== undefined && stroke.opacity < 1) {
      p.setAttribute('opacity', String(stroke.opacity));
    }
    return p;
  }

  function findSvgByTarget(target) {
    if (target.kind === 'overlay') {
      return document.querySelector('.ink-card-overlay[data-chapter-id="' + target.chId + '"][data-section-id="' + target.secId + '"]');
    }
    return document.querySelector('.ink-sketchpad-svg[data-chapter-id="' + target.chId + '"][data-pad-id="' + target.padId + '"]');
  }

  function renderSvgStrokes(svg, strokes) {
    if (!svg) return;
    svg.innerHTML = '';
    (strokes || []).forEach(function (st) {
      if (st && (st.d || (st.points && st.points.length))) {
        svg.appendChild(createPathEl(st));
      }
    });
  }

  /* ========================================================================
   * 2. BODY STATE, UNDO / REDO & FLOATING INK TOOLBAR
   * ======================================================================== */
  function syncBodyClasses() {
    if (!document.body) return;
    document.body.classList.toggle('ink-labs-active', enabled);
    document.body.classList.remove('ink-mode-scroll', 'ink-mode-pen', 'ink-mode-highlighter', 'ink-mode-eraser', 'ink-mode-draw', 'ink-palm-on', 'ink-palm-off', 'ink-labs-hidden');
    if (!enabled) return;
    document.body.classList.add('ink-mode-' + mode);
    if (mode !== 'scroll') document.body.classList.add('ink-mode-draw');
    document.body.classList.add(palmRejection ? 'ink-palm-on' : 'ink-palm-off');
    if (hidden) document.body.classList.add('ink-labs-hidden');
  }

  function pushUndo(action) {
    undoStack.push(action);
    if (undoStack.length > 60) undoStack.shift();
    redoStack = [];
    syncToolbarUi();
  }

  function applyHistoryAction(action, isUndo) {
    if (!action) return;
    var svg = findSvgByTarget(action.target);
    var addAction = (action.type === 'add' && !isUndo) || (action.type === 'erase' && isUndo);
    if (addAction) {
      var list = getOrCreateStrokeList(action.target, svg ? parseFloat(svg.getAttribute('data-vh')) : 420);
      if (list && !list.some(function (s) { return s.id === action.stroke.id; })) {
        list.push(action.stroke);
      }
    } else {
      var delList = getStrokeList(action.target);
      if (delList) {
        var idx = delList.findIndex(function (s) { return s.id === action.stroke.id; });
        if (idx !== -1) delList.splice(idx, 1);
      }
    }
    pruneAndSaveStore();
    if (svg) renderSvgStrokes(svg, getStrokeList(action.target) || []);
    syncToolbarUi();
  }

  function doUndo() {
    if (!undoStack.length) return;
    var act = undoStack.pop();
    redoStack.push(act);
    applyHistoryAction(act, true);
    announce('برگشت خط انجام شد');
  }

  function doRedo() {
    if (!redoStack.length) return;
    var act = redoStack.pop();
    undoStack.push(act);
    applyHistoryAction(act, false);
    announce('تکرار خط انجام شد');
  }

  function syncToolbarUi() {
    syncBodyClasses();
    var tb = document.getElementById('v2InkToolbar');
    if (!tb) return;

    tb.querySelectorAll('[data-ink-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-ink-mode') === mode ? 'true' : 'false');
    });
    var palmBtn = tb.querySelector('#v2InkPalmBtn');
    if (palmBtn) palmBtn.setAttribute('aria-pressed', palmRejection ? 'true' : 'false');

    tb.querySelectorAll('[data-ink-color]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-ink-color') === color ? 'true' : 'false');
    });
    tb.querySelectorAll('[data-ink-width]').forEach(function (b) {
      b.setAttribute('aria-pressed', Number(b.getAttribute('data-ink-width')) === width ? 'true' : 'false');
    });
    var hideBtn = tb.querySelector('#v2InkHideBtn');
    if (hideBtn) hideBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');

    var undoBtn = tb.querySelector('#v2InkUndoBtn');
    var redoBtn = tb.querySelector('#v2InkRedoBtn');
    if (undoBtn) undoBtn.setAttribute('aria-disabled', undoStack.length ? 'false' : 'true');
    if (redoBtn) redoBtn.setAttribute('aria-disabled', redoStack.length ? 'false' : 'true');
  }

  function ensureToolbar() {
    if (!document.getElementById('v2InkLiveStatus') && document.body) {
      var live = document.createElement('div');
      live.id = 'v2InkLiveStatus';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    var existing = document.getElementById('v2InkToolbar');
    if (existing) return existing;

    var tb = document.createElement('div');
    tb.id = 'v2InkToolbar';
    tb.setAttribute('role', 'toolbar');
    tb.setAttribute('focusgroup', 'toolbar wrap');
    tb.setAttribute('aria-label', 'نوار ابزار قلم و دستخط آزمایشی');

    var colorHtml = COLORS.map(function (c) {
      return '<button type="button" class="ink-color-btn" data-ink-color="' + c.id + '" aria-pressed="false" aria-label="رنگ ' + c.label + '" title="' + c.label + '"></button>';
    }).join('');
    var widthHtml = WIDTHS.map(function (w) {
      return '<button type="button" class="ink-tb-btn" data-ink-width="' + w.val + '" aria-pressed="false" aria-label="ضخامت ' + w.label + '">' + w.label + '</button>';
    }).join('');

    tb.innerHTML =
      '<div class="ink-tb-row">' +
        '<div class="ink-tb-group" role="group" aria-label="ابزار قلم">' +
          '<button type="button" class="ink-tb-btn" data-ink-mode="scroll" aria-pressed="false" title="پیمایش و کار با منوها">🖐️ پیمایش</button>' +
          '<button type="button" class="ink-tb-btn" data-ink-mode="pen" aria-pressed="true" title="قلم نوشتن">🖊️ قلم</button>' +
          '<button type="button" class="ink-tb-btn" data-ink-mode="highlighter" aria-pressed="false" title="ماژیک شفاف">🖍️ ماژیک</button>' +
          '<button type="button" class="ink-tb-btn" data-ink-mode="eraser" aria-pressed="false" title="پاککن خطوط">🧹 پاککن</button>' +
        '</div>' +
        '<span class="ink-tb-sep" role="separator" aria-orientation="vertical"></span>' +
        '<button type="button" class="ink-tb-btn" id="v2InkPalmBtn" aria-pressed="true" title="حذف لمس کف دست: فقط قلم/ماوس می‌نویسد و انگشت صفحه را اسکرول می‌کند">🖊️ فقط قلم</button>' +
      '</div>' +
      '<div class="ink-tb-row">' +
        '<div class="ink-tb-group" role="group" aria-label="رنگ قلم">' + colorHtml + '</div>' +
        '<span class="ink-tb-sep" role="separator" aria-orientation="vertical"></span>' +
        '<div class="ink-tb-group" role="group" aria-label="ضخامت قلم">' + widthHtml + '</div>' +
        '<span class="ink-tb-sep" role="separator" aria-orientation="vertical"></span>' +
        '<div class="ink-tb-group" role="group" aria-label="عملیات">' +
          '<button type="button" class="ink-tb-btn" id="v2InkUndoBtn" aria-label="برگشت (Undo)" aria-disabled="true" title="برگشت">↩️</button>' +
          '<button type="button" class="ink-tb-btn" id="v2InkRedoBtn" aria-label="تکرار (Redo)" aria-disabled="true" title="تکرار">↪️</button>' +
          '<button type="button" class="ink-tb-btn" id="v2InkHideBtn" aria-pressed="false" aria-label="مخفی یا نمایش دستخط‌ها" title="مخفی/نمایش دستخط‌ها">👁️</button>' +
          '<button type="button" class="ink-tb-btn ink-tb-close" id="v2InkCloseBtn" aria-label="بستن نوار قلم" title="خروج از آزمایشگاه قلم">✕ بستن نوار قلم</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(tb);

    tb.querySelectorAll('[data-ink-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-ink-mode');
        if (mode === 'highlighter' && color === 'auto') color = 'amber';
        if (hidden && (mode === 'pen' || mode === 'highlighter')) hidden = false;
        syncToolbarUi();
        announce('حالت ابزار تغییر یافت');
      });
    });

    tb.querySelector('#v2InkPalmBtn').addEventListener('click', function () {
      palmRejection = !palmRejection;
      savePalmPref(palmRejection);
      syncToolbarUi();
      announce(palmRejection ? 'فقط قلم و ماوس فعال شد' : 'لمس با انگشت فعال شد');
    });

    tb.querySelectorAll('[data-ink-color]').forEach(function (b) {
      b.addEventListener('click', function () {
        color = b.getAttribute('data-ink-color');
        if (mode === 'scroll' || mode === 'eraser') mode = 'pen';
        syncToolbarUi();
      });
    });

    tb.querySelectorAll('[data-ink-width]').forEach(function (b) {
      b.addEventListener('click', function () {
        width = Number(b.getAttribute('data-ink-width')) || 4;
        if (mode === 'scroll' || mode === 'eraser') mode = 'pen';
        syncToolbarUi();
      });
    });

    tb.querySelector('#v2InkUndoBtn').addEventListener('click', function () {
      if (this.getAttribute('aria-disabled') === 'true') return;
      doUndo();
    });
    tb.querySelector('#v2InkRedoBtn').addEventListener('click', function () {
      if (this.getAttribute('aria-disabled') === 'true') return;
      doRedo();
    });
    tb.querySelector('#v2InkHideBtn').addEventListener('click', function () {
      hidden = !hidden;
      syncToolbarUi();
      announce(hidden ? 'دستخط‌ها موقتاً مخفی شدند' : 'دستخط‌ها نمایش داده شدند');
    });
    tb.querySelector('#v2InkCloseBtn').addEventListener('click', function () {
      if (window.MedicalismShell && typeof window.MedicalismShell.setInkLabs === 'function') {
        window.MedicalismShell.setInkLabs(false);
      } else {
        disable();
      }
    });

    if (!('focusGroup' in HTMLElement.prototype)) {
      var items = Array.prototype.slice.call(tb.querySelectorAll('button'));
      items.forEach(function (btn, idx) { btn.tabIndex = idx === 0 ? 0 : -1; });
      tb.addEventListener('focusin', function (e) {
        if (items.indexOf(e.target) !== -1) items.forEach(function (btn) { btn.tabIndex = btn === e.target ? 0 : -1; });
      });
      tb.addEventListener('keydown', function (e) {
        var idx = items.indexOf(document.activeElement);
        if (idx === -1) return;
        var rtl = getComputedStyle(tb).direction === 'rtl', step = 0;
        if (e.key === 'ArrowRight') step = rtl ? -1 : 1;
        else if (e.key === 'ArrowLeft') step = rtl ? 1 : -1;
        else if (e.key === 'Home') step = -idx;
        else if (e.key === 'End') step = (items.length - 1) - idx;
        else return;
        e.preventDefault();
        items[(idx + step + items.length) % items.length].focus();
      });
    }

    syncToolbarUi();
    return tb;
  }

  /* ========================================================================
   * 3. UNIFIED POINTER DRAWING & ERASING ON SVG TARGETS (Overlays & Sketchpads)
   * ======================================================================== */
  function readTargetFromSvg(svg) {
    return {
      kind: svg.getAttribute('data-ink-kind') || 'overlay',
      chId: svg.getAttribute('data-chapter-id') || '',
      secId: svg.getAttribute('data-section-id') || '',
      padId: svg.getAttribute('data-pad-id') || ''
    };
  }

  function shouldAllowPointer(e) {
    if (e.pointerType === 'pen') return true;
    if (e.pointerType === 'mouse') return e.button === 0 || e.buttons === 1;
    if (e.pointerType === 'touch') return !palmRejection;
    return false;
  }

  function tryEraseAt(svg, target, clientX, clientY) {
    var pt = toSvgPoint(svg, clientX, clientY);
    if (!pt) return false;
    var list = getStrokeList(target);
    if (!list || list.length === 0) return false;

    for (var i = list.length - 1; i >= 0; i--) {
      if (hitTestStroke(list[i], pt.x, pt.y)) {
        var removed = list.splice(i, 1)[0];
        pruneAndSaveStore();
        renderSvgStrokes(svg, list);
        pushUndo({ type: 'erase', target: target, stroke: removed });
        return true;
      }
    }
    return false;
  }

  function bindSvgEvents(svg) {
    if (!svg || svg.dataset.inkBound === '1') return;
    svg.dataset.inkBound = '1';

    svg.addEventListener('pointerdown', function (e) {
      if (!enabled || hidden || mode === 'scroll') return;
      if (!shouldAllowPointer(e)) return;

      e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch (err) {}

      var target = readTargetFromSvg(svg);
      if (mode === 'eraser') {
        activeErase = { pointerId: e.pointerId, svg: svg, target: target };
        tryEraseAt(svg, target, e.clientX, e.clientY);
        return;
      }

      var pt = toSvgPoint(svg, e.clientX, e.clientY);
      if (!pt) return;

      var baseW = mode === 'highlighter' ? 16 : width;
      var pressure = (e.pointerType === 'pen' && e.pressure > 0 && e.pressure < 1) ? e.pressure : 0.5;
      var modW = e.pointerType === 'pen' ? rnd1(baseW * (0.72 + pressure * 0.56)) : baseW;

      var stroke = {
        id: 'ink_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        mode: mode,
        color: color,
        width: modW,
        opacity: mode === 'highlighter' ? 0.35 : 1,
        points: [[pt.x, pt.y]],
        d: ''
      };
      stroke.d = buildQuadraticPath(stroke.points);

      var pathEl = createPathEl(stroke);
      svg.appendChild(pathEl);

      activeDraw = {
        pointerId: e.pointerId,
        svg: svg,
        target: target,
        stroke: stroke,
        pathEl: pathEl,
        minStepSq: pt.minStepSq
      };
    });

    svg.addEventListener('pointermove', function (e) {
      if (!enabled) return;
      if (activeErase && e.pointerId === activeErase.pointerId && activeErase.svg === svg) {
        tryEraseAt(svg, activeErase.target, e.clientX, e.clientY);
        return;
      }
      if (!activeDraw || e.pointerId !== activeDraw.pointerId || activeDraw.svg !== svg) return;

      var pt = toSvgPoint(svg, e.clientX, e.clientY);
      if (!pt) return;
      var pts = activeDraw.stroke.points;
      var last = pts[pts.length - 1];
      var dx = pt.x - last[0], dy = pt.y - last[1];
      if ((dx * dx + dy * dy) < activeDraw.minStepSq) return;

      pts.push([pt.x, pt.y]);
      activeDraw.stroke.d = buildQuadraticPath(pts);
      activeDraw.pathEl.setAttribute('d', activeDraw.stroke.d);
    });

    function finishPointer(e) {
      if (activeErase && e.pointerId === activeErase.pointerId && activeErase.svg === svg) {
        activeErase = null;
        return;
      }
      if (!activeDraw || e.pointerId !== activeDraw.pointerId || activeDraw.svg !== svg) return;
      var st = activeDraw.stroke;
      var target = activeDraw.target;
      var vh = parseFloat(svg.getAttribute('data-vh')) || 420;
      activeDraw = null;

      st.d = buildQuadraticPath(st.points);
      var list = getOrCreateStrokeList(target, vh);
      if (list) {
        list.push(st);
        pruneAndSaveStore();
        pushUndo({ type: 'add', target: target, stroke: st });
      }
    }

    svg.addEventListener('pointerup', finishPointer);
    svg.addEventListener('pointercancel', finishPointer);
    svg.addEventListener('contextmenu', function (e) {
      if (enabled && mode !== 'scroll') e.preventDefault();
    });
  }

  /* ========================================================================
   * 4. MOUNT MODE A (OVERLAYS) & MODE B (DOTTED SKETCHPAD CARDS)
   * ======================================================================== */
  function resolveChapterId(secEl) {
    var attr = secEl.getAttribute('data-chapter-id');
    if (attr) return attr;
    var art = secEl.closest('article[id]');
    if (art && art.id) return art.id;
    try {
      var saved = localStorage.getItem('med_active_chapter');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return document.body.dataset.courseId || 'legacy-course';
  }

  function syncOverlayViewBox(secEl, svg) {
    var rect = secEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var vh = Math.max(120, Math.round((rect.height / rect.width) * 1000));
    if (svg.getAttribute('data-vh') !== String(vh)) {
      svg.setAttribute('data-vh', String(vh));
      svg.setAttribute('viewBox', '0 0 1000 ' + vh);
    }
  }

  function buildSketchpadCard(chId, secId, pad) {
    var card = document.createElement('div');
    card.className = 'ink-sketchpad-card' + (pad.collapsed ? ' is-collapsed' : '');
    card.setAttribute('data-pad-card-id', pad.id);

    var h = pad.height || 420;
    card.innerHTML =
      '<div class="ink-sketchpad-header">' +
        '<div class="ink-sketchpad-title"><span>📝 برگه دستنویس نقطه‌ای</span></div>' +
        '<div class="ink-sketchpad-actions">' +
          '<button type="button" class="ink-pad-action-btn" data-pad-grow>+ افزایش ارتفاع</button>' +
          '<button type="button" class="ink-pad-action-btn" data-pad-collapse>' + (pad.collapsed ? 'باز کردن' : 'جمع‌کردن') + '</button>' +
          '<button type="button" class="ink-pad-action-btn is-danger" data-pad-delete>🗑️ حذف برگه</button>' +
        '</div>' +
      '</div>' +
      '<div class="ink-sketchpad-paper" style="--pad-h:' + h + ';"></div>';

    var paper = card.querySelector('.ink-sketchpad-paper');
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ink-sketchpad-svg');
    svg.setAttribute('data-ink-kind', 'sketchpad');
    svg.setAttribute('data-chapter-id', chId);
    svg.setAttribute('data-section-id', secId);
    svg.setAttribute('data-pad-id', pad.id);
    svg.setAttribute('data-vh', String(h));
    svg.setAttribute('viewBox', '0 0 1000 ' + h);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    paper.appendChild(svg);

    renderSvgStrokes(svg, pad.strokes || []);
    bindSvgEvents(svg);

    card.querySelector('[data-pad-grow]').addEventListener('click', function () {
      pad.height = (pad.height || 420) + 280;
      paper.style.setProperty('--pad-h', String(pad.height));
      svg.setAttribute('data-vh', String(pad.height));
      svg.setAttribute('viewBox', '0 0 1000 ' + pad.height);
      pruneAndSaveStore();
      announce('ارتفاع برگه افزایش یافت');
    });

    card.querySelector('[data-pad-collapse]').addEventListener('click', function () {
      pad.collapsed = !pad.collapsed;
      card.classList.toggle('is-collapsed', pad.collapsed);
      this.textContent = pad.collapsed ? 'باز کردن' : 'جمع‌کردن';
      pruneAndSaveStore();
    });

    card.querySelector('[data-pad-delete]').addEventListener('click', function () {
      if (!window.confirm('آیا این برگه دستنویس نقطه‌ای و خطوط آن حذف شوند؟')) return;
      var ch = store.chapters[chId];
      if (ch && ch.sketchpads && Array.isArray(ch.sketchpads[secId])) {
        ch.sketchpads[secId] = ch.sketchpads[secId].filter(function (p) { return p && p.id !== pad.id; });
      }
      undoStack = undoStack.filter(function (a) { return a.target.padId !== pad.id; });
      redoStack = redoStack.filter(function (a) { return a.target.padId !== pad.id; });
      pruneAndSaveStore();
      card.remove();
      syncToolbarUi();
      announce('برگه دستنویس حذف شد');
    });

    return card;
  }

  function clearMountedNodes() {
    observers.forEach(function (ro) { try { ro.disconnect(); } catch (e) {} });
    observers = [];
    document.querySelectorAll('.ink-card-overlay, .ink-add-pad-row, .ink-sketchpad-card').forEach(function (n) { n.remove(); });
  }

  function mountCurrentChapter() {
    clearMountedNodes();
    if (!enabled) return;
    var container = document.querySelector(READING_SELECTOR);
    if (!container) return;

    store = loadStore();
    var sections = container.querySelectorAll(SECTION_SELECTOR);
    sections.forEach(function (secEl, idx) {
      var secId = secEl.id || ('sec-' + idx);
      var chId = resolveChapterId(secEl);
      var chData = store.chapters[chId] || {};

      // Mode A: SVG Overlay locked to section card top
      var ovSvg = document.createElementNS(SVG_NS, 'svg');
      ovSvg.setAttribute('class', 'ink-card-overlay');
      ovSvg.setAttribute('data-ink-kind', 'overlay');
      ovSvg.setAttribute('data-chapter-id', chId);
      ovSvg.setAttribute('data-section-id', secId);
      ovSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
      secEl.appendChild(ovSvg);
      syncOverlayViewBox(secEl, ovSvg);

      var ovEntry = chData.overlays && chData.overlays[secId];
      renderSvgStrokes(ovSvg, ovEntry && ovEntry.strokes ? ovEntry.strokes : []);
      bindSvgEvents(ovSvg);

      if (typeof window.ResizeObserver === 'function') {
        var ro = new window.ResizeObserver(function () { syncOverlayViewBox(secEl, ovSvg); });
        ro.observe(secEl);
        observers.push(ro);
      }

      // Mode B: Saved Dotted Sketchpads + Add Button
      var savedPads = (chData.sketchpads && Array.isArray(chData.sketchpads[secId])) ? chData.sketchpads[secId] : [];
      savedPads.forEach(function (pad) {
        if (pad && pad.id) secEl.appendChild(buildSketchpadCard(chId, secId, pad));
      });

      var addRow = document.createElement('div');
      addRow.className = 'ink-add-pad-row';
      addRow.innerHTML = '<button type="button" class="ink-add-pad-btn">+ ✍️ افزودن برگه دستنویس نقطه‌ای</button>';
      secEl.appendChild(addRow);

      addRow.querySelector('.ink-add-pad-btn').addEventListener('click', function () {
        var chEntry = ensureChapterEntry(chId);
        if (!Array.isArray(chEntry.sketchpads[secId])) chEntry.sketchpads[secId] = [];
        var newPad = {
          id: 'pad_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
          height: 420,
          collapsed: false,
          strokes: []
        };
        chEntry.sketchpads[secId].push(newPad);
        pruneAndSaveStore();
        var card = buildSketchpadCard(chId, secId, newPad);
        secEl.insertBefore(card, addRow);
        announce('برگه دستنویس نقطه‌ای اضافه شد');
      });
    });

    syncToolbarUi();
  }

  /* ========================================================================
   * 5. LIFECYCLE & GLOBAL EVENT WIRING
   * ======================================================================== */
  function onChapterRendered() {
    if (!enabled) return;
    undoStack = [];
    redoStack = [];
    setTimeout(mountCurrentChapter, 30);
  }

  function onProfileRestored() {
    if (!enabled) return;
    undoStack = [];
    redoStack = [];
    mountCurrentChapter();
  }

  function onKeyDown(e) {
    if (!enabled) return;
    if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'z') {
      if (document.querySelector('dialog[open], .v2-modal-backdrop.is-active, .modal-backdrop.is-active')) return;
      e.preventDefault();
      if (e.shiftKey) doRedo();
      else doUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === 'y') {
      if (document.querySelector('dialog[open], .v2-modal-backdrop.is-active, .modal-backdrop.is-active')) return;
      e.preventDefault();
      doRedo();
    }
  }

  function bindGlobalEventsOnce() {
    if (globalListenersBound) return;
    globalListenersBound = true;
    window.addEventListener('chapterRendered', onChapterRendered);
    window.addEventListener('medicalismProfileRestored', onProfileRestored);
    document.addEventListener('keydown', onKeyDown);
  }

  function enable() {
    enabled = true;
    bindGlobalEventsOnce();
    ensureToolbar();
    mountCurrentChapter();
  }

  function disable() {
    enabled = false;
    activeDraw = null;
    activeErase = null;
    undoStack = [];
    redoStack = [];
    clearMountedNodes();
    var tb = document.getElementById('v2InkToolbar');
    if (tb) tb.remove();
    var live = document.getElementById('v2InkLiveStatus');
    if (live) live.remove();
    syncBodyClasses();
  }

  window.MedicalismInkLabs = {
    enable: enable,
    disable: disable,
    refresh: mountCurrentChapter,
    isEnabled: function () { return enabled; }
  };
})();
