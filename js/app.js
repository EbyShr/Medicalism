/**
 * MEDICAL STUDY WEBAPP - APPLICATION BOOTSTRAP
 * Coordinates component rendering, navigation, search, study features, and routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('chapterContentArea') || document.getElementById('main-content');
  const rawRegistry = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
  const chapters = Array.isArray(rawRegistry)
    ? rawRegistry
    : (rawRegistry && Array.isArray(rawRegistry.chapters) ? rawRegistry.chapters : []);
  
  if (chapters.length === 0) {
    console.error('No chapters found in ACTIVE_REGISTRY or CHAPTERS_REGISTRY.');
    return;
  }

  // Helper to mount a chapter (always falls back safely to chapters[0] in memory)
  function mountChapter(chapterId) {
    const chapter = chapters.find(c => c && c.id === chapterId) || chapters[0];
    if (window.ComponentRenderer && contentContainer && chapter) {
      window.ComponentRenderer.renderChapter(chapter, contentContainer);
      try {
        if (window.AppNavigation) {
          window.AppNavigation.initScrollspy();
        }
      } catch (navErr) {
        console.warn('Scrollspy initialization warning:', navErr);
      }
    }
  }

  // Subscribe to reactive active chapter changes
  if (window.appState) {
    window.appState.subscribe('activeChapterId', (newId) => {
      mountChapter(newId);
    });
  }

  // Initial chapter mount with safe default fallback (without clearing localStorage)
  let initialChapterId = window.appState ? window.appState.activeChapterId : chapters[0].id;
  if (!initialChapterId || !chapters.some(c => c && c.id === initialChapterId)) {
    initialChapterId = chapters[0].id;
    if (window.appState) {
      window.appState.activeChapterId = initialChapterId;
    }
  }
  mountChapter(initialChapterId);

  // 2. Initialize Navigation (Desktop right sidebar & RTL mobile drawer)
  try {
    if (window.AppNavigation) {
      window.AppNavigation.init();
    }
  } catch (e) {
    console.warn('AppNavigation init warning:', e);
  }

  // 3. Initialize Study Features (Continuous Zoom, Font switcher, Bookmarks, Focus Mode, Highlights)
  // Runs AFTER chapter HTML is injected into contentContainer
  try {
    if (window.StudyFeatures) {
      window.StudyFeatures.init();
    }
  } catch (e) {
    console.warn('StudyFeatures init warning:', e);
  }

  // 4. Initialize Search Engine
  try {
    if (window.AppSearch) {
      window.AppSearch.init();
    }
  } catch (e) {
    console.warn('AppSearch init warning:', e);
  }

  // 5. Initialize Router
  try {
    if (window.AppRouter) {
      window.AppRouter.init();
    }
  } catch (e) {
    console.warn('AppRouter init warning:', e);
  }
});
