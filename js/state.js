/**
 * MEDICAL STUDY WEBAPP - STATE MANAGEMENT
 * Centralized reactive store with local persistence for preferences and progress.
 */

class AppState {
  constructor() {
    this.subscribers = new Map();
    
    // Load persisted or default state
    this.theme = localStorage.getItem('med_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    this.fontFamily = localStorage.getItem('med_font_family') || 'vazirmatn';
    
    // Continuous Font Zoom (Clamped between 0.80 and 1.40)
    const savedScale = parseFloat(localStorage.getItem('med_font_scale'));
    this.fontScale = (!isNaN(savedScale) && savedScale >= 0.8 && savedScale <= 1.4) ? savedScale : 1.0;
    
    // Chapter & Section Navigation
    this.activeChapterId = 'ch-27';
    this.activeSectionId = 'ch27-sec01';
    
    // Bookmarks Array
    try {
      this.bookmarks = JSON.parse(localStorage.getItem('med_bookmarks')) || [];
    } catch {
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
    localStorage.setItem('med_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.notify('theme', theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'light' ? 'dark' : 'light');
  }

  setFontFamily(family) {
    this.fontFamily = family;
    localStorage.setItem('med_font_family', family);
    
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
    localStorage.setItem('med_font_scale', clamped.toString());
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
    const idx = this.bookmarks.indexOf(sectionId);
    if (idx > -1) {
      this.bookmarks.splice(idx, 1);
    } else {
      this.bookmarks.push(sectionId);
    }
    localStorage.setItem('med_bookmarks', JSON.stringify(this.bookmarks));
    this.notify('bookmarks', this.bookmarks);
    return idx === -1; // returns true if added, false if removed
  }

  isBookmarked(sectionId) {
    return this.bookmarks.includes(sectionId);
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
