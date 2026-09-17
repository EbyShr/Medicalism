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
