/**
 * MEDICAL STUDY WEBAPP - APPLICATION BOOTSTRAP
 * Coordinates component rendering, navigation, search, study features, and routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const contentContainer = document.getElementById('chapterContentArea');
  const chapters = window.CHAPTERS_REGISTRY || [];
  
  if (chapters.length === 0) {
    console.error('No chapters found in CHAPTERS_REGISTRY.');
    return;
  }

  // Helper to mount a chapter or exam-qa
  function mountChapter(chapterId) {
    if (chapterId === 'exam-qa') {
      if (window.ComponentRenderer && contentContainer) {
        window.ComponentRenderer.renderExamQA(contentContainer);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const chapter = chapters.find(c => c.id === chapterId) || chapters[0];
    if (window.ComponentRenderer && contentContainer) {
      window.ComponentRenderer.renderChapter(chapter, contentContainer);
      if (window.AppNavigation) {
        window.AppNavigation.initScrollspy();
      }
    }
  }

  // Header QA Direct Button Click
  const headerQaBtn = document.getElementById('headerQaBtn');
  if (headerQaBtn) {
    headerQaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.appState) {
        window.appState.setActiveChapter('exam-qa');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, '#exam-qa');
      }
    });
  }

  // Subscribe to reactive active chapter changes
  if (window.appState) {
    window.appState.subscribe('activeChapterId', (newId) => {
      mountChapter(newId);
    });
  }

  // Initial chapter mount
  const initialChapterId = window.appState ? window.appState.activeChapterId : chapters[0].id;
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
