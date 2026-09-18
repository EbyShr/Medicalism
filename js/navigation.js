/**
 * MEDICAL STUDY WEBAPP - NAVIGATION & SCROLLSPY
 * Desktop right-side sidebar, RTL mobile navigation drawer, and intersection observer scrollspy.
 */

window.AppNavigation = {
  desktopTreeContainer: null,
  mobileTreeContainer: null,
  mobileDrawer: null,
  drawerBackdrop: null,
  observer: null,
  expandedFolders: {
    comm: true,
    ncd: true,
    rad: true
  },

  init() {
    this.desktopTreeContainer = document.getElementById('desktopNavTree');
    this.mobileTreeContainer = document.getElementById('mobileNavTree');
    this.mobileDrawer = document.getElementById('mobileDrawer');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');

    this.renderNavigation();
    this.bindDrawerEvents();
    this.initScrollspy();

    // Reactive updates without full DOM re-rendering (prevents scroll jumps)
    if (window.appState) {
      window.appState.subscribe('activeChapterId', (newId) => this.onChapterChanged(newId));
      window.appState.subscribe('activeSectionId', (secId) => this.updateActiveLink(secId));
      window.appState.subscribe('bookmarks', () => this.updateBookmarks());
    }
  },

  /**
   * Updates active and expanded classes on chapter elements without resetting scroll position
   */
  onChapterChanged(newChapterId) {
    const containers = [this.desktopTreeContainer, this.mobileTreeContainer].filter(Boolean);

    containers.forEach(container => {
      // 1. Remove active & expanded from previously active chapter
      container.querySelectorAll('.nav-chapter-item.is-active').forEach(item => {
        item.classList.remove('is-active', 'is-expanded');
      });

      // 2. Add active & expanded to the newly active chapter
      const targetItem = container.querySelector(`.nav-chapter-item[data-nav-chapter="${newChapterId}"]`);
      if (targetItem) {
        targetItem.classList.add('is-active', 'is-expanded');

        // 3. Ensure parent folder is open
        const parentFolder = targetItem.closest('.nav-folder-item');
        if (parentFolder) {
          parentFolder.classList.add('is-expanded');
          const fHeader = parentFolder.querySelector('.nav-folder-header');
          if (fHeader) fHeader.setAttribute('aria-expanded', 'true');
          const fKey = parentFolder.getAttribute('data-folder-key');
          if (fKey) this.expandedFolders[fKey] = true;
        }

        // 4. Scroll smoothly into view in desktop sidebar container without resetting scroll
        if (container === this.desktopTreeContainer) {
          targetItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    });
  },

  /**
   * Updates bookmark icons in the navigation tree
   */
  updateBookmarks() {
    if (!window.appState) return;
    document.querySelectorAll('.nav-heading-link').forEach(link => {
      const secId = link.getAttribute('data-target-id');
      const isBookmarked = window.appState.isBookmarked(secId);
      const existingBadge = link.querySelector('.nav-bookmark-indicator');
      if (isBookmarked && !existingBadge) {
        const span = document.createElement('span');
        span.className = 'nav-bookmark-indicator';
        span.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--state-warning)" stroke="var(--state-warning)">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
        link.appendChild(span);
      } else if (!isBookmarked && existingBadge) {
        existingBadge.remove();
      }
    });
  },

  /**
   * Renders the persistent chapter tree organized into folder categories
   */
  renderNavigation() {
    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const activeChapterId = window.appState ? window.appState.activeChapterId : (chapters[0] ? chapters[0].id : 'ch-01');
    const activeSectionId = window.appState ? window.appState.activeSectionId : '';

    const isRadiology = chapters.some(ch => ch.id.startsWith('rad-') || ch.courseId === 'radiology');

    const commChapters = isRadiology ? [] : chapters.filter(ch => ch.number <= 15);
    const ncdChapters = isRadiology ? [] : chapters.filter(ch => ch.number > 15 && ch.number <= 29);
    const radChapters = isRadiology ? chapters : [];

    // Ensure the folder containing active chapter is open
    const activeCh = chapters.find(ch => ch.id === activeChapterId);
    if (activeCh) {
      if (isRadiology) {
        this.expandedFolders.rad = true;
      } else if (activeCh.number <= 15) {
        this.expandedFolders.comm = true;
      } else {
        this.expandedFolders.ncd = true;
      }
    }

    const renderChapterItem = (ch) => {
      const isCurrentChapter = ch.id === activeChapterId;
      const isExpanded = isCurrentChapter; // Current chapter starts expanded

      const headingsHtml = ch.sections.map(sec => {
        const isActive = sec.id === activeSectionId;
        const isBookmarked = window.appState ? window.appState.isBookmarked(sec.id) : false;

        const imageCount = (window.RadiologyModule && ch.id) ? window.RadiologyModule.getSectionImages(ch.id, sec.id).length : 0;

        return `
          <li class="nav-heading-item">
            <a href="#${sec.id}" class="nav-heading-link ${isActive ? 'is-active' : ''}" data-target-id="${sec.id}">
              <span class="nav-heading-text">${sec.title}</span>
              ${imageCount > 0 ? `
                <span class="nav-has-images-badge" title="${imageCount} کلیشه تصویربرداری">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>${imageCount}</span>
                </span>
              ` : ''}
              ${isBookmarked ? `
                <span class="nav-bookmark-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--state-warning)" stroke="var(--state-warning)">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
              ` : ''}
            </a>
          </li>
        `;
      }).join('');

      const numPadded = ch.number.toString().padStart(2, '۰');

      return `
        <li class="nav-chapter-item ${isCurrentChapter ? 'is-active' : ''} ${isExpanded ? 'is-expanded' : ''}" data-nav-chapter="${ch.id}">
          <div class="nav-chapter-header" data-chapter-id="${ch.id}">
            <div class="nav-chapter-title-group">
              <span class="nav-chapter-badge">فصل ${numPadded}</span>
              <span class="nav-chapter-label" title="${ch.title}">${ch.shortTitle || ch.title}</span>
            </div>
            <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <ul class="nav-headings-list">
            ${headingsHtml}
          </ul>
        </li>
      `;
    };

    const commHtml = commChapters.map(renderChapterItem).join('');
    const ncdHtml = ncdChapters.map(renderChapterItem).join('');
    const radHtml = radChapters.map(renderChapterItem).join('');

    let fullTreeHtml = '';
    if (isRadiology) {
      fullTreeHtml = `
        <!-- Folder: Radiology Course -->
        <li class="nav-folder-item ${this.expandedFolders.rad ? 'is-expanded' : ''}" data-folder-key="rad">
          <div class="nav-folder-header" data-folder-key="rad" role="button" aria-expanded="${this.expandedFolders.rad ? 'true' : 'false'}" tabindex="0">
            <div class="nav-folder-title-group">
              <div class="nav-folder-icon folder-icon-rad" style="background: rgba(14, 165, 233, 0.12); color: #0ea5e9;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <span class="nav-folder-title">رادیولوژی و تصویربرداری بالینی</span>
            </div>
            <div class="nav-folder-meta">
              <span class="nav-folder-badge badge-rad" style="background: rgba(14, 165, 233, 0.12); color: #0ea5e9;">${radChapters.length} فصل</span>
              <svg class="nav-folder-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
          <ul class="nav-folder-content">
            ${radHtml}
          </ul>
        </li>
      `;
    } else {
      fullTreeHtml = `
        <!-- Folder 1: Communicable Diseases (واگیر) -->
        <li class="nav-folder-item ${this.expandedFolders.comm ? 'is-expanded' : ''}" data-folder-key="comm">
          <div class="nav-folder-header" data-folder-key="comm" role="button" aria-expanded="${this.expandedFolders.comm ? 'true' : 'false'}" tabindex="0">
            <div class="nav-folder-title-group">
              <div class="nav-folder-icon folder-icon-comm">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span class="nav-folder-title">بیماری‌های واگیر</span>
            </div>
            <div class="nav-folder-meta">
              <span class="nav-folder-badge badge-comm">۱۵ فصل</span>
              <svg class="nav-folder-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
          <ul class="nav-folder-content">
            ${commHtml}
          </ul>
        </li>

        <!-- Folder 2: Non-Communicable Diseases (غیرواگیر) -->
        <li class="nav-folder-item ${this.expandedFolders.ncd ? 'is-expanded' : ''}" data-folder-key="ncd">
          <div class="nav-folder-header" data-folder-key="ncd" role="button" aria-expanded="${this.expandedFolders.ncd ? 'true' : 'false'}" tabindex="0">
            <div class="nav-folder-title-group">
              <div class="nav-folder-icon folder-icon-ncd">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span class="nav-folder-title">بیماری‌های غیرواگیر</span>
            </div>
            <div class="nav-folder-meta">
              <span class="nav-folder-badge badge-ncd">۱۴ فصل</span>
              <svg class="nav-folder-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
          <ul class="nav-folder-content">
            ${ncdHtml}
          </ul>
        </li>
      `;
    }

    if (this.desktopTreeContainer) {
      this.desktopTreeContainer.innerHTML = fullTreeHtml;
      this.bindTreeClicks(this.desktopTreeContainer, false);
    }

    if (this.mobileTreeContainer) {
      this.mobileTreeContainer.innerHTML = fullTreeHtml;
      this.bindTreeClicks(this.mobileTreeContainer, true);
    }
  },

  /**
   * Bind accordion toggling and anchor scrolling
   */
  bindTreeClicks(container, isMobile) {
    // 1. Folder Header Toggle
    container.querySelectorAll('.nav-folder-header').forEach(fHeader => {
      const toggleHandler = (e) => {
        e.stopPropagation();
        const folderKey = fHeader.getAttribute('data-folder-key');
        const folderItem = fHeader.closest('.nav-folder-item');
        if (folderItem && folderKey) {
          const isExp = folderItem.classList.toggle('is-expanded');
          this.expandedFolders[folderKey] = isExp;
          fHeader.setAttribute('aria-expanded', isExp ? 'true' : 'false');
        }
      };

      fHeader.addEventListener('click', toggleHandler);
      fHeader.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleHandler(e);
        }
      });
    });

    // 2. Chapter Header Toggle & Switch
    container.querySelectorAll('.nav-chapter-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const chapterId = header.getAttribute('data-chapter-id');
        const item = header.closest('.nav-chapter-item');
        if (window.appState && chapterId && window.appState.activeChapterId !== chapterId) {
          window.appState.setActiveChapter(chapterId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          history.pushState(null, null, `#${chapterId}`);
          if (isMobile) {
            this.closeMobileDrawer();
          }
        } else if (item) {
          item.classList.toggle('is-expanded');
        }
      });
    });

    // 3. Heading Anchor Click
    container.querySelectorAll('.nav-heading-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target-id');
        if (targetId) {
          this.scrollToSection(targetId);
          if (isMobile) {
            this.closeMobileDrawer();
          }
        }
      });
    });
  },

  /**
   * Smoothly scrolls to the targeted section element, switching chapters if necessary
   */
  scrollToSection(sectionId) {
    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const targetChapter = chapters.find(ch => ch.sections.some(s => s.id === sectionId));

    if (targetChapter && window.appState && window.appState.activeChapterId !== targetChapter.id) {
      window.appState.setActiveChapter(targetChapter.id);
    }

    const performScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const headerOffset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Update URL hash without jumping
        history.pushState(null, null, `#${sectionId}`);
        if (window.appState) {
          window.appState.setActiveSection(sectionId);
        }
      }
    };

    requestAnimationFrame(() => {
      performScroll();
    });
  },

  /**
   * Updates active state class on all navigation links
   */
  updateActiveLink(sectionId) {
    document.querySelectorAll('.nav-heading-link').forEach(link => {
      const target = link.getAttribute('data-target-id');
      link.classList.toggle('is-active', target === sectionId);
    });
  },

  /**
   * Mobile Drawer Logic (Slide from right, backdrop, touch lock)
   */
  bindDrawerEvents() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const closeBtn = document.getElementById('drawerCloseBtn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.openMobileDrawer());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeMobileDrawer());
    }

    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', () => this.closeMobileDrawer());
    }

    // Keyboard ESC to close drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileDrawer && this.mobileDrawer.classList.contains('is-open')) {
        this.closeMobileDrawer();
      }
    });
  },

  openMobileDrawer() {
    if (this.mobileDrawer && this.drawerBackdrop) {
      this.mobileDrawer.classList.add('is-open');
      this.drawerBackdrop.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      // Ensure aria attributes
      this.mobileDrawer.setAttribute('aria-hidden', 'false');
    }
  },

  closeMobileDrawer() {
    if (this.mobileDrawer && this.drawerBackdrop) {
      this.mobileDrawer.classList.remove('is-open');
      this.drawerBackdrop.classList.remove('is-active');
      document.body.style.overflow = '';
      this.mobileDrawer.setAttribute('aria-hidden', 'true');
    }
  },

  /**
   * IntersectionObserver Scrollspy
   */
  initScrollspy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -65% 0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && window.appState) {
            window.appState.setActiveSection(id);
          }
        }
      });
    }, observerOptions);

    // Observe all study sections
    document.querySelectorAll('.study-section').forEach(sec => {
      this.observer.observe(sec);
    });
  }
};
