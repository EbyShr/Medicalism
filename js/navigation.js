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

  init() {
    this.desktopTreeContainer = document.getElementById('desktopNavTree');
    this.mobileTreeContainer = document.getElementById('mobileNavTree');
    this.mobileDrawer = document.getElementById('mobileDrawer');
    this.drawerBackdrop = document.getElementById('drawerBackdrop');

    this.renderNavigation();
    this.bindDrawerEvents();
    this.initScrollspy();

    // Re-render when active chapter or bookmarks change
    if (window.appState) {
      window.appState.subscribe('activeChapterId', () => this.renderNavigation());
      window.appState.subscribe('activeSectionId', (secId) => this.updateActiveLink(secId));
      window.appState.subscribe('bookmarks', () => this.renderNavigation());
    }
  },

  /**
   * Renders the persistent chapter tree into both desktop and mobile containers
   */
  renderNavigation() {
    const chapters = window.CHAPTERS_REGISTRY || [];
    const activeChapterId = window.appState ? window.appState.activeChapterId : 'ch-01';
    const activeSectionId = window.appState ? window.appState.activeSectionId : '';

    const html = chapters.map(ch => {
      const isCurrentChapter = ch.id === activeChapterId;
      const isExpanded = isCurrentChapter; // Current chapter starts expanded

      const headingsHtml = ch.sections.map(sec => {
        const isActive = sec.id === activeSectionId;
        const isBookmarked = window.appState ? window.appState.isBookmarked(sec.id) : false;

        return `
          <li class="nav-heading-item">
            <a href="#${sec.id}" class="nav-heading-link ${isActive ? 'is-active' : ''}" data-target-id="${sec.id}">
              <span class="nav-heading-text">${sec.title}</span>
              ${isBookmarked ? `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--state-warning)" stroke="var(--state-warning)">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              ` : ''}
            </a>
          </li>
        `;
      }).join('');

      return `
        <li class="nav-chapter-item ${isCurrentChapter ? 'is-active' : ''} ${isExpanded ? 'is-expanded' : ''}" data-nav-chapter="${ch.id}">
          <div class="nav-chapter-header" data-chapter-id="${ch.id}">
            <div class="nav-chapter-title-group">
              <span class="nav-chapter-badge">فصل ${ch.number}</span>
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
    }).join('');

    if (this.desktopTreeContainer) {
      this.desktopTreeContainer.innerHTML = html;
      this.bindTreeClicks(this.desktopTreeContainer, false);
    }

    if (this.mobileTreeContainer) {
      this.mobileTreeContainer.innerHTML = html;
      this.bindTreeClicks(this.mobileTreeContainer, true);
    }
  },

  /**
   * Bind accordion toggling and anchor scrolling
   */
  bindTreeClicks(container, isMobile) {
    // Chapter Header Toggle & Switch
    container.querySelectorAll('.nav-chapter-header').forEach(header => {
      header.addEventListener('click', () => {
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

    // Heading Anchor Click
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
    const chapters = window.CHAPTERS_REGISTRY || [];
    const targetChapter = chapters.find(ch => ch.sections.some(s => s.id === sectionId));

    if (targetChapter && window.appState && window.appState.activeChapterId !== targetChapter.id) {
      window.appState.setActiveChapter(targetChapter.id);
    }

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
