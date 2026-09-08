/**
 * MEDICAL STUDY WEBAPP - STUDY FEATURES
 * Continuous font zoom, font family switcher, bookmarks drawer, reading progress, focus mode, and toasts.
 */

window.StudyFeatures = {
  init() {
    this.initFontControls();
    this.initReadingProgress();
    this.initBookmarksModal();
    this.initFocusMode();
    this.initThemeToggle();
  },

  /**
   * Continuous Font Zoom (A- / A+) and Font Family Selector
   */
  initFontControls() {
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomDisplay = document.getElementById('zoomDisplay');
    const fontSelect = document.getElementById('fontSelect');

    if (!window.appState) return;

    // Apply initial state
    const updateZoomUI = (scale) => {
      if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(scale * 100) + '%';
      }
    };

    updateZoomUI(window.appState.fontScale);
    window.appState.setFontScale(window.appState.fontScale); // apply to CSS

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        window.appState.zoomIn();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        window.appState.zoomOut();
      });
    }

    if (zoomDisplay) {
      zoomDisplay.addEventListener('click', () => {
        window.appState.resetZoom();
        window.showToast('اندازه قلم به مقدار پیش‌فرض ۱۰۰٪ بازنشانی شد');
      });
    }

    window.appState.subscribe('fontScale', (scale) => {
      updateZoomUI(scale);
    });

    // Font Family Select (Desktop & Mobile)
    const fontSelects = [document.getElementById('fontSelect'), document.getElementById('mobileFontSelect')].filter(Boolean);
    
    fontSelects.forEach(sel => {
      sel.value = window.appState.fontFamily;
      sel.addEventListener('change', (e) => {
        window.appState.setFontFamily(e.target.value);
        fontSelects.forEach(other => { if (other !== sel) other.value = e.target.value; });
        window.showToast(`قلم متن به «${sel.options[sel.selectedIndex].text}» تغییر یافت`);
      });
    });

    window.appState.subscribe('fontFamily', (fam) => {
      fontSelects.forEach(sel => { sel.value = fam; });
    });

    window.appState.setFontFamily(window.appState.fontFamily); // apply initial
  },

  /**
   * Global Theme Toggle
   */
  initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (!toggleBtn || !window.appState) return;

    const updateIcon = (theme) => {
      const sunIcon = toggleBtn.querySelector('.icon-sun');
      const moonIcon = toggleBtn.querySelector('.icon-moon');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
          toggleBtn.setAttribute('title', 'تغییر به حالت روشن');
        } else {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
          toggleBtn.setAttribute('title', 'تغییر به حالت تاریک');
        }
      }
    };

    updateIcon(window.appState.theme);
    window.appState.setTheme(window.appState.theme);

    toggleBtn.addEventListener('click', () => {
      window.appState.toggleTheme();
    });

    window.appState.subscribe('theme', (theme) => {
      updateIcon(theme);
    });
  },

  /**
   * Real-time Reading Progress Bar
   */
  initReadingProgress() {
    const bar = document.getElementById('readingProgressBar');
    if (!bar) return;

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        bar.style.width = '0%';
        return;
      }
      const scrollPos = window.scrollY;
      const progress = Math.min(Math.max((scrollPos / docHeight) * 100, 0), 100);
      bar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  /**
   * Bookmarks Manager & Modal Dialog
   */
  initBookmarksModal() {
    const openBtn = document.getElementById('bookmarksToggleBtn');
    const backdrop = document.getElementById('bookmarksModalBackdrop');
    const listContainer = document.getElementById('bookmarksList');
    const countBadge = document.getElementById('bookmarksCountBadge');

    if (!window.appState) return;

    const updateBadge = (bookmarks) => {
      if (countBadge) {
        countBadge.textContent = bookmarks.length;
        countBadge.style.display = bookmarks.length > 0 ? 'inline-flex' : 'none';
      }
    };

    updateBadge(window.appState.bookmarks);
    window.appState.subscribe('bookmarks', (bms) => updateBadge(bms));

    const renderBookmarksList = () => {
      if (!listContainer) return;
      const bms = window.appState.bookmarks;
      const chapters = window.CHAPTERS_REGISTRY || [];

      if (bms.length === 0) {
        listContainer.innerHTML = `
          <div class="search-empty">
            هیچ بخشی هنوز نشانک‌گذاری نشده است.<br>
            برای ذخیره بخش‌ها و مرور سریع، روی آیکون نشانک کنار عنوان هر بخش کلیک کنید.
          </div>
        `;
        return;
      }

      let html = '';
      bms.forEach(secId => {
        let foundSec = null;
        let foundCh = null;

        for (const ch of chapters) {
          const s = ch.sections.find(sec => sec.id === secId);
          if (s) {
            foundSec = s;
            foundCh = ch;
            break;
          }
        }

        if (foundSec && foundCh) {
          html += `
            <div class="search-result-item" style="display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
              <div style="flex: 1; cursor: pointer;" class="bookmark-jump-target" data-target-id="${foundSec.id}">
                <div class="search-result-meta">
                  <span class="search-result-chapter-badge">فصل ${foundCh.number}</span>
                  <span class="search-result-title">${foundSec.title}</span>
                </div>
                <div class="search-result-snippet">${foundSec.summary || ''}</div>
              </div>
              <button class="action-mini-btn btn-remove-bm" data-section-id="${foundSec.id}" title="حذف نشانک" style="margin-inline-start: var(--space-2);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          `;
        }
      });

      listContainer.innerHTML = html;

      // Click to jump
      listContainer.querySelectorAll('.bookmark-jump-target').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-target-id');
          if (id && window.AppNavigation) {
            if (backdrop) backdrop.classList.remove('is-active');
            document.body.style.overflow = '';
            window.AppNavigation.scrollToSection(id);
          }
        });
      });

      // Remove button
      listContainer.querySelectorAll('.btn-remove-bm').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-section-id');
          if (id) {
            window.appState.toggleBookmark(id);
            renderBookmarksList();
          }
        });
      });
    };

    if (openBtn && backdrop) {
      openBtn.addEventListener('click', () => {
        renderBookmarksList();
        backdrop.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      });

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('is-active');
          document.body.style.overflow = '';
        }
      });

      const closeBtn = document.getElementById('bookmarksCloseBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          backdrop.classList.remove('is-active');
          document.body.style.overflow = '';
        });
      }
    }
  },

  /**
   * Distraction-Free Focus Mode Toggle
   */
  initFocusMode() {
    const focusBtn = document.getElementById('focusModeToggleBtn');
    if (!focusBtn || !window.appState) return;

    focusBtn.addEventListener('click', () => {
      window.appState.toggleFocusMode();
    });

    window.appState.subscribe('focusMode', (enabled) => {
      focusBtn.classList.toggle('is-active', enabled);
      focusBtn.setAttribute('title', enabled ? 'خروج از حالت تمرکز' : 'ورود به حالت تمرکز مطالعه');
      window.showToast(enabled ? 'حالت تمرکز فعال شد (نوارهای جانبی پنهان شدند)' : 'حالت تمرکز غیرفعال شد');
    });
  }
};

/**
 * Global Toast System
 */
window.showToast = function(message, duration = 2800) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease-out';
    setTimeout(() => toast.remove(), 250);
  }, duration);
};
