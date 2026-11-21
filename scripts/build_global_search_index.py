#!/usr/bin/env python3
"""
MEDICALISM V2 — GLOBAL SEARCH INDEX BUILDER
Extracts lightweight search records from all courses (Communicable/NCD, Radiology,
Surgery, and V2 courses like OB/GYN) into js/data/global-search-index.js (< 40 KB)
so index.html no longer has to load 894 KB of full course registries at startup.
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_PATH = ROOT / "js" / "data" / "global-search-index.js"

NODE_EXTRACTOR = r"""
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.argv[1];
const items = [];

function runInSandbox(files, extraGlobals = {}) {
  const win = Object.assign({
    location: { hash: '', pathname: '' },
    localStorage: { getItem: () => null, setItem: () => {} },
    matchMedia: () => ({ matches: false }),
    TextDecoder: global.TextDecoder,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
  }, extraGlobals);
  win.window = win;
  const ctx = vm.createContext({
    window: win,
    self: win,
    globalThis: win,
    TextDecoder: global.TextDecoder,
    Uint8Array,
    Int32Array,
    atob: win.atob,
    console,
  });
  for (const rel of files) {
    const fp = path.join(root, rel);
    if (fs.existsSync(fp)) {
      vm.runInContext(fs.readFileSync(fp, 'utf8'), ctx);
    }
  }
  return win;
}

function summarizeSections(sections, maxChars = 110) {
  if (!Array.isArray(sections)) return '';
  const text = sections
    .map(s => [s.title || '', s.latinTitle || '', s.summary || ''].join(' '))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

// 1. Communicable & NCD
try {
  const w1 = runInSandbox(['js/data/chapters-registry.js']);
  const comm = Array.isArray(w1.CHAPTERS_REGISTRY)
    ? w1.CHAPTERS_REGISTRY
    : (w1.CHAPTERS_REGISTRY && w1.CHAPTERS_REGISTRY.chapters) || [];
  for (const ch of comm) {
    if (!ch || !ch.id) continue;
    const isComm = Number(ch.number) <= 16;
    items.push({
      id: ch.id,
      number: ch.number || '',
      title: ch.title || '',
      shortTitle: ch.shortTitle || '',
      author: ch.author || '',
      targetUrl: `./communicable-and-noncommunicable-diseases.html#${ch.id}`,
      trackLabel: isComm ? 'واگیر' : 'غیرواگیر',
      trackPillClass: isComm ? 'pill-comm' : 'pill-ncd',
      keywords: summarizeSections(ch.sections)
    });
  }
} catch (e) {
  console.error('Warn comm:', e.message);
}

// 2. Radiology
try {
  const w2 = runInSandbox(['js/data/radiology-registry.js']);
  const rad = Array.isArray(w2.RADIOLOGY_REGISTRY)
    ? w2.RADIOLOGY_REGISTRY
    : (w2.RADIOLOGY_REGISTRY && w2.RADIOLOGY_REGISTRY.chapters) || [];
  for (const ch of rad) {
    if (!ch || !ch.id) continue;
    items.push({
      id: ch.id,
      number: ch.number || '',
      title: ch.title || '',
      shortTitle: ch.shortTitle || '',
      author: ch.author || '',
      targetUrl: `./radiology.html#${ch.id}`,
      trackLabel: 'رادیولوژی',
      trackPillClass: 'pill-rad',
      keywords: summarizeSections(ch.sections)
    });
  }
} catch (e) {
  console.error('Warn rad:', e.message);
}

// 3. Surgery
try {
  const w3 = runInSandbox(['js/surgery-loader.js', 'js/surgery-index.js']);
  const surg = Array.isArray(w3.SURGERY_INDEX) ? w3.SURGERY_INDEX : [];
  for (const ch of surg) {
    if (!ch || !ch.id) continue;
    items.push({
      id: ch.id,
      number: ch.number || '',
      title: ch.title || '',
      shortTitle: ch.shortTitle || '',
      author: ch.author || '',
      targetUrl: `./surgery.html#${ch.id}`,
      trackLabel: 'جراحی جنرال',
      trackPillClass: 'pill-surg',
      keywords: summarizeSections(ch.sections)
    });
  }
} catch (e) {
  console.error('Warn surg:', e.message);
}

// 4. V2 Native Courses (e.g., OB/GYN, Pediatrics...)
const V2_TRACK_META = {
  obgyn: { page: './obgyn.html', label: 'زنان و زایمان', pillClass: 'pill-obgyn' },
  pediatrics: { page: './pediatrics.html', label: 'اطفال', pillClass: 'pill-peds' },
  internal: { page: './internal.html', label: 'داخلی', pillClass: 'pill-int' }
};

const dataDir = path.join(root, 'data');
if (fs.existsSync(dataDir)) {
  for (const dirName of fs.readdirSync(dataDir)) {
    const idxFile = path.join(dataDir, dirName, 'index.js');
    if (fs.existsSync(idxFile)) {
      try {
        const wv2 = runInSandbox([`data/${dirName}/index.js`]);
        const v2Map = wv2.MEDICALISM_V2_INDEX || {};
        const list = Array.isArray(v2Map[dirName]) ? v2Map[dirName] : [];
        const meta = V2_TRACK_META[dirName] || {
          page: `./${dirName}.html`,
          label: dirName,
          pillClass: `pill-${dirName}`
        };
        for (const ch of list) {
          if (!ch || !ch.id) continue;
          items.push({
            id: ch.id,
            number: ch.number || '',
            title: ch.title || '',
            shortTitle: ch.shortTitle || '',
            author: (ch.source && ch.source.textbook) || '',
            targetUrl: `${meta.page}#${ch.id}`,
            trackLabel: meta.label,
            trackPillClass: meta.pillClass,
            keywords: summarizeSections(ch.sections)
          });
        }
      } catch (e) {
        console.error(`Warn v2 (${dirName}):`, e.message);
      }
    }
  }
}

process.stdout.write(JSON.stringify(items));
"""


def build_index():
    proc = subprocess.run(
        ["node", "-e", NODE_EXTRACTOR, str(ROOT)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True,
    )
    items = json.loads(proc.stdout)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    js_out = (
        "/* Medicalism V2 Global Search Index (Auto-Generated — Lightweight Portal Search) */\n"
        f"window.GLOBAL_SEARCH_INDEX = {payload};\n"
    )
    OUT_PATH.write_text(js_out, encoding="utf-8")
    kb = OUT_PATH.stat().st_size / 1024.0
    print(f"[SearchIndex] Wrote {len(items)} chapters -> {OUT_PATH.relative_to(ROOT).as_posix()} ({kb:.2f} KB)")


if __name__ == "__main__":
    build_index()
