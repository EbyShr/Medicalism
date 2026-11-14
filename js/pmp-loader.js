/**
 * MEDICALISM ALBORZ - PMP SURGERY EXAM CHUNK LOADER
 * - Unregisters any stale Service Workers on startup
 * - Resolves which chunk owns each case/item from window.PMP_EXAM_INDEX
 * - Loads ONLY the requested < 100 KB chunk on demand via dynamic <script>
 */
(function () {
  // Unregister any stale Service Workers that might serve broken cached bundles
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        for (var i = 0; i < regs.length; i++) {
          regs[i].unregister();
        }
      }).catch(function () {});
    }
  } catch (e) {}

  window.__PMP_CHUNK_CACHE = window.__PMP_CHUNK_CACHE || {};

  var inflightChunks = {};
  var loadedCases = {};
  var loadedStages = {};
  var loadedKeys = {};

  function getIndex() {
    return window.PMP_EXAM_INDEX || { cfg: {}, cases: [], totalCases: 0, totalStages: 0, chunkCount: 0 };
  }

  function ingestChunk(chunkId, chunkObj) {
    if (!chunkObj || !Array.isArray(chunkObj.cases)) return;
    var cList = chunkObj.cases;
    var kMap = chunkObj.keys || {};
    for (var i = 0; i < cList.length; i++) {
      var c = cList[i];
      if (!c || !c.caseId) continue;
      if (Array.isArray(c.stages)) {
        c = Object.assign({}, c, {
          stages: c.stages.slice().sort(function (a, b) { return (a.seq || 0) - (b.seq || 0); })
        });
        for (var j = 0; j < c.stages.length; j++) {
          var st = c.stages[j];
          loadedStages[st.itemId] = { case: c, stage: st };
        }
      }
      loadedCases[c.caseId] = c;
      if (kMap[c.caseId]) {
        loadedKeys[c.caseId] = kMap[c.caseId];
      }
    }
  }

  function findCaseMeta(caseId) {
    var idx = getIndex();
    var list = idx.cases || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].caseId === caseId) return list[i];
    }
    return list.length ? list[0] : null;
  }

  function findCaseMetaByItemId(itemId) {
    var idx = getIndex();
    var list = idx.cases || [];
    for (var i = 0; i < list.length; i++) {
      var stages = list[i].stagesMeta || [];
      for (var j = 0; j < stages.length; j++) {
        if (stages[j].itemId === itemId) return list[i];
      }
    }
    return list.length ? list[0] : null;
  }

  function resolveChunkIdForCase(caseId) {
    var meta = findCaseMeta(caseId);
    return meta ? String(meta.chunkId) : '0';
  }

  function resolveChunkIdForItem(itemId) {
    var meta = findCaseMetaByItemId(itemId);
    return meta ? String(meta.chunkId) : '0';
  }

  function loadChunk(chunkId, callback) {
    var cid = String(chunkId);
    if (window.__PMP_CHUNK_CACHE[cid]) {
      ingestChunk(cid, window.__PMP_CHUNK_CACHE[cid]);
      if (callback) callback(null, window.__PMP_CHUNK_CACHE[cid]);
      return;
    }

    if (inflightChunks[cid]) {
      if (callback) inflightChunks[cid].push(callback);
      return;
    }

    inflightChunks[cid] = callback ? [callback] : [];
    var script = document.createElement('script');
    script.src = './data/pmp/pmp-chunk-' + cid + '.js?v=20261114';
    script.async = true;
    script.onload = function () {
      var cbs = inflightChunks[cid] || [];
      delete inflightChunks[cid];
      var payload = window.__PMP_CHUNK_CACHE[cid] || null;
      if (payload) ingestChunk(cid, payload);
      for (var i = 0; i < cbs.length; i++) {
        try {
          cbs[i](payload ? null : new Error('Missing chunk payload: ' + cid), payload);
        } catch (err) {
          console.error('PMP chunk callback error:', err);
        }
      }
    };
    script.onerror = function () {
      var cbs = inflightChunks[cid] || [];
      delete inflightChunks[cid];
      var err = new Error('Failed to load PMP chunk ' + cid);
      for (var i = 0; i < cbs.length; i++) {
        try { cbs[i](err, null); } catch (cbErr) {}
      }
    };
    (document.body || document.head).appendChild(script);
  }

  function ensureCase(caseId, callback) {
    if (loadedCases[caseId] && loadedKeys[caseId]) {
      if (callback) callback(null, loadedCases[caseId]);
      return;
    }
    var chunkId = resolveChunkIdForCase(caseId);
    loadChunk(chunkId, function (err) {
      if (callback) callback(err, loadedCases[caseId] || null);
    });
  }

  function ensureItem(itemId, callback) {
    if (loadedStages[itemId] && loadedKeys[loadedStages[itemId].case.caseId]) {
      if (callback) callback(null, loadedStages[itemId]);
      return;
    }
    var chunkId = resolveChunkIdForItem(itemId);
    loadChunk(chunkId, function (err) {
      if (callback) callback(err, loadedStages[itemId] || null);
    });
  }

  function ensureAllChunks(callback) {
    var idx = getIndex();
    var total = idx.chunkCount || 0;
    if (total === 0) {
      if (callback) callback(null);
      return;
    }
    var remaining = total;
    var firstErr = null;
    function done(err) {
      if (err && !firstErr) firstErr = err;
      remaining--;
      if (remaining <= 0 && callback) {
        callback(firstErr);
      }
    }
    for (var i = 0; i < total; i++) {
      loadChunk(String(i), done);
    }
  }

  window.PmpLoader = {
    getIndex: getIndex,
    findCaseMeta: findCaseMeta,
    findCaseMetaByItemId: findCaseMetaByItemId,
    loadChunk: loadChunk,
    ensureCase: ensureCase,
    ensureItem: ensureItem,
    ensureAllChunks: ensureAllChunks,
    getLoadedCase: function (caseId) { return loadedCases[caseId] || null; },
    getLoadedStage: function (itemId) { return loadedStages[itemId] || null; },
    getLoadedKey: function (caseId) { return loadedKeys[caseId] || null; },
    getAllLoadedKeys: function () { return loadedKeys; },
    getAllLoadedCases: function () { return loadedCases; }
  };
})();
