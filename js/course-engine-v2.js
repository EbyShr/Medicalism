/**
 * MEDICALISM ALBORZ — V2 NATIVE COURSE ENGINE
 * Universal zero-regex renderer & study workspace for medicalism.chapter.v2 courses.
 * Supports all 10 semantic blocks, dynamic chapter chunking (<100KB),
 * smart Cram Mode gating, and 100% Offline Highlighter compatibility.
 */
(function () {
  'use strict';

  /* ========================================================================
   * 1. COMPACT RFC1951 RAW INFLATE (for chunks > 80 KB that used deflate)
   * ======================================================================== */
  var LENS = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  var LEXT = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  var DISTS = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  var DEXT = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  var ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

  function buildTree(lengths, numSyms) {
    var counts = new Int32Array(16), i;
    for (i = 0; i < numSyms; i++) counts[lengths[i]]++;
    counts[0] = 0;
    var offs = new Int32Array(16);
    for (var b = 1; b <= 15; b++) offs[b] = (b === 1) ? 0 : (offs[b - 1] + counts[b - 1]);
    var syms = new Int32Array(numSyms);
    for (i = 0; i < numSyms; i++) if (lengths[i] !== 0) syms[offs[lengths[i]]++] = i;
    return { counts: counts, syms: syms };
  }

  function decodeSym(state, tree) {
    var code = 0, first = 0, index = 0;
    for (var len = 1; len <= 15; len++) {
      if (state.bitCount === 0) { state.bitBuf = state.src[state.pos++]; state.bitCount = 8; }
      code |= (state.bitBuf & 1); state.bitBuf >>>= 1; state.bitCount--;
      var count = tree.counts[len];
      if (code - count < first) return tree.syms[index + (code - first)];
      index += count; first += count; first <<= 1; code <<= 1;
    }
    throw new Error('Invalid Huffman code');
  }

  function readBits(state, n) {
    var val = state.bitBuf;
    while (state.bitCount < n) { val |= (state.src[state.pos++] << state.bitCount); state.bitCount += 8; }
    state.bitBuf = val >>> n; state.bitCount -= n;
    return val & ((1 << n) - 1);
  }

  var fl = new Int32Array(288), k;
  for (k = 0; k <= 143; k++) fl[k] = 8;
  for (k = 144; k <= 255; k++) fl[k] = 9;
  for (k = 256; k <= 279; k++) fl[k] = 7;
  for (k = 280; k <= 287; k++) fl[k] = 8;
  var FIXED_LIT = buildTree(fl, 288);
  var fd = new Int32Array(30);
  for (k = 0; k < 30; k++) fd[k] = 5;
  var FIXED_DIST = buildTree(fd, 30);

  function inflateRaw(src) {
    var st = { src: src, pos: 0, bitBuf: 0, bitCount: 0 };
    var out = new Uint8Array(Math.max(src.length * 4, 4096)), outPos = 0;
    function cap(extra) {
      if (outPos + extra > out.length) {
        var next = new Uint8Array(Math.max(out.length * 2, outPos + extra + 4096));
        next.set(out.subarray(0, outPos)); out = next;
      }
    }
    var bfinal = 0;
    do {
      bfinal = readBits(st, 1);
      var btype = readBits(st, 2);
      if (btype === 0) {
        st.bitBuf = 0; st.bitCount = 0;
        var len = st.src[st.pos] | (st.src[st.pos + 1] << 8); st.pos += 4;
        cap(len); out.set(st.src.subarray(st.pos, st.pos + len), outPos);
        st.pos += len; outPos += len;
      } else {
        var lt, dt;
        if (btype === 1) { lt = FIXED_LIT; dt = FIXED_DIST; }
        else {
          var hlit = readBits(st, 5) + 257, hdist = readBits(st, 5) + 1, hclen = readBits(st, 4) + 4;
          var clens = new Int32Array(19), i;
          for (i = 0; i < hclen; i++) clens[ORDER[i]] = readBits(st, 3);
          var clTree = buildTree(clens, 19), lengths = new Int32Array(hlit + hdist);
          i = 0;
          while (i < hlit + hdist) {
            var sym = decodeSym(st, clTree);
            if (sym < 16) lengths[i++] = sym;
            else {
              var rep = 0, val = 0;
              if (sym === 16) { val = lengths[i - 1]; rep = 3 + readBits(st, 2); }
              else if (sym === 17) rep = 3 + readBits(st, 3);
              else rep = 11 + readBits(st, 7);
              while (rep--) lengths[i++] = val;
            }
          }
          lt = buildTree(lengths, hlit); dt = buildTree(lengths.subarray(hlit), hdist);
        }
        while (true) {
          var s = decodeSym(st, lt);
          if (s < 256) { cap(1); out[outPos++] = s; }
          else if (s === 256) break;
          else {
            var li = s - 257, length = LENS[li] + (LEXT[li] ? readBits(st, LEXT[li]) : 0);
            var di = decodeSym(st, dt), dist = DISTS[di] + (DEXT[di] ? readBits(st, DEXT[di]) : 0);
            cap(length);
            for (var c = 0; c < length; c++) { out[outPos] = out[outPos - dist]; outPos++; }
          }
        }
      }
    } while (!bfinal);
    return out.subarray(0, outPos);
  }

  window.__MEDICALISM_V2_CACHE = window.__MEDICALISM_V2_CACHE || {};
  window.__decodeV2Payload = function (b64) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8').decode(inflateRaw(bytes)));
  };

  /* ========================================================================
   * 2. HELPERS & SAFE INLINE MARKUP FORMATTER
   * ======================================================================== */
  var HL_KEY = 'medicalism_highlights_v1';
  var BM_KEY = 'med_bookmarks';
  var DONE_KEY = 'med_completed_chapters';
  var CRAM_KEY = 'medicalism_exam_cram_mode';

  function toFa(n) {
    if (n === null || n === undefined) return '';
    var d = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(n).replace(/[0-9]/g, function (x) { return d[+x]; });
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmt(raw) {
    if (!raw) return '';
    var s = esc(raw);
    var tokens = [];
    function stash(html) {
      var tok = '\uE000T' + tokens.length + '\uE001';
      tokens.push(html);
      return tok;
    }
    // 1. Nested bold + backtick (**`G5P0222`** or **`BMI`**)
    s = s.replace(/\*\*`([^`]+)`\*\*/g, function (_, inner) {
      var clean = inner.replace(/^\*\*|\*\*$/g, '');
      return stash('<strong class="v2-ltr-strong"><bdi class="ltr-term is-bold">' + clean + '</bdi></strong>');
    });
    // 2. Remaining standalone backtick LTR tokens (also handle any accidental inner **bold**)
    s = s.replace(/`([^`]+)`/g, function (_, inner) {
      var formattedInner = inner.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return stash('<bdi class="ltr-term">' + formattedInner + '</bdi>');
    });
    // 3. Key highlight phrases ==...==
    s = s.replace(/==([^=]+)==/g, '<span class="v2-key-phrase">$1</span>');
    // 4. Bold prose (**...**, including spans containing stashed <bdi> tokens or newlines)
    s = s.replace(/\*\*((?:(?!\*\*)[\s\S])+)\*\*/g, '<strong>$1</strong>');
    // 5. Restore protected LTR tokens & convert newlines to <br> for table cells/text blocks
    s = s.replace(/\uE000T(\d+)\uE001/g, function (_, i) { return tokens[+i] || ''; });
    s = s.replace(/\r?\n/g, '<br>');
    return s;
  }

  function formatCalloutBody(raw) {
    if (!raw) return '';
    var text = String(raw).replace(/\r\n?/g, '\n').trim();
    if (!text) return '';

    // Detect sequential Persian or Latin numbered points: "۱) ... ۲) ..." or "1) ... 2) ..."
    var numRe = /(?:^|(?<=[\s.!؟؛:\u200c]))([۰-۹]{1,2}|[1-9][0-9]?)\)\s+/g;
    var matches = [];
    var m;
    while ((m = numRe.exec(text)) !== null) {
      var asciiNum = parseInt(
        m[1].replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }),
        10
      );
      matches.push({
        label: m[1],
        num: asciiNum,
        markerStart: m.index,
        contentStart: m.index + m[0].length
      });
    }

    var isOrderedPoints = matches.length >= 2 && matches[0].num === 1;
    if (isOrderedPoints) {
      for (var i = 1; i < matches.length; i++) {
        if (matches[i].num <= matches[i - 1].num) {
          isOrderedPoints = false;
          break;
        }
      }
    }

    if (isOrderedPoints) {
      var intro = text.slice(0, matches[0].markerStart).trim();
      var html = intro ? '<p class="v2-callout-para">' + fmt(intro) + '</p>' : '';
      html += '<ul class="v2-callout-list">';
      for (var idx = 0; idx < matches.length; idx++) {
        var end = idx + 1 < matches.length ? matches[idx + 1].markerStart : text.length;
        var itemText = text.slice(matches[idx].contentStart, end).trim();
        html += '<li class="v2-callout-item">' +
          '<span class="v2-callout-num">' + esc(matches[idx].label) + '</span>' +
          '<span class="v2-callout-text">' + fmt(itemText) + '</span>' +
        '</li>';
      }
      html += '</ul>';
      return html;
    }

    if (text.indexOf('\n') !== -1) {
      return text.split(/\n+/).map(function (line) {
        var trimmed = line.trim();
        return trimmed ? '<p class="v2-callout-para">' + fmt(trimmed) + '</p>' : '';
      }).join('');
    }
    return fmt(text);
  }

  function readLS(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function writeLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  /* ========================================================================
   * 3. ENGINE STATE & LOADER
   * ======================================================================== */
  var state = {
    courseId: 'obgyn',
    courseTitle: 'زنان و زایمان',
    index: [],
    activeChapterId: null,
    activeChapter: null,
    cramActive: false,
    inflight: {}
  };

  function loadChapterData(chapterId) {
    if (window.__MEDICALISM_V2_CACHE[chapterId]) {
      return Promise.resolve(window.__MEDICALISM_V2_CACHE[chapterId]);
    }
    var entry = state.index.find(function (c) { return c.id === chapterId; }) || state.index[0];
    if (!entry) return Promise.reject(new Error('No chapters in index'));
    if (state.inflight[entry.id]) return state.inflight[entry.id];

    var src = entry.dataFile || ('./data/' + state.courseId + '/' + entry.id + '.js');
    var p = new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = src + (src.indexOf('?') === -1 ? '?v=20261121' : '');
      sc.async = true;
      sc.onload = function () {
        delete state.inflight[entry.id];
        var ch = window.__MEDICALISM_V2_CACHE[entry.id];
        if (ch) resolve(ch);
        else reject(new Error('Missing chapter payload for ' + entry.id));
      };
      sc.onerror = function () {
        delete state.inflight[entry.id];
        reject(new Error('Failed loading ' + src));
      };
      document.body.appendChild(sc);
    });
    state.inflight[entry.id] = p;
    return p;
  }

  /* ========================================================================
   * 4. ALL 10 SEMANTIC BLOCK RENDERERS
   * ======================================================================== */
  function blockAttrs(b, cramOverride) {
    var cram = typeof cramOverride === 'boolean' ? cramOverride : Boolean(b.cram);
    return 'data-v2-block="' + esc(b.type || '') + '" data-block-type="' + esc(b.type || '') + '" data-block-id="' + esc(b.blockId || b.id) + '" data-cram="' + (cram ? 'true' : 'false') + '"';
  }

  function renderBlock(b, chId) {
    if (!b || !b.type) return '';
    switch (b.type) {
      case 'prose': return renderProse(b);
      case 'stat_strip': return renderStatStrip(b);
      case 'accordion': return renderAccordion(b, chId);
      case 'table': return renderTable(b);
      case 'callout': return renderCallout(b);
      case 'pathway': return renderPathway(b);
      case 'gestational_timeline': return renderTimeline(b);
      case 'osce_card': return renderOsceCard(b);
      case 'ward_orders': return renderWardOrders(b, chId);
      case 'scoring_table': return renderScoringTable(b);
      default: return '';
    }
  }

  function renderProse(b) {
    var html = '<div class="v2-prose" ' + blockAttrs(b) + '>';
    (b.paragraphs || []).forEach(function (p) {
      html += '<p>' + fmt(p) + '</p>';
    });
    if (Array.isArray(b.bullets) && b.bullets.length) {
      html += '<ul>';
      b.bullets.forEach(function (li) { html += '<li>' + fmt(li) + '</li>'; });
      html += '</ul>';
    }
    html += '</div>';
    return html;
  }

  function renderStatStrip(b) {
    var html = '<div class="v2-stat-strip" ' + blockAttrs(b) + '>';
    (b.items || []).forEach(function (it) {
      html += '<div class="v2-stat-card" data-tone="' + esc(it.tone || 'info') + '">' +
        '<div class="v2-stat-label">' + fmt(it.label) + '</div>' +
        '<div class="v2-stat-value">' + fmt(it.value) + '</div>' +
        (it.note ? '<div class="v2-stat-note">' + fmt(it.note) + '</div>' : '') +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderAccordion(b, chId) {
    var openAttr = b.collapsedByDefault === false ? ' open' : '';
    var inner = (b.blocks || []).map(function (nb) { return renderBlock(nb, chId); }).join('');
    return '<details class="v2-accordion" ' + blockAttrs(b) + openAttr + '>' +
      '<summary>' +
        '<span>' + fmt(b.title) + '</span>' +
        '<svg class="v2-acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
      '</summary>' +
      '<div class="v2-accordion-body">' + inner + '</div>' +
    '</details>';
  }

  function renderTable(b) {
    var html = '<div class="v2-table-card" ' + blockAttrs(b) + '>';
    if (b.caption) html += '<div class="v2-table-caption">' + fmt(b.caption) + '</div>';
    html += '<div class="v2-table-scroll"><table class="v2-table"><thead><tr>';
    (b.columns || []).forEach(function (col) { html += '<th>' + fmt(col) + '</th>'; });
    html += '</tr></thead><tbody>';
    (b.rows || []).forEach(function (row) {
      html += '<tr>';
      row.forEach(function (cell) {
        if (cell && typeof cell === 'object') {
          var tone = cell.tone || 'neutral';
          html += '<td>' + (cell.pill ? '<span class="v2-cell-pill tone-' + esc(tone) + '">' + fmt(cell.text) + '</span>' : fmt(cell.text)) + '</td>';
        } else {
          html += '<td>' + fmt(cell) + '</td>';
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
  }

  function renderCallout(b) {
    var icons = { pearl: '💎', exam_trap: '⚠️', red_flag: '🚨', acog_update: '📋' };
    var icon = icons[b.kind] || '📌';
    return '<div class="v2-callout" data-kind="' + esc(b.kind || 'pearl') + '" ' + blockAttrs(b) + '>' +
      '<div class="v2-callout-title"><span>' + icon + '</span><span>' + fmt(b.title) + '</span></div>' +
      '<div class="v2-callout-body">' + formatCalloutBody(b.body) + '</div>' +
    '</div>';
  }

  function renderPathway(b) {
    var html = '<div class="v2-pathway-card" ' + blockAttrs(b) + '>' +
      '<div class="v2-pathway-title">🧭 ' + fmt(b.title) + '</div>' +
      '<div class="v2-pathway-steps">';
    (b.steps || []).forEach(function (st) {
      html += '<div class="v2-pathway-step" data-tone="' + esc(st.tone || 'info') + '">' +
        '<div class="v2-step-num"><span>گام ' + toFa(st.step) + '</span></div>' +
        '<div class="v2-step-label">' + fmt(st.label) + '</div>' +
        (st.detail ? '<div class="v2-step-detail">' + fmt(st.detail) + '</div>' : '');
      if (Array.isArray(st.branches) && st.branches.length) {
        html += '<div class="v2-branches">';
        st.branches.forEach(function (br) {
          html += '<div class="v2-branch-box" data-urgency="' + esc(br.urgency || 'routine') + '">' +
            '<div style="font-weight:800;margin-bottom:3px;">' +
              (br.badge ? '<span class="v2-pill" style="margin-inline-end:6px;">' + esc(br.badge) + '</span>' : '') +
              fmt(br.condition) +
            '</div>' +
            '<div style="color:var(--text-secondary);line-height:1.6;">' + fmt(br.action) + '</div>' +
          '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderTimeline(b) {
    var nodes = b.nodes || [];
    var activeId = b.defaultNodeId || (nodes[0] && nodes[0].id) || '';
    var activeNode = nodes.find(function (n) { return n.id === activeId; }) || nodes[0];
    var uid = esc(b.blockId || b.id);

    var html = '<div class="v2-timeline-card" data-timeline-uid="' + uid + '" ' + blockAttrs(b) + '>' +
      '<div class="v2-timeline-header">' +
        '<div class="v2-timeline-title">📅 ' + fmt(b.title) + '</div>' +
        (b.subtitle ? '<div class="v2-timeline-sub">' + fmt(b.subtitle) + '</div>' : '') +
      '</div>' +
      '<div class="v2-timeline-track" role="tablist" aria-label="' + esc(b.title) + '">';

    nodes.forEach(function (nd) {
      var isAct = nd.id === activeNode.id;
      html += '<button type="button" class="v2-tl-node ' + (isAct ? 'is-active' : '') + '" role="tab" aria-selected="' + (isAct ? 'true' : 'false') + '" data-tl-node="' + esc(nd.id) + '">' +
        '<span class="v2-tl-label">' + fmt(nd.label) + '</span>' +
        (nd.range ? '<span class="v2-tl-range">' + esc(nd.range) + '</span>' : '') +
      '</button>';
    });
    html += '</div><div class="v2-tl-panel" role="tabpanel">' + renderTimelinePanelInner(activeNode) + '</div></div>';
    return html;
  }

  function renderTimelinePanelInner(nd) {
    if (!nd) return '';
    var toneMap = { danger: 'danger', warning: 'warning', success: 'success', info: 'info', neutral: 'neutral' };
    var tone = toneMap[nd.tone] || 'info';
    var html = '<div class="v2-tl-panel-head">' +
      '<div class="v2-tl-headline">' + fmt(nd.headline) + '</div>' +
      (nd.badge ? '<span class="v2-cell-pill tone-' + tone + '">' + esc(nd.badge) + '</span>' : '') +
    '</div>' +
    '<div class="v2-tl-summary">' + fmt(nd.summary) + '</div>';
    if (Array.isArray(nd.actions) && nd.actions.length) {
      html += '<ul class="v2-tl-actions">';
      nd.actions.forEach(function (a) { html += '<li>' + fmt(a) + '</li>'; });
      html += '</ul>';
    }
    if (Array.isArray(nd.checklist) && nd.checklist.length) {
      html += '<div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--border-subtle);font-size:12px;"><strong>پایش بالینی:</strong> ';
      html += nd.checklist.map(fmt).join(' • ') + '</div>';
    }
    if (Array.isArray(nd.redFlags) && nd.redFlags.length) {
      html += '<div style="margin-top:10px;padding:8px 10px;border-radius:10px;background:var(--state-danger-bg);border:1px solid var(--state-danger-border);font-size:12.5px;color:var(--state-danger);font-weight:700;">🚨 ' +
        nd.redFlags.map(fmt).join(' | ') + '</div>';
    }
    return html;
  }

  function renderOsceCard(b) {
    var html = '<div class="v2-osce-card" ' + blockAttrs(b) + '>' +
      '<div class="v2-osce-head">' +
        '<span class="v2-osce-badge">🩺 ایستگاه بالینی و OSCE</span>' +
        '<div class="v2-osce-title">' + fmt(b.title) + '</div>' +
        '<div class="v2-osce-scenario">' + fmt(b.scenario) + '</div>' +
      '</div><div class="v2-osce-grid">';

    if (Array.isArray(b.history) && b.history.length) {
      html += '<div class="v2-osce-box"><div class="v2-osce-box-title">شرح حال هدفمند (History)</div><ul>' +
        b.history.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></div>';
    }
    if (Array.isArray(b.physicalExam) && b.physicalExam.length) {
      html += '<div class="v2-osce-box"><div class="v2-osce-box-title">معاینه فیزیکی (Physical Exam)</div><ul>' +
        b.physicalExam.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></div>';
    }
    if (b.workup) {
      html += '<div class="v2-osce-box"><div class="v2-osce-box-title">آزمایشات و تصویربرداری (Workup)</div><ul>' +
        (b.workup.labs || []).map(function (x) { return '<li><strong>آزمایشات:</strong> ' + fmt(x) + '</li>'; }).join('') +
        (b.workup.imaging || []).map(function (x) { return '<li><strong>تصویربرداری:</strong> ' + fmt(x) + '</li>'; }).join('') +
      '</ul></div>';
    }
    if (Array.isArray(b.differential) && b.differential.length) {
      html += '<div class="v2-osce-box"><div class="v2-osce-box-title">تشخیص‌های افتراقی کلیدی</div><ul>' +
        b.differential.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></div>';
    }
    html += '</div>';

    if (b.ctgNst) {
      var c = b.ctgNst;
      html += '<div class="v2-ctg-strip">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">' +
          '<strong style="font-size:13px;color:var(--state-info);">📈 تفسیر نوار قلب جنین (CTG / NST)</strong>' +
          '<span class="v2-cell-pill tone-info">' + fmt(c.category) + '</span>' +
        '</div>' +
        '<div class="v2-ctg-grid">' +
          '<div><strong>Baseline:</strong> ' + fmt(c.baseline) + '</div>' +
          '<div><strong>Variability:</strong> ' + fmt(c.variability) + '</div>' +
          (c.accelerations ? '<div><strong>Accelerations:</strong> ' + fmt(c.accelerations) + '</div>' : '') +
          (c.decelerations ? '<div><strong>Decelerations:</strong> ' + fmt(c.decelerations) + '</div>' : '') +
        '</div>' +
        '<div style="font-size:12.5px;color:var(--text-primary);font-weight:700;">← اقدام بالینی: ' + fmt(c.action) + '</div>' +
      '</div>';
    }

    if (Array.isArray(b.redFlags) && b.redFlags.length) {
      html += '<div style="margin:0 16px 14px;padding:10px 14px;border-radius:12px;background:var(--state-danger-bg);border:1px solid var(--state-danger-border);font-size:12.5px;color:var(--state-danger);font-weight:700;">' +
        b.redFlags.map(function (rf) { return '<div>🚨 ' + fmt(rf) + '</div>'; }).join('') + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderWardOrders(b, chId) {
    var savedMap = readLS('v2_orders_' + chId, {});
    var prioLabel = { stat: ['فوری STAT', 'danger'], first_line: ['خط اول', 'success'], high: ['اولویت بالا', 'warning'], routine: ['روتین', 'info'] };
    var html = '<div class="v2-orders-card" ' + blockAttrs(b) + '>' +
      '<div class="v2-orders-header">' +
        '<div class="v2-orders-title">💊 ' + fmt(b.title) + '</div>' +
        (b.indication ? '<span class="v2-pill">' + fmt(b.indication) + '</span>' : '') +
      '</div><div class="v2-orders-list">';

    (b.orders || []).forEach(function (od, idx) {
      var orderKey = (b.blockId || b.id) + '_' + idx;
      var checked = Boolean(savedMap[orderKey]);
      var pInfo = prioLabel[od.priority] || ['دستور', 'info'];
      html += '<label class="v2-order-item ' + (checked ? 'is-checked' : '') + '" data-order-key="' + esc(orderKey) + '">' +
        '<input type="checkbox" class="v2-order-checkbox" ' + (checked ? 'checked' : '') + '>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="v2-order-top">' +
            '<span class="v2-order-drug">' + fmt(od.drug) + '</span>' +
            '<span class="v2-cell-pill tone-' + pInfo[1] + '">' + pInfo[0] + '</span>' +
            '<span class="v2-pill">' + fmt(od.category) + '</span>' +
          '</div>' +
          '<div class="v2-order-meta">' +
            '<div><strong>دوز و روش تجویز:</strong> ' + fmt(od.dose) + (od.frequency ? ' • ' + fmt(od.frequency) : '') + '</div>' +
            '<div><strong>پایش (Monitoring):</strong> ' + fmt(od.monitoring) + '</div>' +
            (od.contraindication ? '<div style="color:var(--state-danger);"><strong>منع مصرف:</strong> ' + fmt(od.contraindication) + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</label>';
    });
    html += '</div></div>';
    return html;
  }

  function renderScoringTable(b) {
    var uid = esc(b.blockId || b.id);
    var interactive = b.interactive !== false;
    var unit = esc(b.scoreUnit || 'امتیاز');

    var html = '<div class="v2-scoring-card" data-scoring-uid="' + uid + '" ' + blockAttrs(b) + '>' +
      '<div class="v2-scoring-head">' +
        '<div>' +
          '<div class="v2-orders-title">🧮 ' + fmt(b.title) + '</div>' +
          (b.subtitle ? '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + fmt(b.subtitle) + '</div>' : '') +
        '</div>' +
        (interactive ? '<div style="display:flex;align-items:center;gap:8px;"><span class="v2-score-live-pill">جمع کل: <strong class="v2-score-val">' + toFa(0) + '</strong> ' + unit + '</span><button type="button" class="v2-btn-outline v2-score-reset" style="padding:5px 10px;font-size:11.5px;">ریست</button></div>' : '') +
      '</div>' +
      '<div class="v2-table-scroll"><table class="v2-table"><thead><tr>';

    (b.columns || []).forEach(function (c) { html += '<th>' + fmt(c) + '</th>'; });
    html += '</tr></thead><tbody>';

    var maxCols = Math.max((b.columns || []).length - 1, 1);
    (b.criteria || []).forEach(function (cr) {
      html += '<tr data-criterion-id="' + esc(cr.id) + '"><td style="font-weight:800;color:var(--text-primary);">' + fmt(cr.parameter) + '</td>';
      for (var i = 0; i < maxCols; i++) {
        var opt = cr.options && cr.options[i];
        if (opt) {
          if (interactive) {
            html += '<td><button type="button" class="v2-score-cell-btn" data-points="' + opt.points + '">' + fmt(opt.label) + '</button></td>';
          } else {
            html += '<td>' + fmt(opt.label) + '</td>';
          }
        } else {
          html += '<td style="color:var(--text-subtle);text-align:center;">—</td>';
        }
      }
      html += '</tr>';
    });
    html += '</tbody></table></div>' +
      (interactive ? '<div class="v2-score-result-bar"><span style="color:var(--text-muted);">برای محاسبه وضعیت، از هر ردیف یک گزینه را انتخاب کنید.</span></div>' : '');

    if (Array.isArray(b.notes) && b.notes.length > 0) {
      html += '<div class="v2-score-notes">';
      b.notes.forEach(function (n) {
        if (!n) return;
        var tone = esc(n.tone || 'danger');
        html += '<div class="v2-score-note tone-' + tone + '">' +
          '<div class="v2-score-note-head">' +
            (n.title ? '<strong>🚨 ' + fmt(n.title) + ':</strong> ' : '') +
            (n.label && n.label !== n.title ? '<span class="v2-score-note-label">' + fmt(n.label) + '</span>' : '') +
          '</div>' +
          (n.action ? '<div class="v2-score-note-action">' + fmt(n.action) + '</div>' : '') +
        '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ========================================================================
   * 5. CHAPTER MOUNT & INTERACTIVE BINDINGS
   * ======================================================================== */
  function renderChapter(chapter) {
    state.activeChapter = chapter;
    state.activeChapterId = chapter.chapterId || chapter.id;
    writeLS('med_active_chapter', state.activeChapterId);

    var container = document.getElementById('chapterContentArea');
    if (!container) return;

    var chIdx = state.index.findIndex(function (c) { return c.id === state.activeChapterId; });
    var prevCh = chIdx > 0 ? state.index[chIdx - 1] : null;
    var nextCh = (chIdx >= 0 && chIdx < state.index.length - 1) ? state.index[chIdx + 1] : null;

    var doneList = readLS(DONE_KEY, []);
    var isCompleted = Array.isArray(doneList) && doneList.indexOf(state.activeChapterId) !== -1;
    var src = chapter.source || {};

    var html = '<article class="v2-chapter-article" id="' + esc(state.activeChapterId) + '">' +
      '<header class="v2-chapter-hero">' +
        '<nav class="v2-breadcrumb" aria-label="مسیر درس">' +
          '<a href="./index.html">آموزش</a><span>‹</span>' +
          '<span>' + esc(state.courseTitle) + '</span><span>‹</span>' +
          '<span style="color:var(--text-primary);font-weight:800;">فصل ' + toFa(chapter.number) + ': ' + esc(chapter.shortTitle) + '</span>' +
        '</nav>' +
        '<div class="v2-hero-badges">' +
          '<span class="v2-pill v2-pill-teal">فصل ' + toFa(chapter.number) + '</span>' +
          '<span class="v2-pill">⏱️ ' + esc((chapter.metrics && chapter.metrics.estimatedReadTime) || '') + '</span>' +
          '<span class="v2-pill">' + toFa((chapter.sections || []).length) + ' بخش بالینی</span>' +
        '</div>' +
        '<h1 class="v2-chapter-title">' + esc(chapter.title) + '</h1>' +
        (chapter.latinTitle ? '<div class="v2-chapter-latin">' + esc(chapter.latinTitle) + '</div>' : '') +
        '<div class="v2-source-strip">' +
          (src.textbook ? '<div><strong>رفرنس:</strong> ' + esc(src.textbook) + (src.chapterRef ? ' (' + esc(src.chapterRef) + ')' : '') + '</div>' : '') +
          (src.guideline ? '<div><strong>گایدلاین:</strong> ' + esc(src.guideline) + '</div>' : '') +
        '</div>' +
      '</header>';

    if (Array.isArray(chapter.cramSummary) && chapter.cramSummary.length > 0) {
      html += '<section class="v2-cram-summary-banner" aria-label="خلاصه شب امتحان">' +
        '<div class="v2-cram-summary-title"><span>⚡ چکیده فوق‌سریع شب امتحان (فصل ' + toFa(chapter.number) + ')</span><button type="button" class="v2-btn-outline" id="v2ExitCramInlineBtn" style="padding:4px 10px;font-size:11.5px;">بازگشت به متن کامل</button></div>' +
        '<ul class="v2-cram-summary-list">' +
          chapter.cramSummary.map(function (c) { return '<li>' + fmt(c) + '</li>'; }).join('') +
        '</ul>' +
      '</section>';
    }

    var bmList = readLS(BM_KEY, []);
    (chapter.sections || []).forEach(function (sec) {
      var isBm = Array.isArray(bmList) && bmList.indexOf(sec.id) !== -1;
      html += '<section class="v2-section study-section" id="' + esc(sec.id) + '" data-chapter-id="' + esc(state.activeChapterId) + '">' +
        '<div class="v2-section-header">' +
          '<div>' +
            '<h2 class="v2-section-title">' +
              (sec.badge ? '<span class="v2-pill v2-pill-teal" style="margin-inline-end:8px;">' + esc(sec.badge) + '</span>' : '') +
              esc(sec.title) +
            '</h2>' +
            (sec.latinTitle ? '<div class="v2-section-latin">' + esc(sec.latinTitle) + '</div>' : '') +
          '</div>' +
          '<div class="v2-section-actions">' +
            '<button type="button" class="v2-icon-btn btn-bookmark ' + (isBm ? 'is-bookmarked' : '') + '" data-section-id="' + esc(sec.id) + '" title="نشانک‌گذاری بخش" aria-label="نشانک بخش">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (isBm ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="v2-section-body">' +
          (sec.blocks || []).map(function (b) { return renderBlock(b, state.activeChapterId); }).join('') +
        '</div>' +
      '</section>';
    });

    html += '<div class="v2-completion-bar">' +
      '<button type="button" class="v2-complete-btn ' + (isCompleted ? 'is-completed' : '') + '" id="v2CompleteChapterBtn">' +
        '<span>' + (isCompleted ? '✓' : '○') + '</span>' +
        '<span>' + (isCompleted ? 'فصل به عنوان مطالعه‌شده ثبت شد' : 'ثبت پایان مطالعه این فصل') + '</span>' +
      '</button>' +
    '</div>';

    if (prevCh || nextCh) {
      html += '<footer class="v2-chapter-nav-cards">';
      if (prevCh) {
        html += '<a href="#' + esc(prevCh.id) + '" class="v2-nav-card" data-jump-chapter="' + esc(prevCh.id) + '">' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:4px;">فصل قبلی</div>' +
          '<div style="font-weight:800;">فصل ' + toFa(prevCh.number) + ': ' + esc(prevCh.shortTitle) + '</div>' +
        '</a>';
      }
      if (nextCh) {
        html += '<a href="#' + esc(nextCh.id) + '" class="v2-nav-card" data-jump-chapter="' + esc(nextCh.id) + '">' +
          '<div style="font-size:11.5px;color:var(--text-muted);margin-bottom:4px;">فصل بعدی</div>' +
          '<div style="font-weight:800;">فصل ' + toFa(nextCh.number) + ': ' + esc(nextCh.shortTitle) + '</div>' +
        '</a>';
      }
      html += '</footer>';
    }
    html += '</article>';

    container.innerHTML = html;

    bindInteractiveBlocks(container, chapter);
    syncCramToggleAvailability(chapter);
    restoreChapterHighlights(state.activeChapterId);
    renderSidebarNav();
    updateStudyProgress();

    try {
      window.dispatchEvent(new CustomEvent('chapterRendered', { detail: { chapterId: state.activeChapterId } }));
    } catch (e) {}
  }

  function bindInteractiveBlocks(container, chapter) {
    // 1. Gestational Timeline Tabs
    container.querySelectorAll('.v2-timeline-card').forEach(function (card) {
      var uid = card.getAttribute('data-timeline-uid');
      var blk = findBlockByUid(chapter, uid);
      if (!blk || !Array.isArray(blk.nodes)) return;
      var panel = card.querySelector('.v2-tl-panel');
      card.querySelectorAll('[data-tl-node]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetId = btn.getAttribute('data-tl-node');
          var nd = blk.nodes.find(function (n) { return n.id === targetId; });
          if (!nd || !panel) return;
          card.querySelectorAll('[data-tl-node]').forEach(function (b) {
            var act = b === btn;
            b.classList.toggle('is-active', act);
            b.setAttribute('aria-selected', act ? 'true' : 'false');
          });
          panel.innerHTML = renderTimelinePanelInner(nd);
        });
      });
    });

    // 2. Interactive Clinical Scoring Table (Bishop / APGAR)
    container.querySelectorAll('.v2-scoring-card').forEach(function (card) {
      var uid = card.getAttribute('data-scoring-uid');
      var blk = findBlockByUid(chapter, uid);
      if (!blk || blk.interactive === false) return;
      var scoresByRow = {};
      var valEl = card.querySelector('.v2-score-val');
      var resEl = card.querySelector('.v2-score-result-bar');
      var resetBtn = card.querySelector('.v2-score-reset');

      function updateScore() {
        var total = 0;
        Object.keys(scoresByRow).forEach(function (k) { total += scoresByRow[k]; });
        if (valEl) valEl.textContent = toFa(total);
        if (!resEl) return;
        var countSelected = Object.keys(scoresByRow).length;
        if (countSelected === 0) {
          resEl.innerHTML = '<span style="color:var(--text-muted);">برای محاسبه وضعیت، از هر ردیف یک گزینه را انتخاب کنید.</span>';
          return;
        }
        var match = (blk.interpretations || []).find(function (it) { return total >= it.min && total <= it.max; });
        if (match) {
          var tone = match.tone || 'info';
          resEl.innerHTML = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span class="v2-cell-pill tone-' + esc(tone) + '">' + fmt(match.label) + ' (' + toFa(total) + ' ' + esc(blk.scoreUnit || 'امتیاز') + ')</span>' +
            '<span style="color:var(--text-primary);font-weight:600;">' + fmt(match.action) + '</span>' +
          '</div>';
        }
      }

      card.querySelectorAll('tr[data-criterion-id]').forEach(function (row) {
        var cId = row.getAttribute('data-criterion-id');
        row.querySelectorAll('.v2-score-cell-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            row.querySelectorAll('.v2-score-cell-btn').forEach(function (b) { b.classList.remove('is-selected'); });
            btn.classList.add('is-selected');
            scoresByRow[cId] = parseFloat(btn.getAttribute('data-points')) || 0;
            updateScore();
          });
        });
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          scoresByRow = {};
          card.querySelectorAll('.v2-score-cell-btn.is-selected').forEach(function (b) { b.classList.remove('is-selected'); });
          updateScore();
        });
      }
    });

    // 3. Bedside Ward Orders Checkboxes
    container.querySelectorAll('.v2-order-item').forEach(function (lbl) {
      var key = lbl.getAttribute('data-order-key');
      var cb = lbl.querySelector('.v2-order-checkbox');
      if (!cb || !key) return;
      cb.addEventListener('change', function () {
        var map = readLS('v2_orders_' + state.activeChapterId, {});
        if (cb.checked) map[key] = true; else delete map[key];
        writeLS('v2_orders_' + state.activeChapterId, map);
        lbl.classList.toggle('is-checked', cb.checked);
      });
    });

    // 4. Section Bookmarks
    container.querySelectorAll('.btn-bookmark').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var secId = btn.getAttribute('data-section-id');
        var list = readLS(BM_KEY, []);
        if (!Array.isArray(list)) list = [];
        var idx = list.indexOf(secId);
        var added = idx === -1;
        if (added) list.push(secId); else list.splice(idx, 1);
        writeLS(BM_KEY, list);
        btn.classList.toggle('is-bookmarked', added);
        var svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
        updateBadges();
        toast(added ? 'بخش به نشانک‌ها اضافه شد' : 'بخش از نشانک‌ها حذف شد');
      });
    });

    // 5. Chapter Completion
    var compBtn = document.getElementById('v2CompleteChapterBtn');
    if (compBtn) {
      compBtn.addEventListener('click', function () {
        var done = readLS(DONE_KEY, []);
        if (!Array.isArray(done)) done = [];
        var idx = done.indexOf(state.activeChapterId);
        var nowDone = idx === -1;
        if (nowDone) done.push(state.activeChapterId); else done.splice(idx, 1);
        writeLS(DONE_KEY, done);
        compBtn.classList.toggle('is-completed', nowDone);
        compBtn.innerHTML = '<span>' + (nowDone ? '✓' : '○') + '</span><span>' +
          (nowDone ? 'فصل به عنوان مطالعه‌شده ثبت شد' : 'ثبت پایان مطالعه این فصل') + '</span>';
        renderSidebarNav();
        updateStudyProgress();
        toast(nowDone ? 'مطالعه فصل ثبت شد ✓' : 'نشان مطالعه فصل برداشته شد');
      });
    }

    // 6. Prev/Next Chapter Cards
    container.querySelectorAll('[data-jump-chapter]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openChapter(a.getAttribute('data-jump-chapter'));
      });
    });

    // 7. Inline Cram Exit
    var exitCram = document.getElementById('v2ExitCramInlineBtn');
    if (exitCram) {
      exitCram.addEventListener('click', function () { setCramMode(false, true); });
    }
  }

  function findBlockByUid(chapter, uid) {
    var found = null;
    function walk(blocks) {
      for (var i = 0; i < (blocks || []).length; i++) {
        var b = blocks[i];
        if ((b.blockId || b.id) === uid) { found = b; return; }
        if (b.blocks) walk(b.blocks);
      }
    }
    (chapter.sections || []).forEach(function (s) { if (!found) walk(s.blocks); });
    return found;
  }

  /* ========================================================================
   * 6. CRAM MODE GATING (Shown ONLY when chapter.capabilities.hasCramMode === true)
   * ======================================================================== */
  function syncCramToggleAvailability(chapter) {
    var supported = Boolean(chapter && chapter.capabilities && chapter.capabilities.hasCramMode);
    var btns = document.querySelectorAll('#examCramToggleBtn, #mobileExamCramToggleBtn');
    btns.forEach(function (btn) {
      btn.style.display = supported ? 'inline-flex' : 'none';
    });

    if (!supported) {
      setCramMode(false, false);
    } else {
      var saved = false;
      try { saved = localStorage.getItem(CRAM_KEY) === 'true'; } catch (e) {}
      setCramMode(saved, false);
    }
    if (window.MedicalismShell && window.MedicalismShell.syncDock) {
      window.MedicalismShell.syncDock();
    }
  }

  function setCramMode(active, notify) {
    state.cramActive = Boolean(active);
    if (notify) {
      try { localStorage.setItem(CRAM_KEY, state.cramActive ? 'true' : 'false'); } catch (e) {}
    }
    var area = document.getElementById('chapterContentArea');
    if (area) {
      area.classList.toggle('v2-cram-active', state.cramActive);
      area.querySelectorAll('[data-v2-block]').forEach(function (blk) {
        blk.classList.toggle('v2-cram-has-hl', Boolean(blk.querySelector('mark.user-highlight')));
      });
    }
    document.querySelectorAll('#examCramToggleBtn, #mobileExamCramToggleBtn').forEach(function (btn) {
      btn.classList.toggle('is-active', state.cramActive);
      btn.setAttribute('aria-pressed', state.cramActive ? 'true' : 'false');
    });
    try { window.dispatchEvent(new CustomEvent('cramModeChanged', { detail: { active: state.cramActive } })); } catch (e) {}
    if (notify) toast(state.cramActive ? '⚡ حالت مرور سریع (شب امتحان) فعال شد' : '📖 نمایش کامل درسنامه');
  }

  /* ========================================================================
   * 7. OFFLINE TEXT HIGHLIGHTER (100% compatible with medicalism_highlights_v1)
   * ======================================================================== */
  var activeRange = null, activeMark = null;

  function ensurePopover() {
    var pop = document.getElementById('highlightPopover');
    if (pop) return pop;
    pop = document.createElement('div');
    pop.id = 'highlightPopover';
    pop.className = 'highlight-popover';
    pop.innerHTML = '' +
      '<div class="popover-swatches">' +
        '<button type="button" class="swatch-btn color-yellow" data-color="yellow" aria-label="زرد"></button>' +
        '<button type="button" class="swatch-btn color-green" data-color="green" aria-label="سبز"></button>' +
        '<button type="button" class="swatch-btn color-pink" data-color="pink" aria-label="صورتی"></button>' +
        '<button type="button" class="swatch-btn color-blue" data-color="blue" aria-label="آبی"></button>' +
      '</div>' +
      '<button type="button" class="btn-delete-hl" id="popoverDeleteBtn" style="display:none;">حذف 🗑️</button>';
    document.body.appendChild(pop);

    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pop.querySelectorAll('.swatch-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        applyHighlightColor(btn.getAttribute('data-color'));
      });
    });
    var del = pop.querySelector('#popoverDeleteBtn');
    if (del) {
      del.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        deleteActiveHighlight();
      });
    }
    return pop;
  }

  function isBottomBarMode() {
    return window.innerWidth < 1024 || (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches);
  }

  function showPopover(rect, mark) {
    if (document.body.classList.contains('brush-highlight-mode')) return;
    var pop = ensurePopover();
    activeMark = mark || null;
    activeRange = mark ? null : activeRange;
    var del = pop.querySelector('#popoverDeleteBtn');
    if (del) del.style.display = mark ? 'inline-flex' : 'none';
    var curColor = mark ? mark.getAttribute('data-color') : '';
    pop.querySelectorAll('.swatch-btn').forEach(function (b) {
      b.classList.toggle('is-active', Boolean(mark && b.getAttribute('data-color') === curColor));
    });
    pop.style.display = 'flex';

    if (isBottomBarMode()) {
      pop.style.left = '';
      pop.style.top = '';
      pop.classList.remove('popover-below');
      pop.classList.add('popover-bottom-dock');
      return;
    }

    pop.classList.remove('popover-bottom-dock');
    var x = Math.max(100, Math.min(window.innerWidth - 100, rect.left + rect.width / 2));
    var y = rect.bottom + 10;
    var below = true;
    if (y + 44 > window.innerHeight && rect.top - 48 > 0) { y = rect.top - 10; below = false; }
    y = below
      ? Math.max(12, Math.min(window.innerHeight - 54, y))
      : Math.max(54, Math.min(window.innerHeight - 12, y));
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
    pop.classList.toggle('popover-below', below);
  }

  function hidePopover() {
    var pop = document.getElementById('highlightPopover');
    if (pop) {
      pop.style.display = 'none';
      pop.classList.remove('popover-bottom-dock');
    }
    activeRange = null; activeMark = null;
  }

  function wrapRange(range, id, color) {
    var mark = document.createElement('mark');
    mark.className = 'user-highlight';
    mark.setAttribute('data-color', color || 'yellow');
    mark.setAttribute('data-id', id);
    try {
      range.surroundContents(mark);
    } catch (e) {
      var frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
    }
    mark.addEventListener('click', function (ev) {
      if (document.body.classList.contains('brush-highlight-mode')) return;
      ev.stopPropagation(); ev.preventDefault();
      showPopover(mark.getBoundingClientRect(), mark);
    });
    return mark;
  }

  function recolorHighlightMark(mark, color, opts) {
    if (!mark) return false;
    var all = readLS(HL_KEY, []);
    if (!Array.isArray(all)) all = [];
    var id = mark.getAttribute('data-id');
    mark.setAttribute('data-color', color);
    var item = all.find(function (h) { return h.id === id; });
    if (item) { item.color = color; writeLS(HL_KEY, all); }
    if (!opts || !opts.silent) toast('رنگ هایلایت تغییر یافت');
    return true;
  }

  function createHighlightFromRange(range, color, opts) {
    if (!range) return null;
    var text = range.toString().trim();
    if (!text) return null;

    var all = readLS(HL_KEY, []);
    if (!Array.isArray(all)) all = [];

    var node = range.commonAncestorContainer;
    var el = node.nodeType === 1 ? node : node.parentElement;
    var blkEl = el ? el.closest('[data-block-id]') : null;
    var secEl = el ? el.closest('.study-section') : null;
    var secTitleEl = secEl ? secEl.querySelector('.v2-section-title') : null;
    var hlId = 'hl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

    var ctxRoot = blkEl || secEl || document.getElementById('chapterContentArea');
    var full = ctxRoot ? (ctxRoot.textContent || '') : '';
    var idx = full.indexOf(text);
    var prefix = idx > 0 ? full.slice(Math.max(0, idx - 36), idx) : '';
    var suffix = idx >= 0 ? full.slice(idx + text.length, idx + text.length + 36) : '';

    try {
      var mark = wrapRange(range, hlId, color || 'yellow');
      all.push({
        id: hlId,
        chapterId: state.activeChapterId,
        sectionId: secEl ? secEl.id : '',
        blockId: blkEl ? blkEl.getAttribute('data-block-id') : '',
        sectionTitle: secTitleEl ? secTitleEl.textContent.trim() : '',
        chapterTitle: state.activeChapter ? state.activeChapter.title : state.activeChapterId,
        color: color || 'yellow',
        text: text,
        prefix: prefix,
        suffix: suffix,
        createdAt: Date.now()
      });
      writeLS(HL_KEY, all);
      if (blkEl) blkEl.classList.add('v2-cram-has-hl');
      updateBadges();
      if (!opts || !opts.silent) toast('متن با موفقیت هایلایت شد ✓');
      return mark;
    } catch (err) {
      console.warn('Highlight wrap failed:', err);
      return null;
    }
  }

  function deleteHighlightMark(mark, opts) {
    if (!mark) return false;
    var id = mark.getAttribute('data-id');
    var blkEl = mark.closest ? mark.closest('[data-v2-block]') : null;
    unwrapMark(mark);
    if (blkEl && !blkEl.querySelector('mark.user-highlight')) {
      blkEl.classList.remove('v2-cram-has-hl');
    }
    var all = readLS(HL_KEY, []).filter(function (h) { return h.id !== id; });
    writeLS(HL_KEY, all);
    updateBadges();
    if (activeMark === mark) hidePopover();
    if (!opts || !opts.silent) toast('هایلایت حذف شد');
    return true;
  }

  function applyHighlightColor(color) {
    if (activeMark) {
      recolorHighlightMark(activeMark, color);
      hidePopover();
      return;
    }

    if (!activeRange) { hidePopover(); return; }
    createHighlightFromRange(activeRange, color);
    hidePopover();
    if (window.getSelection) window.getSelection().removeAllRanges();
  }

  function deleteActiveHighlight() {
    if (!activeMark) { hidePopover(); return; }
    deleteHighlightMark(activeMark);
    hidePopover();
  }

  function unwrapMark(mark) {
    var parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  }

  function findRangeInRoot(root, text, prefix, suffix) {
    if (!root || !text) return null;
    var full = root.textContent || '';
    var idx = full.indexOf(text);
    if (idx === -1) return null;
    var bestIdx = idx, bestScore = -1;
    while (idx !== -1) {
      var sc = 0;
      if (prefix && full.slice(Math.max(0, idx - prefix.length), idx).slice(-12) === prefix.slice(-12)) sc += 2;
      if (suffix && full.slice(idx + text.length, idx + text.length + suffix.length).slice(0, 12) === suffix.slice(0, 12)) sc += 2;
      if (sc > bestScore) { bestScore = sc; bestIdx = idx; }
      idx = full.indexOf(text, idx + 1);
    }
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var pos = 0, startN = null, startO = 0, endN = null, endO = 0, n;
    while ((n = walker.nextNode())) {
      if (n.parentElement && n.parentElement.closest('mark.user-highlight')) continue;
      var len = n.nodeValue.length;
      if (!startN && pos + len > bestIdx) { startN = n; startO = bestIdx - pos; }
      if (startN && pos + len >= bestIdx + text.length) { endN = n; endO = bestIdx + text.length - pos; break; }
      pos += len;
    }
    if (!startN || !endN) return null;
    var r = document.createRange();
    r.setStart(startN, startO); r.setEnd(endN, endO);
    return r;
  }

  function restoreChapterHighlights(chapterId) {
    var all = readLS(HL_KEY, []);
    if (!Array.isArray(all) || all.length === 0) return;
    var list = all.filter(function (h) { return h && h.chapterId === chapterId && h.text; });
    var area = document.getElementById('chapterContentArea');
    if (!area || list.length === 0) return;

    list.forEach(function (h) {
      if (document.querySelector('mark.user-highlight[data-id="' + h.id + '"]')) return;
      var root = (h.blockId && area.querySelector('[data-block-id="' + h.blockId + '"]')) ||
        (h.sectionId && document.getElementById(h.sectionId)) || area;
      var range = findRangeInRoot(root, h.text, h.prefix, h.suffix) || findRangeInRoot(area, h.text, h.prefix, h.suffix);
      if (range) {
        try {
          var mark = wrapRange(range, h.id, h.color || 'yellow');
          var blk = mark.closest('[data-v2-block]');
          if (blk) blk.classList.add('v2-cram-has-hl');
        } catch (e) {}
      }
    });
  }

  function expandAncestorsAndScroll(el) {
    if (!el) return;
    var cur = el;
    while (cur && cur !== document.body) {
      if (cur.tagName === 'DETAILS') cur.open = true;
      cur = cur.parentElement;
    }
    requestAnimationFrame(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ========================================================================
   * 8. SIDEBAR TOC, MODALS (Search, Bookmarks, Highlights), & PROGRESS
   * ======================================================================== */
  function renderSidebarNav() {
    var done = readLS(DONE_KEY, []);
    var doneSet = new Set(Array.isArray(done) ? done : []);
    var html = state.index.map(function (ch) {
      var isAct = ch.id === state.activeChapterId;
      var isDone = doneSet.has(ch.id);
      var secHtml = (ch.sections || []).map(function (s) {
        return '<li><a href="#' + esc(s.id) + '" class="v2-nav-sec-link" data-nav-sec="' + esc(s.id) + '">' + esc(s.title) + '</a></li>';
      }).join('');
      return '<li class="v2-nav-chapter ' + (isAct ? 'is-active' : '') + '">' +
        '<button type="button" class="v2-nav-ch-btn" data-nav-ch="' + esc(ch.id) + '">' +
          '<span>فصل ' + toFa(ch.number) + ': ' + esc(ch.shortTitle) + '</span>' +
          '<span>' + (isDone ? '✓' : '‹') + '</span>' +
        '</button>' +
        '<ul class="v2-nav-sec-list">' + secHtml + '</ul>' +
      '</li>';
    }).join('');

    ['desktopNavTree', 'mobileNavTree'].forEach(function (id) {
      var ul = document.getElementById(id);
      if (!ul) return;
      ul.innerHTML = html;
      ul.querySelectorAll('[data-nav-ch]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          openChapter(btn.getAttribute('data-nav-ch'));
          closeMobileDrawer();
        });
      });
      ul.querySelectorAll('[data-nav-sec]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var target = document.getElementById(a.getAttribute('data-nav-sec'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          closeMobileDrawer();
        });
      });
    });
  }

  function updateStudyProgress() {
    var done = readLS(DONE_KEY, []);
    var doneSet = new Set(Array.isArray(done) ? done : []);
    var total = state.index.length || 1;
    var count = state.index.filter(function (c) { return doneSet.has(c.id); }).length;
    var pct = Math.round((count / total) * 100);
    var txt = toFa(count) + ' از ' + toFa(total) + ' فصل (' + toFa(pct) + '٪)';
    ['studyProgressStats', 'mobileStudyProgressStats'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = txt;
    });
    ['studyProgressFill', 'mobileStudyProgressFill'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.width = pct + '%';
    });
  }

  function updateBadges() {
    var hl = readLS(HL_KEY, []);
    var bm = readLS(BM_KEY, []);
    var hc = Array.isArray(hl) ? hl.length : 0;
    var bc = Array.isArray(bm) ? bm.length : 0;
    document.querySelectorAll('#highlightsCountBadge, #mobileHighlightsCountBadge').forEach(function (el) {
      el.textContent = toFa(hc);
      el.style.display = hc > 0 ? 'inline-flex' : 'none';
    });
    var bmEl = document.getElementById('bookmarksCountBadge');
    if (bmEl) { bmEl.textContent = toFa(bc); bmEl.style.display = bc > 0 ? 'inline-flex' : 'none'; }
    var pill = document.getElementById('highlightsModalCountPill');
    if (pill) pill.textContent = toFa(hc) + ' مورد';
    if (window.MedicalismShell && window.MedicalismShell.syncDock) window.MedicalismShell.syncDock();
  }

  function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('is-active'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('is-active'); document.body.style.overflow = ''; }
  }

  function renderHighlightsList() {
    var listEl = document.getElementById('highlightsList');
    if (!listEl) return;
    var all = readLS(HL_KEY, []);
    if (!Array.isArray(all) || all.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">هنوز متنی هایلایت نشده است.</div>';
      return;
    }
    listEl.innerHTML = all.map(function (h) {
      return '<div class="v2-result-row" data-jump-hl="' + esc(h.id) + '" data-ch="' + esc(h.chapterId) + '" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
        '<div style="flex:1;">' +
          '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">' + esc(h.chapterTitle || h.chapterId) + (h.sectionTitle ? ' • ' + esc(h.sectionTitle) : '') + '</div>' +
          '<div style="font-size:13px;font-weight:600;">«' + esc(h.text) + '»</div>' +
        '</div>' +
        '<button type="button" class="v2-icon-btn" data-del-hl="' + esc(h.id) + '" title="حذف">🗑️</button>' +
      '</div>';
    }).join('');

    listEl.querySelectorAll('[data-jump-hl]').forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('[data-del-hl]')) return;
        var hlId = row.getAttribute('data-jump-hl');
        var chId = row.getAttribute('data-ch');
        closeModal('highlightsModalBackdrop');
        var jump = function () {
          var mark = document.querySelector('mark.user-highlight[data-id="' + hlId + '"]');
          if (mark) {
            expandAncestorsAndScroll(mark);
            mark.classList.add('highlight-jump-pulse');
            setTimeout(function () { mark.classList.remove('highlight-jump-pulse'); }, 2200);
          }
        };
        if (chId && chId !== state.activeChapterId) {
          openChapter(chId).then(function () { setTimeout(jump, 120); });
        } else {
          jump();
        }
      });
    });

    listEl.querySelectorAll('[data-del-hl]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-del-hl');
        var m = document.querySelector('mark.user-highlight[data-id="' + id + '"]');
        if (m) unwrapMark(m);
        writeLS(HL_KEY, readLS(HL_KEY, []).filter(function (x) { return x.id !== id; }));
        updateBadges();
        renderHighlightsList();
      });
    });
  }

  function renderBookmarksList() {
    var listEl = document.getElementById('bookmarksList');
    if (!listEl) return;
    var bms = readLS(BM_KEY, []);
    if (!Array.isArray(bms) || bms.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">هنوز بخشی نشانک‌گذاری نشده است.</div>';
      return;
    }
    var rows = [];
    bms.forEach(function (secId) {
      state.index.forEach(function (ch) {
        var s = (ch.sections || []).find(function (x) { return x.id === secId; });
        if (s) rows.push({ ch: ch, sec: s });
      });
    });
    listEl.innerHTML = rows.length ? rows.map(function (r) {
      return '<div class="v2-result-row" data-bm-ch="' + esc(r.ch.id) + '" data-bm-sec="' + esc(r.sec.id) + '">' +
        '<div style="font-size:11px;color:var(--accent-primary);font-weight:700;">فصل ' + toFa(r.ch.number) + ': ' + esc(r.ch.shortTitle) + '</div>' +
        '<div style="font-size:13.5px;font-weight:800;">' + esc(r.sec.title) + '</div>' +
      '</div>';
    }).join('') : '<div style="text-align:center;padding:30px;color:var(--text-muted);">نشانکی در این دوره ثبت نشده است.</div>';

    listEl.querySelectorAll('[data-bm-sec]').forEach(function (row) {
      row.addEventListener('click', function () {
        var chId = row.getAttribute('data-bm-ch');
        var secId = row.getAttribute('data-bm-sec');
        closeModal('bookmarksModalBackdrop');
        openChapter(chId).then(function () {
          var el = document.getElementById(secId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    });
  }

  function normSearchFa(str) {
    return (str || '').toLowerCase()
      .replace(/ي/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[\u200c\u200f\u064b-\u065f]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function runSearch(query) {
    var listEl = document.getElementById('searchResultsList');
    if (!listEl) return;
    var q = normSearchFa(query);
    if (!q) {
      listEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted);">کلیدواژه، دارو، معیار یا عنوان بخش را وارد کنید...</div>';
      return;
    }
    var hits = [];
    // Search active DOM blocks for deep hits + TOC across all chapters
    state.index.forEach(function (ch) {
      (ch.sections || []).forEach(function (sec) {
        var t = normSearchFa(ch.title + ' ' + sec.title + ' ' + (sec.latinTitle || ''));
        if (t.indexOf(q) !== -1) {
          hits.push({ chId: ch.id, secId: sec.id, label: 'فصل ' + toFa(ch.number), title: sec.title, sub: ch.shortTitle, el: null });
        }
      });
    });
    var area = document.getElementById('chapterContentArea');
    if (area && state.activeChapter) {
      area.querySelectorAll('[data-v2-block]').forEach(function (blk) {
        var txt = normSearchFa(blk.textContent || '');
        if (txt.indexOf(q) !== -1) {
          var sec = blk.closest('.study-section');
          hits.push({
            chId: state.activeChapterId,
            secId: sec ? sec.id : '',
            label: 'فصل فعلی',
            title: (sec && sec.querySelector('.v2-section-title')) ? sec.querySelector('.v2-section-title').textContent.trim() : state.activeChapter.shortTitle,
            sub: (blk.textContent || '').trim().slice(0, 110) + '...',
            blockId: blk.getAttribute('data-block-id')
          });
        }
      });
    }
    listEl.innerHTML = hits.length ? hits.slice(0, 14).map(function (h) {
      return '<div class="v2-result-row" data-hit-ch="' + esc(h.chId) + '" data-hit-sec="' + esc(h.secId) + '" data-hit-blk="' + esc(h.blockId || '') + '">' +
        '<div style="font-size:11px;color:var(--accent-primary);font-weight:700;">' + esc(h.label) + ' • ' + esc(h.title) + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-secondary);">' + esc(h.sub) + '</div>' +
      '</div>';
    }).join('') : '<div style="text-align:center;padding:24px;color:var(--text-muted);">موردی یافت نشد.</div>';

    listEl.querySelectorAll('[data-hit-ch]').forEach(function (row) {
      row.addEventListener('click', function () {
        var chId = row.getAttribute('data-hit-ch');
        var secId = row.getAttribute('data-hit-sec');
        var blkId = row.getAttribute('data-hit-blk');
        closeModal('searchModalBackdrop');
        openChapter(chId).then(function () {
          var target = (blkId && document.querySelector('[data-block-id="' + blkId + '"]')) || document.getElementById(secId);
          if (target) expandAncestorsAndScroll(target);
        });
      });
    });
  }

  function openMobileDrawer() {
    var d = document.getElementById('mobileDrawer');
    var b = document.getElementById('drawerBackdrop');
    if (d && b) { d.classList.add('is-open'); b.classList.add('is-active'); document.body.style.overflow = 'hidden'; }
  }
  function closeMobileDrawer() {
    var d = document.getElementById('mobileDrawer');
    var b = document.getElementById('drawerBackdrop');
    if (d && b) { d.classList.remove('is-open'); b.classList.remove('is-active'); document.body.style.overflow = ''; }
  }

  function toast(msg) {
    if (window.MedicalismShell && window.MedicalismShell.showToast) window.MedicalismShell.showToast(msg);
  }

  function openChapter(chapterId, replaceMode) {
    return loadChapterData(chapterId).then(function (ch) {
      renderChapter(ch);
      if (window.location.hash !== '#' + ch.chapterId) {
        try {
          if (replaceMode === true) history.replaceState(null, '', '#' + ch.chapterId);
          else if (replaceMode !== 'skip') history.pushState(null, '', '#' + ch.chapterId);
        } catch (e) {}
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return ch;
    });
  }

  /* ========================================================================
   * 9. BOOTSTRAP
   * ======================================================================== */
  window.CourseEngineV2 = {
    openChapter: openChapter,
    setCramMode: setCramMode,
    createHighlightFromRange: createHighlightFromRange,
    deleteHighlightMark: deleteHighlightMark,
    recolorHighlightMark: recolorHighlightMark,
    hideHighlightPopover: hidePopover,
    refreshUserMarks: function () {
      if (state.activeChapterId) restoreChapterHighlights(state.activeChapterId);
      updateBadges();
      updateStudyProgress();
    },
    init: function (cfg) {
      state.courseId = (cfg && cfg.courseId) || 'obgyn';
      state.courseTitle = (cfg && cfg.courseTitle) || 'زنان و زایمان';
      var v2Map = window.MEDICALISM_V2_INDEX || {};
      state.index = Array.isArray(v2Map[state.courseId]) ? v2Map[state.courseId] : [];
      if (state.index.length === 0) return;

      function resolveHashTarget() {
        var h = (window.location.hash || '').replace(/^#/, '');
        if (!h) return null;
        var found = state.index.find(function (c) {
          return c.id === h || (c.sections || []).some(function (s) { return s.id === h; });
        });
        return found ? { chapterId: found.id, hash: h } : null;
      }

      var initial = resolveHashTarget();
      var savedCh = readLS('med_active_chapter', null);
      var targetChId = (initial && initial.chapterId) || (state.index.some(function (c) { return c.id === savedCh; }) ? savedCh : state.index[0].id);

      openChapter(targetChId, true).then(function () {
        if (initial && initial.hash && initial.hash !== targetChId) {
          var secEl = document.getElementById(initial.hash);
          if (secEl) secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      window.addEventListener('hashchange', function () {
        var next = resolveHashTarget();
        if (!next) return;
        if (next.chapterId !== state.activeChapterId) {
          openChapter(next.chapterId, 'skip').then(function () {
            if (next.hash && next.hash !== next.chapterId) {
              var secEl = document.getElementById(next.hash);
              if (secEl) secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        } else if (next.hash && next.hash !== next.chapterId) {
          var secEl = document.getElementById(next.hash);
          if (secEl) secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      // Bind global events
      document.querySelectorAll('#examCramToggleBtn, #mobileExamCramToggleBtn').forEach(function (btn) {
        btn.addEventListener('click', function () { setCramMode(!state.cramActive, true); });
      });

      document.querySelectorAll('.btn-search-trigger').forEach(function (btn) {
        btn.addEventListener('click', function () {
          closeMobileDrawer();
          openModal('searchModalBackdrop');
          var inp = document.getElementById('searchInput');
          if (inp) { inp.value = ''; runSearch(''); setTimeout(function () { inp.focus(); }, 60); }
        });
      });
      var sInp = document.getElementById('searchInput');
      if (sInp) sInp.addEventListener('input', function () { runSearch(sInp.value); });

      document.querySelectorAll('#highlightsToggleBtn, #mobileHighlightsBtn').forEach(function (btn) {
        btn.addEventListener('click', function () { closeMobileDrawer(); renderHighlightsList(); openModal('highlightsModalBackdrop'); });
      });
      var bmBtn = document.getElementById('bookmarksToggleBtn');
      if (bmBtn) bmBtn.addEventListener('click', function () { renderBookmarksList(); openModal('bookmarksModalBackdrop'); });

      var clrBtn = document.getElementById('clearAllHighlightsBtn');
      if (clrBtn) {
        clrBtn.addEventListener('click', function () {
          if (!confirm('آیا تمام هایلایت‌ها پاک شوند؟')) return;
          localStorage.removeItem(HL_KEY);
          document.querySelectorAll('mark.user-highlight').forEach(unwrapMark);
          updateBadges(); renderHighlightsList();
        });
      }

      ['searchModalBackdrop', 'bookmarksModalBackdrop', 'highlightsModalBackdrop'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', function (e) { if (e.target === el) closeModal(id); });
      });
      var scClose = document.getElementById('searchCloseBtn');
      var bmClose = document.getElementById('bookmarksCloseBtn');
      var hlClose = document.getElementById('highlightsCloseBtn');
      if (scClose) scClose.addEventListener('click', function () { closeModal('searchModalBackdrop'); });
      if (bmClose) bmClose.addEventListener('click', function () { closeModal('bookmarksModalBackdrop'); });
      if (hlClose) hlClose.addEventListener('click', function () { closeModal('highlightsModalBackdrop'); });

      var mobNav = document.getElementById('mobileNavToggle');
      var mobClose = document.getElementById('drawerCloseBtn');
      var mobBd = document.getElementById('drawerBackdrop');
      if (mobNav) mobNav.addEventListener('click', openMobileDrawer);
      if (mobClose) mobClose.addEventListener('click', closeMobileDrawer);
      if (mobBd) mobBd.addEventListener('click', closeMobileDrawer);

      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          openModal('searchModalBackdrop');
          var inp = document.getElementById('searchInput');
          if (inp) { inp.value = ''; runSearch(''); setTimeout(function () { inp.focus(); }, 60); }
        } else if (e.key === 'Escape') {
          closeModal('searchModalBackdrop'); closeModal('bookmarksModalBackdrop'); closeModal('highlightsModalBackdrop');
          closeMobileDrawer();
        }
      });

      // Selection highlighter listener
      var checkSel = function () {
        setTimeout(function () {
          if (document.body.classList.contains('brush-highlight-mode')) return;
          var sel = window.getSelection();
          if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
          if (sel.toString().trim().length < 2) return;
          var r = sel.getRangeAt(0);
          var area = document.querySelector('#chapterContentArea, #main-content');
          if (!area || !area.contains(r.commonAncestorContainer)) return;
          activeRange = r;
          showPopover(r.getBoundingClientRect(), null);
        }, 30);
      };
      document.addEventListener('mouseup', function (e) {
        if (document.body.classList.contains('brush-highlight-mode')) return;
        if (e.target.closest && (e.target.closest('#highlightPopover') || e.target.closest('mark.user-highlight'))) return;
        checkSel();
      });
      document.addEventListener('touchend', function (e) {
        if (document.body.classList.contains('brush-highlight-mode')) return;
        if (e.target.closest && (e.target.closest('#highlightPopover') || e.target.closest('mark.user-highlight'))) return;
        checkSel();
      });
      var selTimer = null;
      document.addEventListener('selectionchange', function () {
        if (document.body.classList.contains('brush-highlight-mode')) return;
        if (!isBottomBarMode()) return;
        clearTimeout(selTimer);
        selTimer = setTimeout(function () {
          var sel = window.getSelection();
          if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
            if (activeRange && !activeMark) hidePopover();
            return;
          }
          if (sel.toString().trim().length < 2) return;
          var r = sel.getRangeAt(0);
          var area = document.querySelector('#chapterContentArea, #main-content');
          if (area && area.contains(r.commonAncestorContainer)) {
            activeRange = r;
            showPopover(r.getBoundingClientRect(), null);
          }
        }, 140);
      });
      document.addEventListener('contextmenu', function (e) {
        var area = document.querySelector('#chapterContentArea, #main-content');
        if (!area || !area.contains(e.target)) return;
        if (document.body.classList.contains('brush-highlight-mode')) {
          e.preventDefault();
          return;
        }
        var sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
          e.preventDefault();
        }
      });
      document.addEventListener('click', function (e) {
        var pop = document.getElementById('highlightPopover');
        if (!pop || pop.style.display === 'none') return;
        if (pop.contains(e.target) || (e.target.closest && e.target.closest('mark.user-highlight'))) return;
        hidePopover();
      });

      updateBadges();
    }
  };
})();
