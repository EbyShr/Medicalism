/**
 * MEDICAL STUDY WEBAPP - HASH ROUTER
 * Direct anchor navigation and link sharing compatible with static GitHub Pages hosting.
 */

window.AppRouter = {
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    // Initial route handling after DOM is ready
    setTimeout(() => this.handleRoute(), 100);
  },

  handleRoute() {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;

    // 1. Direct Exam Q&A Bank Route
    if (hash === 'exam-qa') {
      if (window.appState && window.appState.activeChapterId !== 'exam-qa') {
        window.appState.setActiveChapter('exam-qa');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Exam Q&A Question Direct Route (e.g. #qa-q-10)
    if (hash.startsWith('qa-')) {
      if (window.appState && window.appState.activeChapterId !== 'exam-qa') {
        window.appState.setActiveChapter('exam-qa');
      }
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 150);
      return;
    }

    const chapters = window.CHAPTERS_REGISTRY || [];

    // 3. Direct Chapter Route (e.g. #ch-01, #ch-02)
    const chapterMatch = chapters.find(c => c.id === hash);
    if (chapterMatch) {
      if (window.appState && window.appState.activeChapterId !== chapterMatch.id) {
        window.appState.setActiveChapter(chapterMatch.id);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Section Route (e.g. #ch01-sec02, #ch02-sec03)
    if (window.AppNavigation) {
      window.AppNavigation.scrollToSection(hash);
    }
  }
};
