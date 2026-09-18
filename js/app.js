/**
 * MEDICAL STUDY WEBAPP - APPLICATION BOOTSTRAP
 * Coordinates component rendering, navigation, search, study features, and routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('chapterContentArea');
  const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
  
  if (chapters.length === 0) {
    console.error('No chapters found in ACTIVE_REGISTRY or CHAPTERS_REGISTRY.');
    return;
  }

  // Helper to mount a chapter
  function mountChapter(chapterId) {
    const chapter = chapters.find(c => c.id === chapterId) || chapters[0];
    if (window.ComponentRenderer && contentContainer) {
      window.ComponentRenderer.renderChapter(chapter, contentContainer);
      if (window.AppNavigation) {
        window.AppNavigation.initScrollspy();
      }
    }
  }

  // Subscribe to reactive active chapter changes
  if (window.appState) {
    window.appState.subscribe('activeChapterId', (newId) => {
      mountChapter(newId);
    });
  }

  // Initial chapter mount
  let initialChapterId = window.appState ? window.appState.activeChapterId : chapters[0].id;
  if (!chapters.some(c => c.id === initialChapterId)) {
    initialChapterId = chapters[0].id;
    if (window.appState) {
      window.appState.activeChapterId = initialChapterId;
    }
  }
  mountChapter(initialChapterId);

  // 2. Initialize Navigation (Desktop right sidebar & RTL mobile drawer)
  if (window.AppNavigation) {
    window.AppNavigation.init();
  }

  // 3. Initialize Study Features (Continuous Zoom, Font switcher, Bookmarks, Focus Mode)
  if (window.StudyFeatures) {
    window.StudyFeatures.init();
  }

  // 4. Initialize Search Engine
  if (window.AppSearch) {
    window.AppSearch.init();
  }

  // 5. Initialize Router
  if (window.AppRouter) {
    window.AppRouter.init();
  }
});
