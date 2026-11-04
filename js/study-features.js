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
    this.initChapterCompletion();
    this.initTextHighlighter();
    this.initExamCramMode();
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
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        document.body.scrollHeight - window.innerHeight,
        0
      );
      if (docHeight <= 0) {
        bar.style.width = '0%';
        return;
      }
      const progress = Math.min(Math.max((scrollPos / docHeight) * 100, 0), 100);
      bar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    this._updateReadingProgress = onScroll;
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
      const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];

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
  },

  /**
   * Chapter Completion Tracking & Study Progress
   */
  STORAGE_KEY_COMPLETED: 'med_completed_chapters',

  toPersianDigits(num) {
    if (num === null || num === undefined) return '';
    const id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/[0-9]/g, function (w) {
      return id[+w];
    });
  },

  getCompletedChapters() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_COMPLETED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading completed chapters:', e);
      return [];
    }
  },

  isChapterCompleted(chapterId) {
    if (!chapterId) return false;
    const completed = this.getCompletedChapters();
    return completed.includes(chapterId);
  },

  toggleChapterCompletion(chapterId) {
    if (!chapterId) return false;
    let completed = this.getCompletedChapters();
    const index = completed.indexOf(chapterId);
    let isNowCompleted = false;

    if (index >= 0) {
      completed.splice(index, 1);
      isNowCompleted = false;
    } else {
      completed.push(chapterId);
      isNowCompleted = true;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY_COMPLETED, JSON.stringify(completed));
    } catch (e) {
      console.warn('Error saving completed chapters:', e);
    }

    // 1. Update button state in active chapter view
    document.querySelectorAll(`.btn-toggle-chapter-completed[data-chapter-id="${chapterId}"]`).forEach(btn => {
      btn.classList.toggle('is-completed', isNowCompleted);
      const box = btn.querySelector('.completion-checkbox-box');
      if (box) box.textContent = isNowCompleted ? '✓' : '';
      const text = btn.querySelector('.completion-text');
      if (text) {
        text.textContent = isNowCompleted
          ? 'مطالعه‌شده (ثبت‌شده در کارنامه)'
          : 'نشان کردن این فصل به عنوان مطالعه‌شده';
      }
    });

    // 2. Update indicator badge in sidebar & mobile drawer nav trees
    document.querySelectorAll(`[data-nav-chapter="${chapterId}"]`).forEach(item => {
      item.classList.toggle('is-chapter-completed', isNowCompleted);
      const badge = item.querySelector('.nav-chapter-completed-badge');
      if (badge) {
        badge.style.display = isNowCompleted ? 'inline-flex' : 'none';
      }
    });

    // 3. Update Study Progress Widget
    this.updateStudyProgressWidget();

    // 4. Notify user with toast
    if (typeof window.showToast === 'function') {
      window.showToast(
        isNowCompleted
          ? 'فصل به عنوان مطالعه‌شده در کارنامه ثبت شد ✓'
          : 'علامت مطالعه این فصل برداشته شد'
      );
    }

    return isNowCompleted;
  },

  updateStudyProgressWidget() {
    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const validChapters = chapters.filter(c => !c.isExam);
    const totalCount = validChapters.length > 0 ? validChapters.length : 30;

    const completed = this.getCompletedChapters();
    const completedSet = new Set(completed);
    const currentCompletedCount = validChapters.filter(c => completedSet.has(c.id)).length;

    const percentage = totalCount > 0 ? Math.round((currentCompletedCount / totalCount) * 100) : 0;

    const statsText = `${this.toPersianDigits(currentCompletedCount)} از ${this.toPersianDigits(totalCount)} فصل (${this.toPersianDigits(percentage)}٪)`;

    // Update desktop widget
    const statsEl = document.getElementById('studyProgressStats');
    const fillEl = document.getElementById('studyProgressFill');
    if (statsEl) statsEl.textContent = statsText;
    if (fillEl) fillEl.style.width = `${percentage}%`;

    // Update mobile widget
    const mobStatsEl = document.getElementById('mobileStudyProgressStats');
    const mobFillEl = document.getElementById('mobileStudyProgressFill');
    if (mobStatsEl) mobStatsEl.textContent = statsText;
    if (mobFillEl) mobFillEl.style.width = `${percentage}%`;
  },

  initChapterCompletion() {
    this.updateStudyProgressWidget();

    // Also update widget and reading progress bar when chapter changes
    if (window.appState) {
      window.appState.subscribe('activeChapterId', () => {
        this.updateStudyProgressWidget();
        setTimeout(() => {
          if (typeof this._updateReadingProgress === 'function') {
            this._updateReadingProgress();
          }
        }, 120);
      });
    }
  },

  /* ==========================================================================
     FEATURE 1: OFFLINE PERSISTENT TEXT HIGHLIGHTER (هایلایت متون آفلاین)
     ========================================================================== */
  STORAGE_KEY_HIGHLIGHTS: 'medicalism_highlights_v1',
  _activeRange: null,
  _activeMark: null,

  getHighlights() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_HIGHLIGHTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Error reading highlights:', e);
      return [];
    }
  },

  saveHighlights(highlights) {
    try {
      localStorage.setItem(this.STORAGE_KEY_HIGHLIGHTS, JSON.stringify(highlights));
    } catch (e) {
      console.warn('Error saving highlights:', e);
    }
    this.updateHighlightsBadge();
  },

  updateHighlightsBadge() {
    const count = this.getHighlights().length;
    const badges = document.querySelectorAll('#highlightsCountBadge, #mobileHighlightsCountBadge');
    badges.forEach(badge => {
      badge.textContent = this.toPersianDigits(count);
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    const modalPill = document.getElementById('highlightsModalCountPill');
    if (modalPill) {
      modalPill.textContent = `${this.toPersianDigits(count)} مورد`;
    }
  },

  ensureHighlightPopover() {
    let popover = document.getElementById('highlightPopover');
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'highlightPopover';
      popover.className = 'highlight-popover';
      popover.setAttribute('role', 'toolbar');
      popover.setAttribute('aria-label', 'ابزار هایلایت متنی');
      popover.innerHTML = `
        <div class="popover-swatches">
          <button type="button" class="swatch-btn color-yellow" data-color="yellow" title="هایلایت زرد (#fef08a)" aria-label="رنگ زرد"></button>
          <button type="button" class="swatch-btn color-green" data-color="green" title="هایلایت سبز (#bbf7d0)" aria-label="رنگ سبز"></button>
          <button type="button" class="swatch-btn color-pink" data-color="pink" title="هایلایت صورتی (#fbcfe8)" aria-label="رنگ صورتی"></button>
          <button type="button" class="swatch-btn color-blue" data-color="blue" title="هایلایت آبی (#bae6fd)" aria-label="رنگ آبی"></button>
        </div>
        <div class="popover-divider" id="popoverDivider" style="display: none;"></div>
        <button type="button" class="btn-delete-hl" id="popoverDeleteBtn" title="حذف هایلایت (🗑️)" aria-label="حذف هایلایت" style="display: none;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>حذف هایلایت (🗑️)</span>
        </button>
      `;
      document.body.appendChild(popover);

      // Prevent mousedown inside popover from deselecting text selection!
      popover.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      // Swatches selection
      popover.querySelectorAll('.swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const color = btn.getAttribute('data-color');
          this.applyHighlightColor(color);
        });
      });

      // Delete button
      const delBtn = popover.querySelector('#popoverDeleteBtn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.deleteActiveHighlight();
        });
      }
    }
    return popover;
  },

  showPopoverForSelection(range) {
    const popover = this.ensureHighlightPopover();
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this._activeRange = range;
    this._activeMark = null;

    const delBtn = document.getElementById('popoverDeleteBtn');
    const divider = document.getElementById('popoverDivider');
    if (delBtn) delBtn.style.display = 'none';
    if (divider) divider.style.display = 'none';

    popover.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('is-active'));
    this.positionPopover(popover, rect);
  },

  showPopoverForMark(mark) {
    const popover = this.ensureHighlightPopover();
    const rect = mark.getBoundingClientRect();

    this._activeMark = mark;
    this._activeRange = null;

    const delBtn = document.getElementById('popoverDeleteBtn');
    const divider = document.getElementById('popoverDivider');
    if (delBtn) delBtn.style.display = 'inline-flex';
    if (divider) divider.style.display = 'block';

    const currentColor = mark.getAttribute('data-color') || 'yellow';
    popover.querySelectorAll('.swatch-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-color') === currentColor);
    });

    this.positionPopover(popover, rect);
  },

  positionPopover(popover, rect) {
    popover.style.display = 'flex';
    const popoverWidth = popover.offsetWidth || 190;
    const popoverHeight = popover.offsetHeight || 38;

    let x = rect.left + (rect.width / 2);
    const padding = 12;
    x = Math.max(popoverWidth / 2 + padding, Math.min(window.innerWidth - popoverWidth / 2 - padding, x));

    let y = rect.top - 8;
    let isBelow = false;
    if (y < popoverHeight + 10) {
      y = rect.bottom + 8;
      isBelow = true;
    }

    popover.style.left = `${x}px`;
    popover.style.top = `${y}px`;
    popover.classList.toggle('popover-below', isBelow);
  },

  hideHighlightPopover() {
    const popover = document.getElementById('highlightPopover');
    if (popover) {
      popover.style.display = 'none';
    }
    this._activeRange = null;
    this._activeMark = null;
  },

  applyHighlightColor(color) {
    // 1. Changing color of an existing highlight
    if (this._activeMark) {
      const id = this._activeMark.getAttribute('data-id');
      this._activeMark.setAttribute('data-color', color);
      const highlights = this.getHighlights();
      const item = highlights.find(h => h.id === id);
      if (item) {
        item.color = color;
        this.saveHighlights(highlights);
      }
      this.hideHighlightPopover();
      if (typeof window.showToast === 'function') {
        window.showToast('رنگ هایلایت تغییر یافت');
      }
      return;
    }

    // 2. Creating a new highlight from selection
    const selection = window.getSelection();
    let range = this._activeRange;
    if (!range && selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    if (!range) {
      this.hideHighlightPopover();
      return;
    }

    const text = range.toString().trim();
    if (!text) {
      this.hideHighlightPopover();
      return;
    }

    const highlightId = 'hl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const chapterId = window.appState ? window.appState.activeChapterId : 'ch-27';

    // Find section and context
    const container = range.commonAncestorContainer;
    const element = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
    const secEl = element ? (element.closest('.study-section') || element.closest('.chapter-section')) : null;
    const secId = secEl ? secEl.id : '';
    const secTitle = secEl ? (secEl.querySelector('h2, h3')?.textContent?.trim() || '') : '';

    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const chObj = chapters.find(c => c.id === chapterId);
    const chapterTitle = chObj ? (chObj.title || `فصل ${chObj.number}`) : chapterId;

    const block = element ? (element.closest('p, li, h1, h2, h3, h4, div.study-section') || element) : document.body;
    const fullText = block.textContent || '';
    const textIdx = fullText.indexOf(text);
    const prefix = textIdx > 0 ? fullText.substring(Math.max(0, textIdx - 40), textIdx) : '';
    const suffix = textIdx >= 0 ? fullText.substring(textIdx + text.length, textIdx + text.length + 40) : '';

    const mark = document.createElement('mark');
    mark.className = 'user-highlight';
    mark.setAttribute('data-color', color);
    mark.setAttribute('data-id', highlightId);
    mark.setAttribute('title', 'برای ویرایش یا حذف کلیک کنید');

    let wrapped = false;
    try {
      range.surroundContents(mark);
      wrapped = true;
    } catch (e) {
      try {
        const contents = range.extractContents();
        mark.appendChild(contents);
        range.insertNode(mark);
        wrapped = true;
      } catch (err) {
        console.warn('Could not wrap range in mark:', err);
      }
    }

    if (wrapped) {
      this.attachMarkEvents(mark);

      const highlights = this.getHighlights();
      highlights.push({
        id: highlightId,
        chapterId,
        sectionId: secId,
        sectionTitle: secTitle,
        chapterTitle,
        color,
        text,
        prefix,
        suffix,
        createdAt: Date.now()
      });
      this.saveHighlights(highlights);

      if (this.isExamCramModeActive() && block) {
        block.classList.add('cram-keep-visible');
      }

      if (typeof window.showToast === 'function') {
        window.showToast('متن با موفقیت هایلایت شد ✓');
      }
    }

    this.hideHighlightPopover();
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  },

  deleteActiveHighlight() {
    if (!this._activeMark) {
      this.hideHighlightPopover();
      return;
    }

    const id = this._activeMark.getAttribute('data-id');
    const parent = this._activeMark.parentNode;
    if (parent) {
      while (this._activeMark.firstChild) {
        parent.insertBefore(this._activeMark.firstChild, this._activeMark);
      }
      parent.removeChild(this._activeMark);
      parent.normalize();
    }

    const highlights = this.getHighlights().filter(h => h.id !== id);
    this.saveHighlights(highlights);

    this.hideHighlightPopover();
    if (typeof window.showToast === 'function') {
      window.showToast('هایلایت حذف شد');
    }
  },

  deleteHighlightById(id) {
    // If mark currently in active DOM, unwrap it
    const mark = document.querySelector(`mark.user-highlight[data-id="${id}"]`);
    if (mark && mark.parentNode) {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    }

    const highlights = this.getHighlights().filter(h => h.id !== id);
    this.saveHighlights(highlights);
    this.renderHighlightsModalList();

    if (typeof window.showToast === 'function') {
      window.showToast('هایلایت حذف شد');
    }
  },

  attachMarkEvents(mark) {
    if (!mark) return;
    mark.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.showPopoverForMark(mark);
    });
  },

  findTextRange(root, text, prefix, suffix) {
    if (!root || !text) return null;

    const blocks = Array.from(root.querySelectorAll('p, li, h1, h2, h3, h4, .callout-content, td, div.study-section'));
    if (blocks.length === 0) blocks.push(root);

    let bestBlock = null;
    let bestOffset = -1;
    let bestScore = -1;

    for (const block of blocks) {
      const content = block.textContent || '';
      let idx = content.indexOf(text);
      while (idx !== -1) {
        let score = 0;
        if (prefix) {
          const blockPrefix = content.substring(Math.max(0, idx - prefix.length), idx);
          if (prefix.endsWith(blockPrefix) || blockPrefix.endsWith(prefix.slice(-15))) score += 2;
        }
        if (suffix) {
          const blockSuffix = content.substring(idx + text.length, idx + text.length + suffix.length);
          if (suffix.startsWith(blockSuffix) || blockSuffix.startsWith(suffix.slice(0, 15))) score += 2;
        }
        if (score > bestScore) {
          bestScore = score;
          bestBlock = block;
          bestOffset = idx;
        }
        idx = content.indexOf(text, idx + 1);
      }
    }

    if (!bestBlock || bestOffset === -1) return null;

    const walker = document.createTreeWalker(bestBlock, NodeFilter.SHOW_TEXT, null, false);
    let currentPos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;
    const targetStart = bestOffset;
    const targetEnd = bestOffset + text.length;

    let node = walker.nextNode();
    while (node) {
      if (node.parentElement && node.parentElement.closest('mark.user-highlight')) {
        node = walker.nextNode();
        continue;
      }
      const len = node.nodeValue.length;
      if (!startNode && currentPos + len > targetStart) {
        startNode = node;
        startOffset = targetStart - currentPos;
      }
      if (startNode && currentPos + len >= targetEnd) {
        endNode = node;
        endOffset = targetEnd - currentPos;
        break;
      }
      currentPos += len;
      node = walker.nextNode();
    }

    if (startNode && endNode) {
      const range = document.createRange();
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      return range;
    }

    return null;
  },

  reapplyChapterHighlights(chapterId) {
    if (!chapterId) return;
    const highlights = this.getHighlights().filter(h => h.chapterId === chapterId);
    if (highlights.length === 0) return;

    const container = document.querySelector('#chapterContentArea, .chapter-content, #main-content');
    if (!container) return;

    highlights.forEach(h => {
      if (document.querySelector(`mark.user-highlight[data-id="${h.id}"]`)) return;

      const searchRoot = h.sectionId ? (document.getElementById(h.sectionId) || container) : container;
      const range = this.findTextRange(searchRoot, h.text, h.prefix, h.suffix);
      if (range) {
        try {
          const mark = document.createElement('mark');
          mark.className = 'user-highlight';
          mark.setAttribute('data-color', h.color);
          mark.setAttribute('data-id', h.id);
          mark.setAttribute('title', 'برای ویرایش یا حذف کلیک کنید');
          range.surroundContents(mark);
          this.attachMarkEvents(mark);
        } catch (e) {
          try {
            const mark = document.createElement('mark');
            mark.className = 'user-highlight';
            mark.setAttribute('data-color', h.color);
            mark.setAttribute('data-id', h.id);
            mark.setAttribute('title', 'برای ویرایش یا حذف کلیک کنید');
            const contents = range.extractContents();
            mark.appendChild(contents);
            range.insertNode(mark);
            this.attachMarkEvents(mark);
          } catch (err) {
            console.warn('Reapply highlight error:', h.id, err);
          }
        }
      }
    });

    if (this.isExamCramModeActive()) {
      this.scanExamCramElements(container);
    }
  },

  initTextHighlighter() {
    this.updateHighlightsBadge();

    // 1. Listen for mouseup / touchend inside chapter content
    const onSelectionCheck = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          return;
        }

        const text = selection.toString().trim();
        if (text.length < 2) return;

        const range = selection.getRangeAt(0);
        const container = document.querySelector('#chapterContentArea, .chapter-content, #main-content');
        if (!container || !container.contains(range.commonAncestorContainer)) {
          return;
        }

        this.showPopoverForSelection(range);
      }, 30);
    };

    document.addEventListener('mouseup', (e) => {
      if (e.target.closest('#highlightPopover')) return;
      if (e.target.closest('mark.user-highlight')) return;
      onSelectionCheck();
    });

    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#highlightPopover')) return;
      if (e.target.closest('mark.user-highlight')) return;
      onSelectionCheck();
    });

    // 2. Hide popover when clicking elsewhere
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('highlightPopover');
      if (!popover || popover.style.display === 'none') return;
      if (popover.contains(e.target)) return;
      if (e.target.closest('mark.user-highlight')) return;

      this.hideHighlightPopover();
    });

    // 3. Re-apply highlights on initial load
    const activeChId = window.appState ? window.appState.activeChapterId : 'ch-27';
    setTimeout(() => {
      this.reapplyChapterHighlights(activeChId);
    }, 150);

    // 4. Re-apply highlights on chapter changes
    if (window.appState) {
      window.appState.subscribe('activeChapterId', (newChId) => {
        setTimeout(() => {
          this.reapplyChapterHighlights(newChId);
        }, 120);
      });
    }

    // 5. Initialize Highlights Modal Drawer
    this.initHighlightsModal();
  },

  initHighlightsModal() {
    const triggerBtns = document.querySelectorAll('#highlightsToggleBtn, #mobileHighlightsBtn');
    const backdrop = document.getElementById('highlightsModalBackdrop');
    const closeBtn = document.getElementById('highlightsCloseBtn');
    const clearAllBtn = document.getElementById('clearAllHighlightsBtn');
    const printBtn = document.getElementById('printHighlightsBtn');

    triggerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.openHighlightsModal();
      });
    });

    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.closeHighlightsModal();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeHighlightsModal();
      });
    }

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.clearAllHighlights();
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printHighlightsSummary();
      });
    }
  },

  openHighlightsModal() {
    const backdrop = document.getElementById('highlightsModalBackdrop');
    if (!backdrop) return;
    this.renderHighlightsModalList();
    backdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  },

  closeHighlightsModal() {
    const backdrop = document.getElementById('highlightsModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  },

  renderHighlightsModalList() {
    const container = document.getElementById('highlightsList');
    if (!container) return;

    const highlights = this.getHighlights();
    if (highlights.length === 0) {
      container.innerHTML = `
        <div class="search-empty" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 32px; margin-bottom: 12px;">🖍️</div>
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 6px;">هنوز متنی هایلایت نشده است</div>
          <div style="color: var(--text-muted); font-size: 13px; max-width: 360px; margin: 0 auto; line-height: 1.6;">
            هنگام مطالعه، هر جمله یا عبارتی را در متن انتخاب کنید تا نوار ابزار هایلایت باز شود و آن را با رنگ‌های مختلف ذخیره کنید.
          </div>
        </div>
      `;
      return;
    }

    const groups = {};
    highlights.forEach(h => {
      if (!groups[h.chapterId]) groups[h.chapterId] = [];
      groups[h.chapterId].push(h);
    });

    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const colorNames = {
      yellow: 'زرد',
      green: 'سبز',
      pink: 'صورتی',
      blue: 'آبی'
    };
    const colorHexes = {
      yellow: '#fef08a',
      green: '#bbf7d0',
      pink: '#fbcfe8',
      blue: '#bae6fd'
    };

    let html = '';
    for (const chId in groups) {
      const items = groups[chId];
      const chObj = chapters.find(c => c.id === chId);
      const chTitle = chObj ? chObj.title : (items[0].chapterTitle || chId);
      const chNum = chObj ? `فصل ${this.toPersianDigits(chObj.number)}` : chId;

      html += `
        <div class="highlights-chapter-group">
          <div class="highlights-chapter-header">
            <span class="highlights-ch-badge">${chNum}</span>
            <span class="highlights-ch-title">${this.escapeHtml(chTitle)}</span>
            <span class="highlights-ch-count">${this.toPersianDigits(items.length)} هایلایت</span>
          </div>
          <div class="highlights-items-container">
      `;

      items.forEach(item => {
        const cHex = colorHexes[item.color] || '#fef08a';
        const cName = colorNames[item.color] || 'زرد';
        html += `
          <div class="highlight-item-card" data-highlight-id="${item.id}" data-chapter-id="${item.chapterId}">
            <div class="highlight-item-color-bar" style="background-color: ${cHex};"></div>
            <div class="highlight-item-body btn-jump-to-highlight" data-highlight-id="${item.id}" data-chapter-id="${item.chapterId}" data-section-id="${item.sectionId || ''}">
              <div class="highlight-item-meta">
                <span class="highlight-color-tag color-${item.color}">${cName}</span>
                ${item.sectionTitle ? `<span class="highlight-section-badge">${this.escapeHtml(item.sectionTitle)}</span>` : ''}
              </div>
              <blockquote class="highlight-text-quote" style="border-right-color: ${cHex};">
                «${this.escapeHtml(item.text)}»
              </blockquote>
            </div>
            <div class="highlight-item-actions">
              <button type="button" class="action-mini-btn btn-delete-single-hl" data-highlight-id="${item.id}" title="حذف هایلایت" aria-label="حذف هایلایت">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach click to jump
    container.querySelectorAll('.btn-jump-to-highlight').forEach(el => {
      el.addEventListener('click', () => {
        const hlId = el.getAttribute('data-highlight-id');
        const chId = el.getAttribute('data-chapter-id');
        const secId = el.getAttribute('data-section-id');
        this.jumpToHighlight(hlId, chId, secId);
      });
    });

    // Attach delete single
    container.querySelectorAll('.btn-delete-single-hl').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hlId = btn.getAttribute('data-highlight-id');
        this.deleteHighlightById(hlId);
      });
    });
  },

  jumpToHighlight(hlId, chapterId, sectionId) {
    this.closeHighlightsModal();

    const doScroll = () => {
      const mark = document.querySelector(`mark.user-highlight[data-id="${hlId}"]`);
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mark.classList.add('highlight-jump-pulse');
        setTimeout(() => mark.classList.remove('highlight-jump-pulse'), 2500);
      } else if (sectionId && window.AppNavigation) {
        window.AppNavigation.scrollToSection(sectionId);
      }
    };

    if (window.appState && window.appState.activeChapterId !== chapterId) {
      window.appState.setActiveChapter(chapterId);
      setTimeout(doScroll, 200);
    } else {
      doScroll();
    }
  },

  clearAllHighlights() {
    if (!confirm('آیا از پاک کردن تمامی هایلایت‌های ذخیره‌شده در این دوره اطمینان دارید؟')) return;

    localStorage.removeItem(this.STORAGE_KEY_HIGHLIGHTS);

    document.querySelectorAll('mark.user-highlight').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        parent.normalize();
      }
    });

    this.updateHighlightsBadge();
    this.renderHighlightsModalList();
    if (typeof window.showToast === 'function') {
      window.showToast('تمامی هایلایت‌ها با موفقیت پاک شدند');
    }
  },

  printHighlightsSummary() {
    const highlights = this.getHighlights();
    if (highlights.length === 0) {
      alert('هایلایتی برای چاپ وجود ندارد.');
      return;
    }

    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const groups = {};
    highlights.forEach(h => {
      if (!groups[h.chapterId]) groups[h.chapterId] = [];
      groups[h.chapterId].push(h);
    });

    let contentHtml = `
      <div style="direction: rtl; font-family: Tahoma, Vazirmatn, sans-serif; padding: 24px; color: #1e293b;">
        <header style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; color: #0284c7; margin: 0 0 6px 0;">مدیکالیسم البرز — چکیده و خلاصه هایلایت‌های درسی</h1>
          <p style="font-size: 12px; color: #64748b; margin: 0;">مجموع ${this.toPersianDigits(highlights.length)} مورد هایلایت کلیدی استخراج‌شده برای مرور سریع و شب امتحان</p>
        </header>
    `;

    for (const chId in groups) {
      const chObj = chapters.find(c => c.id === chId);
      const chTitle = chObj ? `فصل ${this.toPersianDigits(chObj.number)}: ${chObj.title}` : chId;
      contentHtml += `
        <div style="margin-bottom: 22px; page-break-inside: avoid;">
          <h2 style="font-size: 15px; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; margin: 0 0 10px 0; border-right: 4px solid #0284c7;">
            ${this.escapeHtml(chTitle)}
          </h2>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
      `;
      groups[chId].forEach(item => {
        contentHtml += `
          <li style="margin-bottom: 10px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            ${item.sectionTitle ? `<div style="font-size: 11px; font-weight: bold; color: #0284c7; margin-bottom: 4px;">${this.escapeHtml(item.sectionTitle)}</div>` : ''}
            <div style="font-size: 13px; line-height: 1.6;">«${this.escapeHtml(item.text)}»</div>
          </li>
        `;
      });
      contentHtml += `</ul></div>`;
    }

    contentHtml += `</div>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>خلاصه هایلایت‌ها | مدیکالیسم</title>
          <style>
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${contentHtml}
          <script>
            window.onload = function() { window.print(); };
          <\/script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  },

  /* ==========================================================================
     FEATURE 2: "⚡ حالت شب امتحان" (NIGHT-BEFORE-EXAM HIGH-YIELD MODE)
     ========================================================================== */
  STORAGE_KEY_CRAM: 'medicalism_exam_cram_mode',

  isExamCramModeActive() {
    return localStorage.getItem(this.STORAGE_KEY_CRAM) === 'true';
  },

  initExamCramMode() {
    const toggleBtns = document.querySelectorAll('#examCramToggleBtn, #mobileExamCramToggleBtn');
    const isInitiallyActive = this.isExamCramModeActive();

    this.applyExamCramMode(isInitiallyActive, false);

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextState = !this.isExamCramModeActive();
        this.applyExamCramMode(nextState, true);
      });
    });

    if (window.appState) {
      window.appState.subscribe('activeChapterId', () => {
        if (this.isExamCramModeActive()) {
          setTimeout(() => {
            this.applyExamCramMode(true, false);
          }, 120);
        }
      });
    }
  },

  applyExamCramMode(active, notify = true) {
    localStorage.setItem(this.STORAGE_KEY_CRAM, active ? 'true' : 'false');

    const containers = [
      document.getElementById('chapterContentArea'),
      document.querySelector('.chapter-content'),
      document.querySelector('.app-shell'),
      document.body
    ].filter(Boolean);

    containers.forEach(c => {
      c.classList.toggle('exam-cram-mode', active);
    });

    document.querySelectorAll('#examCramToggleBtn, #mobileExamCramToggleBtn').forEach(btn => {
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    const contentArea = document.getElementById('chapterContentArea') || document.querySelector('.chapter-content');
    let banner = document.getElementById('examCramBanner');

    if (active) {
      if (!banner && contentArea) {
        banner = document.createElement('div');
        banner.id = 'examCramBanner';
        banner.className = 'exam-cram-banner';
        banner.innerHTML = `
          <div class="cram-banner-content">
            <span class="cram-banner-badge">⚡ حالت شب امتحان</span>
            <span>در حال نمایش فشرده نکات کلیدی، تله‌های امتحانی، جداول مقایسه‌ای و هایلایت‌های شما.</span>
          </div>
          <button type="button" class="btn-exit-cram" id="btnExitCram">مطالعه کامل (خروج)</button>
        `;
        contentArea.insertBefore(banner, contentArea.firstChild);

        const exitBtn = banner.querySelector('#btnExitCram');
        if (exitBtn) {
          exitBtn.addEventListener('click', () => {
            this.applyExamCramMode(false, true);
          });
        }
      }
      if (banner) banner.style.display = 'flex';

      this.scanExamCramElements(contentArea);
    } else {
      if (banner) banner.style.display = 'none';
    }

    if (notify && typeof window.showToast === 'function') {
      window.showToast(
        active
          ? '⚡ حالت شب امتحان فعال شد (مرور سریع نکات و هایلایت‌ها)'
          : 'حالت مطالعه کامل فعال شد (نمایش تمام متون)'
      );
    }
  },

  scanExamCramElements(container) {
    if (!container) return;

    const highYieldTags = [
      '[🎯 نکته تئوری]',
      '[⚠️ تله امتحانی]',
      '⚡ مرور شب امتحان',
      'نکته تئوری',
      'تله امتحانی',
      'مرور شب امتحان'
    ];

    container.querySelectorAll('p, li').forEach(el => {
      const text = el.textContent || '';
      const hasKeyword = highYieldTags.some(t => text.includes(t)) ||
                         !!el.querySelector('.badge-theory') ||
                         !!el.querySelector('.badge-trap');
      const hasHighlight = !!el.querySelector('mark.user-highlight');

      if (hasKeyword || hasHighlight) {
        el.classList.add('cram-keep-visible');
      } else {
        el.classList.remove('cram-keep-visible');
      }
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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



/**
 * Global handler for Chapter Mind-Map toggle button (with debounce against double-trigger)
 */
window.toggleMindmapSection = function(btn) {
  if (!btn) return;
  if (btn._lastToggleTime && (Date.now() - btn._lastToggleTime < 250)) {
    return;
  }
  btn._lastToggleTime = Date.now();
  const card = btn.closest('.chapter-mindmap-card') || btn.closest('.chapter-mindmap-container') || document;
  const content = card.querySelector('#mindmapContent, .mindmap-content');
  if (!content) return;
  const isCollapsed = content.classList.toggle('is-collapsed');
  btn.setAttribute('aria-expanded', !isCollapsed);
  btn.classList.toggle('is-collapsed', isCollapsed);
  const label = btn.querySelector('.mindmap-btn-text');
  if (label) {
    label.textContent = isCollapsed ? 'مشاهده نقشه' : 'جمع‌بندی نقشه';
  }
};
