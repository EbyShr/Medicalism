/**
 * MEDICAL STUDY WEBAPP - STATE MANAGEMENT
 * Centralized reactive store with local persistence for preferences and progress.
 */

class AppState {
  constructor() {
    this.subscribers = new Map();
    
    // Load persisted or default state safely without clearing existing user data
    let savedTheme = null;
    let savedFont = null;
    let savedScaleRaw = null;
    let savedBookmarksRaw = null;
    let savedChapterId = null;
    try {
      savedTheme = localStorage.getItem('med_theme');
      savedFont = localStorage.getItem('med_font_family');
      savedScaleRaw = localStorage.getItem('med_font_scale');
      savedBookmarksRaw = localStorage.getItem('med_bookmarks');
      savedChapterId = localStorage.getItem('med_active_chapter');
    } catch (e) {
      console.warn('localStorage read warning:', e);
    }

    this.theme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme :
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    this.fontFamily = savedFont || 'vazirmatn';
    
    // Continuous Font Zoom (Clamped between 0.80 and 1.40)
    const savedScale = parseFloat(savedScaleRaw);
    this.fontScale = (!isNaN(savedScale) && savedScale >= 0.8 && savedScale <= 1.4) ? savedScale : 1.0;
    
    // Chapter & Section Navigation (Safe fallback to chapters[0] without clearing storage)
    const rawReg = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const initialReg = Array.isArray(rawReg)
      ? rawReg
      : (rawReg && Array.isArray(rawReg.chapters) ? rawReg.chapters : []);
    const matchedChapter = savedChapterId ? initialReg.find(c => c && c.id === savedChapterId) : null;
    const defaultChapter = matchedChapter || initialReg[0] || null;
    this.activeChapterId = (defaultChapter && defaultChapter.id) ? defaultChapter.id : 'ch-27';
    this.activeSectionId = (defaultChapter && Array.isArray(defaultChapter.sections) && defaultChapter.sections[0])
      ? defaultChapter.sections[0].id
      : 'ch27-sec01';
    
    // Bookmarks Array (Strict array validation)
    try {
      const parsedBookmarks = savedBookmarksRaw ? JSON.parse(savedBookmarksRaw) : [];
      this.bookmarks = Array.isArray(parsedBookmarks) ? parsedBookmarks : [];
    } catch (e) {
      this.bookmarks = [];
    }

    // Focus Mode
    this.focusMode = false;
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => this.subscribers.get(key).delete(callback);
  }

  notify(key, value) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(cb => cb(value));
    }
  }

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this.theme = theme;
    try { localStorage.setItem('med_theme', theme); } catch (e) {}
    document.documentElement.setAttribute('data-theme', theme);
    this.notify('theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  setFontFamily(family) {
    this.fontFamily = family;
    try { localStorage.setItem('med_font_family', family); } catch (e) {}
    
    const root = document.documentElement;
    if (family === 'shabnam') {
      root.style.setProperty('--font-current', 'var(--font-shabnam)');
    } else if (family === 'sahel') {
      root.style.setProperty('--font-current', 'var(--font-sahel)');
    } else {
      root.style.setProperty('--font-current', 'var(--font-vazirmatn)');
    }
    this.notify('fontFamily', family);
  }

  setFontScale(scale) {
    // Clamp between 0.80 (80%) and 1.40 (140%)
    const clamped = Math.round(Math.min(Math.max(scale, 0.80), 1.40) * 100) / 100;
    this.fontScale = clamped;
    try { localStorage.setItem('med_font_scale', clamped.toString()); } catch (e) {}
    document.documentElement.style.setProperty('--font-scale', clamped.toString());
    this.notify('fontScale', clamped);
  }

  zoomIn() {
    this.setFontScale(this.fontScale + 0.05);
  }

  zoomOut() {
    this.setFontScale(this.fontScale - 0.05);
  }

  resetZoom() {
    this.setFontScale(1.0);
  }

  setActiveChapter(chapterId) {
    this.activeChapterId = chapterId;
    this.notify('activeChapterId', chapterId);
  }

  setActiveSection(sectionId) {
    this.activeSectionId = sectionId;
    this.notify('activeSectionId', sectionId);
  }

  toggleBookmark(sectionId) {
    if (!Array.isArray(this.bookmarks)) this.bookmarks = [];
    const idx = this.bookmarks.indexOf(sectionId);
    if (idx > -1) {
      this.bookmarks.splice(idx, 1);
    } else {
      this.bookmarks.push(sectionId);
    }
    try { localStorage.setItem('med_bookmarks', JSON.stringify(this.bookmarks)); } catch (e) {}
    this.notify('bookmarks', this.bookmarks);
    return idx === -1; // returns true if added, false if removed
  }

  isBookmarked(sectionId) {
    return Array.isArray(this.bookmarks) && this.bookmarks.indexOf(sectionId) !== -1;
  }

  setFocusMode(enabled) {
    this.focusMode = enabled;
    document.body.classList.toggle('focus-mode-active', enabled);
    this.notify('focusMode', enabled);
  }

  toggleFocusMode() {
    this.setFocusMode(!this.focusMode);
  }
}

window.appState = new AppState();
