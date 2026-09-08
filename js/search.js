/**
 * MEDICAL STUDY WEBAPP - CLIENT-SIDE SEARCH ENGINE
 * Full-text search with Persian character normalization, snippet generation, and keyboard shortcuts.
 */

window.AppSearch = {
  backdrop: null,
  dialog: null,
  input: null,
  resultsContainer: null,
  isOpen: false,

  init() {
    this.backdrop = document.getElementById('searchModalBackdrop');
    this.dialog = document.getElementById('searchDialog');
    this.input = document.getElementById('searchInput');
    this.resultsContainer = document.getElementById('searchResultsList');

    this.bindEvents();
  },

  /**
   * Persian text normalization (unifies Arabic/Persian chars and strips diacritics)
   */
  normalize(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[\u064B-\u065F\u0670]/g, '') // strip diacritics
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u200C\u200B]/g, ' ') // half-space & zero-width to regular space
      .replace(/\s+/g, ' ')
      .trim();
  },

  bindEvents() {
    // Keyboard shortcuts (Ctrl+K, Cmd+K, or slash when not in an input)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.open();
      } else if (e.key === '/' && !['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
        e.preventDefault();
        this.open();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Trigger buttons
    document.querySelectorAll('.btn-search-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    // Backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // Input typing listener with debouncing
    if (this.input) {
      let debounceTimer;
      this.input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.performSearch(this.input.value);
        }, 120);
      });
    }
  },

  open() {
    if (!this.backdrop) return;
    this.isOpen = true;
    this.backdrop.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    if (this.input) {
      this.input.value = '';
      setTimeout(() => this.input.focus(), 100);
      this.performSearch('');
    }
  },

  close() {
    if (!this.backdrop) return;
    this.isOpen = false;
    this.backdrop.classList.remove('is-active');
    document.body.style.overflow = '';
  },

  extractAllText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj + ' ';
    if (typeof obj === 'number') return obj.toString() + ' ';
    if (Array.isArray(obj)) return obj.map(item => this.extractAllText(item)).join(' ');
    if (typeof obj === 'object') {
      return Object.values(obj).map(val => this.extractAllText(val)).join(' ');
    }
    return '';
  },

  /**
   * Searches across all registered chapters and sections
   */
  performSearch(query) {
    if (!this.resultsContainer) return;

    const normQuery = this.normalize(query);
    if (!normQuery) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty">
          یک کلیدواژه بالینی، دارو، شاخص یا بیماری را جستجو کنید...
          <div style="font-size: 11px; margin-block-start: 8px; color: var(--text-subtle);">
            مثال: CD4، دوره پنجره، آبشار درمان، متادون، RDS، الایزا، توبرکولین، DOTS
          </div>
        </div>
      `;
      return;
    }

    const terms = normQuery.split(' ').filter(t => t.length > 0);
    const results = [];
    const chapters = window.CHAPTERS_REGISTRY || [];

    chapters.forEach(ch => {
      ch.sections.forEach(sec => {
        // Collect text content for searching
        const titleNorm = this.normalize(sec.title);
        const latinNorm = this.normalize(sec.latinTitle || '');
        const summaryNorm = this.normalize(sec.summary || '');
        
        // Extract text from DOM if mounted, or fallback to section registry data
        let rawBody = '';
        const secEl = document.getElementById(sec.id);
        if (secEl) {
          rawBody = secEl.innerText || '';
        } else {
          rawBody = this.extractAllText(sec);
        }
        const bodyNorm = this.normalize(rawBody + ' ' + (sec.summary || ''));

        // Match scoring
        let matchesAll = true;
        let score = 0;

        for (const term of terms) {
          if (titleNorm.includes(term)) {
            score += 10;
          } else if (latinNorm.includes(term)) {
            score += 8;
          } else if (summaryNorm.includes(term)) {
            score += 5;
          } else if (bodyNorm.includes(term)) {
            score += 2;
          } else {
            matchesAll = false;
            break;
          }
        }

        if (matchesAll) {
          results.push({
            chapterId: ch.id,
            chapterNumber: ch.number,
            sectionId: sec.id,
            title: sec.title,
            latinTitle: sec.latinTitle,
            rawBody: rawBody || sec.summary || '',
            score
          });
        }
      });
    });

    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty">
          هیچ نتیجه‌ای برای «${query}» یافت نشد.
        </div>
      `;
      return;
    }

    const html = results.map(r => {
      const snippet = this.createSnippet(r.rawBody, terms);
      return `
        <div class="search-result-item" data-target-id="${r.sectionId}">
          <div class="search-result-meta">
            <span class="search-result-chapter-badge">فصل ${r.chapterNumber}</span>
            <span class="search-result-title">${r.title}</span>
          </div>
          <div class="search-result-snippet">${snippet}</div>
        </div>
      `;
    }).join('');

    this.resultsContainer.innerHTML = html;

    // Attach click listeners to results
    this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target-id');
        if (targetId && window.AppNavigation) {
          this.close();
          window.AppNavigation.scrollToSection(targetId);
        }
      });
    });
  },

  /**
   * Generates a snippet around the matched terms with <mark> tags
   */
  createSnippet(text, terms) {
    if (!text) return '';
    const cleanText = text.replace(/\s+/g, ' ');
    const normText = this.normalize(cleanText);

    let firstMatchIndex = -1;
    for (const t of terms) {
      const idx = normText.indexOf(t);
      if (idx !== -1 && (firstMatchIndex === -1 || idx < firstMatchIndex)) {
        firstMatchIndex = idx;
      }
    }

    if (firstMatchIndex === -1) {
      return cleanText.substring(0, 110) + '...';
    }

    const start = Math.max(0, firstMatchIndex - 40);
    const end = Math.min(cleanText.length, firstMatchIndex + 90);
    let snippet = cleanText.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < cleanText.length) snippet = snippet + '...';

    // Highlight matched words
    terms.forEach(term => {
      try {
        const reg = new RegExp(`(${term})`, 'gi');
        snippet = snippet.replace(reg, '<mark>$1</mark>');
      } catch {}
    });

    return snippet;
  }
};
