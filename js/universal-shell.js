/**
 * MEDICALISM ALBORZ — UNIVERSAL SHELL V2 & PROFILE SYNC
 * - Zero-dependency shared controller across ALL pages (index, courses, quiz, pmp, v2 courses)
 * - 3-state Theme Engine (Light / Dark / System) synced via <meta name="color-scheme"> + [data-theme]
 * - Lazy-loaded Font Switcher (Vazirmatn default; Sahel & Shabnam fetched only when selected)
 * - Continuous Font Zoom (80%–140%) across ALL pages
 * - Native top-layer <dialog> Universal Settings & Profile Drawer
 * - GPU-composited Reading Progress Bar (transform: scaleX via --read-progress)
 * - Local JSON Profile Backup/Restore (Merge / Replace) + Cloud Sync hook (window.MedicalismSync)
 */
(function () {
  'use strict';

  var FONT_MAP = {
    vazirmatn: "'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    googlesans: "'Google Sans', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
    sahel: "'Sahel', 'Vazirmatn', -apple-system, sans-serif",
    shabnam: "'Shabnam', 'Vazirmatn', -apple-system, sans-serif"
  };

  var FONT_CDN_URLS = {
    googlesans: 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap',
    sahel: 'https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.4.0/dist/font-face.css',
    shabnam: 'https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css'
  };

  var EXACT_SYNC_KEYS = [
    'med_theme',
    'med_font_family',
    'med_font_scale',
    'med_reduced_motion',
    'med_brush_highlight_mode',
    'med_ink_labs_enabled',
    'med_ink_palm_rejection',
    'med_ink_scroll_lock',
    'medicalism_ink_labs_v1',
    'medicalism_exam_cram_mode',
    'rad_exam_mode',
    'med_bookmarks',
    'med_completed_chapters',
    'med_active_chapter',
    'medicalism_highlights_v1',
    'pmp1:exam:session',
    'pmp1:practice:session',
    'med_quiz_stats_v2'
  ];

  var PREFIX_SYNC_KEYS = ['med_quiz_', 'v2_orders_'];

  function safeGet(key, fallback) {
    try {
      var val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, String(val));
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function isMedicalismKey(key) {
    if (!key) return false;
    if (EXACT_SYNC_KEYS.indexOf(key) !== -1) return true;
    for (var i = 0; i < PREFIX_SYNC_KEYS.length; i++) {
      if (key.indexOf(PREFIX_SYNC_KEYS[i]) === 0) return true;
    }
    return false;
  }

  function toPersianDigits(val) {
    if (val === null || val === undefined) return '';
    var map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(val).replace(/[0-9]/g, function (d) { return map[+d]; });
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
      return;
    }
    var container = document.getElementById('v2ToastContainer');
    if (!container && document.body) {
      container = document.createElement('div');
      container.id = 'v2ToastContainer';
      container.className = 'v2-toast-container';
      document.body.appendChild(container);
    }
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'v2-toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 180ms ease';
      setTimeout(function () { el.remove(); }, 200);
    }, 2400);
  }

  /* ========================================================================
   * 1. COLOR SCHEME / THEME ENGINE (System | Light | Dark)
   * ======================================================================== */
  var mediaQuery = (typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function ensureColorSchemeMeta() {
    var meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta && document.head) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      meta.content = 'light dark';
      document.head.insertBefore(meta, document.head.firstChild);
    }
    return meta;
  }

  function getThemePreference() {
    var saved = safeGet('med_theme', null);
    return (saved === 'light' || saved === 'dark') ? saved : 'system';
  }

  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return (mediaQuery && mediaQuery.matches) ? 'dark' : 'light';
  }

  function applyThemePreference(pref, persist) {
    var normalized = (pref === 'light' || pref === 'dark') ? pref : 'system';
    if (persist) {
      if (normalized === 'system') safeRemove('med_theme');
      else safeSet('med_theme', normalized);
    }

    var resolved = resolveTheme(normalized);
    var meta = ensureColorSchemeMeta();
    if (meta) {
      meta.content = normalized === 'system' ? 'light dark' : normalized;
    }
    document.documentElement.setAttribute('data-theme', resolved);

    if (window.appState && window.appState.theme !== resolved) {
      window.appState.theme = resolved;
      if (typeof window.appState.notify === 'function') {
        window.appState.notify('theme', resolved);
      }
    }

    syncDrawerControls();
    return resolved;
  }

  /* ========================================================================
   * 2. LAZY-LOADED FONT & CONTINUOUS ZOOM ENGINE
   * ======================================================================== */
  function ensureFontStylesheet(family) {
    var url = FONT_CDN_URLS[family];
    if (!url || !document.head) return;
    var linkId = 'v2-font-css-' + family;
    if (document.getElementById(linkId)) return;
    var marker = family === 'googlesans' ? 'family=Google+Sans' : (family + '-font');
    var existing = document.querySelector('link[href*="' + marker + '"]');
    if (existing) {
      if (existing.media === 'print') existing.media = 'all';
      if (existing.getAttribute('rel') === 'preload') existing.setAttribute('rel', 'stylesheet');
      return;
    }
    var link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    document.head.appendChild(link);
  }

  function getFontFamily() {
    var f = safeGet('med_font_family', 'vazirmatn');
    return FONT_MAP[f] ? f : 'vazirmatn';
  }

  function applyFontFamily(family, persist) {
    var clean = FONT_MAP[family] ? family : 'vazirmatn';
    if (clean !== 'vazirmatn') {
      ensureFontStylesheet(clean);
    }
    var cssVal = FONT_MAP[clean];
    document.documentElement.style.setProperty('--font-current', cssVal);
    document.documentElement.style.setProperty('--app-font-family', cssVal);
    if (persist) {
      safeSet('med_font_family', clean);
    }
    if (window.appState && window.appState.fontFamily !== clean) {
      window.appState.fontFamily = clean;
      if (typeof window.appState.notify === 'function') {
        window.appState.notify('fontFamily', clean);
      }
    }
    syncDrawerControls();
    return clean;
  }

  function getFontScale() {
    var raw = parseFloat(safeGet('med_font_scale', '1'));
    if (isNaN(raw)) return 1;
    return Math.round(Math.min(1.40, Math.max(0.80, raw)) * 100) / 100;
  }

  function applyFontScale(scale, persist) {
    var num = parseFloat(scale);
    if (isNaN(num)) num = 1;
    var clamped = Math.round(Math.min(1.40, Math.max(0.80, num)) * 100) / 100;
    document.documentElement.style.setProperty('--font-scale', String(clamped));
    var pmpRoot = document.getElementById('pmpAppRoot');
    if (pmpRoot) {
      pmpRoot.style.setProperty('--font-scale', String(clamped));
      pmpRoot.style.fontSize = (16 * clamped).toFixed(2) + 'px';
    }
    if (persist) {
      safeSet('med_font_scale', clamped);
    }
    if (window.appState && window.appState.fontScale !== clamped) {
      window.appState.fontScale = clamped;
      if (typeof window.appState.notify === 'function') {
        window.appState.notify('fontScale', clamped);
      }
    }
    syncDrawerControls();
    return clamped;
  }

  function applyReducedMotion(enabled, persist) {
    var on = Boolean(enabled);
    document.documentElement.classList.toggle('v2-reduced-motion', on);
    if (persist) safeSet('med_reduced_motion', on ? 'true' : 'false');
    syncDrawerControls();
  }

  var BRUSH_KEY = 'med_brush_highlight_mode', INK_KEY = 'med_ink_labs_enabled', lazyBusy = {};
  function isBrushMode() { return safeGet(BRUSH_KEY, 'false') === 'true'; }
  function isInkLabs() { return safeGet(INK_KEY, 'false') === 'true'; }
  function getReadingEl() { return document.querySelector('#chapterContentArea,#main-content,.chapter-content'); }
  function loadLazyScript(id, src, cb) {
    if (document.getElementById(id) || lazyBusy[id] || !document.head) return;
    lazyBusy[id] = 1;
    var s = document.createElement('script');
    s.id = id; s.src = src; s.async = true;
    s.onload = function () { lazyBusy[id] = 0; cb && cb(); };
    s.onerror = function () { lazyBusy[id] = 0; };
    document.head.appendChild(s);
  }
  function applyBrushMode(enabled, persist) {
    var on = !!enabled, b = document.body, pop = document.getElementById('highlightPopover'), eng = window.MedicalismBrushEngine;
    if (persist) safeSet(BRUSH_KEY, on ? 'true' : 'false');
    if (on && isInkLabs()) applyInkLabs(false, true);
    if (b) { b.classList.toggle('brush-highlight-mode', on); if (!on) delete b.dataset.brushTool; }
    if (on) {
      try { window.getSelection().removeAllRanges(); } catch (e) {}
      if (pop) pop.style.display = 'none';
      if (getReadingEl()) {
        if (eng) eng.activate();
        else loadLazyScript('v2-brush-js', './js/brush-highlighter.js?v=20261121f', function () {
          if (isBrushMode() && window.MedicalismBrushEngine) window.MedicalismBrushEngine.activate();
        });
      }
    } else if (eng) eng.deactivate();
    try { window.dispatchEvent(new CustomEvent('brushHighlightModeChanged', { detail: { active: on } })); } catch (e) {}
    syncDrawerControls();
    if (persist) showToast(on ? '🖍️ حالت ماژیک مستقیم فعال شد' : 'حالت ماژیک مستقیم غیرفعال شد');
    return on;
  }
  function applyInkLabs(enabled, persist) {
    var on = !!enabled, eng = window.MedicalismInkLabs;
    if (persist) safeSet(INK_KEY, on ? 'true' : 'false');
    if (on && isBrushMode()) applyBrushMode(false, true);
    if (on && getReadingEl()) {
      if (!document.getElementById('v2-ink-labs-css') && document.head) {
        var ln = document.createElement('link');
        ln.id = 'v2-ink-labs-css'; ln.rel = 'stylesheet'; ln.href = './css/ink-labs.css?v=20261121f';
        document.head.appendChild(ln);
      }
      if (eng) eng.enable();
      else loadLazyScript('v2-ink-labs-js', './js/ink-labs.js?v=20261121f', function () {
        if (isInkLabs() && window.MedicalismInkLabs) window.MedicalismInkLabs.enable();
      });
    } else if (!on && eng) {
      eng.disable();
    }
    syncDrawerControls();
    if (persist) showToast(on ? '✍️ آزمایشگاه قلم و دستخط فعال شد' : 'آزمایشگاه قلم غیرفعال شد');
    return on;
  }

  /* ========================================================================
   * 3. LOCAL BACKUP / RESTORE & CLOUD SYNC HOOK (window.MedicalismSync)
   * ======================================================================== */
  var syncListeners = [];

  function parseJsonSafe(raw, fallback) {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function mergeArraysUnique(a, b, keyFn) {
    var out = [];
    var seen = Object.create(null);
    var push = function (item) {
      var k = keyFn ? keyFn(item) : String(item);
      if (!seen[k]) {
        seen[k] = true;
        out.push(item);
      }
    };
    (Array.isArray(a) ? a : []).forEach(push);
    (Array.isArray(b) ? b : []).forEach(push);
    return out;
  }

  var MedicalismSync = {
    provider: 'local', // Future: 'supabase'

    getStatus: function () {
      return {
        provider: this.provider,
        connected: false,
        lastSyncedAt: safeGet('med_last_backup_at', null),
        user: null
      };
    },

    onStatusChange: function (cb) {
      if (typeof cb === 'function') syncListeners.push(cb);
    },

    exportSnapshot: function () {
      var data = {};
      var count = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (isMedicalismKey(k)) {
            data[k] = localStorage.getItem(k);
            count++;
          }
        }
      } catch (e) {}

      var nowIso = new Date().toISOString();
      safeSet('med_last_backup_at', nowIso);

      return {
        schemaVersion: '2.0',
        app: 'medicalism-alborz',
        exportedAt: nowIso,
        keyCount: count,
        data: data
      };
    },

    downloadBackupFile: function () {
      var snap = this.exportSnapshot();
      var blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      var dateTag = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = 'medicalism-profile-' + dateTag + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        a.remove();
      }, 200);
      syncDrawerControls();
      showToast('فایل پشتیبان پروفایل با ' + toPersianDigits(snap.keyCount) + ' رکورد دانلود شد');
      return snap;
    },

    importSnapshot: function (rawInput, mode) {
      var importMode = mode === 'replace' ? 'replace' : 'merge';
      var parsed = typeof rawInput === 'string' ? parseJsonSafe(rawInput, null) : rawInput;
      if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
        throw new Error('ساختار فایل پشتیبان نامعتبر است.');
      }

      var data = parsed.data;
      if (importMode === 'replace') {
        var existingKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
          var ek = localStorage.key(i);
          if (isMedicalismKey(ek)) existingKeys.push(ek);
        }
        existingKeys.forEach(function (k) { safeRemove(k); });
      }

      var appliedKeys = 0;
      Object.keys(data).forEach(function (k) {
        if (!isMedicalismKey(k)) return;
        var val = data[k];
        if (val === null || val === undefined) return;
        var strVal = typeof val === 'string' ? val : JSON.stringify(val);

        if (importMode === 'merge') {
          if (k === 'medicalism_highlights_v1') {
            var curHl = parseJsonSafe(safeGet(k, '[]'), []);
            var incHl = parseJsonSafe(strVal, []);
            var mergedHl = mergeArraysUnique(curHl, incHl, function (h) {
              return h && h.id ? h.id : ((h.chapterId || '') + '|' + (h.sectionId || '') + '|' + (h.text || ''));
            });
            safeSet(k, JSON.stringify(mergedHl));
            appliedKeys++;
            return;
          }
          if (k === 'medicalism_ink_labs_v1') {
            var curInk = parseJsonSafe(safeGet(k, '{}'), {}), incInk = parseJsonSafe(strVal, {});
            var cCh = (curInk && curInk.chapters) || {}, iCh = (incInk && incInk.chapters) || {}, byId = function (x) { return x && x.id; };
            Object.keys(iCh).forEach(function (cid) {
              var tc = cCh[cid] = cCh[cid] || { overlays: {}, sketchpads: {} }, sc = iCh[cid] || {};
              tc.overlays = tc.overlays || {}; tc.sketchpads = tc.sketchpads || {};
              Object.keys(sc.overlays || {}).forEach(function (sid) {
                var a = tc.overlays[sid] || {}, b = sc.overlays[sid] || {};
                tc.overlays[sid] = { vw: b.vw || a.vw || 1000, vh: b.vh || a.vh || 600, strokes: mergeArraysUnique(a.strokes, b.strokes, byId) };
              });
              Object.keys(sc.sketchpads || {}).forEach(function (sid) {
                var tp = tc.sketchpads[sid] = tc.sketchpads[sid] || [], sp = sc.sketchpads[sid] || [];
                sp.forEach(function (np) {
                  if (!np || !np.id) return;
                  var ex = tp.find(function (p) { return p && p.id === np.id; });
                  if (ex) { ex.strokes = mergeArraysUnique(ex.strokes, np.strokes, byId); ex.height = Math.max(ex.height || 420, np.height || 420); }
                  else tp.push(np);
                });
              });
            });
            safeSet(k, JSON.stringify({ schemaVersion: '1.0', chapters: cCh }));
            appliedKeys++;
            return;
          }
          if (k === 'med_bookmarks' || k === 'med_completed_chapters' || k.indexOf('med_quiz_flags_') === 0) {
            var curArr = parseJsonSafe(safeGet(k, '[]'), []);
            var incArr = parseJsonSafe(strVal, []);
            safeSet(k, JSON.stringify(mergeArraysUnique(curArr, incArr)));
            appliedKeys++;
            return;
          }
          if (k.indexOf('med_quiz_answers_') === 0 || k === 'med_quiz_stats_v2') {
            var curObj = parseJsonSafe(safeGet(k, '{}'), {});
            var incObj = parseJsonSafe(strVal, {});
            if (curObj && typeof curObj === 'object' && incObj && typeof incObj === 'object') {
              safeSet(k, JSON.stringify(Object.assign({}, curObj, incObj)));
              appliedKeys++;
              return;
            }
          }
        }

        safeSet(k, strVal);
        appliedKeys++;
      });

      // Immediately apply restored appearance & sync UI
      applyThemePreference(getThemePreference(), false);
      applyFontFamily(getFontFamily(), false);
      applyFontScale(getFontScale(), false);
      applyReducedMotion(safeGet('med_reduced_motion', 'false') === 'true', false);
      applyBrushMode(isBrushMode(), false);
      applyInkLabs(isInkLabs(), false);
      if (window.MedicalismInkLabs && window.MedicalismInkLabs.refresh) try { window.MedicalismInkLabs.refresh(); } catch (e) {}

      if (window.StudyFeatures) {
        try {
          if (typeof window.StudyFeatures.updateHighlightsBadge === 'function') {
            window.StudyFeatures.updateHighlightsBadge();
          }
          if (typeof window.StudyFeatures.updateStudyProgressWidget === 'function') {
            window.StudyFeatures.updateStudyProgressWidget();
          }
          if (window.appState && typeof window.StudyFeatures.reapplyChapterHighlights === 'function') {
            window.StudyFeatures.reapplyChapterHighlights(window.appState.activeChapterId);
          }
        } catch (e) {}
      }

      if (window.CourseEngineV2 && typeof window.CourseEngineV2.refreshUserMarks === 'function') {
        try { window.CourseEngineV2.refreshUserMarks(); } catch (e) {}
      }

      if (window.medicalQuiz && typeof window.medicalQuiz.updateStudentPerformanceOverview === 'function') {
        try { window.medicalQuiz.updateStudentPerformanceOverview(); } catch (e) {}
      }

      try {
        window.dispatchEvent(new CustomEvent('medicalismProfileRestored', {
          detail: { mode: importMode, appliedKeys: appliedKeys }
        }));
      } catch (e) {}

      syncDrawerControls();
      return { appliedKeys: appliedKeys, mode: importMode };
    },

    // Future Supabase Cloud Sync Adapter Interface (No-op locally)
    pushToCloud: function () {
      return Promise.resolve({ ok: false, reason: 'cloud_not_configured', provider: this.provider });
    },
    pullFromCloud: function () {
      return Promise.resolve({ ok: false, reason: 'cloud_not_configured', provider: this.provider });
    }
  };

  window.MedicalismSync = MedicalismSync;

  /* ========================================================================
   * 4. GPU-COMPOSITED READING PROGRESS BAR
   * ======================================================================== */
  function initReadingProgressGPU() {
    var bar = document.getElementById('readingProgressBar');
    if (!bar) return;

    var rafScheduled = false;
    var update = function () {
      rafScheduled = false;
      var scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      var docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body ? (document.body.scrollHeight - window.innerHeight) : 0,
        0
      );
      var ratio = docHeight > 0 ? Math.min(Math.max(scrollPos / docHeight, 0), 1) : 0;
      bar.style.setProperty('--read-progress', ratio.toFixed(4));
    };

    var schedule = function () {
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('chapterRendered', function () {
      setTimeout(schedule, 60);
    });
    update();
  }

  /* ========================================================================
   * 5. NATIVE <dialog> SETTINGS & PROFILE DRAWER + QUICK-DOCK
   * ======================================================================== */
  var dialogEl = null;
  var sheetEl = null;
  var isClosing = false;

  function buildDrawerHtml() {
    var hasFocusToggle = Boolean(document.querySelector('.app-sidebar, .v2-sidebar'));
    var hasBookmarks = Boolean(document.getElementById('bookmarksToggleBtn'));
    var hasHighlights = Boolean(document.getElementById('highlightsToggleBtn'));

    return '' +
      '<div class="v2-settings-sheet" role="document">' +
        '<div class="v2-settings-header">' +
          '<div class="v2-settings-title-wrap">' +
            '<div class="v2-settings-icon-box" aria-hidden="true"><span>⚙️</span></div>' +
            '<div>' +
              '<h2 class="v2-settings-title">تنظیمات و پروفایل مطالعه</h2>' +
              '<div class="v2-settings-subtitle">ذخیره خودکار در مرورگر • همگام‌سازی سراسری</div>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="v2-settings-close" id="v2SettingsCloseBtn" aria-label="بستن تنظیمات" autofocus>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
          '</button>' +
        '</div>' +

        '<div class="v2-settings-body">' +
          /* 1. Theme Selector */
          '<section class="v2-settings-section" aria-label="تم نمایش">' +
            '<div class="v2-settings-section-label"><span>حالت نمایش و رنگ‌بندی</span><span id="v2ThemeActiveLabel">روشن</span></div>' +
            '<div class="v2-segmented-group" role="group" aria-label="انتخاب تم">' +
              '<button type="button" class="v2-seg-btn" data-v2-theme="light">☀️ روشن</button>' +
              '<button type="button" class="v2-seg-btn" data-v2-theme="dark">🌙 تاریک</button>' +
              '<button type="button" class="v2-seg-btn" data-v2-theme="system">🖥️ سیستم</button>' +
            '</div>' +
          '</section>' +

          /* 2. Typography & Zoom */
          '<section class="v2-settings-section" aria-label="تایپوگرافی">' +
            '<div class="v2-settings-section-label"><span>قلم مطالعه (تایپوگرافی)</span><span>بهینه برای RTL</span></div>' +
            '<div class="v2-segmented-group v2-segmented-group--2col" role="group" aria-label="انتخاب فونت">' +
              '<button type="button" class="v2-seg-btn" data-v2-font="vazirmatn">وزیرمتن</button>' +
              '<button type="button" class="v2-seg-btn" data-v2-font="googlesans">گوگل سنس (Google Sans)</button>' +
              '<button type="button" class="v2-seg-btn" data-v2-font="sahel">ساحل</button>' +
              '<button type="button" class="v2-seg-btn" data-v2-font="shabnam">شبنم</button>' +
            '</div>' +

            '<div class="v2-settings-section-label" style="margin-top: 4px;"><span>اندازه متن (بزرگ‌نمایی پیوسته)</span><span class="v2-zoom-readout" id="v2ZoomReadout" title="کلیک برای بازنشانی ۱۰۰٪">100%</span></div>' +
            '<div class="v2-zoom-row">' +
              '<button type="button" class="v2-zoom-step-btn" id="v2ZoomOutBtn" aria-label="کوچک‌تر کردن متن">A−</button>' +
              '<input type="range" class="v2-zoom-slider" id="v2ZoomSlider" min="80" max="140" step="5" value="100" aria-label="اسلایدر اندازه فونت">' +
              '<button type="button" class="v2-zoom-step-btn" id="v2ZoomInBtn" aria-label="بزرگ‌تر کردن متن">A+</button>' +
            '</div>' +
          '</section>' +

          /* 3. Reading Comfort & Study Shortcuts */
          '<section class="v2-settings-section" aria-label="آسایش مطالعه">' +
            '<div class="v2-settings-section-label"><span>آسایش مطالعه و ابزارها</span></div>' +
            (hasFocusToggle ? (
              '<div class="v2-toggle-row">' +
                '<div><div class="v2-toggle-label">حالت تمرکز (بدون حاشیه)</div><div class="v2-toggle-hint">پنهان‌سازی نوار فهرست کناری</div></div>' +
                '<button type="button" class="v2-switch" id="v2FocusSwitch" role="switch" aria-checked="false" aria-label="حالت تمرکز"></button>' +
              '</div>'
            ) : '') +
            '<div class="v2-toggle-row">' +
              '<div><div class="v2-toggle-label">کاهش انیمیشن‌ها</div><div class="v2-toggle-hint">پاسخ‌دهی فوری و صرفه‌جویی در باتری</div></div>' +
              '<button type="button" class="v2-switch" id="v2MotionSwitch" role="switch" aria-checked="false" aria-label="کاهش انیمیشن"></button>' +
            '</div>' +
            ((hasBookmarks || hasHighlights) ? (
              '<div class="v2-study-stats-grid">' +
                (hasHighlights ? '<button type="button" class="v2-study-stat-btn" id="v2OpenHighlightsBtn"><span>🖍️ هایلایت‌ها</span><span class="v2-study-stat-count" id="v2DrawerHlCount">۰</span></button>' : '') +
                (hasBookmarks ? '<button type="button" class="v2-study-stat-btn" id="v2OpenBookmarksBtn"><span>🔖 نشانک‌ها</span><span class="v2-study-stat-count" id="v2DrawerBmCount">۰</span></button>' : '') +
              '</div>'
            ) : '') +
          '</section>' +

          '<section class="v2-settings-section" aria-label="آزمایشگاه امکانات">' +
            '<div class="v2-settings-section-label"><span>🧪 آزمایشگاه امکانات (Labs)</span></div>' +
            '<div class="v2-toggle-row"><div><div class="v2-toggle-label">🧪 حالت ماژیک مستقیم (حذف منوی پیشفرض مرورگر — آزمایشی)</div><div class="v2-toggle-hint">جلوگیری کامل از باز شدن منوی کپی/جستجوی اندروید، آیفون و ویندوز هنگام هایلایت کردن</div></div><button type="button" class="v2-switch" id="v2BrushModeSwitch" role="switch" aria-checked="false" aria-label="حالت ماژیک مستقیم"></button></div>' +
            '<div class="v2-toggle-row"><div><div class="v2-toggle-label">✍️ قلم و دستخط آزمایشی (GoodNotes Ink Labs)</div><div class="v2-toggle-hint">حاشیه‌نویسی مستقیم روی کارت‌ها و برگه نقطه‌ای چسبان با پشتیبانی از قلم تبلت</div></div><button type="button" class="v2-switch" id="v2InkLabsSwitch" role="switch" aria-checked="false" aria-label="قلم و دستخط آزمایشی"></button></div>' +
          '</section>' +

          /* 4. Profile Backup / Restore + Cloud Hook */
          '<section class="v2-settings-section" aria-label="پشتیبان‌گیری پروفایل">' +
            '<div class="v2-settings-section-label"><span>پشتیبان‌گیری و انتقال پروفایل</span><span id="v2BackupCountTag">—</span></div>' +
            '<div style="font-size: 11.5px; color: var(--text-muted); line-height: 1.6;">' +
              'تمامی هایلایت‌ها، نشانک‌ها، فصول مطالعه‌شده، کارنامه آزمون‌ها و جلسات PMP در یک فایل JSON ذخیره و قابل بازیابی هستند.' +
            '</div>' +
            '<div class="v2-import-mode-row">' +
              '<label for="v2ImportModeSelect">روش بازیابی فایل:</label>' +
              '<select id="v2ImportModeSelect" class="v2-import-mode-select">' +
                '<option value="merge">ادغام امن با داده‌های فعلی (پیشنهادی)</option>' +
                '<option value="replace">جایگزینی کامل پروفایل</option>' +
              '</select>' +
            '</div>' +
            '<div class="v2-backup-actions">' +
              '<button type="button" class="v2-btn-primary" id="v2ExportProfileBtn">⬇️ دریافت بکاپ (.json)</button>' +
              '<button type="button" class="v2-btn-outline" id="v2ImportProfileBtn">⬆️ بازیابی بکاپ</button>' +
              '<input type="file" id="v2ImportProfileFile" accept=".json,application/json" style="display: none;">' +
            '</div>' +
            '<div class="v2-cloud-sync-pill">' +
              '<span><span class="v2-cloud-dot"></span>همگام‌سازی محلی (آفلاین) فعال</span>' +
              '<span style="font-size: 10.5px; opacity: 0.85;">Cloud Sync (به‌زودی)</span>' +
            '</div>' +
          '</section>' +
        '</div>' +
      '</div>';
  }

  function ensureSettingsDialog() {
    if (dialogEl && document.body.contains(dialogEl)) return dialogEl;
    dialogEl = document.getElementById('v2SettingsDialog');
    if (!dialogEl) {
      dialogEl = document.createElement('dialog');
      dialogEl.id = 'v2SettingsDialog';
      dialogEl.className = 'v2-settings-dialog';
      dialogEl.setAttribute('aria-label', 'تنظیمات و پروفایل مطالعه');
      dialogEl.innerHTML = buildDrawerHtml();
      document.body.appendChild(dialogEl);
    }
    sheetEl = dialogEl.querySelector('.v2-settings-sheet');
    bindDialogEvents();
    syncDrawerControls();
    return dialogEl;
  }

  function openSettingsDrawer() {
    var dlg = ensureSettingsDialog();
    if (!dlg || dlg.open) return;
    isClosing = false;
    syncDrawerControls();
    if (typeof dlg.showModal === 'function') {
      dlg.showModal();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          dlg.classList.add('is-visible');
        });
      });
    }
  }

  function closeSettingsDrawer() {
    if (!dialogEl || !dialogEl.open || isClosing) return;
    isClosing = true;
    dialogEl.classList.remove('is-visible');
    setTimeout(function () {
      if (dialogEl && dialogEl.open) dialogEl.close();
      isClosing = false;
    }, 240);
  }

  function bindDialogEvents() {
    if (!dialogEl || dialogEl.dataset.v2Bound === '1') return;
    dialogEl.dataset.v2Bound = '1';

    var closeBtn = dialogEl.querySelector('#v2SettingsCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeSettingsDrawer);

    dialogEl.addEventListener('click', function (e) {
      if (sheetEl && !sheetEl.contains(e.target)) {
        closeSettingsDrawer();
      }
    });

    dialogEl.addEventListener('cancel', function (e) {
      if (e.cancelable) {
        e.preventDefault();
        closeSettingsDrawer();
      }
    });

    // Theme buttons
    dialogEl.querySelectorAll('[data-v2-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pref = btn.getAttribute('data-v2-theme');
        applyThemePreference(pref, true);
      });
    });

    // Font buttons
    dialogEl.querySelectorAll('[data-v2-font]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-v2-font');
        applyFontFamily(f, true);
        showToast('قلم مطالعه تغییر یافت');
      });
    });

    // Zoom controls
    var zOut = dialogEl.querySelector('#v2ZoomOutBtn');
    var zIn = dialogEl.querySelector('#v2ZoomInBtn');
    var zSlider = dialogEl.querySelector('#v2ZoomSlider');
    var zReadout = dialogEl.querySelector('#v2ZoomReadout');

    if (zOut) zOut.addEventListener('click', function () { applyFontScale(getFontScale() - 0.05, true); });
    if (zIn) zIn.addEventListener('click', function () { applyFontScale(getFontScale() + 0.05, true); });
    if (zSlider) zSlider.addEventListener('input', function () { applyFontScale(parseInt(zSlider.value, 10) / 100, true); });
    if (zReadout) zReadout.addEventListener('click', function () { applyFontScale(1.0, true); showToast('اندازه متن به ۱۰۰٪ بازنشانی شد'); });

    // Switches
    var focusSw = dialogEl.querySelector('#v2FocusSwitch');
    if (focusSw) {
      focusSw.addEventListener('click', function () {
        if (window.appState && typeof window.appState.toggleFocusMode === 'function') {
          window.appState.toggleFocusMode();
        } else {
          document.body.classList.toggle('focus-mode-active');
        }
        syncDrawerControls();
      });
    }

    var motionSw = dialogEl.querySelector('#v2MotionSwitch');
    if (motionSw) {
      motionSw.addEventListener('click', function () {
        var next = !document.documentElement.classList.contains('v2-reduced-motion');
        applyReducedMotion(next, true);
      });
    }

    var brushSw = dialogEl.querySelector('#v2BrushModeSwitch'), inkSw = dialogEl.querySelector('#v2InkLabsSwitch');
    if (brushSw) brushSw.addEventListener('click', function () { applyBrushMode(!isBrushMode(), true); });
    if (inkSw) inkSw.addEventListener('click', function () { applyInkLabs(!isInkLabs(), true); });

    var hlS = dialogEl.querySelector('#v2OpenHighlightsBtn'), bmS = dialogEl.querySelector('#v2OpenBookmarksBtn');
    if (hlS) hlS.addEventListener('click', function () {
      closeSettingsDrawer();
      setTimeout(function () { var t = document.getElementById('highlightsToggleBtn'); if (t) t.click(); else if (window.StudyFeatures && window.StudyFeatures.openHighlightsModal) window.StudyFeatures.openHighlightsModal(); }, 250);
    });
    if (bmS) bmS.addEventListener('click', function () {
      closeSettingsDrawer();
      setTimeout(function () { var t = document.getElementById('bookmarksToggleBtn'); if (t) t.click(); }, 250);
    });

    // Backup Export / Import
    var exportBtn = dialogEl.querySelector('#v2ExportProfileBtn');
    var importBtn = dialogEl.querySelector('#v2ImportProfileBtn');
    var importInput = dialogEl.querySelector('#v2ImportProfileFile');
    var importModeSel = dialogEl.querySelector('#v2ImportModeSelect');

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        MedicalismSync.downloadBackupFile();
      });
    }

    if (importBtn && importInput) {
      importBtn.addEventListener('click', function () {
        importInput.value = '';
        importInput.click();
      });
      importInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          try {
            var mode = importModeSel ? importModeSel.value : 'merge';
            var res = MedicalismSync.importSnapshot(ev.target.result, mode);
            showToast('پروفایل بازیابی شد (' + toPersianDigits(res.appliedKeys) + ' کلید)');
          } catch (err) {
            alert('خطا در خواندن فایل پشتیبان: ' + err.message);
          }
        };
        reader.readAsText(file, 'utf-8');
      });
    }
  }

  function syncDrawerControls() {
    syncQuickDock();
    if (!dialogEl) return;
    var pref = getThemePreference();
    var resolved = resolveTheme(pref);
    var labelMap = { light: 'روشن', dark: 'تاریک', system: 'خودکار (' + (resolved === 'dark' ? 'تاریک' : 'روشن') + ')' };
    var lbl = dialogEl.querySelector('#v2ThemeActiveLabel');
    if (lbl) lbl.textContent = labelMap[pref] || 'روشن';

    dialogEl.querySelectorAll('[data-v2-theme]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-v2-theme') === pref);
    });

    var fam = getFontFamily();
    dialogEl.querySelectorAll('[data-v2-font]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-v2-font') === fam);
    });

    var scale = getFontScale();
    var pct = Math.round(scale * 100);
    var zSlider = dialogEl.querySelector('#v2ZoomSlider');
    var zReadout = dialogEl.querySelector('#v2ZoomReadout');
    if (zSlider) zSlider.value = String(pct);
    if (zReadout) zReadout.textContent = pct + '%';

    var focusSw = dialogEl.querySelector('#v2FocusSwitch');
    if (focusSw) {
      var isFocus = document.body.classList.contains('focus-mode-active') || (window.appState && window.appState.focusMode);
      focusSw.setAttribute('aria-checked', isFocus ? 'true' : 'false');
    }

    var motionSw = dialogEl.querySelector('#v2MotionSwitch');
    if (motionSw) {
      motionSw.setAttribute('aria-checked', document.documentElement.classList.contains('v2-reduced-motion') ? 'true' : 'false');
    }

    var brushSw = dialogEl.querySelector('#v2BrushModeSwitch'), inkSw = dialogEl.querySelector('#v2InkLabsSwitch');
    if (brushSw) brushSw.setAttribute('aria-checked', isBrushMode() ? 'true' : 'false');
    if (inkSw) inkSw.setAttribute('aria-checked', isInkLabs() ? 'true' : 'false');

    // Study Counts
    try {
      var hlArr = JSON.parse(safeGet('medicalism_highlights_v1', '[]') || '[]');
      var bmArr = JSON.parse(safeGet('med_bookmarks', '[]') || '[]');
      var hlCount = Array.isArray(hlArr) ? hlArr.length : 0;
      var bmCount = Array.isArray(bmArr) ? bmArr.length : 0;
      var hlEl = dialogEl.querySelector('#v2DrawerHlCount');
      var bmEl = dialogEl.querySelector('#v2DrawerBmCount');
      if (hlEl) hlEl.textContent = toPersianDigits(hlCount);
      if (bmEl) bmEl.textContent = toPersianDigits(bmCount);

      var countTag = dialogEl.querySelector('#v2BackupCountTag');
      if (countTag) {
        countTag.textContent = toPersianDigits(hlCount) + ' هایلایت • ' + toPersianDigits(bmCount) + ' نشانک';
      }
    } catch (e) {}

  }

  /* ========================================================================
   * 6. FLOATING LEFT QUICK-DOCK FOR DESKTOP COURSE PAGES
   * ======================================================================== */
  function ensureQuickDock() {
    var contentArea = document.getElementById('chapterContentArea') || document.getElementById('main-content');
    if (!contentArea) return;
    if (document.getElementById('v2QuickDock')) return;

    var hasSearch = Boolean(document.querySelector('.btn-search-trigger'));
    var hasCram = Boolean(document.getElementById('examCramToggleBtn'));
    var hasHl = Boolean(document.getElementById('highlightsToggleBtn'));
    var hasBm = Boolean(document.getElementById('bookmarksToggleBtn'));
    if (!hasSearch && !hasHl && !hasBm) return;

    var dock = document.createElement('aside');
    dock.id = 'v2QuickDock';
    dock.className = 'v2-quick-dock';
    dock.setAttribute('aria-label', 'دسترسی سریع ابزارهای مطالعه');

    var html = '';
    if (hasHl) html += '<button type="button" class="v2-dock-btn" id="v2DockBrushBtn" aria-pressed="false" title="حالت ماژیک مستقیم (روشن/خاموش)" aria-label="حالت ماژیک مستقیم"><span>🖍️</span></button><button type="button" class="v2-dock-btn" data-dock-target="#highlightsToggleBtn" title="لیست هایلایت‌های من" aria-label="لیست هایلایت‌های من"><span>📋</span><span class="v2-dock-badge" id="v2DockHlBadge"></span></button>';
    if (hasCram) {
      html += '<button type="button" class="v2-dock-btn" id="v2DockCramBtn" data-dock-target="#examCramToggleBtn" title="حالت مرور سریع / شب امتحان" aria-label="حالت مرور سریع">' +
        '<span>⚡</span></button>';
    }
    if (hasSearch) {
      html += '<button type="button" class="v2-dock-btn" data-dock-target=".btn-search-trigger" title="جستجوی سریع (⌘K)" aria-label="جستجو">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button>';
    }
    if (hasBm) {
      html += '<button type="button" class="v2-dock-btn" data-dock-target="#bookmarksToggleBtn" title="نشانک‌های من" aria-label="نشانک‌ها">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
        '<span class="v2-dock-badge" id="v2DockBmBadge"></span></button>';
    }

    dock.innerHTML = html;
    document.body.appendChild(dock);
    document.body.classList.add('has-v2-quick-dock');

    var db = dock.querySelector('#v2DockBrushBtn');
    if (db) db.addEventListener('click', function () { applyBrushMode(!isBrushMode(), true); });
    dock.querySelectorAll('.v2-dock-btn[data-dock-target]').forEach(function (btn) {
      btn.addEventListener('click', function () { var t = document.querySelector(btn.getAttribute('data-dock-target')); if (t) t.click(); });
    });
    syncQuickDock();
  }

  function syncQuickDock() {
    var dock = document.getElementById('v2QuickDock');
    if (!dock) return;

    try {
      var hlArr = JSON.parse(safeGet('medicalism_highlights_v1', '[]') || '[]');
      var bmArr = JSON.parse(safeGet('med_bookmarks', '[]') || '[]');
      var hlBadge = dock.querySelector('#v2DockHlBadge');
      var bmBadge = dock.querySelector('#v2DockBmBadge');
      if (hlBadge) {
        var hc = Array.isArray(hlArr) ? hlArr.length : 0;
        hlBadge.textContent = hc > 99 ? '99+' : String(hc);
        hlBadge.classList.toggle('has-count', hc > 0);
      }
      if (bmBadge) {
        var bc = Array.isArray(bmArr) ? bmArr.length : 0;
        bmBadge.textContent = bc > 99 ? '99+' : String(bc);
        bmBadge.classList.toggle('has-count', bc > 0);
      }
    } catch (e) {}

    var cramSrc = document.getElementById('examCramToggleBtn');
    var dockCram = dock.querySelector('#v2DockCramBtn');
    if (dockCram && cramSrc) {
      var hidden = cramSrc.style.display === 'none' || cramSrc.hasAttribute('hidden');
      dockCram.style.display = hidden ? 'none' : 'inline-flex';
      dockCram.classList.toggle('is-active', cramSrc.classList.contains('is-active'));
    }

    var db = dock.querySelector('#v2DockBrushBtn');
    if (db) { var ba = isBrushMode(); db.setAttribute('aria-pressed', ba ? 'true' : 'false'); db.classList.toggle('is-active', ba); }
  }

  /* ========================================================================
   * 7. EARLY INIT + DOM READY BINDING
   * ======================================================================== */
  applyThemePreference(getThemePreference(), false);
  applyFontFamily(getFontFamily(), false);
  applyFontScale(getFontScale(), false);
  if (safeGet('med_reduced_motion', 'false') === 'true') {
    document.documentElement.classList.add('v2-reduced-motion');
  }

  if (mediaQuery) {
    var onSystemSchemeChange = function () {
      if (getThemePreference() === 'system') {
        applyThemePreference('system', false);
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onSystemSchemeChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onSystemSchemeChange);
    }
  }

  window.addEventListener('storage', function (e) {
    if (!e || !e.key) return;
    if (e.key === 'med_theme') applyThemePreference(getThemePreference(), false);
    else if (e.key === 'med_font_family') applyFontFamily(getFontFamily(), false);
    else if (e.key === 'med_font_scale') applyFontScale(getFontScale(), false);
    else if (e.key === 'med_reduced_motion') applyReducedMotion(e.newValue === 'true', false);
    else if (e.key === BRUSH_KEY) applyBrushMode(isBrushMode(), false);
    else if (e.key === INK_KEY) applyInkLabs(isInkLabs(), false);
    else if (e.key === 'medicalism_ink_labs_v1' && window.MedicalismInkLabs && window.MedicalismInkLabs.refresh) window.MedicalismInkLabs.refresh();
    else if (e.key === 'medicalism_highlights_v1' || e.key === 'med_bookmarks') syncDrawerControls();
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Re-apply font scale for dynamic elements like #pmpAppRoot
    applyFontScale(getFontScale(), false);
    initReadingProgressGPU();
    ensureQuickDock();
    if (isBrushMode() && getReadingEl()) applyBrushMode(true, false);
    if (isInkLabs() && getReadingEl()) applyInkLabs(true, false);

    document.addEventListener('click', function (e) {
      var trigger = e.target && e.target.closest ? e.target.closest('[data-v2-settings-trigger], #v2SettingsBtn') : null;
      if (trigger) {
        e.preventDefault();
        openSettingsDrawer();
      }
    });

    // Keep dock & drawer synced when study state updates
    window.addEventListener('chapterRendered', syncQuickDock);
    window.addEventListener('cramModeChanged', syncQuickDock);
    if (window.appState && typeof window.appState.subscribe === 'function') {
      window.appState.subscribe('bookmarks', syncDrawerControls);
      window.appState.subscribe('fontScale', syncDrawerControls);
      window.appState.subscribe('fontFamily', syncDrawerControls);
      window.appState.subscribe('theme', syncDrawerControls);
    }
  });

  window.MedicalismShell = {
    openSettings: openSettingsDrawer,
    closeSettings: closeSettingsDrawer,
    setTheme: function (pref) { return applyThemePreference(pref, true); },
    getThemePreference: getThemePreference,
    setFontFamily: function (fam) { return applyFontFamily(fam, true); },
    getFontFamily: getFontFamily,
    setFontScale: function (scale) { return applyFontScale(scale, true); },
    getFontScale: getFontScale,
    setBrushMode: function (on) { return applyBrushMode(on, true); },
    toggleBrushMode: function () { return applyBrushMode(!isBrushMode(), true); },
    isBrushMode: isBrushMode,
    setInkLabs: function (on) { return applyInkLabs(on, true); },
    isInkLabs: isInkLabs,
    syncDock: syncQuickDock,
    showToast: showToast
  };
})();
