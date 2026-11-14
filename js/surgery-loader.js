/**
 * SURGERY FAST LOADER & PURE-JS RFC1951 INFLATE DECODER
 * - Unregisters any stale Service Worker (sw.js) on startup
 * - Loads ONLY the requested chapter on demand via <script src="./data/surgery/chapter-X.js?v=20261114">
 * - Decodes pre-compiled chapter payloads synchronously without blocking the main thread
 */
(function () {
  // 1. Unregister any stale Service Workers that might cache old broken files
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (var i = 0; i < registrations.length; i++) {
          registrations[i].unregister();
        }
      }).catch(function () {});
    }
  } catch (e) {}

  // 2. Compact pure-JS RFC 1951 raw-deflate decompressor (zero dependencies, ES5/iOS Safari safe)
  var LENS = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  var LEXT = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  var DISTS = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  var DEXT = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  var ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

  function buildTree(lengths, numSyms) {
    var counts = new Int32Array(16);
    var i;
    for (i = 0; i < numSyms; i++) {
      counts[lengths[i]]++;
    }
    counts[0] = 0;
    var offs = new Int32Array(16);
    var left = 1;
    for (var bits = 1; bits <= 15; bits++) {
      left <<= 1;
      left -= counts[bits];
      offs[bits] = (bits === 1) ? 0 : (offs[bits - 1] + counts[bits - 1]);
    }
    var syms = new Int32Array(numSyms);
    for (i = 0; i < numSyms; i++) {
      if (lengths[i] !== 0) {
        syms[offs[lengths[i]]++] = i;
      }
    }
    return { counts: counts, syms: syms };
  }

  function decodeSym(state, tree) {
    var counts = tree.counts;
    var syms = tree.syms;
    var code = 0, first = 0, index = 0;
    for (var len = 1; len <= 15; len++) {
      if (state.bitCount === 0) {
        state.bitBuf = state.src[state.pos++];
        state.bitCount = 8;
      }
      code |= (state.bitBuf & 1);
      state.bitBuf >>>= 1;
      state.bitCount--;
      var count = counts[len];
      if (code - count < first) {
        return syms[index + (code - first)];
      }
      index += count;
      first += count;
      first <<= 1;
      code <<= 1;
    }
    throw new Error('Invalid Huffman code');
  }

  function readBits(state, n) {
    var val = state.bitBuf;
    while (state.bitCount < n) {
      val |= (state.src[state.pos++] << state.bitCount);
      state.bitCount += 8;
    }
    state.bitBuf = val >>> n;
    state.bitCount -= n;
    return val & ((1 << n) - 1);
  }

  var fixedLitLen = new Int32Array(288);
  var k;
  for (k = 0; k <= 143; k++) fixedLitLen[k] = 8;
  for (k = 144; k <= 255; k++) fixedLitLen[k] = 9;
  for (k = 256; k <= 279; k++) fixedLitLen[k] = 7;
  for (k = 280; k <= 287; k++) fixedLitLen[k] = 8;
  var FIXED_LIT_TREE = buildTree(fixedLitLen, 288);

  var fixedDistLen = new Int32Array(30);
  for (k = 0; k < 30; k++) fixedDistLen[k] = 5;
  var FIXED_DIST_TREE = buildTree(fixedDistLen, 30);

  function inflateRaw(src) {
    var state = { src: src, pos: 0, bitBuf: 0, bitCount: 0 };
    var out = new Uint8Array(Math.max(src.length * 4, 4096));
    var outPos = 0;

    function ensureCap(extra) {
      if (outPos + extra > out.length) {
        var next = new Uint8Array(Math.max(out.length * 2, outPos + extra + 4096));
        next.set(out.subarray(0, outPos));
        out = next;
      }
    }

    var bfinal = 0;
    do {
      bfinal = readBits(state, 1);
      var btype = readBits(state, 2);
      if (btype === 0) {
        state.bitBuf = 0;
        state.bitCount = 0;
        var len = state.src[state.pos] | (state.src[state.pos + 1] << 8);
        state.pos += 4;
        ensureCap(len);
        out.set(state.src.subarray(state.pos, state.pos + len), outPos);
        state.pos += len;
        outPos += len;
      } else {
        var litTree, distTree;
        if (btype === 1) {
          litTree = FIXED_LIT_TREE;
          distTree = FIXED_DIST_TREE;
        } else {
          var hlit = readBits(state, 5) + 257;
          var hdist = readBits(state, 5) + 1;
          var hclen = readBits(state, 4) + 4;
          var clens = new Int32Array(19);
          var i;
          for (i = 0; i < hclen; i++) {
            clens[ORDER[i]] = readBits(state, 3);
          }
          var clTree = buildTree(clens, 19);
          var lengths = new Int32Array(hlit + hdist);
          i = 0;
          while (i < hlit + hdist) {
            var sym = decodeSym(state, clTree);
            if (sym < 16) {
              lengths[i++] = sym;
            } else {
              var rep = 0, val = 0;
              if (sym === 16) {
                val = lengths[i - 1];
                rep = 3 + readBits(state, 2);
              } else if (sym === 17) {
                rep = 3 + readBits(state, 3);
              } else {
                rep = 11 + readBits(state, 7);
              }
              while (rep--) lengths[i++] = val;
            }
          }
          litTree = buildTree(lengths, hlit);
          distTree = buildTree(lengths.subarray(hlit), hdist);
        }

        while (true) {
          var s = decodeSym(state, litTree);
          if (s < 256) {
            ensureCap(1);
            out[outPos++] = s;
          } else if (s === 256) {
            break;
          } else {
            var li = s - 257;
            var length = LENS[li] + (LEXT[li] ? readBits(state, LEXT[li]) : 0);
            var di = decodeSym(state, distTree);
            var dist = DISTS[di] + (DEXT[di] ? readBits(state, DEXT[di]) : 0);
            ensureCap(length);
            for (var c = 0; c < length; c++) {
              out[outPos] = out[outPos - dist];
              outPos++;
            }
          }
        }
      }
    } while (!bfinal);

    return out.subarray(0, outPos);
  }

  function decodeBase64(b64) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  function utf8ToString(bytes) {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
    var out = '';
    var i = 0;
    var len = bytes.length;
    while (i < len) {
      var c = bytes[i++];
      if (c < 128) {
        out += String.fromCharCode(c);
      } else if (c > 191 && c < 224) {
        out += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
      } else if (c > 239 && c < 365) {
        var cp = (((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63)) - 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 1023));
      } else {
        out += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
      }
    }
    return out;
  }

  window.__SURGERY_CACHE = window.__SURGERY_CACHE || {};
  window.__decodeSurgeryPayload = function (b64) {
    var compressed = decodeBase64(b64);
    var rawBytes = inflateRaw(compressed);
    return JSON.parse(utf8ToString(rawBytes));
  };

  // 3. On-Demand Dynamic <script> Loader for Single-Chapter Rendering
  var inflight = {};

  window.SurgeryLoader = {
    getIndex: function () {
      var raw = window.SURGERY_INDEX || window.ACTIVE_REGISTRY || [];
      return Array.isArray(raw) ? raw : [];
    },

    findEntry: function (chapterId) {
      var list = this.getIndex();
      if (list.length === 0) return null;
      if (chapterId) {
        for (var i = 0; i < list.length; i++) {
          if (list[i] && list[i].id === chapterId) {
            return { entry: list[i], idx: i };
          }
        }
      }
      return { entry: list[0], idx: 0 };
    },

    resolveChapterFromHash: function (hash) {
      if (!hash) return null;
      var clean = hash.replace(/^#/, '');
      if (!clean) return null;
      var list = this.getIndex();
      for (var i = 0; i < list.length; i++) {
        var ch = list[i];
        if (!ch) continue;
        if (ch.id === clean) return ch.id;
        if (Array.isArray(ch.sections)) {
          for (var j = 0; j < ch.sections.length; j++) {
            if (ch.sections[j] && ch.sections[j].id === clean) {
              return ch.id;
            }
          }
        }
      }
      return null;
    },

    loadChapter: function (chapterId, callback) {
      var resolved = this.findEntry(chapterId);
      if (!resolved) {
        callback(new Error('No chapters found in surgery index.'), null);
        return;
      }

      var targetId = resolved.entry.id;
      if (window.__SURGERY_CACHE && window.__SURGERY_CACHE[targetId]) {
        callback(null, window.__SURGERY_CACHE[targetId]);
        return;
      }

      if (inflight[targetId]) {
        inflight[targetId].push(callback);
        return;
      }

      inflight[targetId] = [callback];
      var src = resolved.entry.dataFile || ('./data/surgery/chapter-' + resolved.idx + '.js');
      if (src.indexOf('?') === -1) {
        src += '?v=20261114';
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () {
        var cbs = inflight[targetId] || [];
        delete inflight[targetId];
        var chData = (window.__SURGERY_CACHE && window.__SURGERY_CACHE[targetId]) || null;
        for (var k = 0; k < cbs.length; k++) {
          try {
            cbs[k](chData ? null : new Error('Chapter payload missing after load: ' + targetId), chData);
          } catch (cbErr) {
            console.error('Chapter load callback error:', cbErr);
          }
        }
      };
      script.onerror = function () {
        var cbs = inflight[targetId] || [];
        delete inflight[targetId];
        var err = new Error('Failed to load chapter script: ' + src);
        for (var k = 0; k < cbs.length; k++) {
          try {
            cbs[k](err, null);
          } catch (cbErr) {}
        }
      };
      document.body.appendChild(script);
    }
  };
})();
