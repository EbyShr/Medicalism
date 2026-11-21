/**
 * MEDICALISM ALBORZ - PMP SURGERY EXAM ENGINE (UPGRADED + SHARDED)
 * Preserves 100% of PMP Surgery Trainer 3.1 scoring, branching, timer, pause/auto-pause,
 * backup/restore, clinical error analysis, and case review mechanics while loading
 * data chunks dynamically on demand (< 100 KB per request).
 */
(function () {
  'use strict';

  /* ========================================================================
   * 1. DETERMINISTIC SCORING ENGINE
   * ======================================================================== */
  var CLASSES = ['necessary', 'harmful', 'neutral', 'premature'];

  function counts(classes) {
    var c = { necessary: 0, harmful: 0, neutral: 0, premature: 0 };
    var vals = Object.values(classes);
    for (var i = 0; i < vals.length; i++) c[vals[i]]++;
    return c;
  }

  function scorePerOption(key, selected, cfg) {
    var w = Object.assign({}, cfg.perOption, key.weightsOverride || {});
    var sel = new Set(selected);
    var breakdown = {};
    var raw = 0, max = 0, min = 0;
    var entries = Object.entries(key.classes);
    for (var i = 0; i < entries.length; i++) {
      var id = entries[i][0], cls = entries[i][1];
      var picked = sel.has(id);
      var pts, hi, lo;
      if (cls === 'necessary') { pts = picked ? w.necessarySelected : w.necessaryMissed; hi = w.necessarySelected; lo = w.necessaryMissed; }
      else if (cls === 'harmful') { pts = picked ? w.harmfulSelected : w.harmfulAvoided; hi = w.harmfulAvoided; lo = w.harmfulSelected; }
      else if (cls === 'premature') { pts = picked ? w.prematureSelected : w.prematureOmitted; hi = Math.max(w.prematureSelected, w.prematureOmitted); lo = Math.min(w.prematureSelected, w.prematureOmitted); }
      else { pts = picked ? w.neutralSelected : w.neutralOmitted; hi = Math.max(w.neutralSelected, w.neutralOmitted); lo = Math.min(w.neutralSelected, w.neutralOmitted); }
      breakdown[id] = { class: cls, selected: picked, points: pts };
      raw += pts; max += hi; min += lo;
    }
    return { raw: raw, max: max, min: min, breakdown: breakdown };
  }

  function scoreSingleBest(key, selected, cfg) {
    var w = cfg.singleBest;
    var ids = Object.keys(key.classes);
    var best = ids.find(function (i) { return key.classes[i] === 'necessary'; });
    var pick = selected[0];
    var raw;
    if (pick === undefined) raw = w.omitted;
    else if (pick === best) raw = w.correct;
    else if (key.classes[pick] === 'harmful') raw = w.harmfulChosen;
    else raw = w.otherChosen;
    var breakdown = {};
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      breakdown[id] = { class: key.classes[id], selected: id === pick, points: id === pick ? raw : 0 };
    }
    return { raw: raw, max: w.correct, min: Math.min(w.harmfulChosen, w.otherChosen, w.omitted), breakdown: breakdown };
  }

  function scoreItem(format, key, selected, cfg) {
    if (!Array.isArray(selected)) throw new Error('selected must be an array');
    var uniq = Array.from(new Set(selected));
    for (var i = 0; i < uniq.length; i++) {
      if (!(uniq[i] in key.classes)) throw new Error('unknown option id: ' + uniq[i]);
    }
    if (format === 'single_best') {
      if (uniq.length > 1) throw new Error('single_best accepts at most one selection');
      return scoreSingleBest(key, uniq, cfg);
    }
    if (format === 'multi_response') return scorePerOption(key, uniq, cfg);
    throw new Error('unknown format: ' + format);
  }

  function normalize(raw, max, min) {
    return {
      raw: raw, max: max, min: min,
      rawPercent: max === 0 ? 0 : (raw / max) * 100,
      scaledPercent: max === min ? 0 : ((raw - min) / (max - min)) * 100
    };
  }

  /* ========================================================================
   * 2. SESSION / CASE-FLOW ENGINE (Index-aware + On-Demand Chunk Hydration)
   * ======================================================================== */
  function PmpError(code, msg) {
    this.name = 'PmpError';
    this.message = msg || code;
    this.code = code;
  }
  PmpError.prototype = Object.create(Error.prototype);

  function matches(when, selected) {
    if (!when) return true;
    var s = new Set(selected);
    if (when.anySelected && !when.anySelected.some(function (x) { return s.has(x); })) return false;
    if (when.allSelected && !when.allSelected.every(function (x) { return s.has(x); })) return false;
    if (when.noneSelected && when.noneSelected.some(function (x) { return s.has(x); })) return false;
    return true;
  }

  function buildIndexBank(indexObj) {
    var rawCases = (indexObj && indexObj.cases) ? indexObj.cases : [];
    var cases = [];
    var caseById = {};
    var stageById = {};

    for (var i = 0; i < rawCases.length; i++) {
      var meta = rawCases[i];
      var stages = (meta.stagesMeta || []).slice().sort(function (a, b) { return (a.seq || 0) - (b.seq || 0); });
      var caseEntry = {
        caseId: meta.caseId,
        order: meta.order,
        title: meta.title,
        topics: meta.topics || [],
        patient: meta.patient || {},
        chunkId: meta.chunkId,
        hasImages: !!meta.hasImages,
        stages: stages
      };
      cases.push(caseEntry);
      caseById[caseEntry.caseId] = caseEntry;
      for (var j = 0; j < stages.length; j++) {
        stageById[stages[j].itemId] = { case: caseEntry, stage: stages[j] };
      }
    }
    return { cases: cases, caseById: caseById, stageById: stageById };
  }

  function resolveFullCase(bank, caseId) {
    if (window.PmpLoader) {
      var loaded = window.PmpLoader.getLoadedCase(caseId);
      if (loaded) return loaded;
    }
    return bank.caseById[caseId];
  }

  function resolveFullStage(bank, itemId) {
    if (window.PmpLoader) {
      var ref = window.PmpLoader.getLoadedStage(itemId);
      if (ref) return ref;
    }
    return bank.stageById[itemId];
  }

  function nextStageId(stage, selected) {
    var branches = stage.branches || [];
    for (var i = 0; i < branches.length; i++) {
      if (matches(branches[i].when, selected)) return branches[i].goto;
    }
    return stage.next || null;
  }

  function chain(state, bank, caseObj) {
    var c = resolveFullCase(bank, caseObj.caseId) || caseObj;
    var out = [];
    var seen = new Set();
    var cur = c.stages && c.stages[0];
    var open = false;
    while (cur && !seen.has(cur.itemId)) {
      seen.add(cur.itemId);
      var com = state.committed[cur.itemId];
      var status;
      if (com) status = 'committed';
      else if (!open) { status = 'open'; open = true; }
      else status = 'locked';
      out.push({ itemId: cur.itemId, stage: cur, status: status });
      var nid = com ? nextStageId(cur, com.selected) : (cur.next || null);
      var ref = nid ? resolveFullStage(bank, nid) : null;
      cur = ref ? ref.stage : null;
    }
    return out;
  }

  function itemStatus(state, bank, itemId) {
    var ref = resolveFullStage(bank, itemId);
    if (!ref) throw new PmpError('UNKNOWN_ITEM', itemId);
    var list = chain(state, bank, ref.case);
    for (var i = 0; i < list.length; i++) {
      if (list[i].itemId === itemId) return list[i].status;
    }
    return 'unreachable';
  }

  function createSession(bank, cfg, mode, now, opts) {
    var timed = !(opts && opts.timed === false);
    if (mode !== 'exam' && mode !== 'practice') throw new PmpError('BAD_MODE');
    var startCaseId = (opts && opts.startCaseId && bank.caseById[opts.startCaseId]) ? opts.startCaseId : bank.cases[0].caseId;
    var firstCase = bank.caseById[startCaseId];
    var first = firstCase.stages[0].itemId;
    return {
      v: 1, mode: mode, cfgVersion: cfg.version, startedAt: now,
      deadline: mode === 'exam' && timed ? now + cfg.session.totalMinutes * 60000 : null,
      timed: mode === 'exam' && timed, pausedAt: null, lastSeen: now, pauses: 0, pausedMs: 0,
      status: 'in_progress', submittedAt: null, submitReason: null,
      committed: {}, drafts: {}, current: first
    };
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function remainingMs(st, now) {
    return st.deadline == null ? null : Math.max(0, st.deadline - (st.pausedAt != null ? st.pausedAt : now));
  }
  function isExpired(st, now) { return st.deadline != null && st.pausedAt == null && now >= st.deadline; }
  function isPaused(st) { return st.pausedAt != null && st.status === 'in_progress'; }

  function pause(state, now) {
    if (state.mode !== 'exam' || state.deadline == null || state.status !== 'in_progress' || state.pausedAt != null || isExpired(state, now)) return state;
    var s = clone(state); s.pausedAt = now; s.pauses = (s.pauses || 0) + 1; return s;
  }
  function resume(state, now) {
    if (state.pausedAt == null) return state;
    var s = clone(state);
    var delta = Math.max(0, now - s.pausedAt);
    s.deadline += delta; s.pausedMs = (s.pausedMs || 0) + delta; s.pausedAt = null; s.lastSeen = now;
    return s;
  }
  function touch(state, now) {
    if (state.status !== 'in_progress' || state.pausedAt != null) return state;
    var s = clone(state); s.lastSeen = now; return s;
  }
  function applyAutoPause(state, now, gapMs) {
    if (state.mode !== 'exam' || state.deadline == null || state.status !== 'in_progress' || state.pausedAt != null) return state;
    var seen = state.lastSeen != null ? state.lastSeen : now;
    if (now - seen <= gapMs) return state;
    if (seen >= state.deadline) return state;
    var s = clone(state); s.pausedAt = seen; s.pauses = (s.pauses || 0) + 1; return s;
  }

  function validateSelection(stage, selected) {
    if (!Array.isArray(selected)) throw new PmpError('BAD_SELECTION');
    var ids = new Set((stage.options || []).map(function (o) { return o.id; }));
    var u = Array.from(new Set(selected));
    for (var i = 0; i < u.length; i++) if (!ids.has(u[i])) throw new PmpError('UNKNOWN_OPTION', u[i]);
    if (stage.format === 'single_best' && u.length > 1) throw new PmpError('TOO_MANY', 'single_best allows one selection');
    return u;
  }

  function setDraft(state, bank, itemId, selected, now) {
    if (state.status !== 'in_progress' || state.pausedAt != null || isExpired(state, now)) return state;
    var ref = resolveFullStage(bank, itemId);
    if (!ref || itemStatus(state, bank, itemId) !== 'open') return state;
    var s = clone(state);
    s.drafts[itemId] = validateSelection(ref.stage, selected);
    return s;
  }

  function commit(state, bank, itemId, selected, now) {
    if (state.status !== 'in_progress') throw new PmpError('SUBMITTED');
    if (state.pausedAt != null) throw new PmpError('PAUSED');
    if (isExpired(state, now)) throw new PmpError('TIME_EXPIRED');
    var ref = resolveFullStage(bank, itemId);
    if (!ref) throw new PmpError('UNKNOWN_ITEM', itemId);
    if (state.committed[itemId]) throw new PmpError('ALREADY_COMMITTED');
    if (itemStatus(state, bank, itemId) !== 'open') throw new PmpError('LOCKED');
    var sel = validateSelection(ref.stage, selected);
    var s = clone(state);
    s.committed[itemId] = { selected: sel, at: now };
    delete s.drafts[itemId];
    return s;
  }

  function finalize(state, bank, cfg, reason, now) {
    if (state.status === 'submitted') return state;
    var s = clone(resume(state, now));
    if (reason === 'timeout' && cfg.session.submitDraftsOnTimeout) {
      var at = s.deadline != null ? s.deadline : now;
      var progressed = true;
      while (progressed) {
        progressed = false;
        for (var i = 0; i < bank.cases.length; i++) {
          var open = chain(s, bank, bank.cases[i]).find(function (e) { return e.status === 'open'; });
          if (open && s.drafts[open.itemId]) {
            s.committed[open.itemId] = { selected: s.drafts[open.itemId], at: at };
            delete s.drafts[open.itemId];
            progressed = true;
          }
        }
      }
    }
    s.status = 'submitted';
    s.submitReason = reason;
    s.submittedAt = reason === 'timeout' && s.deadline != null ? s.deadline : now;
    return s;
  }

  function scoredItemIds(state, bank) {
    var ids = [];
    for (var i = 0; i < bank.cases.length; i++) {
      var ch = chain(state, bank, bank.cases[i]);
      for (var j = 0; j < ch.length; j++) ids.push(ch[j].itemId);
    }
    return ids;
  }

  function caseFile(state, bank, caseId) {
    var c = resolveFullCase(bank, caseId);
    var path = chain(state, bank, c);
    var out = [];
    var prevResults = [];
    for (var i = 0; i < path.length; i++) {
      var e = path[i];
      if (e.status === 'locked') break;
      var com = state.committed[e.itemId];
      var results = [];
      if (com && Array.isArray(e.stage.conditionalInfo)) {
        for (var j = 0; j < e.stage.conditionalInfo.length; j++) {
          var ci = e.stage.conditionalInfo[j];
          if (matches(ci.when, com.selected) && Array.isArray(ci.blocks)) {
            results = results.concat(ci.blocks);
          }
        }
      }
      out.push({
        itemId: e.itemId, seq: e.stage.seq, status: e.status,
        resultsFromPrev: prevResults, info: e.stage.info || [], ownResults: results,
        selected: com ? com.selected : null
      });
      prevResults = results;
    }
    return out;
  }

  function computeResults(state, bank, keys, cfg) {
    var ids = scoredItemIds(state, bank);
    var items = [];
    var raw = 0, max = 0, min = 0, answered = 0;
    var byTopic = {}, byFormat = {};
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var ref = resolveFullStage(bank, id);
      var c = ref.case, stage = ref.stage;
      var key = keys[c.caseId].items[id];
      var com = state.committed[id];
      var selected = com ? com.selected : [];
      var sc = scoreItem(stage.format, key, selected, cfg);
      var perfect = scoreItem(stage.format, key, Object.keys(key.classes).filter(function (k) { return key.classes[k] === 'necessary'; }), cfg);
      var itemMax = perfect.max, itemMin = sc.min;
      if (com) answered++;
      raw += sc.raw; max += itemMax; min += itemMin;
      var pairs = [[byTopic, stage.topic], [byFormat, stage.format]];
      for (var p = 0; p < pairs.length; p++) {
        var bucket = pairs[p][0], name = pairs[p][1];
        var b = bucket[name] || (bucket[name] = { raw: 0, max: 0, min: 0, items: 0 });
        b.raw += sc.raw; b.max += itemMax; b.min += itemMin; b.items++;
      }
      items.push({
        itemId: id, caseId: c.caseId, topic: stage.topic, format: stage.format,
        phase: stage.phase, answered: !!com, selected: selected,
        raw: sc.raw, max: itemMax, min: itemMin, breakdown: sc.breakdown
      });
    }
    var end = state.submittedAt != null ? state.submittedAt : null;
    return {
      items: items, answered: answered, unanswered: ids.length - answered, total: ids.length,
      totals: normalize(raw, max, min),
      byTopic: byTopic, byFormat: byFormat,
      timeUsedMs: end != null ? Math.max(0, end - state.startedAt - (state.pausedMs || 0)) : null,
      pauses: state.pauses || 0, pausedMs: state.pausedMs || 0,
      timed: state.timed !== false && state.mode === 'exam',
      submitReason: state.submitReason, mode: state.mode, scoringVersion: cfg.version
    };
  }

  /* ========================================================================
   * 3. BACKUP / RESTORE ENGINE (Unchanged checksum & format)
   * ======================================================================== */
  function djb2Hash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(16);
  }

  function makeBackup(sessions, bank, cfg, now) {
    var data = JSON.stringify({
      app: 'pmp-surgery', v: 1, exportedAt: now, scoringVersion: cfg.version,
      itemCount: Object.keys(bank.stageById).length,
      sessions: { exam: sessions.exam || null, practice: sessions.practice || null }
    });
    return JSON.stringify({ check: djb2Hash(data), data: data });
  }

  function validateSession(s, mode, bank) {
    if (!s || typeof s !== 'object') return 'ساختار جلسه نامعتبر است';
    if (s.mode !== mode) return 'نوع جلسه با محل ذخیره نمی‌خواند';
    if (s.status !== 'in_progress' && s.status !== 'submitted') return 'وضعیت جلسه نامعتبر است';
    if (!s.committed || typeof s.committed !== 'object') return 'تصمیم‌های ثبت‌شده یافت نشد';
    var comEntries = Object.entries(s.committed);
    for (var i = 0; i < comEntries.length; i++) {
      var id = comEntries[i][0], c = comEntries[i][1];
      var ref = resolveFullStage(bank, id);
      if (!ref) return 'آیتم ناشناخته در پشتیبان: ' + id + ' (این پشتیبان از نسخه دیگری از بانک سؤال است)';
      var ids = new Set((ref.stage.options || []).map(function (o) { return o.id; }));
      if (!Array.isArray(c.selected) || c.selected.some(function (x) { return !ids.has(x); })) return 'گزینه نامعتبر در ' + id;
    }
    var draftEntries = Object.entries(s.drafts || {});
    for (var j = 0; j < draftEntries.length; j++) {
      var did = draftEntries[j][0], d = draftEntries[j][1];
      var dref = resolveFullStage(bank, did);
      if (!dref || !Array.isArray(d) || d.some(function (x) { return !(dref.stage.options || []).some(function (o) { return o.id === x; }); })) {
        return 'پیش‌نویس نامعتبر در ' + did;
      }
    }
    return null;
  }

  function parseBackup(text, bank) {
    var outer;
    try { outer = JSON.parse(String(text).trim()); } catch (e) { return { ok: false, error: 'متن پشتیبان خوانده نشد (ناقص کپی شده یا فایل اشتباه است).' }; }
    if (!outer || typeof outer.data !== 'string' || typeof outer.check !== 'string') return { ok: false, error: 'قالب پشتیبان نامعتبر است.' };
    if (djb2Hash(outer.data) !== outer.check) return { ok: false, error: 'پشتیبان آسیب‌دیده یا ناقص است (کد کنترل نمی‌خواند).' };
    var d;
    try { d = JSON.parse(outer.data); } catch (e) { return { ok: false, error: 'محتوای پشتیبان خوانده نشد.' }; }
    if (d.app !== 'pmp-surgery' || d.v !== 1) return { ok: false, error: 'این پشتیبان مربوط به این برنامه یا نسخه نیست.' };
    var out = { exam: null, practice: null };
    var modes = ['exam', 'practice'];
    for (var i = 0; i < modes.length; i++) {
      var mode = modes[i];
      var s = d.sessions && d.sessions[mode];
      if (!s) continue;
      var err = validateSession(s, mode, bank);
      if (err) return { ok: false, error: err };
      out[mode] = s;
    }
    if (!out.exam && !out.practice) return { ok: false, error: 'این پشتیبان هیچ جلسه‌ای ندارد.' };
    function info(m) { return out[m] ? { status: out[m].status, committed: Object.keys(out[m].committed).length } : null; }
    return { ok: true, sessions: out, summary: { exam: info('exam'), practice: info('practice'), exportedAt: d.exportedAt } };
  }

  /* ========================================================================
   * 4. STORAGE ADAPTER (Never clears or overwrites user highlights!)
   * ======================================================================== */
  function createStorage(env) {
    env = env || (typeof globalThis !== 'undefined' ? globalThis : {});
    var ws = env.storage && typeof env.storage.get === 'function' && typeof env.storage.set === 'function' ? env.storage : null;
    var ls = null;
    try {
      if (env.localStorage) {
        env.localStorage.setItem('__pmp_probe', '1');
        env.localStorage.removeItem('__pmp_probe');
        ls = env.localStorage;
      }
    } catch (e) { ls = null; }
    var mem = {};
    var kind = ws ? 'artifact' : ls ? 'localStorage' : 'memory';
    return {
      kind: kind,
      get: function (key) {
        return new Promise(function (resolve) {
          try {
            if (ws) {
              ws.get(key).then(function (r) { resolve(r && r.value != null ? JSON.parse(r.value) : null); }, function () { resolve(null); });
              return;
            }
            if (ls) {
              var v = ls.getItem(key);
              resolve(v == null ? null : JSON.parse(v));
              return;
            }
            resolve(key in mem ? JSON.parse(mem[key]) : null);
          } catch (e) { resolve(null); }
        });
      },
      set: function (key, value) {
        var str = JSON.stringify(value);
        return new Promise(function (resolve) {
          try {
            if (ws) {
              ws.set(key, str).then(function () { resolve(true); }, function () { resolve(false); });
              return;
            }
            if (ls) {
              ls.setItem(key, str);
              resolve(true);
              return;
            }
            mem[key] = str;
            resolve(true);
          } catch (e) { resolve(false); }
        });
      },
      remove: function (key) {
        return new Promise(function (resolve) {
          try {
            if (ws) ws.delete(key).then(function () { resolve(); }, function () { resolve(); });
            else if (ls) { ls.removeItem(key); resolve(); }
            else { delete mem[key]; resolve(); }
          } catch (e) { resolve(); }
        });
      }
    };
  }

  /* ========================================================================
   * 5. RENDERERS (Medicalism Clinical Workstation UI + Full Original Detail)
   * ======================================================================== */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function num(x) { return '<bdi dir="ltr">' + esc(x) + '</bdi>'; }
  function sgn(n) { return (n > 0 ? '+' : n < 0 ? '\u2212' : '') + Math.abs(n); }
  function sgnH(n) { return num(sgn(n)); }
  function letter(i) { return String.fromCharCode(65 + i); }

  function fmtClock(ms) {
    if (ms == null) return '--:--';
    var t = Math.ceil(ms / 1000), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    function p(n) { return String(n).padStart(2, '0'); }
    return (h ? h + ':' : '') + p(m) + ':' + p(s);
  }
  function fmtDur(ms) {
    return ms == null ? '-' : Math.floor(ms / 60000) + ' دقیقه و ' + Math.floor((ms % 60000) / 1000) + ' ثانیه';
  }
  function pct(n) { return (Math.round(n * 10) / 10).toFixed(1) + '%'; }

  var FORMAT_LABEL = { multi_response: 'چندپاسخی', single_best: 'تک‌پاسخ (بهترین گزینه)' };
  var PHASE_LABEL = {
    initial_assessment: 'ارزیابی اولیه', stabilization: 'تثبیت', workup: 'کار‌آپ تشخیصی',
    interpretation: 'تفسیر', definitive: 'درمان قطعی', complication: 'عارضه', reassessment: 'ارزیابی مجدد'
  };
  var CLASS_LABEL = { necessary: 'لازم', harmful: 'مضر / ممنوع', neutral: 'بی‌اهمیت', premature: 'زودهنگام' };
  var TOPIC_LABEL = {
    trauma: 'تروما', nutrition: 'تغذیه جراحی', fluids_electrolytes: 'مایعات و الکترولیت', shock: 'شوک',
    acid_base: 'اسید-باز', stomach: 'معده', duodenum: 'دوازدهه', esophagus: 'مری', liver: 'کبد',
    biliary: 'صفراوی', pancreas: 'پانکراس', spleen: 'طحال', small_intestine: 'روده باریک',
    appendix: 'آپاندیس', hernias: 'فتق', breast: 'پستان', endocrine: 'غدد درون‌ریز',
    vascular: 'عروق', thoracic: 'توراکس', neurosurgery: 'جراحی اعصاب', hemostasis: 'هموستاز',
    burns: 'سوختگی', wound_healing: 'ترمیم زخم', plastic: 'جراحی پلاستیک',
    critical_care: 'مراقبت ویژه', soft_tissue_skin_malignancy: 'بدخیمی بافت نرم و پوست'
  };
  function topicLabel(t) { return TOPIC_LABEL[t] || t; }

  function outcome(format, cls, picked) {
    if (format === 'single_best') {
      if (cls === 'necessary') return picked ? { ok: true, kind: 'good', text: '✅ اقدام صحیح: بهترین گزینه را انتخاب کردی', icon: '\u2713' } : { ok: false, kind: 'missed', text: '⚠️ پاسخ صحیحِ از قلم افتاده', icon: '!' };
      if (picked) return cls === 'harmful' ? { ok: false, kind: 'bad', text: '⛔ بدون اندیکاسیون / نمره منفی: گزینه مضر', icon: '\u2717' } : { ok: false, kind: 'bad', text: '⛔ انتخاب غیربهینه', icon: '\u2717' };
      return cls === 'harmful' ? { ok: true, kind: 'good', text: '✅ پرهیز صحیح از اقدام مضر', icon: '\u2713' } : { ok: null, kind: 'neu', text: '○ انتخاب نشد', icon: '\u25CB' };
    }
    if (cls === 'necessary') return picked ? { ok: true, kind: 'good', text: '✅ اقدام صحیح (الزامی انتخاب شد)', icon: '\u2713' } : { ok: false, kind: 'missed', text: '⚠️ اقدام الزامیِ از قلم افتاده (نمره منفی)', icon: '!' };
    if (cls === 'harmful') return picked ? { ok: false, kind: 'bad', text: '⛔ بدون اندیکاسیون / مضر (نمره منفی)', icon: '\u2717' } : { ok: true, kind: 'good', text: '✅ پرهیز صحیح از اقدام مضر', icon: '\u2713' };
    var kind = cls === 'premature' ? 'زودهنگام' : 'بی‌اهمیت';
    return { ok: null, kind: 'neu', text: '○ ' + (picked ? 'انتخاب شد' : 'انتخاب نشد') + '؛ ' + kind + ' (۰)', icon: '\u25CB' };
  }

  function renderVitalsPills(raw) {
    var parts = String(raw || '').split(/[\r\n,;]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) return '<p dir="ltr">' + nl(raw) + '</p>';
    return '<div class="pmp-vitals-grid" role="list">' + parts.map(function (part) {
      return '<span class="pmp-vital-pill" role="listitem"><span class="pmp-vital-dot" aria-hidden="true"></span><span class="pmp-vital-val" dir="ltr">' + esc(part) + '</span></span>';
    }).join('') + '</div>';
  }

  function radiologyFallbackHtml(descText, titleText) {
    var titleBlock = titleText && titleText !== descText
      ? '<div class="pmp-radiology-fallback-title" dir="auto">' + esc(titleText) + '</div>'
      : '';
    var bodyText = descText || titleText || 'نمای تصویربرداری بالینی مرتبط با مرحله فعلی بیمار';
    return '<div class="pmp-radiology-fallback" role="note">' +
      '<div class="pmp-radiology-fallback-head"><span class="pmp-radiology-icon" aria-hidden="true">🩻</span><span>نمای کلیشه تصویربرداری</span></div>' +
      titleBlock +
      '<p class="pmp-radiology-fallback-desc" dir="auto">' + esc(bodyText) + '</p>' +
      '</div>';
  }

  function blockHtml(b, opts) {
    opts = opts || {};
    if (b.type === 'image' && b.src) {
      var fallbackJson = JSON.stringify(b.fallbackSrcs || []);
      var imgDesc = b.caption || b.sourceLabel || b.alt || b.title || 'نمای تصویربرداری بالینی مرتبط با پرونده بیمار';
      var imgTitle = b.title || '';
      return '<section class="clinical-image-block' + (opts.fresh ? ' clinical-image-fresh' : '') + '">' +
        '<button class="clinical-image-open" type="button" data-action="openImage" data-src="' + esc(b.src) + '" data-fallbacks="' + esc(fallbackJson) + '" data-desc="' + esc(imgDesc) + '" data-title="' + esc(imgTitle) + '" aria-label="بزرگ‌نمایی تصویر پزشکی">' +
        '<img loading="lazy" data-fallbacks="' + esc(fallbackJson) + '" data-fallback-index="0" src="' + esc(b.src) + '" alt="' + esc(imgDesc) + '" onerror="window.__pmpImgErr(this)">' +
        '</button>' + radiologyFallbackHtml(imgDesc, imgTitle) + '</section>';
    }
    var expand = (b.type === 'lab_table' || b.type === 'report') ? '<button class="link pmp-expand-btn" data-action="openBlock" data-block="' + esc(b.id) + '" aria-label="باز کردن ' + esc(b.title) + ' در نمایشگر">نمایشگر کامل</button>' : '';
    var bodyHtml = b.type === 'vitals'
      ? renderVitalsPills(b.content)
      : '<p' + (b.type === 'lab_table' ? ' dir="ltr"' : '') + '>' + nl(b.content) + '</p>';
    return '<section class="blk blk-' + esc(b.type) + (opts.fresh ? ' blk-fresh' : '') + '">' +
      '<header><h4>' + esc(b.title) + '</h4>' + expand + '</header>' +
      bodyHtml + '</section>';
  }

  window.__pmpImgErr = function (imgEl) {
    var f = [];
    try { f = JSON.parse(imgEl.dataset.fallbacks || '[]'); } catch (e) {}
    var n = Number(imgEl.dataset.fallbackIndex || 0);
    if (n < f.length) {
      imgEl.dataset.fallbackIndex = String(n + 1);
      imgEl.src = f[n];
      return;
    }
    var b = imgEl.closest('.clinical-image-block');
    if (b) b.classList.add('image-load-failed');
    imgEl.style.display = 'none';
  };

  window.__pmpModalImgErr = function (imgEl) {
    var f = [];
    try { f = JSON.parse(imgEl.dataset.fallbacks || '[]'); } catch (e) {}
    var n = Number(imgEl.dataset.fallbackIndex || 0);
    if (n < f.length) {
      imgEl.dataset.fallbackIndex = String(n + 1);
      imgEl.src = f[n];
      return;
    }
    var box = document.createElement('div');
    box.innerHTML = radiologyFallbackHtml(imgEl.dataset.desc || imgEl.alt || '', imgEl.dataset.title || '');
    imgEl.replaceWith(box.firstChild);
  };

  function attachmentChips(stage) {
    var atts = stage.attachments || [];
    if (!atts.length) return '';
    var images = atts.filter(function (a) { return a.kind === 'image' && a.src; }).map(function (a) {
      var fallbackJson = JSON.stringify(a.fallbackSrcs || []);
      var desc = a.caption || a.sourceLabel || a.alt || a.title || 'نمای تصویربرداری بالینی مرتبط با مرحله فعلی بیمار';
      var titleText = a.title || '';
      var caption = titleText ? '<div class="clinical-image-caption">' + esc(titleText) + '</div>' : '';
      var source = a.sourceLabel ? '<div class="clinical-image-source">' + esc(a.sourceLabel) + '</div>' : '';
      return '<div class="clinical-image-block">' +
        '<button class="clinical-image-open" type="button" data-action="openImage" data-src="' + esc(a.src) + '" data-fallbacks="' + esc(fallbackJson) + '" data-desc="' + esc(desc) + '" data-title="' + esc(titleText) + '" aria-label="بزرگ‌نمایی تصویر پزشکی">' +
        '<img loading="lazy" data-fallbacks="' + esc(fallbackJson) + '" data-fallback-index="0" src="' + esc(a.src) + '" alt="' + esc(a.alt || a.title || 'تصویر پزشکی') + '" onerror="window.__pmpImgErr(this)">' +
        '</button>' + caption + source + radiologyFallbackHtml(desc, titleText) + '</div>';
    }).join('');
    var other = atts.filter(function (a) { return !(a.kind === 'image' && a.src); });
    var chips = other.length ? '<div class="chips">' + other.map(function (a) {
      return '<button class="chip" data-action="openAttachment" data-att="' + esc(a.id) + '" data-item="' + esc(stage.itemId) + '">' +
        '📎 ' + esc(a.title) + (a.synthetic ? ' (تصویر آموزشی ساختگی)' : '') + '</button>';
    }).join('') + '</div>' : '';
    return (images ? '<div class="clinical-images">' + images + '</div>' : '') + chips;
  }

  function scoringSummary(cfg) {
    var p = cfg.perOption, sb = cfg.singleBest;
    return '<table class="plain"><thead><tr><th>نوع آیتم</th><th>وضعیت</th><th>امتیاز</th></tr></thead><tbody>' +
      '<tr><td rowspan="5">چندپاسخی</td><td>انتخاب اقدام لازم</td><td>' + sgnH(p.necessarySelected) + '</td></tr>' +
      '<tr><td>جا انداختن اقدام لازم</td><td>' + sgnH(p.necessaryMissed) + '</td></tr>' +
      '<tr><td>انتخاب اقدام مضر یا ممنوع</td><td>' + sgnH(p.harmfulSelected) + '</td></tr>' +
      '<tr><td>انتخاب نکردن اقدام مضر</td><td>' + sgnH(p.harmfulAvoided) + '</td></tr>' +
      '<tr><td>انتخاب یا نکردن اقدام بی‌اهمیت</td><td>' + sgnH(p.neutralSelected) + '</td></tr>' +
      '<tr><td rowspan="4">تک‌پاسخ</td><td>انتخاب بهترین گزینه</td><td>' + sgnH(sb.correct) + '</td></tr>' +
      '<tr><td>انتخاب گزینه مضر</td><td>' + sgnH(sb.harmfulChosen) + '</td></tr>' +
      '<tr><td>انتخاب هر گزینه دیگر</td><td>' + sgnH(sb.otherChosen) + '</td></tr>' +
      '<tr><td>بدون پاسخ</td><td>' + sgnH(sb.omitted) + '</td></tr></tbody></table>';
  }

  function storageNote(kind) {
    var m = {
      artifact: 'پیشرفت تو در حافظه خود این برنامه روی همین دستگاه ذخیره می‌شود.',
      localStorage: 'پیشرفت تو در همین مرورگر (localStorage) ذخیره می‌شود و با سایر ابزارها و هایلایت‌های سایت تداخلی ندارد.',
      memory: 'در این محیط ذخیره‌سازی ممکن نیست. با refresh کردن صفحه، جلسه از بین می‌رود.'
    };
    return m[kind] || m.memory;
  }

  function landing(ctx) {
    var cfg = ctx.cfg, bank = ctx.bank, saved = ctx.saved, storageKind = ctx.storageKind, ui = ctx.ui, indexObj = ctx.indexObj;
    var n = indexObj.totalStages || scoredItemIds(createSession(bank, cfg, 'exam', 0), bank).length;
    var totalCases = bank.cases.length;
    var mname = { exam: 'آزمون', practice: 'تمرین' };

    function resumeBtn(mode) {
      var s = saved[mode];
      if (!s) return '';
      var paused = s.pausedAt != null && s.deadline != null ? ' · متوقف‌شده، ' + num(fmtClock(remainingMs(s, 0))) + ' باقی‌مانده' : '';
      return s.status === 'submitted'
        ? '<button class="btn ghost" data-action="viewResults" data-mode="' + mode + '">مشاهده آخرین نتیجه ' + mname[mode] + '</button>'
        : '<button class="btn" data-action="resume" data-mode="' + mode + '">ادامه ' + mname[mode] + ' (' + num(Object.keys(s.committed).length) + ' تصمیم ثبت‌شده' + paused + ')</button>';
    }

    // Topic filters & search over lightweight index metadata (ZERO body chunks needed!)
    var q = (ui.caseQuery || '').trim().toLowerCase();
    var activeTopic = ui.caseTopic || 'all';
    var topicKeys = Object.keys(indexObj.topicCounts || {}).sort(function (a, b) {
      return (indexObj.topicCounts[b] || 0) - (indexObj.topicCounts[a] || 0);
    });

    var filteredCases = bank.cases.filter(function (c) {
      if (activeTopic !== 'all' && (c.topics || []).indexOf(activeTopic) === -1) return false;
      if (q) {
        var hay = (c.caseId + ' ' + c.title + ' ' + (c.patient && c.patient.setting || '') + ' ' + (c.topics || []).map(topicLabel).join(' ')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var topicPillsHtml = '<button class="pmp-topic-pill' + (activeTopic === 'all' ? ' active' : '') + '" data-action="filterTopic" data-topic="all">همه مباحث (' + num(totalCases) + ')</button>' +
      topicKeys.map(function (t) {
        return '<button class="pmp-topic-pill' + (activeTopic === t ? ' active' : '') + '" data-action="filterTopic" data-topic="' + esc(t) + '">' +
          esc(topicLabel(t)) + ' (' + num(indexObj.topicCounts[t]) + ')</button>';
      }).join('');

    var caseCardsHtml = filteredCases.map(function (c) {
      var p = c.patient || {};
      var badges = (c.topics || []).slice(0, 3).map(function (t) {
        return '<span class="pmp-case-topic-tag">' + esc(topicLabel(t)) + '</span>';
      }).join('');
      return '<article class="pmp-case-card">' +
        '<div class="pmp-case-card-top">' +
          '<span class="pmp-case-id-pill">' + esc(c.caseId) + '</span>' +
          '<div class="pmp-case-badges">' +
            (c.hasImages ? '<span class="pmp-media-badge" title="دارای تصویر بالینی">🖼️ تصویر بالینی</span>' : '') +
            '<span class="pmp-stage-badge">' + num(c.stages.length) + ' مرحله</span>' +
          '</div>' +
        '</div>' +
        '<h3 class="pmp-case-title">' + esc(c.title) + '</h3>' +
        '<p class="pmp-case-patient">' + esc(p.sex || '') + (p.age ? ' · ' + num(p.age) + ' ساله' : '') + (p.setting ? ' · ' + esc(p.setting) : '') + '</p>' +
        '<div class="pmp-case-topics">' + badges + '</div>' +
        '<div class="pmp-case-actions">' +
          '<button class="btn small" data-action="openCasePractice" data-case="' + esc(c.caseId) + '">شروع در حالت تمرین</button>' +
          '<button class="btn small ghost" data-action="openCaseExam" data-case="' + esc(c.caseId) + '">باز کردن در آزمون</button>' +
        '</div>' +
      '</article>';
    }).join('');

    return '<main class="landing"><div class="landing-inner">' +
      '<section class="pmp-hero-banner">' +
        '<div class="pmp-hero-badge"><span>🖥️ ایستگاه شبیه‌ساز بالینی مدیکالیسم البرز</span><span class="version-pill">نسخه ۳.۱</span></div>' +
        '<h1>سامانه جامع شبیه‌ساز آزمون PMP و کیس‌های بالینی جراحی</h1>' +
        '<p class="lede">مسائل مدیریت بیمار (Patient Management Problem) ویژه کارآموزی و اکسترنی جراحی عمومی؛ شامل ' + num(totalCases) + ' سناریوی بالینی واقعی و ' + num(n) + ' مرحله تصمیم‌گیری همراه با نمره‌دهی استاندارد، تحلیل خطاهای بالینی و تصاویر تشخیصی.</p>' +
        '<p class="image-general-note">تصاویر تشخیصی پنج سناریوی نخست، نمونه‌های آموزشیِ بدون نشانه‌گذاری از موارد دیگرند و لزوماً متعلق به بیمار همان سناریو نیستند؛ برای تمرین تفسیر تصویری ارائه می‌شوند.</p>' +
      '</section>' +
      '<div class="modes">' +
        '<section class="mode mode-exam"><div class="mode-kicker">شبیه‌ساز رسمی</div><h2>حالت آزمون</h2>' +
          '<p>شمارش معکوس ' + num(cfg.session.totalMinutes) + ' دقیقه‌ای (یا بدون تایمر). تصمیم‌های ثبت‌شده قفل می‌شوند و بعد از پایان هر کیس، پاسخ‌نامه تشریحی همان کیس نمایش داده می‌شود.</p>' +
          '<p class="meta">' + num(totalCases) + ' کیس · ' + num(n) + ' آیتم تصمیم‌گیری</p>' +
          '<div class="row"><button class="btn" data-action="instructions" data-mode="exam">مطالعه قوانین و شروع آزمون</button>' + resumeBtn('exam') + '</div></section>' +
        '<section class="mode mode-practice"><div class="mode-kicker">یادگیری مرحله‌به‌مرحله</div><h2>حالت تمرین آموزشی</h2>' +
          '<p>بدون تایمر. بلافاصله پس از ثبت هر مرحله، اقدامات صحیح، اقدامات مضر، اقدامات ازقلم‌افتاده، نمره دقیق و نکته کلیدی را می‌بینی. نمره‌های تمرین جدا از آزمون ذخیره می‌شوند.</p>' +
          '<p class="meta">انتخاب آزاد هر کیس · بازخورد آنی</p>' +
          '<div class="row"><button class="btn secondary" data-action="instructions" data-mode="practice">شروع تمرین از کیس ۱</button>' + resumeBtn('practice') + '</div></section>' +
      '</div>' +
      '<div class="row pmp-backup-strip"><button class="btn ghost" data-action="openBackup" data-fid="backup-open">💾 پشتیبان‌گیری و بازیابی پیشرفت</button></div>' +
      '<p class="note">' + esc(storageNote(storageKind)) + '</p>' +
      (storageKind === 'memory' ? '<p class="banner crit">ذخیره‌سازی در این محیط کار نمی‌کند. بدون پشتیبان‌گیری با بستن صفحه همه چیز از بین می‌رود.</p>' : '') +
      '<section class="pmp-explorer" aria-label="کاوشگر کیس‌های بالینی PMP">' +
        '<div class="pmp-explorer-head">' +
          '<div><h2>کاوشگر مستقیم کیس‌های بالینی (' + num(filteredCases.length) + ' از ' + num(totalCases) + ')</h2><p class="note">روی هر کیس کلیک کنید تا فقط داده همان کیس به‌صورت آنی بارگذاری و اجرا شود.</p></div>' +
          '<div class="pmp-search-box"><input type="search" id="pmpCaseSearch" placeholder="جستجوی کیس (مثلاً: صفراوی، شوک، P15، آپاندیس)..." value="' + esc(ui.caseQuery || '') + '" data-action="searchCases" aria-label="جستجوی کیس‌های PMP"></div>' +
        '</div>' +
        '<div class="pmp-topic-pills">' + topicPillsHtml + '</div>' +
        '<div class="pmp-case-grid">' + (caseCardsHtml || '<p class="note">کیسی مطابق فیلتر انتخاب‌شده یافت نشد.</p>') + '</div>' +
      '</section>' +
    '</div></main>';
  }

  function instructions(ctx) {
    var cfg = ctx.cfg, mode = ctx.mode, storageKind = ctx.storageKind, saved = ctx.saved, ui = ctx.ui;
    var exam = mode === 'exam';
    var unfinished = saved && saved[mode] && saved[mode].status === 'in_progress';
    var review = cfg.session.caseReview === 'after_case';
    return '<main class="doc"><div class="doc-inner">' +
      '<button class="link" data-action="home">→ بازگشت به داشبورد PMP</button>' +
      '<h1>قوانین ' + (exam ? 'آزمون' : 'تمرین') + '</h1>' +
      '<h2>هر کیس چطور کار می‌کند</h2>' +
      '<p>با اطلاعات محدود شروع می‌کنی. در هر مرحله همه اقداماتی را که مناسب می‌دانی انتخاب و سپس ثبت می‌کنی. بعضی انتخاب‌ها (مثلاً یک بررسی که درخواست می‌کنی) نتیجه‌شان را در مرحله بعد برمی‌گردانند. تصمیم ثبت‌شده را نمی‌توان تغییر داد. هر زمان که خواستی «پرونده بیمار» را باز کن تا همه اطلاعات آشکارشده را دوباره بخوانی.</p>' +
      '<p>تعداد اقدامات درست هیچ‌وقت نمایش داده نمی‌شود. مراحل تک‌پاسخ دقیقاً یک انتخاب می‌خواهند. مراحل هر کیس به ترتیب باز می‌شوند؛ کیس‌های مختلف را به هر ترتیبی می‌توانی حل کنی. گزینه‌ها با حروف A، B، C، … نشان داده می‌شوند و کلیدهای ۱ تا ۹ صفحه‌کلید هم به همان ترتیب آن‌ها را انتخاب می‌کنند.</p>' +
      (review ? '<p>بعد از ثبت آخرین مرحله هر کیس، <strong>پاسخ‌نامه تشریحی همان کیس</strong> نشان داده می‌شود: کدام گزینه‌ها را درست زدی، کدام را اشتباه زدی، و کدام را جا انداختی، همراه با توضیح هر گزینه.</p>' : '') +
      '<h2>نمره‌دهی</h2>' +
      '<p>طبق روش PMP، هر گزینه در یکی از سه گروه است: لازم، مضر یا ممنوع، و نسبتاً بی‌اهمیت. برای انتخاب اقدام لازم و انتخاب نکردن اقدام مضر امتیاز مثبت می‌گیری؛ برای انتخاب اقدام مضر و جا انداختن اقدام لازم امتیاز منفی.</p>' +
      scoringSummary(cfg) +
      '<p class="note">نمره خام می‌تواند منفی باشد و clip نمی‌شود. گزارش پایانی نمره خام، حداکثر، درصد خام، و درصد مقیاس‌شده را نشان می‌دهد (۰ = بدترین حالت ممکن، ۱۰۰ = کامل).</p>' +
      '<h2>تحلیل خطاهای بالینی (Clinical Error Analysis)</h2>' +
      '<p>پس از پایان آزمون یا تمرین، گزارش تحلیل خطا در چهار گروه دانش بالینی، تفسیر داده‌ها، اولویت‌بندی و زمان‌بندی، و انتخاب/اجرای مدیریت دسته‌بندی می‌شود.</p>' +
      '<h2>' + (exam ? 'زمان' : 'حالت تمرین') + '</h2>' +
      (exam
        ? '<p>' + (cfg.session.pauseAllowed ? 'می‌توانی با دکمه «توقف» ساعت را نگه داری (در توقف، سؤال‌ها پنهان می‌شوند). ' + (cfg.session.autoPauseOnLeave ? 'اگر صفحه را ببندی یا برای بیش از ' + num(cfg.session.autoPauseGapSeconds) + ' ثانیه از آن بروی، مدت غیبت از وقت آزمون کم نمی‌شود. ' : '') : '') + num(cfg.session.totalMinutes) + ' دقیقه وقت فعال داری. اگر صفحه را refresh کنی تایمر ادامه پیدا می‌کند.</p>'
        : '<p>بدون محدودیت زمان. بعد از هر ثبت تصمیم بازخورد کامل می‌بینی. نتیجه تمرین هیچ‌وقت با نتیجه آزمون قاطی نمی‌شود.</p>') +
      '<h2>ذخیره‌سازی</h2><p>' + esc(storageNote(storageKind)) + '</p>' +
      (exam ? '<label class="timed-choice"><input type="checkbox" data-action="setTimed" ' + (ui.timedChoice === false ? '' : 'checked') + '> آزمون زمان‌دار (' + num(cfg.session.totalMinutes) + ' دقیقه)<small> — اگر برداری، آزمون بدون تایمر است و می‌توانی در چند نشست ادامه بدهی.</small></label>' : '') +
      (unfinished ? '<p class="banner warn">یک ' + (exam ? 'آزمون' : 'تمرین') + ' نیمه‌تمام داری. شروع دوباره آن را حذف می‌کند. برای نگه داشتنش برگرد و «ادامه» را بزن.</p>' : '') +
      '<div class="row"><button class="btn" data-action="start" data-mode="' + mode + '">' + (exam ? 'شروع آزمون' : 'شروع تمرین') + '</button><button class="btn ghost" data-action="home">انصراف</button></div>' +
    '</div></main>';
  }

  function railHtml(ctx) {
    var session = ctx.session, bank = ctx.bank, ui = ctx.ui, cfg = ctx.cfg;
    var q = (ui.railQuery || '').trim().toLowerCase();
    var items = bank.cases.filter(function (c) {
      if (!q) return true;
      return (c.caseId + ' ' + c.title).toLowerCase().indexOf(q) !== -1;
    }).map(function (c) {
      var path = chain(session, bank, c);
      var done = path.every(function (e) { return e.status === 'committed'; });
      var pips = path.map(function (e) {
        var cur = ui.current === e.itemId && !ui.reviewing;
        var label = e.status === 'committed' ? 'ثبت‌شده' : e.status === 'open' ? 'باز' : 'قفل تا ثبت مرحله قبل';
        var glyph = e.status === 'committed' ? '&#10003;' : e.status === 'open' ? '&#9675;' : '&#8212;';
        return '<button class="pip pip-' + e.status + (cur ? ' pip-cur' : '') + '" data-action="goto" data-item="' + esc(e.itemId) + '" data-fid="pip-' + esc(e.itemId) + '" ' +
          (e.status === 'locked' ? 'disabled' : '') + ' aria-label="' + esc(c.title) + '، مرحله ' + e.stage.seq + ': ' + label + '" ' +
          (cur ? 'aria-current="true"' : '') + ' title="' + label + '"><span aria-hidden="true">' + glyph + '</span><small>' + e.stage.seq + '</small></button>';
      }).join('');
      return '<div class="rail-case"><div class="rail-title"><span class="rail-case-id">' + esc(c.caseId) + '</span> ' + esc(c.title) + '</div><div class="pips">' + pips + '</div>' +
        (done && cfg.session.caseReview === 'after_case' ? '<button class="link rail-review" data-action="reviewCase" data-case="' + esc(c.caseId) + '">پاسخ‌نامه تشریحی</button>' : '') + '</div>';
    }).join('');

    return '<nav class="rail" aria-label="ناوبری کیس‌ها و مراحل">' +
      '<div class="rail-filter"><input type="search" id="pmpRailSearch" placeholder="فیلتر سریع کیس (P15، صفرا)..." value="' + esc(ui.railQuery || '') + '" data-action="filterRail" aria-label="فیلتر سریع کیس‌ها"></div>' +
      (items || '<p class="note">موردی یافت نشد</p>') +
      '<ul class="legend"><li><span class="pip pip-committed" aria-hidden="true">&#10003;</span> ثبت‌شده</li><li><span class="pip pip-open" aria-hidden="true">&#9675;</span> باز</li><li><span class="pip pip-locked" aria-hidden="true">&#8212;</span> قفل</li></ul></nav>';
  }

  function optionsHtml(stage, selected, locked, practiceFb, keyObj) {
    var type = stage.format === 'single_best' ? 'radio' : 'checkbox';
    var opts = stage.options || [];
    return '<fieldset class="opts" ' + (locked ? 'disabled' : '') + '><legend class="sr">گزینه‌ها</legend>' +
      opts.map(function (o, i) {
        var on = selected.includes(o.id);
        var stateCls = '';
        var badge = '';
        if (practiceFb) {
          var b = practiceFb.breakdown[o.id];
          var cls = b.class;
          if (cls === 'necessary') {
            stateCls = b.selected ? ' opt-good' : ' opt-missed';
            badge = '<span class="cls ' + (b.selected ? 'cls-necessary' : 'cls-missed') + '">' +
              (b.selected ? '✅ اقدام صحیح' : '⚠️ اقدام الزامیِ از قلم افتاده') + ' (' + sgnH(b.points) + ')</span>';
          } else if (cls === 'harmful') {
            stateCls = b.selected ? ' opt-bad' : ' opt-good-avoided';
            badge = '<span class="cls ' + (b.selected ? 'cls-harmful' : 'cls-necessary') + '">' +
              (b.selected ? '⛔ بدون اندیکاسیون / نمره منفی' : '✅ پرهیز صحیح از اقدام مضر') + ' (' + sgnH(b.points) + ')</span>';
          } else {
            stateCls = ' opt-neutral';
            badge = '<span class="cls cls-' + cls + '">○ ' + CLASS_LABEL[cls] + ' (۰)</span>';
          }
        }
        return '<label class="opt' + (on ? ' on' : '') + (locked ? ' locked' : '') + stateCls + '">' +
          '<input type="' + type + '" name="opt" value="' + esc(o.id) + '" data-action="toggle" data-opt="' + esc(o.id) + '" data-fid="opt-' + esc(o.id) + '" ' + (on ? 'checked' : '') + '>' +
          '<span class="box" aria-hidden="true"></span>' +
          '<span class="otext"><kbd aria-hidden="true">' + letter(i) + '</kbd> ' + esc(o.text) + '</span>' +
          badge + '</label>';
      }).join('') + '</fieldset>';
  }

  function optionReviewList(stage, key, selected, format) {
    return '<ul class="orev">' + (stage.options || []).map(function (o, i) {
      var cls = key.classes[o.id], picked = selected.includes(o.id);
      var oc = outcome(format, cls, picked);
      return '<li class="orev-' + oc.kind + '"><div class="orev-head"><span class="orev-icon" aria-hidden="true">' + oc.icon + '</span>' +
        '<span class="orev-status">' + oc.text + '</span><span class="cls cls-' + cls + '">' + CLASS_LABEL[cls] + '</span></div>' +
        '<div class="orev-text"><kbd aria-hidden="true">' + letter(i) + '</kbd> ' + esc(o.text) + '</div>' +
        '<p class="orev-why">' + nl(key.optionRationales[o.id]) + '</p></li>';
    }).join('') + '</ul>';
  }

  function refsHtml(key) {
    var refs = (key.references || []).map(function (r) {
      var locator = r.locator ? ' — ' + esc(r.locator) : '';
      var support = r.supportLevel === 'partial' ? ' (پشتیبانی جزئی)' : '';
      var verified = r.verified ? '' : ' (تأییدنشده)';
      return esc(r.source) + locator + support + verified;
    }).join('؛ ');
    return '<p class="refs"><small>منابع: ' + refs + '. قطعیت: ' + esc(key.certainty) + '. وضعیت: ' + esc(key.status) + '.</small></p>';
  }

  function feedbackHtml(fb, key, stage) {
    var selIds = Object.keys(fb.breakdown).filter(function (k) { return fb.breakdown[k].selected; });
    var missedCount = Object.keys(fb.breakdown).filter(function (k) {
      return fb.breakdown[k].class === 'necessary' && !fb.breakdown[k].selected;
    }).length;
    var missedBanner = missedCount > 0
      ? '<div class="pmp-missed-alert"><strong>⚠️ توجه به اقدامات از قلم افتاده:</strong> در این مرحله <strong>' + num(missedCount) + '</strong> اقدام الزامی را انتخاب نکردید. موارد با کادر کهربایی مشخص شده‌اند.</div>'
      : '';
    return '<section class="feedback" aria-label="بازخورد"><h3>تحلیل گزینه‌ها و نمره مرحله</h3>' +
      '<p class="score">نمره این آیتم: <strong>' + sgnH(fb.raw) + '</strong> از ' + num(fb.max) + ' (بدترین حالت ' + sgnH(fb.min) + ')</p>' +
      missedBanner +
      '<p>' + nl(key.rationale) + '</p>' +
      optionReviewList(stage, key, selIds, stage.format) +
      '<p class="lesson"><strong>💎 نکته کلیدی:</strong> ' + esc(key.criticalLesson) + '</p>' + refsHtml(key) + '</section>';
  }

  function stageSummary(items) {
    var good = 0, miss = 0, wrong = 0, zero = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var entries = Object.entries(it.breakdown);
      for (var j = 0; j < entries.length; j++) {
        var v = entries[j][1];
        if (!v.class) continue;
        var fmt = it.format;
        if (fmt === 'single_best') {
          if (v.class === 'necessary') { if (v.selected) good++; else miss++; }
          else if (v.selected) wrong++;
          continue;
        }
        if (v.class === 'necessary') { if (v.selected) good++; else miss++; }
        else if (v.class === 'harmful') { if (v.selected) wrong++; else good++; }
        else if (v.selected) zero++;
      }
    }
    return { good: good, miss: miss, wrong: wrong, zero: zero };
  }

  function caseReview(ctx, caseId) {
    var session = ctx.session, bank = ctx.bank, cfg = ctx.cfg, getKey = ctx.getKey;
    var c = resolveFullCase(bank, caseId);
    var path = chain(session, bank, c).filter(function (e) { return e.status === 'committed'; });
    var file = caseFile(session, bank, caseId);
    var raw = 0, max = 0, min = 0;
    var rows = path.map(function (e) {
      var key = getKey(e.itemId);
      var sel = session.committed[e.itemId].selected;
      var sc = scoreItem(e.stage.format, key, sel, cfg);
      var perfect = scoreItem(e.stage.format, key, Object.keys(key.classes).filter(function (k) { return key.classes[k] === 'necessary'; }), cfg);
      raw += sc.raw; max += perfect.max; min += sc.min;
      var f = file.find(function (x) { return x.itemId === e.itemId; });
      var sum = stageSummary([{ format: e.stage.format, breakdown: sc.breakdown }]);
      return { e: e, key: key, sel: sel, sc: sc, max: perfect.max, f: f, sum: sum };
    });
    return '<article class="chart review" aria-labelledby="rv-title">' +
      '<header class="chart-head"><div><span class="pmp-case-id-pill">' + esc(c.caseId) + '</span><h2 id="rv-title">پاسخ‌نامه تشریحی: ' + esc(c.title) + '</h2>' +
        '<p class="patient">' + esc(c.patient.sex) + ' ' + num(c.patient.age) + ' ساله · ' + esc(c.patient.setting) + '</p></div>' +
        '<div class="stage-tag">نمره کیس: ' + sgnH(raw) + ' از ' + num(max) + '<small>بدترین حالت ممکن ' + sgnH(min) + '</small></div></header>' +
      '<div class="rv-body"><p class="note">تصمیم‌های این کیس قفل شده‌اند. در هر گزینه وضعیت صحیح، مضر یا اقدام الزامی جاافتاده را به همراه دلیل بالینی مشاهده می‌کنید.</p>' +
      rows.map(function (r) {
        var visibleOwn = r.e.stage.next ? r.f.ownResults.filter(function (b) { return b.type !== 'image'; }) : r.f.ownResults;
        return '<section class="rv-stage"><h3>مرحله ' + num(r.e.stage.seq) + ' · نمره ' + sgnH(r.sc.raw) + ' از ' + num(r.max) + '</h3>' +
          '<p class="rv-sum"><span class="sum-good">' + num(r.sum.good) + ' درست</span> · <span class="sum-bad">' + num(r.sum.wrong) + ' اشتباه</span> · <span class="sum-miss">' + num(r.sum.miss) + ' جا‌افتاده</span>' + (r.sum.zero ? ' · <span>' + num(r.sum.zero) + ' بی‌اهمیت</span>' : '') + '</p>' +
          '<details class="rv-info"><summary>اطلاعات بالینی این مرحله</summary>' + r.f.resultsFromPrev.map(function (b) { return blockHtml(b); }).join('') + r.f.info.map(function (b) { return blockHtml(b); }).join('') + attachmentChips(r.e.stage) + '</details>' +
          '<p class="prompt">' + esc(r.e.stage.prompt) + '</p>' +
          optionReviewList(r.e.stage, r.key, r.sel, r.e.stage.format) +
          '<p>' + nl(r.key.rationale) + '</p>' +
          (visibleOwn.length ? '<details class="rv-info"><summary>نتایجی که بعد از این تصمیم برمی‌گشت</summary>' + visibleOwn.map(function (b) { return blockHtml(b); }).join('') + '</details>' : '') +
          '<p class="lesson"><strong>💎 نکته کلیدی:</strong> ' + esc(r.key.criticalLesson) + '</p>' + refsHtml(r.key) + '</section>';
      }).join('') +
      '<div class="row"><button class="btn" data-action="nextCase" data-fid="rv-next">ادامه به کیس بعدی</button><button class="btn ghost" data-action="closeReview">بازگشت به آخرین مرحله</button></div></div></article>';
  }

  function stageStepperHtml(path, currentItemId) {
    return '<div class="pmp-stepper" aria-label="پیشرفت مراحل این کیس">' + path.map(function (e, idx) {
      var cur = e.itemId === currentItemId;
      var cls = 'pmp-step ' + e.status + (cur ? ' current' : '');
      var icon = e.status === 'committed' ? '✓' : e.status === 'open' ? num(e.stage.seq) : '🔒';
      var arrow = idx < path.length - 1 ? '<span class="pmp-step-line" aria-hidden="true"></span>' : '';
      return '<button type="button" class="' + cls + '" data-action="goto" data-item="' + esc(e.itemId) + '" ' +
        (e.status === 'locked' ? 'disabled' : '') + '>' +
        '<span class="pmp-step-dot">' + icon + '</span>' +
        '<span class="pmp-step-label">مرحله ' + num(e.stage.seq) + '</span>' +
      '</button>' + arrow;
    }).join('') + '</div>';
  }

  function itemView(ctx) {
    var session = ctx.session, bank = ctx.bank, ui = ctx.ui, getKey = ctx.getKey;
    var ref = resolveFullStage(bank, ui.current);
    var c = ref.case, stage = ref.stage;
    var status = itemStatus(session, bank, stage.itemId);
    var com = session.committed[stage.itemId];
    var sel = com ? com.selected : (session.drafts[stage.itemId] || []);
    var file = caseFile(session, bank, c.caseId);
    var idx = file.findIndex(function (f) { return f.itemId === stage.itemId; });
    var fresh = idx > 0 ? file[idx].resultsFromPrev : [];
    var locked = status === 'committed' || session.status !== 'in_progress';
    var fb = (session.mode === 'practice' && com) ? ctx.getFeedback(stage.itemId) : null;
    var keyObj = fb ? getKey(stage.itemId) : null;
    var own = com ? (stage.next ? file[idx].ownResults.filter(function (b) { return b.type !== 'image'; }) : file[idx].ownResults) : [];
    var path = chain(session, bank, c);
    var nextOpen = path.find(function (e) { return e.status === 'open'; });
    var caseDone = path.every(function (e) { return e.status === 'committed'; });
    var reviewOn = ctx.cfg.session.caseReview === 'after_case';

    var actions;
    if (locked) {
      actions = '<div class="commit-bar"><span class="badge-lock">✓ ثبت و قفل شد</span>' +
        (com && !com.selected.length ? ' <small>(هیچ اقدامی انتخاب نشد)</small>' : '') +
        (nextOpen ? '<button class="btn" data-action="goto" data-item="' + esc(nextOpen.itemId) + '">ادامه به مرحله بعد</button>'
          : (reviewOn && caseDone ? '<button class="btn" data-action="reviewCase" data-case="' + esc(c.caseId) + '">مشاهده پاسخ‌نامه تشریحی این کیس</button>'
            : '<button class="btn" data-action="nextCase">رفتن به کیس باز بعدی</button>')) + '</div>';
    } else if (ui.confirmCommit) {
      actions = '<div class="commit-bar confirm" role="alertdialog" aria-label="تأیید ثبت"><span>' +
        (sel.length ? 'ثبت ' + num(sel.length) + ' انتخاب؟ بعد از ثبت نمی‌توانی آن‌ها را تغییر بدهی.' : 'هیچ گزینه‌ای انتخاب نکرده‌ای. بدون هیچ اقدامی ثبت شود؟ جا انداختن اقدامات لازم نمره منفی دارد.') +
        '</span><button class="btn" data-action="commit" data-fid="commit-yes">تأیید و ثبت تصمیم</button><button class="btn ghost" data-action="cancelCommit">ادامه ویرایش</button></div>';
    } else {
      actions = '<div class="commit-bar"><button class="btn" data-action="askCommit" data-fid="commit">ثبت تصمیم این مرحله</button><small>' +
        (stage.format === 'single_best' ? 'فقط یک پاسخ انتخاب کن.' : 'همه اقداماتی را که مناسب می‌دانی انتخاب کن.') + '</small></div>';
    }

    var topicBadges = (c.topics || []).map(function (t) { return '<span class="pmp-case-topic-tag">' + esc(topicLabel(t)) + '</span>'; }).join('');

    return '<article class="chart" aria-labelledby="case-title">' +
      '<header class="chart-head">' +
        '<div>' +
          '<div class="pmp-chart-meta-row"><span class="pmp-case-id-pill">' + esc(c.caseId) + '</span>' + topicBadges + '</div>' +
          '<h2 id="case-title">' + esc(c.title) + '</h2>' +
          '<p class="patient">👤 ' + esc(c.patient.sex) + ' · ' + num(c.patient.age) + ' ساله · 📍 ' + esc(c.patient.setting) + '</p>' +
        '</div>' +
        '<div class="stage-tag">مرحله ' + num(stage.seq) + ' از ' + num(path.length) + '<small>' + esc(FORMAT_LABEL[stage.format]) + (session.mode === 'practice' && stage.phase ? ' · ' + esc(PHASE_LABEL[stage.phase] || stage.phase) : '') + '</small></div>' +
      '</header>' +
      stageStepperHtml(path, stage.itemId) +
      (fresh.length ? '<section class="fresh"><h3>🧪 نتایج جدید پس از تصمیم قبلی</h3>' + fresh.map(function (b) { return blockHtml(b, { fresh: true }); }).join('') + '</section>' : '') +
      '<section class="info">' + (stage.info || []).map(function (b) { return blockHtml(b); }).join('') + attachmentChips(stage) + '</section>' +
      (locked && own.length ? '<section class="fresh"><h3>📋 نتایجی که پس از این تصمیم برگشت</h3>' + own.map(function (b) { return blockHtml(b); }).join('') + '</section>' : '') +
      '<section class="decision"><h3 class="prompt">' + esc(stage.prompt) + '</h3>' +
        optionsHtml(stage, sel, locked, fb, keyObj) + actions + (fb ? feedbackHtml(fb, keyObj, stage) : '') +
      '</section></article>';
  }

  function caseFileDrawer(ctx) {
    var session = ctx.session, bank = ctx.bank, ui = ctx.ui;
    var c = resolveFullStage(bank, ui.current).case;
    var file = caseFile(session, bank, c.caseId);
    return '<aside class="drawer" role="dialog" aria-label="پرونده بیمار">' +
      '<header><h3>📁 پرونده بیمار: ' + esc(c.title) + '</h3><button class="link" data-action="closeDrawer" data-fid="drawer-close">بستن</button></header>' +
      file.map(function (f) {
        var st = resolveFullStage(bank, f.itemId).stage;
        var com = session.committed[f.itemId];
        var selText = com
          ? (com.selected.length ? '<ul>' + com.selected.map(function (id) {
            var opt = (st.options || []).find(function (o) { return o.id === id; });
            return '<li>' + esc(opt ? opt.text : id) + '</li>';
          }).join('') + '</ul>' : 'هیچ اقدامی انتخاب نشد')
          : 'هنوز ثبت نشده';
        return '<section class="cf"><h4>مرحله ' + num(f.seq) + '</h4>' +
          f.resultsFromPrev.map(function (b) { return blockHtml(b); }).join('') +
          f.info.map(function (b) { return blockHtml(b); }).join('') +
          attachmentChips(st) +
          '<p class="cf-sel"><strong>تصمیم تو:</strong> ' + selText + '</p></section>';
      }).join('') + '</aside>';
  }

  function modalHtml(ctx) {
    var m = ctx.ui.modal;
    if (!m) return '';
    return '<div class="modal-back" data-action="closeModal"><div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(m.title) + '" data-stop="1">' +
      '<header><h3>' + esc(m.title) + '</h3><button class="link" data-action="closeModal" data-fid="modal-close">بستن</button></header>' + m.html + '</div></div>';
  }

  function submitConfirm(ctx) {
    var session = ctx.session, bank = ctx.bank, now = ctx.now;
    var ids = scoredItemIds(session, bank), done = Object.keys(session.committed).length;
    var rem = remainingMs(session, now);
    var left = ids.length - done;
    return '<div class="modal-back"><div class="modal" role="alertdialog" aria-modal="true" aria-label="ثبت نهایی" data-stop="1">' +
      '<h3>' + (session.mode === 'exam' ? 'آزمون' : 'تمرین') + ' نهایی شود؟</h3>' +
      '<p>' + num(done) + ' از ' + num(ids.length) + ' آیتم ثبت شده است. ' +
      (left ? '<strong>' + num(left) + ' آیتم بی‌پاسخ «بدون انتخاب» نمره می‌گیرند</strong> و برای اقدامات لازمِ جاافتاده نمره کم می‌شود.' : 'همه آیتم‌ها ثبت شده‌اند.') + '</p>' +
      (rem != null ? '<p>زمان باقی‌مانده: ' + num(fmtClock(rem)) + '.</p>' : '') +
      '<p>بعد از ثبت نهایی هیچ چیز قابل تغییر نیست.</p>' +
      '<div class="row"><button class="btn" data-action="submit" data-fid="submit-yes">ثبت نهایی و مشاهده کارنامه</button><button class="btn ghost" data-action="cancelSubmit">ادامه کار</button></div></div></div>';
  }

  function pausedScreen(ctx) {
    var session = ctx.session, bank = ctx.bank, now = ctx.now;
    var ids = scoredItemIds(session, bank), done = Object.keys(session.committed).length;
    return '<main class="doc paused"><div class="doc-inner"><h1>⏸ آزمون متوقف شد</h1>' +
      '<p>ساعت نگه داشته شده و سؤال‌ها پنهان‌اند. زمان باقی‌مانده: <strong>' + num(fmtClock(remainingMs(session, now))) + '</strong>. ' + num(done) + ' از ' + num(ids.length) + ' آیتم ثبت شده است.</p>' +
      '<p class="note">پیشرفتت ذخیره شده است. برای اطمینان بیشتر می‌توانی یک پشتیبان بگیری.</p>' +
      '<div class="row"><button class="btn" data-action="resumeExam" data-fid="resume-exam">ادامه آزمون</button><button class="btn ghost" data-action="openBackup">پشتیبان‌گیری</button><button class="btn ghost" data-action="home">رفتن به صفحه اول</button></div></div></main>' + modalHtml(ctx);
  }

  function examShell(ctx) {
    var session = ctx.session, bank = ctx.bank, ui = ctx.ui, cfg = ctx.cfg, now = ctx.now;
    if (isPaused(session)) return pausedScreen(ctx);
    var ids = scoredItemIds(session, bank), done = Object.keys(session.committed).length;
    var rem = remainingMs(session, now);
    var low = rem != null && rem <= cfg.session.warnAtMinutes[1] * 60000 ? 'crit' : rem != null && rem <= cfg.session.warnAtMinutes[0] * 60000 ? 'warn' : '';
    var flat = [];
    for (var i = 0; i < bank.cases.length; i++) {
      var ch = chain(session, bank, bank.cases[i]);
      for (var j = 0; j < ch.length; j++) {
        if (ch[j].status !== 'locked') flat.push(ch[j].itemId);
      }
    }
    var pos = flat.indexOf(ui.current);
    var body;
    if (ui.loadingCase) {
      body = '<div class="pmp-loading-card"><div class="pmp-spinner"></div><p>در حال بارگذاری اطلاعات کیس بالینی...</p></div>';
    } else if (ui.reviewing) {
      body = caseReview(ctx, ui.reviewing);
    } else {
      body = itemView(ctx) + '<div class="pager"><button class="btn ghost small" data-action="prev" ' + (pos <= 0 ? 'disabled' : '') + '>→ آیتم قبلی</button><button class="btn ghost small" data-action="next" ' + (pos >= flat.length - 1 ? 'disabled' : '') + '>آیتم بعدی ←</button></div>';
    }
    return '<div class="shell">' +
      '<header class="bar pmp-session-bar"><div class="pmp-session-mode"><span class="modetag">حالت ' + (session.mode === 'exam' ? 'آزمون' : 'تمرین') + '</span></div>' +
        '<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + ids.length + '" aria-valuenow="' + done + '" aria-label="تصمیم‌های ثبت‌شده"><div class="prog-fill" style="width:' + (ids.length ? (done / ids.length * 100) : 0) + '%"></div><span>' + num(done) + ' / ' + num(ids.length) + ' ثبت‌شده</span></div>' +
        (rem != null ? '<div class="timer ' + low + '" id="timer" role="timer" aria-label="زمان باقی‌مانده" dir="ltr"><span id="timer-text">' + fmtClock(rem) + '</span></div>' : '<div class="timer none">بدون تایمر</div>') +
        '<div class="bar-actions">' +
          '<button class="btn small ghost nav-toggle" data-action="toggleRail" aria-expanded="' + (ui.railOpen ? 'true' : 'false') + '">فهرست کیس‌ها</button>' +
          '<button class="btn small ghost" data-action="openDrawer" data-fid="drawer-open">📁 پرونده بیمار</button>' +
          (session.mode === 'exam' && session.deadline != null && cfg.session.pauseAllowed ? '<button class="btn small ghost" data-action="pause">توقف</button>' : '') +
          '<button class="btn small ghost" data-action="openBackup">پشتیبان</button>' +
          '<button class="btn small ghost" data-action="exit">ذخیره و داشبورد</button>' +
          '<button class="btn small" data-action="askSubmit">ثبت نهایی و کارنامه</button>' +
          '<span class="save save-' + (ctx.saveState || 'idle') + '" id="save-ind" role="status">' + (ctx.saveState === 'ok' ? '\u2713 ذخیره شد' : ctx.saveState === 'failed' ? '\u26A0 ذخیره نشد' : '') + '</span>' +
        '</div></header>' +
      (ui.banner ? '<div class="banner ' + esc(ui.banner.kind) + '" role="status" aria-live="polite">' + esc(ui.banner.text) + ' <button class="link" data-action="dismissBanner">بستن</button></div>' : '') +
      '<div class="body' + (ui.railOpen ? ' rail-open' : '') + '">' + railHtml(ctx) + '<main class="main" id="main" tabindex="-1">' + body + '</main></div>' +
      (ui.drawer ? caseFileDrawer(ctx) : '') + modalHtml(ctx) + (ui.confirmSubmit ? submitConfirm(ctx) : '') + '</div>';
  }

  function bucketTable(title, first, obj, labelFn) {
    var rows = Object.entries(obj).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    return '<h3>' + esc(title) + '</h3><table class="plain"><thead><tr><th>' + esc(first) + '</th><th>آیتم</th><th>نمره خام</th><th>حداکثر</th><th>درصد خام</th></tr></thead><tbody>' +
      rows.map(function (entry) {
        var k = entry[0], b = entry[1];
        return '<tr><td>' + esc(labelFn(k)) + '</td><td>' + num(b.items) + '</td><td>' + sgnH(b.raw) + '</td><td>' + num(b.max) + '</td><td>' + (b.max ? num(pct(b.raw / b.max * 100)) : '-') + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function itemReview(it, ctx) {
    var bank = ctx.bank, getKey = ctx.getKey;
    var ref = resolveFullStage(bank, it.itemId);
    var c = ref.case, stage = ref.stage;
    var key = getKey(it.itemId);
    return '<details class="rev"><summary><span>' + esc(c.caseId) + ' · ' + esc(c.title) + ' · مرحله ' + num(stage.seq) + '</span><span class="rv-score ' + (it.raw < 0 ? 'neg' : '') + '">' + sgnH(it.raw) + ' / ' + num(it.max) + (it.answered ? '' : ' (بی‌پاسخ)') + '</span></summary>' +
      '<p class="prompt">' + esc(stage.prompt) + '</p>' +
      optionReviewList(stage, key, it.selected, stage.format) +
      '<p>' + nl(key.rationale) + '</p><p class="lesson"><strong>💎 نکته کلیدی:</strong> ' + esc(key.criticalLesson) + '</p>' + refsHtml(key) + '</details>';
  }

  var ERROR_TAG_LABEL = {
    knowledge: 'دانش بالینی', interpretation: 'تفسیر داده‌های بالینی',
    prioritization: 'اولویت‌بندی و زمان‌بندی', management: 'انتخاب و اجرای مدیریت', unclassified: 'برچسب‌گذاری‌نشده'
  };
  var ERROR_KIND_LABEL = {
    missed_necessary: 'جا انداختن اقدام ضروری', harmful_selected: 'انتخاب اقدام مضر',
    premature_selected: 'انتخاب اقدام زودهنگام', wrong_single_best: 'انتخاب پاسخ غیربهینه'
  };

  function buildClinicalErrorAnalysis(r, ctx) {
    var events = [];
    var unreachedStages = 0, blankSingleBest = 0, submittedStages = 0;
    function addEvent(it, stage, caseObj, key, optionId, kind) {
      var option = (stage.options || []).find(function (o) { return o.id === optionId; });
      var rawTag = key.errorTags && key.errorTags[optionId];
      var tag = Object.prototype.hasOwnProperty.call(ERROR_TAG_LABEL, rawTag) ? rawTag : 'unclassified';
      events.push({
        itemId: it.itemId, caseId: it.caseId, caseTitle: caseObj.title, seq: stage.seq, topic: it.topic,
        optionId: optionId, optionText: option ? option.text : optionId, kind: kind,
        kindLabel: ERROR_KIND_LABEL[kind], tag: tag, tagLabel: ERROR_TAG_LABEL[tag],
        rationale: key.optionRationales && key.optionRationales[optionId] ? key.optionRationales[optionId] : ''
      });
    }

    var rItems = r.items || [];
    for (var i = 0; i < rItems.length; i++) {
      var it = rItems[i];
      if (!it.answered) { unreachedStages++; continue; }
      submittedStages++;
      var ref = resolveFullStage(ctx.bank, it.itemId);
      if (!ref) continue;
      var stage = ref.stage, caseObj = ref.case, key = ctx.getKey(it.itemId);
      var selected = new Set(it.selected || []);
      if (stage.format === 'single_best') {
        var chosen = (it.selected || [])[0];
        if (!chosen) { blankSingleBest++; continue; }
        var cls = key.classes[chosen];
        if (cls !== 'necessary') {
          var k = cls === 'harmful' ? 'harmful_selected' : cls === 'premature' ? 'premature_selected' : 'wrong_single_best';
          addEvent(it, stage, caseObj, key, chosen, k);
        }
        continue;
      }
      var clsEntries = Object.entries(key.classes);
      for (var j = 0; j < clsEntries.length; j++) {
        var optId = clsEntries[j][0], ccls = clsEntries[j][1];
        if (ccls === 'necessary' && !selected.has(optId)) addEvent(it, stage, caseObj, key, optId, 'missed_necessary');
        else if (ccls === 'harmful' && selected.has(optId)) addEvent(it, stage, caseObj, key, optId, 'harmful_selected');
        else if (ccls === 'premature' && selected.has(optId)) addEvent(it, stage, caseObj, key, optId, 'premature_selected');
      }
    }

    var byTag = Object.fromEntries(Object.keys(ERROR_TAG_LABEL).map(function (k) { return [k, 0]; }));
    var byKind = Object.fromEntries(Object.keys(ERROR_KIND_LABEL).map(function (k) { return [k, 0]; }));
    var byCase = {};
    var affectedStages = new Set(), affectedCases = new Set();
    for (var m = 0; m < events.length; m++) {
      var ev = events[m];
      byTag[ev.tag] = (byTag[ev.tag] || 0) + 1;
      byKind[ev.kind] = (byKind[ev.kind] || 0) + 1;
      byCase[ev.caseId] = (byCase[ev.caseId] || 0) + 1;
      affectedStages.add(ev.itemId); affectedCases.add(ev.caseId);
    }
    var rankedTags = Object.entries(byTag).filter(function (x) { return x[0] !== 'unclassified' && x[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; });
    var topCount = rankedTags.length ? rankedTags[0][1] : 0;
    var dominant = rankedTags.filter(function (x) { return x[1] === topCount; }).map(function (x) { return ERROR_TAG_LABEL[x[0]]; });
    var hotspots = Object.entries(byCase).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5).map(function (pair) {
      return { caseId: pair[0], count: pair[1], title: ctx.bank.caseById[pair[0]].title };
    });
    return {
      events: events, byTag: byTag, byKind: byKind, submittedStages: submittedStages,
      unreachedStages: unreachedStages, blankSingleBest: blankSingleBest,
      affectedStages: affectedStages.size, affectedCases: affectedCases.size,
      dominant: dominant, dominantCount: topCount, hotspots: hotspots
    };
  }

  function clinicalErrorAnalysisHtml(r, ctx) {
    var a = buildClinicalErrorAnalysis(r, ctx);
    var total = a.events.length;
    var tagOrder = ['knowledge', 'interpretation', 'prioritization', 'management', 'unclassified'];
    var maxTag = Math.max.apply(null, [1].concat(tagOrder.map(function (k) { return a.byTag[k] || 0; })));
    var tagBars = tagOrder.filter(function (k) { return a.byTag[k] > 0; }).map(function (k) {
      var count = a.byTag[k], width = total ? (count / maxTag) * 100 : 0;
      return '<div class="err-row"><span class="err-label">' + esc(ERROR_TAG_LABEL[k]) + '</span><div class="err-track"><div class="err-fill" style="width:' + width.toFixed(1) + '%"></div></div><span class="err-count">' + num(count) + '</span></div>';
    }).join('');
    var kindOrder = ['missed_necessary', 'harmful_selected', 'premature_selected', 'wrong_single_best'];
    var kindCards = kindOrder.map(function (k) {
      return '<div class="err-type"><strong>' + num(a.byKind[k]) + '</strong><span>' + esc(ERROR_KIND_LABEL[k]) + '</span></div>';
    }).join('');
    var hotspotRows = a.hotspots.map(function (h) {
      return '<tr><td>' + esc(h.caseId) + '</td><td>' + esc(h.title) + '</td><td>' + num(h.count) + '</td></tr>';
    }).join('');
    var eventsByTag = tagOrder.filter(function (k) { return a.events.some(function (e) { return e.tag === k; }); }).map(function (k) {
      var group = a.events.filter(function (e) { return e.tag === k; });
      return '<h4>' + esc(ERROR_TAG_LABEL[k]) + ' · ' + num(group.length) + '</h4><ul class="err-event-list">' +
        group.map(function (e) {
          return '<li class="err-event"><div class="err-event-title">' + esc(e.kindLabel) + ' — ' + esc(e.caseTitle) + '</div>' +
            '<div class="err-event-meta"><span class="err-chip">' + esc(e.caseId) + ' · ' + esc(e.itemId) + '</span><span class="err-chip">' + esc(e.tagLabel) + '</span></div>' +
            '<p>' + esc(e.optionText) + '</p>' + (e.rationale ? '<p class="note">' + esc(e.rationale) + '</p>' : '') + '</li>';
        }).join('') + '</ul>';
    }).join('');
    var dominantText = a.dominant.length ? a.dominant.join('، ') : 'هنوز قابل تعیین نیست';
    var empty = total === 0;
    return '<section class="error-analysis" aria-labelledby="error-analysis-title">' +
      '<div class="error-analysis-head"><div><h2 id="error-analysis-title">تحلیل خطاهای بالینی <span class="version-pill">Clinical Error Analysis</span></h2><p class="error-subtitle">الگوهای خطا در همین تلاش بر اساس برچسب‌های گزینه‌ها.</p></div></div>' +
      '<div class="err-stat-grid">' +
        '<div class="err-stat"><strong>' + num(total) + '</strong><span>رویداد خطای طبقه‌بندی‌شده</span></div>' +
        '<div class="err-stat"><strong>' + num(a.affectedStages) + '</strong><span>مرحله دارای خطا</span></div>' +
        '<div class="err-stat"><strong>' + num(a.affectedCases) + '</strong><span>کیس دارای خطا</span></div>' +
        '<div class="err-stat"><strong>' + num(a.unreachedStages + a.blankSingleBest) + '</strong><span>مرحله بدون پاسخ</span></div>' +
      '</div>' +
      (empty
        ? '<p class="err-empty">در تصمیم‌های پاسخ‌داده‌شده، خطای قابل‌طبقه‌بندی ثبت نشد.</p>'
        : '<div class="err-section"><h3>الگوی غالب این تلاش</h3><p><strong>' + esc(dominantText) + '</strong>' + (a.dominant.length ? ' با ' + num(a.dominantCount) + ' مورد از ' + num(total) + ' رویداد خطا.' : '') + '</p></div>' +
          '<div class="err-section"><h3>توزیع خطا بر اساس نوع استدلال</h3><div class="err-bars">' + (tagBars || '<p class="note">داده‌ای وجود ندارد.</p>') + '</div></div>' +
          '<div class="err-section"><h3>رفتارهای خطاساز مشاهده‌شده</h3><div class="err-types">' + kindCards + '</div></div>' +
          (hotspotRows ? '<div class="err-section"><h3>کیس‌هایی با بیشترین رویداد خطا</h3><table class="err-hotspots"><thead><tr><th>شناسه</th><th>کیس</th><th>تعداد</th></tr></thead><tbody>' + hotspotRows + '</tbody></table></div>' : '') +
          '<details class="err-events"><summary>مشاهده جزئیات ' + num(total) + ' رویداد خطا</summary>' + eventsByTag + '</details>') +
      '<p class="note">از ' + num(a.submittedStages) + ' مرحله ثبت‌شده تحلیل انجام شد؛ ' + num(a.unreachedStages) + ' مرحله بدون رسیدن و ' + num(a.blankSingleBest) + ' مرحله تک‌پاسخ خالی ثبت شد.</p></section>';
  }

  function resultsHtml(ctx) {
    var r = ctx.results, t = r.totals;
    return '<main class="doc results"><div class="doc-inner">' +
      '<h1>گزارش ' + (r.mode === 'exam' ? 'آزمون' : 'تمرین') + '</h1>' +
      (r.submitReason === 'timeout' ? '<p class="banner crit">زمان تمام شد. آزمون به‌طور خودکار ثبت شد.</p>' : '') +
      '<div class="scores">' +
        '<div><span class="big" dir="ltr">' + esc(t.raw) + '</span><span>نمره خام</span></div>' +
        '<div><span class="big" dir="ltr">' + esc(t.max) + '</span><span>حداکثر نمره ممکن</span></div>' +
        '<div><span class="big" dir="ltr">' + pct(t.rawPercent) + '</span><span>درصد خام</span></div>' +
        '<div><span class="big" dir="ltr">' + pct(t.scaledPercent) + '</span><span>درصد مقیاس‌شده (' + sgnH(t.min) + ' تا ' + num(t.max) + ')</span></div>' +
      '</div>' +
      '<p>به ' + num(r.answered) + ' از ' + num(r.total) + ' آیتم پاسخ دادی. زمان فعال: ' + fmtDur(r.timeUsedMs) +
        (r.mode === 'exam' && !r.timed ? ' (بدون محدودیت زمان)' : '') +
        (r.pauses ? '؛ ' + num(r.pauses) + ' بار توقف (مجموع ' + fmtDur(r.pausedMs) + ')' : '') + '.</p>' +
      bucketTable('عملکرد بر اساس موضوع', 'موضوع', r.byTopic, topicLabel) +
      bucketTable('عملکرد بر اساس نوع سؤال', 'نوع', r.byFormat, function (k) { return FORMAT_LABEL[k]; }) +
      clinicalErrorAnalysisHtml(r, ctx) +
      '<h3>مرور آیتم‌ها</h3>' + r.items.map(function (it) { return itemReview(it, ctx); }).join('') +
      '<div class="row"><button class="btn" data-action="home">بازگشت به داشبورد</button><button class="btn ghost" data-action="newAttempt" data-mode="' + r.mode + '">شروع ' + (r.mode === 'exam' ? 'آزمون' : 'تمرین') + ' جدید</button></div>' +
    '</div></main>';
  }

  function backupHtml(text, kind) {
    return '<p>این متن همه پیشرفت آزمون و تمرین تو را نگه می‌دارد تا بتوانی روی دستگاه دیگر بازیابی کنی.</p>' +
      '<h4>گرفتن پشتیبان</h4><textarea id="bk-out" class="bk" readonly dir="ltr" rows="4">' + esc(text) + '</textarea>' +
      '<div class="row"><button class="btn" data-action="downloadBackup">دانلود فایل</button><button class="btn ghost" data-action="copyBackup">کپی متن</button></div>' +
      '<h4>بازیابی از پشتیبان</h4><textarea id="bk-in" class="bk" dir="ltr" rows="4" placeholder="متن پشتیبان را اینجا بچسبان"></textarea>' +
      '<div class="row"><input type="file" id="bk-file" accept=".json,application/json"><button class="btn" data-action="importBackup">بازیابی از متن</button></div>';
  }
  function restoreDoneHtml(sum) {
    function line(n, x) { return x ? '<li>' + n + ': ' + (x.status === 'submitted' ? 'پایان‌یافته' : 'در جریان') + '، ' + num(x.committed) + ' تصمیم ثبت‌شده</li>' : ''; }
    return '<p>پیشرفت برگردانده شد.</p><ul>' + line('آزمون', sum.exam) + line('تمرین', sum.practice) + '</ul><div class="row"><button class="btn" data-action="closeModal">باشه</button></div>';
  }

  /* ========================================================================
   * 6. APPLICATION CONTROLLER (With Lazy Chunk Loading)
   * ======================================================================== */
  function createApp(opts) {
    var indexObj = opts.indexObj, bank = opts.bank, cfg = indexObj.cfg, storage = opts.storage, root = opts.root;
    var clock = opts.now || function () { return Date.now(); };
    function getKey(itemId) {
      var ref = resolveFullStage(bank, itemId);
      if (!ref) return null;
      var ck = window.PmpLoader ? window.PmpLoader.getLoadedKey(ref.case.caseId) : null;
      return ck && ck.items ? ck.items[itemId] : null;
    }
    function skey(mode) { return 'pmp1:' + mode + ':session'; }

    var app = {
      view: 'landing', mode: null, session: null, results: null,
      saved: { exam: null, practice: null },
      ui: {
        current: null, drawer: false, modal: null, confirmCommit: false, confirmSubmit: false,
        banner: null, railOpen: false, warned: {}, reviewing: null, timedChoice: true,
        caseQuery: '', caseTopic: 'all', railQuery: '', loadingCase: false
      },
      saveState: 'idle', tickCount: 0, timerHandle: null
    };

    function ctx() {
      return {
        indexObj: indexObj, cfg: cfg, bank: bank, session: app.session, ui: app.ui, now: clock(),
        saved: app.saved, mode: app.mode, storageKind: storage.kind, results: app.results, getKey: getKey,
        saveState: app.saveState,
        getFeedback: function (id) {
          var ref = resolveFullStage(bank, id);
          return scoreItem(ref.stage.format, getKey(id), app.session.committed[id].selected, cfg);
        }
      };
    }

    function setSaveState(st) {
      app.saveState = st;
      var el = root.querySelector && root.querySelector('#save-ind');
      if (el) {
        el.className = 'save save-' + st;
        el.textContent = st === 'ok' ? '\u2713 ذخیره شد' : st === 'failed' ? '\u26A0 ذخیره نشد' : '...';
      }
    }
    function persist() {
      if (!app.session) return Promise.resolve(false);
      app.saved[app.session.mode] = app.session;
      setSaveState('saving');
      return storage.set(skey(app.session.mode), app.session).then(function (ok) {
        setSaveState(ok ? 'ok' : 'failed');
        return ok;
      });
    }

    function render() {
      var a = typeof document !== 'undefined' ? document.activeElement : null;
      var fid = a && a.dataset ? a.dataset.fid : null;
      var activeId = a && a.id ? a.id : null;
      var selStart = (a && typeof a.selectionStart === 'number') ? a.selectionStart : null;
      var html;
      if (app.view === 'landing') html = landing(ctx());
      else if (app.view === 'instructions') html = instructions(ctx());
      else if (app.view === 'exam') html = examShell(ctx());
      else html = resultsHtml(Object.assign(ctx(), { results: app.results }));
      if (app.view !== 'exam') html += modalHtml(ctx());
      root.innerHTML = html;

      var focusTarget = fid ? root.querySelector('[data-fid="' + fid + '"]') : (activeId ? root.querySelector('#' + activeId) : null);
      if (focusTarget && focusTarget.focus && !focusTarget.disabled) {
        focusTarget.focus();
        if (selStart !== null && typeof focusTarget.setSelectionRange === 'function') {
          try { focusTarget.setSelectionRange(selStart, selStart); } catch (e) {}
        }
      }
      if (app.scrollTop && typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo(0, 0);
        var m = root.querySelector && root.querySelector('#main');
        if (m && m.focus) m.focus({ preventScroll: true });
        app.scrollTop = false;
      }
    }

    function ensureCurrentLoadedAndRender(itemId) {
      if (window.PmpLoader && !window.PmpLoader.getLoadedStage(itemId)) {
        app.ui.loadingCase = true;
        render();
        window.PmpLoader.ensureItem(itemId, function (err) {
          app.ui.loadingCase = false;
          if (err) {
            app.ui.banner = { kind: 'crit', text: 'خطا در بارگذاری اطلاعات کیس.' };
          }
          render();
        });
        return;
      }
      app.ui.loadingCase = false;
      render();
    }

    function setSession(s) { app.session = s; return persist(); }
    function goItem(id) {
      app.ui.current = id; app.ui.confirmCommit = false; app.ui.railOpen = false; app.ui.reviewing = null; app.scrollTop = true;
      app.session = Object.assign({}, app.session, { current: id });
      persist();
      ensureCurrentLoadedAndRender(id);
    }

    function showResults() {
      if (window.PmpLoader) {
        window.PmpLoader.ensureAllChunks(function () {
          app.results = computeResults(app.session, bank, window.PmpLoader.getAllLoadedKeys(), cfg);
          app.view = 'results'; app.ui.modal = null; app.ui.drawer = false; app.ui.confirmSubmit = false; app.scrollTop = true;
          render();
        });
      }
    }

    function doFinalize(reason) {
      var s = finalize(app.session, bank, cfg, reason, clock());
      app.saved[s.mode] = s;
      setSession(s);
      showResults();
    }

    function openExam(session) {
      if (!bank.stageById[session.current]) {
        session = Object.assign({}, session, { current: bank.cases[0].stages[0].itemId });
      }
      app.session = session; app.mode = session.mode; app.view = 'exam';
      app.ui.current = session.current; app.ui.drawer = false; app.ui.modal = null;
      app.ui.confirmCommit = false; app.ui.confirmSubmit = false; app.ui.banner = null;
      app.ui.railOpen = false; app.ui.warned = {}; app.ui.reviewing = null;
      app.scrollTop = true;
      if (session.mode === 'exam') tick();
      ensureCurrentLoadedAndRender(session.current);
    }

    function openSpecificCase(caseId, mode) {
      var targetMeta = bank.caseById[caseId] || bank.cases[0];
      if (!targetMeta) return;
      var firstItem = targetMeta.stages[0].itemId;
      var existing = app.saved[mode];
      var session;
      if (existing && existing.status === 'in_progress') {
        var ch = chain(existing, bank, targetMeta);
        var openStage = ch.find(function (e) { return e.status === 'open'; }) || ch[ch.length - 1];
        session = Object.assign({}, existing, { current: openStage ? openStage.itemId : firstItem });
        if (mode === 'exam' && isPaused(session)) session = resume(session, clock());
      } else {
        session = createSession(bank, cfg, mode, clock(), { timed: mode === 'exam' && app.ui.timedChoice !== false, startCaseId: targetMeta.caseId });
      }
      setSession(session);
      openExam(session);
    }

    function flatOpen() {
      var out = [];
      for (var i = 0; i < bank.cases.length; i++) {
        var ch = chain(app.session, bank, bank.cases[i]);
        for (var j = 0; j < ch.length; j++) if (ch[j].status !== 'locked') out.push(ch[j].itemId);
      }
      return out;
    }

    function findBlock(id) {
      var ref = resolveFullStage(bank, app.ui.current);
      if (!ref) return null;
      var list = caseFile(app.session, bank, ref.case.caseId);
      for (var i = 0; i < list.length; i++) {
        var f = list[i];
        var blocks = [].concat(f.info, f.resultsFromPrev, f.ownResults);
        for (var j = 0; j < blocks.length; j++) if (blocks[j].id === id) return blocks[j];
      }
      return null;
    }

    function downloadText(text) {
      try {
        var blob = new Blob([text], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url;
        a.download = 'pmp-backup-' + new Date(clock()).toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        app.ui.banner = { kind: 'info', text: 'فایل پشتیبان ساخته شد.' };
      } catch (e) {
        app.ui.banner = { kind: 'warn', text: 'دانلود در این محیط ممکن نیست؛ متن پشتیبان را کپی کن.' };
      }
      render();
    }

    function copyText(text) {
      function done(ok) {
        app.ui.banner = { kind: ok ? 'info' : 'warn', text: ok ? 'متن پشتیبان کپی شد.' : 'کپی خودکار ممکن نشد؛ متن داخل کادر را دستی کپی کن.' };
        render();
      }
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
          return;
        }
      } catch (e) {}
      try {
        var ta = root.querySelector && root.querySelector('#bk-out');
        if (ta) { ta.focus(); ta.select(); done(document.execCommand('copy')); return; }
      } catch (e) {}
      done(false);
    }

    function dispatch(a) {
      var s = app.session;
      switch (a.type) {
        case 'home': app.view = 'landing'; render(); return;
        case 'instructions': app.mode = a.mode; app.view = 'instructions'; app.ui.timedChoice = true; render(); return;
        case 'setTimed': app.ui.timedChoice = !!a.value; render(); return;
        case 'filterTopic': app.ui.caseTopic = a.topic || 'all'; render(); return;
        case 'searchCases': app.ui.caseQuery = a.value || ''; render(); return;
        case 'filterRail': app.ui.railQuery = a.value || ''; render(); return;
        case 'openCasePractice': openSpecificCase(a.case, 'practice'); return;
        case 'openCaseExam': openSpecificCase(a.case, 'exam'); return;
        case 'start': {
          var ns = createSession(bank, cfg, a.mode, clock(), { timed: app.ui.timedChoice !== false });
          setSession(ns); openExam(ns); return;
        }
        case 'newAttempt': app.mode = a.mode; app.view = 'instructions'; render(); return;
        case 'resume': {
          var sv = app.saved[a.mode];
          if (sv && sv.status === 'in_progress') openExam(sv);
          return;
        }
        case 'exit': {
          if (s && s.mode === 'exam' && s.deadline != null && cfg.session.pauseAllowed) {
            var ps = pause(s, clock());
            if (ps !== s) setSession(ps);
          }
          app.ui.drawer = false; app.ui.modal = null; app.view = 'landing'; render(); return;
        }
        case 'pause': {
          if (cfg.session.pauseAllowed) {
            var ps2 = pause(s, clock());
            if (ps2 !== s) { app.ui.drawer = false; app.ui.modal = null; app.ui.confirmSubmit = false; setSession(ps2); render(); }
          }
          return;
        }
        case 'resumeExam': setSession(resume(s, clock())); app.scrollTop = true; render(); return;
        case 'openBackup':
          app.ui.modal = { title: 'پشتیبان‌گیری و بازیابی', html: backupHtml(makeBackup(app.saved, bank, cfg, clock()), storage.kind) };
          render(); return;
        case 'downloadBackup': downloadText(makeBackup(app.saved, bank, cfg, clock())); return;
        case 'copyBackup': copyText(makeBackup(app.saved, bank, cfg, clock())); return;
        case 'importBackup': {
          var text = a.text != null ? a.text : (root.querySelector && root.querySelector('#bk-in') ? root.querySelector('#bk-in').value : '');
          window.PmpLoader.ensureAllChunks(function () {
            var r = parseBackup(text, bank);
            if (!r.ok) {
              app.ui.modal = { title: 'بازیابی انجام نشد', html: '<p class="banner crit">' + esc(r.error) + '</p><div class="row"><button class="btn" data-action="openBackup">بازگشت</button></div>' };
              render(); return;
            }
            app.ui.modal = { title: 'بازیابی انجام شد', html: restoreDoneHtml(r.summary) };
            ['exam', 'practice'].forEach(function (m) {
              if (r.sessions[m]) {
                var ss = r.sessions[m];
                if (m === 'exam' && ss.status === 'in_progress' && ss.deadline != null && ss.pausedAt == null) {
                  ss = applyAutoPause(ss, clock(), 0);
                }
                app.saved[m] = ss;
                storage.set(skey(m), ss);
              }
            });
            app.view = 'landing';
            render();
          });
          return;
        }
        case 'viewResults': app.session = app.saved[a.mode]; app.mode = a.mode; showResults(); return;
        case 'goto': if (itemStatus(s, bank, a.item) !== 'locked') goItem(a.item); return;
        case 'prev': case 'next': {
          var f = flatOpen(), i = f.indexOf(app.ui.current), j = a.type === 'prev' ? i - 1 : i + 1;
          if (f[j]) goItem(f[j]);
          return;
        }
        case 'nextCase': {
          var cur = resolveFullStage(bank, app.ui.current).case.caseId;
          var order = bank.cases.map(function (c) { return c.caseId; }), start = order.indexOf(cur);
          var target = null;
          for (var k = 1; k <= order.length && !target; k++) {
            var c = bank.caseById[order[(start + k) % order.length]];
            var open = chain(s, bank, c).find(function (e) { return e.status === 'open'; });
            if (open) target = open.itemId;
          }
          if (target) goItem(target);
          else { app.ui.reviewing = null; app.ui.banner = { kind: 'info', text: 'همه کیس‌ها ثبت شده‌اند. هر زمان آماده بودی «ثبت نهایی» را بزن.' }; render(); }
          return;
        }
        case 'toggle': {
          var st = resolveFullStage(bank, app.ui.current).stage;
          var curSel = (s.drafts[st.itemId] || []).slice();
          var nextSel;
          if (st.format === 'single_best') nextSel = [a.opt];
          else nextSel = curSel.includes(a.opt) ? curSel.filter(function (x) { return x !== a.opt; }) : curSel.concat(a.opt);
          app.ui.confirmCommit = false;
          setSession(setDraft(s, bank, st.itemId, nextSel, clock()));
          render(); return;
        }
        case 'askCommit': app.ui.confirmCommit = true; render(); return;
        case 'cancelCommit': app.ui.confirmCommit = false; render(); return;
        case 'commit': {
          var cid = app.ui.current;
          try {
            var ns2 = commit(s, bank, cid, s.drafts[cid] || [], clock());
            setSession(ns2); app.ui.confirmCommit = false;
            var caseObj = resolveFullStage(bank, cid).case;
            var done = chain(ns2, bank, caseObj).every(function (e) { return e.status === 'committed'; });
            if (done && cfg.session.caseReview === 'after_case' && ns2.mode === 'exam') {
              app.ui.reviewing = caseObj.caseId; app.scrollTop = true;
            }
            render();
          } catch (e) {
            if (e.code === 'TIME_EXPIRED') { doFinalize('timeout'); return; }
            app.ui.banner = { kind: 'crit', text: 'ثبت انجام نشد: ' + e.code };
            render();
          }
          return;
        }
        case 'reviewCase': {
          app.ui.reviewing = a.case; app.ui.railOpen = false; app.scrollTop = true;
          if (window.PmpLoader && !window.PmpLoader.getLoadedCase(a.case)) {
            app.ui.loadingCase = true; render();
            window.PmpLoader.ensureCase(a.case, function () { app.ui.loadingCase = false; render(); });
            return;
          }
          render(); return;
        }
        case 'closeReview': app.ui.reviewing = null; app.scrollTop = true; render(); return;
        case 'openDrawer': app.ui.drawer = true; render(); return;
        case 'closeDrawer': app.ui.drawer = false; render(); return;
        case 'openBlock': {
          var b = findBlock(a.block);
          if (b) app.ui.modal = { title: b.title, html: blockHtml(b) };
          render(); return;
        }
        case 'openImage': {
          var src = a.src;
          var fallbackSrcs = [];
          try { fallbackSrcs = JSON.parse(a.fallbacks || '[]'); } catch (e) { fallbackSrcs = []; }
          if (src) {
            app.ui.modal = {
              title: a.title || 'نمایش تصویر بالینی',
              html: '<img class="clinical-image-modal" loading="lazy" data-fallbacks="' + esc(JSON.stringify(fallbackSrcs)) + '" data-fallback-index="0" data-desc="' + esc(a.desc || '') + '" data-title="' + esc(a.title || '') + '" src="' + esc(src) + '" alt="' + esc(a.desc || a.title || 'تصویر پزشکی') + '" onerror="window.__pmpModalImgErr(this)">'
            };
            render();
          }
          return;
        }
        case 'openAttachment': {
          var ast = resolveFullStage(bank, a.item || app.ui.current).stage;
          var at = (ast.attachments || []).find(function (x) { return x.id === a.att; });
          if (at) {
            var body = at.svg
              ? '<figure>' + at.svg + '<figcaption>' + esc(at.caption) + (at.synthetic && !/ساختگی/.test(at.caption) ? ' (تصویر آموزشی ساختگی)' : '') + '</figcaption></figure>'
              : (at.kind === 'image' && at.src)
                ? '<img class="clinical-image-modal" data-fallbacks="' + esc(JSON.stringify(at.fallbackSrcs || [])) + '" data-fallback-index="0" data-desc="' + esc(at.caption || at.sourceLabel || at.alt || at.title || '') + '" data-title="' + esc(at.title || '') + '" src="' + esc(at.src) + '" alt="' + esc(at.alt || at.title || 'تصویر پزشکی') + '" onerror="window.__pmpModalImgErr(this)">'
                : (at.kind === 'video' && at.embedUrl)
                  ? '<div class="clinical-video-modal"><div class="clinical-video-ratio"><iframe src="' + esc(at.embedUrl) + '" title="ویدئوی بالینی" loading="lazy" allowfullscreen></iframe></div><p>' + esc(at.caption || '') + '</p><p><a href="' + esc(at.sourceUrl || at.embedUrl) + '" target="_blank" rel="noopener noreferrer">باز کردن منبع اصلی</a></p></div>'
                  : '<p>' + esc(at.inline || at.caption || '') + '</p>';
            app.ui.modal = { title: at.kind === 'image' ? 'نمایش تصویر' : at.kind === 'video' ? 'ویدئوی بالینی' : at.title, html: body };
            render();
          }
          return;
        }
        case 'closeModal': app.ui.modal = null; render(); return;
        case 'askSubmit': app.ui.confirmSubmit = true; render(); return;
        case 'cancelSubmit': app.ui.confirmSubmit = false; render(); return;
        case 'submit': doFinalize('manual'); return;
        case 'dismissBanner': app.ui.banner = null; render(); return;
        case 'toggleRail': app.ui.railOpen = !app.ui.railOpen; render(); return;
        default: return;
      }
    }

    function tick() {
      if (app.view !== 'exam' || !app.session || app.session.mode !== 'exam' || app.session.status !== 'in_progress') return;
      if (app.session.pausedAt != null) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      var now = clock();
      app.session = touch(app.session, now);
      if (++app.tickCount % 10 === 0) persist();
      if (app.session.deadline == null) return;
      var rem = remainingMs(app.session, now);
      if (rem <= 0) { doFinalize('timeout'); return; }
      var warn = cfg.session.warnAtMinutes;
      var rerender = false;
      for (var i = 0; i < warn.length; i++) {
        var m = warn[i];
        if (rem <= m * 60000 && !app.ui.warned[m]) {
          app.ui.warned[m] = true;
          app.ui.banner = { kind: m <= warn[1] ? 'crit' : 'warn', text: m + ' دقیقه یا کمتر باقی مانده است. آیتم‌های بی‌پاسخ «بدون انتخاب» نمره می‌گیرند.' };
          rerender = true;
        }
      }
      if (rerender) { render(); return; }
      var el = root.querySelector && root.querySelector('#timer-text');
      if (el) el.textContent = fmtClock(rem);
      var box = root.querySelector && root.querySelector('#timer');
      if (box) box.className = 'timer ' + (rem <= warn[1] * 60000 ? 'crit' : rem <= warn[0] * 60000 ? 'warn' : '');
    }

    function onKey(e) {
      if (e.key === 'Escape') {
        if (app.ui.modal) dispatch({ type: 'closeModal' });
        else if (app.ui.confirmSubmit) dispatch({ type: 'cancelSubmit' });
        else if (app.ui.drawer) dispatch({ type: 'closeDrawer' });
        else if (app.ui.confirmCommit) dispatch({ type: 'cancelCommit' });
        return;
      }
      if (app.view !== 'exam' || app.ui.reviewing || app.ui.modal || app.ui.confirmSubmit || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      if (/^[1-9]$/.test(e.key)) {
        var ref = resolveFullStage(bank, app.ui.current);
        var st = ref && ref.stage;
        if (!st || itemStatus(app.session, bank, st.itemId) !== 'open') return;
        var o = st.options[Number(e.key) - 1];
        if (o) { e.preventDefault(); dispatch({ type: 'toggle', opt: o.id }); }
      }
    }

    function checkAway() {
      if (!app.session || app.view !== 'exam' || !cfg.session.autoPauseOnLeave) return;
      var ns = applyAutoPause(app.session, clock(), cfg.session.autoPauseGapSeconds * 1000);
      if (ns !== app.session) { app.session = ns; persist(); render(); }
    }

    function attach() {
      root.addEventListener('click', function (e) {
        var t = e.target;
        if (t.tagName === 'INPUT') return;
        var el = t.closest && t.closest('[data-action]');
        if (!el) return;
        if (el.classList.contains('modal-back') && t.closest('[data-stop]')) return;
        if (el.tagName === 'LABEL') return;
        dispatch(Object.assign({ type: el.dataset.action }, el.dataset));
      });
      root.addEventListener('input', function (e) {
        var t = e.target;
        if (t.dataset && (t.dataset.action === 'searchCases' || t.dataset.action === 'filterRail')) {
          dispatch({ type: t.dataset.action, value: t.value });
        }
      });
      root.addEventListener('change', function (e) {
        var t = e.target;
        if (t.tagName !== 'INPUT') return;
        if (t.dataset.action === 'toggle') dispatch({ type: 'toggle', opt: t.dataset.opt });
        else if (t.dataset.action === 'setTimed') dispatch({ type: 'setTimed', value: t.checked });
        else if (t.id === 'bk-file' && t.files && t.files[0]) {
          var fr = new FileReader();
          fr.onload = function () { dispatch({ type: 'importBackup', text: String(fr.result) }); };
          fr.readAsText(t.files[0]);
        }
      });
      document.addEventListener('keydown', onKey);
      app.timerHandle = setInterval(tick, 1000);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          if (app.session && app.session.status === 'in_progress') { app.session = touch(app.session, clock()); persist(); }
          return;
        }
        checkAway(); tick();
      });
      window.addEventListener('pagehide', function () {
        if (app.session && app.session.status === 'in_progress') { app.session = touch(app.session, clock()); persist(); }
      });
      window.addEventListener('hashchange', function () {
        var h = (window.location.hash || '').replace(/^#/, '').toUpperCase();
        if (h && bank.caseById[h]) {
          openSpecificCase(h, app.mode || 'practice');
        }
      });
    }

    function resolveDeepLinkCase() {
      if (window.location.hash) {
        var h = window.location.hash.replace(/^#/, '').toUpperCase();
        if (bank.caseById[h]) return h;
      }
      if (window.location.search) {
        var m = window.location.search.match(/[?&]case=([^&]+)/i);
        if (m && bank.caseById[m[1].toUpperCase()]) return m[1].toUpperCase();
      }
      return null;
    }

    function init() {
      return Promise.all([storage.get(skey('exam')), storage.get(skey('practice'))]).then(function (vals) {
        app.saved.exam = vals[0];
        app.saved.practice = vals[1];
        var ex = app.saved.exam;
        if (ex && ex.status === 'in_progress') {
          if (cfg.session.autoPauseOnLeave) ex = applyAutoPause(ex, clock(), cfg.session.autoPauseGapSeconds * 1000);
          if (isExpired(ex, clock())) ex = finalize(ex, bank, cfg, 'timeout', clock());
          if (ex !== app.saved.exam) { app.saved.exam = ex; storage.set(skey('exam'), ex); }
        }
        render();

        var deepCase = resolveDeepLinkCase();
        if (deepCase) {
          openSpecificCase(deepCase, 'practice');
        }
      });
    }

    return Object.assign(app, { dispatch: dispatch, tick: tick, init: init, attach: attach, render: render, getKey: getKey, openSpecificCase: openSpecificCase });
  }

  /* ========================================================================
   * 7. MEDICALISM TOP TOOLBAR CONTROLS (Theme, Font, Continuous Zoom)
   * ======================================================================== */
  function initMedicalismPrefs() {
    if (window.MedicalismShell) {
      window.MedicalismShell.setFontScale(window.MedicalismShell.getFontScale());
      return;
    }
    var root = document.documentElement;
    function safeGet(k, defVal) {
      try { var v = localStorage.getItem(k); return v !== null ? v : defVal; } catch (e) { return defVal; }
    }
    function safeSet(k, v) {
      try { localStorage.setItem(k, String(v)); } catch (e) {}
    }

    var theme = safeGet('med_theme', 'light');
    var font = safeGet('med_font_family', 'vazirmatn');
    var scale = parseFloat(safeGet('med_font_scale', '1')) || 1;
    scale = Math.min(1.30, Math.max(0.85, scale));

    function applyTheme(t) {
      theme = t === 'dark' ? 'dark' : 'light';
      root.setAttribute('data-theme', theme);
      safeSet('med_theme', theme);
      var btn = document.getElementById('themeToggleBtn');
      if (btn) {
        var sun = btn.querySelector('.icon-sun');
        var moon = btn.querySelector('.icon-moon');
        if (sun) sun.style.display = theme === 'dark' ? 'block' : 'none';
        if (moon) moon.style.display = theme === 'dark' ? 'none' : 'block';
      }
    }

    function applyFont(f) {
      var map = {
        vazirmatn: "'Vazirmatn', system-ui, -apple-system, sans-serif",
        sahel: "'Sahel', 'Vazirmatn', system-ui, sans-serif",
        shabnam: "'Shabnam', 'Vazirmatn', system-ui, sans-serif"
      };
      font = map[f] ? f : 'vazirmatn';
      root.style.setProperty('--app-font-family', map[font]);
      root.style.setProperty('--font-current', map[font]);
      if (document.body) document.body.style.fontFamily = map[font];
      safeSet('med_font_family', font);
      var sel = document.getElementById('fontSelect');
      if (sel && sel.value !== font) sel.value = font;
    }

    function applyScale(s) {
      scale = Math.round(Math.min(1.30, Math.max(0.85, s)) * 20) / 20;
      root.style.setProperty('--font-scale', String(scale));
      var pmpRoot = document.getElementById('pmpAppRoot');
      if (pmpRoot) {
        pmpRoot.style.setProperty('--font-scale', String(scale));
        pmpRoot.style.fontSize = (16 * scale).toFixed(2) + 'px';
      }
      safeSet('med_font_scale', scale);
      var disp = document.getElementById('zoomDisplay');
      if (disp) disp.textContent = Math.round(scale * 100) + '%';
    }

    applyTheme(theme);
    applyFont(font);
    applyScale(scale);

    var themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', function () { applyTheme(theme === 'dark' ? 'light' : 'dark'); });
    var fontSel = document.getElementById('fontSelect');
    if (fontSel) fontSel.addEventListener('change', function (e) { applyFont(e.target.value); });
    var zOut = document.getElementById('zoomOutBtn');
    if (zOut) zOut.addEventListener('click', function () { applyScale(scale - 0.05); });
    var zIn = document.getElementById('zoomInBtn');
    if (zIn) zIn.addEventListener('click', function () { applyScale(scale + 0.05); });
    var zDisp = document.getElementById('zoomDisplay');
    if (zDisp) zDisp.addEventListener('click', function () { applyScale(1); });
  }

  /* ========================================================================
   * 8. BOOTSTRAP ON DOMCONTENTLOADED (< 50ms startup using only PMP_EXAM_INDEX)
   * ======================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initMedicalismPrefs();

    var indexObj = window.PMP_EXAM_INDEX;
    var rootEl = document.getElementById('pmpAppRoot') || document.getElementById('app');
    if (!indexObj || !rootEl) {
      console.error('PMP_EXAM_INDEX or root container not found.');
      return;
    }

    var bank = buildIndexBank(indexObj);
    var app = createApp({
      indexObj: indexObj,
      bank: bank,
      storage: createStorage(window),
      root: rootEl
    });

    window.__pmp = app;
    app.attach();
    app.init();
  });
})();
