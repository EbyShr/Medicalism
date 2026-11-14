/**
 * MEDICAL STUDY WEBAPP - APPLICATION BOOTSTRAP
 * Coordinates component rendering, navigation, search, study features, and routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('chapterContentArea') || document.getElementById('main-content');
  const rawRegistry = window.SURGERY_INDEX || window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
  const chapters = Array.isArray(rawRegistry)
    ? rawRegistry
    : (rawRegistry && Array.isArray(rawRegistry.chapters) ? rawRegistry.chapters : []);
  
  if (chapters.length === 0) {
    console.error('No chapters found in SURGERY_INDEX, ACTIVE_REGISTRY, or CHAPTERS_REGISTRY.');
    return;
  }

  let mountSeq = 0;

  function finalizeChapterMount(chapter) {
    try {
      if (window.AppNavigation) {
        window.AppNavigation.initScrollspy();
      }
    } catch (navErr) {
      console.warn('Scrollspy initialization warning:', navErr);
    }

    // Re-apply saved highlights and cram state AFTER chapter HTML is injected
    try {
      if (window.StudyFeatures && typeof window.StudyFeatures.reapplyChapterHighlights === 'function') {
        window.StudyFeatures.reapplyChapterHighlights(chapter.id);
      }
    } catch (hlErr) {
      console.warn('Highlight restoration warning:', hlErr);
    }

    try {
      if (window.StudyFeatures && typeof window.StudyFeatures.isExamCramModeActive === 'function' && window.StudyFeatures.isExamCramModeActive()) {
        window.StudyFeatures.applyExamCramMode(true, false);
      }
    } catch (cramErr) {
      console.warn('Exam cram mode sync warning:', cramErr);
    }

    try {
      window.dispatchEvent(new CustomEvent('chapterRendered', { detail: { chapterId: chapter.id } }));
    } catch (evtErr) {}
  }

  // Helper to mount a chapter (supports on-demand single-chapter loading when SurgeryLoader is present)
  function mountChapter(chapterId) {
    const seq = ++mountSeq;
    const fallbackEntry = chapters.find(c => c && c.id === chapterId) || chapters[0];
    if (!fallbackEntry || !contentContainer) return;

    if (window.SurgeryLoader && typeof window.SurgeryLoader.loadChapter === 'function') {
      window.SurgeryLoader.loadChapter(fallbackEntry.id, (err, fullChapter) => {
        if (seq !== mountSeq) return; // superseded by newer navigation
        if (err || !fullChapter) {
          console.error('Failed to load chapter:', fallbackEntry.id, err);
          return;
        }
        if (window.ComponentRenderer) {
          window.ComponentRenderer.renderChapter(fullChapter, contentContainer);
          finalizeChapterMount(fullChapter);
        }
      });
      return;
    }

    if (window.ComponentRenderer) {
      window.ComponentRenderer.renderChapter(fallbackEntry, contentContainer);
      finalizeChapterMount(fallbackEntry);
    }
  }

  // 1. Determine initial chapter ID (prefer URL hash target, else saved state, else chapters[0])
  let initialChapterId = window.appState ? window.appState.activeChapterId : chapters[0].id;
  if (window.SurgeryLoader && typeof window.SurgeryLoader.resolveChapterFromHash === 'function' && window.location.hash) {
    const hashChapterId = window.SurgeryLoader.resolveChapterFromHash(window.location.hash);
    if (hashChapterId) {
      initialChapterId = hashChapterId;
    }
  }
  if (!initialChapterId || !chapters.some(c => c && c.id === initialChapterId)) {
    initialChapterId = chapters[0].id;
  }
  if (window.appState) {
    window.appState.activeChapterId = initialChapterId;
  }

  // Subscribe to reactive active chapter changes
  if (window.appState) {
    window.appState.subscribe('activeChapterId', (newId) => {
      mountChapter(newId);
    });
  }

  // 2. Render sidebar TOC immediately (< 10ms) from lightweight index
  try {
    if (window.AppNavigation) {
      window.AppNavigation.init();
    }
  } catch (e) {
    console.warn('AppNavigation init warning:', e);
  }

  // 3. Load and render ONLY the active single chapter on startup
  mountChapter(initialChapterId);

  // 4. Initialize Study Features (Continuous Zoom, Font switcher, Bookmarks, Focus Mode, Highlights)
  try {
    if (window.StudyFeatures) {
      window.StudyFeatures.init();
    }
  } catch (e) {
    console.warn('StudyFeatures init warning:', e);
  }

  // 5. Initialize Search Engine (lazy on user input, zero startup indexing loop)
  try {
    if (window.AppSearch) {
      window.AppSearch.init();
    }
  } catch (e) {
    console.warn('AppSearch init warning:', e);
  }

  // 6. Initialize Router
  try {
    if (window.AppRouter) {
      window.AppRouter.init();
    }
  } catch (e) {
    console.warn('AppRouter init warning:', e);
  }
});
