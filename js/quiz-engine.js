/**
 * MEDICAL STUDY WEBAPP - QUIZ & QUESTION BANK ENGINE (موتور هوشمند آزمون و بانک سوال)
 * 
 * Implements:
 * - Data Layer loader & registry integration
 * - Study Mode (پاسخ آنی و نمایش تحلیل) vs Exam Mode (شبیه‌ساز و کارنامه پایانی)
 * - Topic filter & selection
 * - Rationale & Distractors Correction breakdown
 * - LocalStorage persistence & retake
 * - Keyboard shortcuts & Question matrix navigation
 */

(function () {
  'use strict';

  class MedicalQuizEngine {
    constructor() {
      this.currentQuiz = null;
      this.currentCourseId = 'ncd';
      this.selectedCourseTopicId = 'ncd-all';
      this.selectedCourseMode = 'study';
      this.allQuestions = [];
      this.filteredQuestions = [];
      this.studyBatch = [];
      this.seenQuestionIdsInStudy = new Set();
      this.currentIndex = 0;
      this.mode = 'study'; // 'study' or 'exam'
      this.answers = {}; // { [questionId]: selectedKey }
      this.flags = new Set(); // Set of questionIds
      this.isSubmitted = false;
      this.activeTopic = 'all';
      this.timerSeconds = 0;
      this.timerInterval = null;

      // Professional Question Bank Features (UWorld / Amboss)
      this.strikes = {}; // { [qId]: Set of struck option keys }
      this.pacingSeconds = 0;
      this.pacingInterval = null;
      this.questionPacingMap = {}; // { [qId]: seconds spent }

      // DOM Elements
      this.dom = {};
    }

    /**
     * Initialize engine on DOM Ready
     */
    init() {
      this.cacheDom();
      this.bindGlobalEvents();
      this.handleUrlParams();
      if (!this.dom.activeView || this.dom.activeView.style.display !== 'block') {
        this.renderHub();
      }
    }

    cacheDom() {
      this.dom.hubView = document.getElementById('quizHubView');
      this.dom.courseView = document.getElementById('quizCourseView');
      this.dom.activeView = document.getElementById('quizActiveView');
      this.dom.scorecardView = document.getElementById('quizScorecardView');
      
      this.dom.quizzesGrid = document.getElementById('quizzesGrid');
      
      // Course View Elements
      this.dom.courseCategoryBadge = document.getElementById('courseCategoryBadge');
      this.dom.courseTotalBadge = document.getElementById('courseTotalBadge');
      this.dom.courseTitle = document.getElementById('courseTitle');
      this.dom.courseDesc = document.getElementById('courseDesc');
      this.dom.courseModeStudy = document.getElementById('courseModeStudy');
      this.dom.courseModeExam = document.getElementById('courseModeExam');
      this.dom.courseTopicDropdown = document.getElementById('courseTopicDropdown');
      this.dom.courseDropdownTrigger = document.getElementById('courseDropdownTrigger');
      this.dom.courseDropdownSelectedText = document.getElementById('courseDropdownSelectedText');
      this.dom.courseDropdownMenu = document.getElementById('courseDropdownMenu');
      this.dom.courseTopicSearchInput = document.getElementById('courseTopicSearchInput');
      this.dom.courseDropdownList = document.getElementById('courseDropdownList');
      this.dom.btnStartConfiguredQuiz = document.getElementById('btnStartConfiguredQuiz');
      this.dom.btnStartConfiguredText = document.getElementById('btnStartConfiguredText');
      this.dom.courseChaptersGrid = document.getElementById('courseChaptersGrid');

      // Active View Elements
      this.dom.activeQuizTitle = document.getElementById('activeQuizTitle');
      this.dom.questionCounter = document.getElementById('questionCounter');
      this.dom.questionTopicTag = document.getElementById('questionTopicTag');
      this.dom.progressBar = document.getElementById('quizProgressFill');
      this.dom.timerDisplay = document.getElementById('quizTimerDisplay');
      this.dom.timerWrapper = document.getElementById('quizTimerWrapper');
      this.dom.batchIndicatorBadge = document.getElementById('batchIndicatorBadge');
      this.dom.batchIndicatorText = document.getElementById('batchIndicatorText');
      this.dom.btnShuffleOrder = document.getElementById('btnShuffleOrder');
      
      this.dom.btnFlag = document.getElementById('btnFlagQuestion');
      this.dom.btnStudyMode = document.getElementById('btnModeStudy');
      this.dom.btnExamMode = document.getElementById('btnModeExam');
      
      this.dom.questionCard = document.getElementById('quizQuestionCard');
      this.dom.questionStem = document.getElementById('questionStem');
      this.dom.optionsList = document.getElementById('optionsList');
      this.dom.explanationCard = document.getElementById('explanationCard');
      this.dom.explanationCardsContainer = document.getElementById('explanationCardsContainer');
      this.dom.legacyRationaleContainer = document.getElementById('legacyRationaleContainer');
      this.dom.distractorsContainer = document.getElementById('legacyDistractorsContainer') || document.querySelector('.distractors-container');
      this.dom.rationaleBox = document.getElementById('rationaleText');
      this.dom.distractorsList = document.getElementById('distractorsList');
      
      this.dom.btnPrev = document.getElementById('btnPrevQuestion');
      this.dom.btnNext = document.getElementById('btnNextQuestion');
      this.dom.btnNextBatch = document.getElementById('btnNextBatch');
      this.dom.btnSubmit = document.getElementById('btnSubmitExam');
      this.dom.btnReset = document.getElementById('btnResetQuiz');
      this.dom.btnMatrix = document.getElementById('btnOpenMatrix');
      this.dom.btnBackHub = document.getElementById('btnBackToHub');
      
      // Question Matrix Modal
      this.dom.matrixModal = document.getElementById('matrixModal');
      this.dom.matrixGrid = document.getElementById('matrixGrid');
      this.dom.matrixCloseBtn = document.getElementById('matrixCloseBtn');

      // Pacing Timer & Floating Multi-Select Bar
      this.dom.questionPacingTimer = document.getElementById('questionPacingTimer');
      this.dom.questionPacingDisplay = document.getElementById('questionPacingDisplay');
      this.dom.courseFloatingActionBar = document.getElementById('courseFloatingActionBar');
      this.dom.floatingSelectedText = document.getElementById('floatingSelectedText');
    }

    bindGlobalEvents() {
      // Back to Hub or Course View
      if (this.dom.btnBackHub) {
        this.dom.btnBackHub.addEventListener('click', () => this.returnToCourseView());
      }

      // Mode toggles in Active View
      if (this.dom.btnStudyMode) {
        this.dom.btnStudyMode.addEventListener('click', () => this.switchMode('study'));
      }
      if (this.dom.btnExamMode) {
        this.dom.btnExamMode.addEventListener('click', () => this.switchMode('exam'));
      }

      // Flag question
      if (this.dom.btnFlag) {
        this.dom.btnFlag.addEventListener('click', () => this.toggleFlagCurrent());
      }

      // Navigation
      if (this.dom.btnPrev) {
        this.dom.btnPrev.addEventListener('click', () => this.goToPrevQuestion());
      }
      if (this.dom.btnNext) {
        this.dom.btnNext.addEventListener('click', () => this.goToNextQuestion());
      }
      if (this.dom.btnNextBatch) {
        this.dom.btnNextBatch.addEventListener('click', () => this.loadNextRandomBatch());
      }
      if (this.dom.btnSubmit) {
        this.dom.btnSubmit.addEventListener('click', () => this.confirmSubmitExam());
      }
      if (this.dom.btnReset) {
        this.dom.btnReset.addEventListener('click', () => this.confirmResetQuiz());
      }

      // Matrix Modal
      if (this.dom.btnMatrix) {
        this.dom.btnMatrix.addEventListener('click', () => this.openMatrixModal());
      }
      if (this.dom.matrixCloseBtn) {
        this.dom.matrixCloseBtn.addEventListener('click', () => this.closeMatrixModal());
      }
      if (this.dom.matrixModal) {
        this.dom.matrixModal.addEventListener('click', (e) => {
          if (e.target === this.dom.matrixModal) this.closeMatrixModal();
        });
      }

      // Click outside to close course dropdown menu
      document.addEventListener('click', (e) => {
        if (!document.contains(e.target)) return;
        if (!e.target.closest('#courseTopicDropdown')) {
          this.closeCourseDropdown();
        }
      });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    handleUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const quizId = params.get('quiz');
      const mode = params.get('mode');
      const courseId = params.get('course');
      
      if (quizId) {
        const quiz = window.QuizRegistry.getQuizById(quizId);
        if (quiz && (quiz.totalQuestions > 0 || (quiz.fallbackQuestions && quiz.fallbackQuestions.length > 0))) {
          this.startQuiz(quizId, mode === 'exam' ? 'exam' : 'study');
          return;
        }
      }
      
      if (courseId) {
        this.openCourseTopics(courseId);
      }
    }

    /* ==========================================================================
       VIEW 1: RENDER HUB (فهرست کلی دروس و پورتال‌های آزمون)
       ========================================================================== */
    toPersianDigits(num) {
      if (num === null || num === undefined) return '';
      const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return num.toString().replace(/\d/g, d => farsiDigits[parseInt(d, 10)]);
    }

    loadStoredFlags(quizId) {
      try {
        const stored = localStorage.getItem(`med_quiz_flags_${quizId}`);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    computeStudentStats() {
      const course = window.QuizRegistry ? window.QuizRegistry.getQuizById('ncd') : null;
      const chapters = (course && course.chapters && course.chapters.filter(c => !c.isAll)) || [];

      let totalAnswered = 0;
      let totalCorrect = 0;
      let totalIncorrect = 0;
      const flaggedSet = new Set();
      const incorrectQuestionsMap = new Map();
      const flaggedQuestionsMap = new Map();
      const allUniqueAnsweredQuestions = new Map();

      // Collect from individual chapters
      chapters.forEach(ch => {
        const questions = ch.fallbackQuestions || 
          (window.QuizRegistry && window.QuizRegistry.questionsCache && window.QuizRegistry.questionsCache.get(ch.id)) || [];

        const storedAnswers = this.loadStoredAnswers(ch.id);
        const storedFlags = this.loadStoredFlags(ch.id);

        questions.forEach(q => {
          const key = `${ch.id}_${q.id}`;

          // Check flagged
          if (storedFlags.includes(q.id) || storedFlags.includes(String(q.id))) {
            flaggedSet.add(key);
            flaggedQuestionsMap.set(key, { ...q, chapterId: ch.id, chapterTitle: ch.shortTitle || ch.title });
          }

          // Check answered
          const userAns = storedAnswers[q.id] || storedAnswers[String(q.id)];
          if (userAns !== undefined && userAns !== null) {
            const isCorrect = userAns === q.correct_answer;
            allUniqueAnsweredQuestions.set(key, isCorrect);
            if (!isCorrect) {
              incorrectQuestionsMap.set(key, { ...q, chapterId: ch.id, chapterTitle: ch.shortTitle || ch.title, userAns });
            }
          }
        });
      });

      // Also check global answer sets if saved under 'ncd' or 'ncd-all'
      ['ncd', 'ncd-all'].forEach(qKey => {
        const globalAnswers = this.loadStoredAnswers(qKey);
        const globalFlags = this.loadStoredFlags(qKey);

        chapters.forEach(ch => {
          const questions = ch.fallbackQuestions || 
            (window.QuizRegistry && window.QuizRegistry.questionsCache && window.QuizRegistry.questionsCache.get(ch.id)) || [];

          questions.forEach(q => {
            const key = `${ch.id}_${q.id}`;

            if (globalFlags.includes(q.id) || globalFlags.includes(String(q.id))) {
              flaggedSet.add(key);
              flaggedQuestionsMap.set(key, { ...q, chapterId: ch.id, chapterTitle: ch.shortTitle || ch.title });
            }

            const userAns = globalAnswers[q.id] || globalAnswers[String(q.id)];
            if (userAns !== undefined && userAns !== null && !allUniqueAnsweredQuestions.has(key)) {
              const isCorrect = userAns === q.correct_answer;
              allUniqueAnsweredQuestions.set(key, isCorrect);
              if (!isCorrect) {
                incorrectQuestionsMap.set(key, { ...q, chapterId: ch.id, chapterTitle: ch.shortTitle || ch.title, userAns });
              }
            }
          });
        });
      });

      totalAnswered = allUniqueAnsweredQuestions.size;
      allUniqueAnsweredQuestions.forEach(isCorrect => {
        if (isCorrect) totalCorrect++;
        else totalIncorrect++;
      });

      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

      return {
        totalAnswered,
        totalCorrect,
        totalIncorrect,
        accuracy,
        flaggedCount: flaggedSet.size,
        flaggedQuestions: Array.from(flaggedQuestionsMap.values()),
        incorrectQuestions: Array.from(incorrectQuestionsMap.values())
      };
    }

    updateStudentPerformanceOverview() {
      const stats = this.computeStudentStats();
      
      const elTotal = document.getElementById('perfTotalAnswered');
      const elAcc = document.getElementById('perfAccuracy');
      const elFlag = document.getElementById('perfFlaggedCount');
      const elInc = document.getElementById('perfIncorrectCount');

      if (elTotal) elTotal.textContent = this.toPersianDigits(stats.totalAnswered);
      if (elAcc) elAcc.textContent = stats.totalAnswered > 0 ? `${this.toPersianDigits(stats.accuracy)}٪` : '۰٪';
      if (elFlag) elFlag.textContent = this.toPersianDigits(stats.flaggedCount);
      if (elInc) elInc.textContent = this.toPersianDigits(stats.totalIncorrect);
    }

    launchSmartReview() {
      const stats = this.computeStudentStats();
      const combinedMap = new Map();
      (stats.flaggedQuestions || []).forEach(q => combinedMap.set(`${q.chapterId}_${q.id}`, q));
      (stats.incorrectQuestions || []).forEach(q => combinedMap.set(`${q.chapterId}_${q.id}`, q));
      const questions = Array.from(combinedMap.values());

      if (questions.length === 0) {
        this.openReviewEmptyModal();
        return;
      }

      this.startCustomReviewQuiz(questions, `بانک هوشمند مرور شخصی (${this.toPersianDigits(questions.length)} سوال)`);
    }

    openReviewEmptyModal() {
      const modal = document.getElementById('reviewEmptyModal');
      if (modal) modal.style.display = 'flex';
    }

    closeReviewEmptyModal() {
      const modal = document.getElementById('reviewEmptyModal');
      if (modal) modal.style.display = 'none';
    }

    async startCustomReviewQuiz(questions, title = 'بانک هوشمند مرور شخصی') {
      try {
        const quizMeta = {
          id: 'smart-review',
          title: title,
          category: 'مرور هوشمند شخصی'
        };

        this.currentQuiz = quizMeta;
        this.mode = 'study';
        this.currentIndex = 0;
        this.activeTopic = 'all';

        this.allQuestions = [...questions];
        this.filteredQuestions = this.shuffleArray([...this.allQuestions]);
        this.answers = {};
        this.flags = new Set(this.allQuestions.map(q => q.id));
        this.isSubmitted = false;

        if (this.dom.hubView) this.dom.hubView.style.display = 'none';
        if (this.dom.courseView) this.dom.courseView.style.display = 'none';
        if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';
        if (this.dom.activeView) this.dom.activeView.style.display = 'block';
        if (this.dom.courseFloatingActionBar) this.dom.courseFloatingActionBar.style.display = 'none';

        if (this.dom.activeQuizTitle) {
          this.dom.activeQuizTitle.textContent = quizMeta.title;
        }

        this.updateModePills();
        this.renderCurrentQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error("Error starting custom review quiz:", err);
      }
    }

    renderHub() {
      if (!this.dom.hubView) return;
      this.dom.hubView.style.display = 'block';
      if (this.dom.courseView) this.dom.courseView.style.display = 'none';
      if (this.dom.activeView) this.dom.activeView.style.display = 'none';
      if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';

      // Update Student Performance Overview from LocalStorage
      this.updateStudentPerformanceOverview();

      const quizzes = window.QuizRegistry ? window.QuizRegistry.getAllQuizzes() : [];
      if (!this.dom.quizzesGrid) return;

      const ncdQuiz = quizzes.find(q => q.id === 'ncd') || quizzes[0];
      const stats = this.computeStudentStats();

      const flaggedCountPersian = this.toPersianDigits(stats.flaggedCount);
      const incorrectCountPersian = this.toPersianDigits(stats.totalIncorrect);
      const totalReviewCount = stats.flaggedCount + stats.totalIncorrect;
      const totalReviewPersian = this.toPersianDigits(totalReviewCount);

      const ncdIndividual = (ncdQuiz && ncdQuiz.chapters && ncdQuiz.chapters.filter(c => !c.isAll)) || [];
      const ncdChaptersCount = ncdIndividual.length;

      let html = '';

      // Card 1: NCD Question Bank
      if (ncdQuiz) {
        html += `
          <div class="quiz-card" data-quiz-id="${ncdQuiz.id}">
            <div>
              <div class="quiz-card-header">
                <span class="quiz-card-category" style="color: ${ncdQuiz.categoryColor || '#0284c7'}; background: ${ncdQuiz.categoryColor ? ncdQuiz.categoryColor + '18' : 'rgba(2, 132, 199, 0.1)'};">
                  ${ncdQuiz.category || 'بیماری‌های غیرواگیر'}
                </span>
                <span class="quiz-card-badge">${ncdQuiz.badge || `${ncdQuiz.totalQuestions} سوال`}</span>
              </div>
              <h3 class="quiz-card-title">${ncdQuiz.title}</h3>
              <p class="quiz-card-desc">${ncdQuiz.description}</p>
            </div>
            <div>
              <div class="quiz-card-meta">
                <div class="quiz-card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>${ncdChaptersCount} سرفصل و مبحث آموزشی</span>
                </div>
                <div class="quiz-card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>حالت ۵تایی و شبیه‌ساز رسمی</span>
                </div>
              </div>
              <div>
                <button type="button" class="btn-open-course" onclick="window.medicalQuiz.openCourseTopics('${ncdQuiz.id}')">
                  <span>مشاهده سرفصل‌ها و ورود به آزمون</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Card 2: General Surgery (Lawrence - جراحی جنرال لارنس)
      const surgQuiz = quizzes.find(q => q.id === 'surgery');
      if (surgQuiz) {
        const surgIndividual = (surgQuiz.chapters && surgQuiz.chapters.filter(c => !c.isAll)) || [];
        const surgChaptersCount = surgIndividual.length;
        const surgTotalQuestions = surgQuiz.totalQuestions || 0;
        const surgBadge = surgQuiz.badge || `${this.toPersianDigits(surgTotalQuestions)} سوال در ${this.toPersianDigits(surgChaptersCount)} مبحث`;

        html += `
          <div class="quiz-card quiz-card-surgery" data-quiz-id="${surgQuiz.id}">
            <div>
              <div class="quiz-card-header">
                <span class="quiz-card-category" style="color: #e11d48; background: rgba(225, 29, 72, 0.1);">
                  ${surgQuiz.category || 'جراحی جنرال لارنس'}
                </span>
                <span class="quiz-card-badge" style="background: rgba(225, 29, 72, 0.08); color: #e11d48; border-color: rgba(225, 29, 72, 0.25);">
                  ${this.toPersianDigits(surgBadge)}
                </span>
              </div>
              <h3 class="quiz-card-title">${surgQuiz.title}</h3>
              <p class="quiz-card-desc">${surgQuiz.description}</p>
            </div>
            <div>
              <div class="quiz-card-meta">
                <div class="quiz-card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span>${this.toPersianDigits(surgChaptersCount)} فصل و مبحث جامع لارنس</span>
                </div>
                <div class="quiz-card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>حالت ۵تایی و شبیه‌ساز رسمی</span>
                </div>
              </div>
              <div>
                <button type="button" class="btn-open-course" style="background: linear-gradient(135deg, #e11d48, #be123c);" onclick="window.medicalQuiz.openCourseTopics('${surgQuiz.id}')">
                  <span>مشاهده سرفصل‌ها و ورود به آزمون جراحی</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }

      // Card 3: Smart Personal Review Bank (سوالات نشان‌شده و غلط‌ها)
      html += `
        <div class="quiz-card quiz-card-review" data-quiz-id="smart-review">
          <div>
            <div class="quiz-card-header">
              <span class="quiz-card-category" style="color: #d97706; background: rgba(217, 119, 6, 0.12);">
                مرور هوشمند شخصی
              </span>
              <span class="quiz-card-badge" style="background: rgba(217, 119, 6, 0.1); color: #d97706; border-color: rgba(217, 119, 6, 0.3);">
                ${totalReviewCount > 0 ? `${totalReviewPersian} سوال آماده مرور` : 'شخصی‌سازی شده'}
              </span>
            </div>
            <h3 class="quiz-card-title">بانک هوشمند مرور شخصی (سوالات نشان‌شده و غلط‌ها)</h3>
            <p class="quiz-card-desc">
              سامانه هوشمند بازآموزی بالینی؛ دسترسی متمرکز به سوالاتی که در جریان آزمون‌ها نشان‌کرده‌اید (⭐️) یا به آن‌ها پاسخ نادرست داده‌اید، جهت رفع خطاهای تشخیصی.
            </p>
          </div>
          <div>
            <div class="quiz-card-meta">
              <div class="quiz-card-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span style="font-weight: 700;">${flaggedCountPersian} سوال نشان‌شده (⭐️ شک‌دار)</span>
              </div>
              <div class="quiz-card-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span style="font-weight: 700;">${incorrectCountPersian} پاسخ نادرست برای بازبینی</span>
              </div>
            </div>
            <div>
              <button type="button" class="btn-open-course" style="background: linear-gradient(135deg, #d97706, #b45309);" onclick="window.medicalQuiz.launchSmartReview()">
                <span>شروع جلسه مرور شخصی</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      // Card 3: Radiology Clinical Cases Exam
      html += `
        <div class="quiz-card quiz-card-radiology" data-quiz-id="radiology-cases">
          <div>
            <div class="quiz-card-header">
              <span class="quiz-card-category" style="color: #0ea5e9; background: rgba(14, 165, 233, 0.12);">
                رادیولوژی بالینی
              </span>
              <span class="quiz-card-badge" style="background: rgba(14, 165, 233, 0.1); color: #0284c7; border-color: rgba(14, 165, 233, 0.3);">
                ۲۰ کیس تصویری
              </span>
            </div>
            <h3 class="quiz-card-title">آزمون کیس‌های بالینی رادیولوژی (۲۰ کیس تصویری)</h3>
            <p class="quiz-card-desc">
              آزمون تعاملی تفسیر گرافی‌های واقعی بالینی (ترومای اسکلتی، شکم حاد، CT مغز و مجاری ادراری) با قابلیت فعال‌سازی کادرهای تشخیصی پاتولوژی (Bounding Boxes).
            </p>
          </div>
          <div>
            <div class="quiz-card-meta">
              <div class="quiz-card-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>۲۰ کیس استاندارد همراه با کلیشه</span>
              </div>
              <div class="quiz-card-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span>کادرهای اختصاصی پاتولوژی و پاسخ تشریحی</span>
              </div>
            </div>
            <div>
              <a href="./radiology.html#rad-exam" class="btn-open-course" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>ورود به آزمون رادیولوژی</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>
      `;

      this.dom.quizzesGrid.innerHTML = html;
    }

    /* ==========================================================================
       VIEW 1.5: COURSE TOPICS VIEW (صفحه اختصاصی مباحث درس با فیلتر بالا)
       ========================================================================== */
    openCourseTopics(courseId = 'ncd') {
      const course = window.QuizRegistry.getQuizById(courseId);
      if (!course) return;

      this.currentCourseId = courseId;
      const individual = (course.chapters && course.chapters.filter(c => !c.isAll)) || [];
      // Select all chapters by default
      this.selectedChapterIds = new Set(individual.map(c => c.id));
      this.selectedCourseMode = 'study';

      if (this.dom.hubView) this.dom.hubView.style.display = 'none';
      if (this.dom.activeView) this.dom.activeView.style.display = 'none';
      if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';
      if (this.dom.courseView) this.dom.courseView.style.display = 'block';

      // Meta & Header
      if (this.dom.courseCategoryBadge) this.dom.courseCategoryBadge.textContent = course.category || 'بیماری‌های غیرواگیر';
      if (this.dom.courseTotalBadge) this.dom.courseTotalBadge.textContent = course.badge || `${course.totalQuestions} سوال`;
      if (this.dom.courseTitle) this.dom.courseTitle.textContent = course.title;
      if (this.dom.courseDesc) this.dom.courseDesc.textContent = course.description;

      // Populate Chapters Grid
      this.renderCourseChaptersGrid(course);

      // Populate Dropdown
      this.renderCourseTopicDropdown(course);

      // Update Filter Bar Controls (mode, button text)
      this.updateCourseFilterBar();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderCourseChaptersGrid(course) {
      if (!this.dom.courseChaptersGrid || !course.chapters) return;
      const chapters = course.chapters.filter(c => !c.isAll);

      this.dom.courseChaptersGrid.innerHTML = chapters.map((ch, idx) => {
        const questions = ch.fallbackQuestions || 
          (window.QuizRegistry && window.QuizRegistry.questionsCache && window.QuizRegistry.questionsCache.get(ch.id)) || [];
        const totalChQuestions = ch.totalQuestions || questions.length || 0;

        const chAnswers = this.loadStoredAnswers(ch.id);
        const globalAnswers = this.loadStoredAnswers(course.id || 'ncd');
        const allAnswers = this.loadStoredAnswers(`${course.id || 'ncd'}-all`);

        let answeredCount = 0;
        let correctCount = 0;

        questions.forEach(q => {
          const ans = chAnswers[q.id] || chAnswers[String(q.id)] ||
                      globalAnswers[q.id] || globalAnswers[String(q.id)] ||
                      allAnswers[q.id] || allAnswers[String(q.id)];
          if (ans !== undefined && ans !== null) {
            answeredCount++;
            if (ans === q.correct_answer) {
              correctCount++;
            }
          }
        });

        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
        const progressPercent = totalChQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalChQuestions) * 100)) : 0;
        const isSelected = this.selectedChapterIds.has(ch.id);
        const isSpecial = !!ch.isSpecialExam;

        return `
          <div class="chapter-card ${isSpecial ? 'is-special-exam' : ''}" data-chapter-id="${ch.id}">
            <div>
              ${isSpecial ? `
                <div class="special-exam-ribbon">
                  <span>⭐ سوالات تالیف کلاسی (احتمال بالای آزمون)</span>
                </div>
              ` : ''}
              <div class="chapter-card-header">
                <span class="chapter-card-num ${isSpecial ? 'is-special-num' : ''}">${isSpecial ? `★ منتخب امتحانی ${idx + 1}` : `مبحث ${idx + 1}`}</span>
                <button type="button" class="chapter-select-pill ${isSelected ? 'is-selected' : ''}" 
                        onclick="window.medicalQuiz.toggleCourseTopic('${ch.id}')" 
                        title="${isSelected ? 'کلیک کنید تا از آزمون ترکیبی خارج شود' : 'کلیک کنید تا به آزمون ترکیبی افزوده شود'}">
                  <span class="item-checkbox" style="width: 14px; height: 14px; min-width: 14px; border-radius: 3px; font-size: 10px;">
                    ${isSelected ? '✓' : ''}
                  </span>
                  <span>${isSelected ? 'انتخاب‌شده' : 'افزودن به آزمون'}</span>
                </button>
                <span class="chapter-card-badge">${ch.badge || `${ch.totalQuestions} سوال`}</span>
              </div>
              <h4 class="chapter-card-title">${ch.title}</h4>
              <p class="chapter-card-desc">${ch.description || (ch.shortTitle ? `مجموعه سوالات استاندارد مبحث «${ch.shortTitle}» با تحلیل دام‌های گزینه‌ها.` : 'تحلیل جامع بر اساس گایدلاین‌های کشوری')}</p>
            </div>
            <div>
              <div class="chapter-card-meta">
                <span>⏱️ زمان تخمینی: ${ch.estimatedMinutes || 25} دقیقه</span>
                ${answeredCount > 0 
                  ? `<span class="chapter-mastery-pill" style="color: ${accuracy >= 70 ? '#059669' : (accuracy >= 40 ? '#0284c7' : '#d97706')}; background: ${accuracy >= 70 ? 'rgba(5, 150, 105, 0.1)' : (accuracy >= 40 ? 'rgba(2, 132, 199, 0.1)' : 'rgba(217, 119, 6, 0.1)')};">
                       ✓ ${this.toPersianDigits(answeredCount)} از ${this.toPersianDigits(totalChQuestions)} پاسخ داده شده (${this.toPersianDigits(accuracy)}٪ دقت)
                     </span>`
                  : `<span class="chapter-mastery-pill is-unstarted">شروع نشده (۰ از ${this.toPersianDigits(totalChQuestions)})</span>`
                }
              </div>
              <div class="chapter-card-buttons">
                <button type="button" class="btn-mode-study" onclick="window.medicalQuiz.startSingleChapterQuiz('${ch.id}', 'study')" title="مطالعه آموزشی فقط این مبحث به صورت تصادفی">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  <span>آموزشی (تصادفی)</span>
                </button>
                <button type="button" class="btn-mode-exam" onclick="window.medicalQuiz.startSingleChapterQuiz('${ch.id}', 'exam')" title="شبیه‌ساز آزمون فقط این مبحث">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>شبیه‌ساز آزمون</span>
                </button>
              </div>
            </div>

            <!-- Topic Mastery Progress Track -->
            <div class="topic-mastery-progress-track" title="میزان پیشرفت پاسخ‌دهی به این مبحث: ${progressPercent}٪">
              <div class="topic-mastery-progress-fill" style="width: ${progressPercent}%; background: ${accuracy >= 70 ? '#059669' : (accuracy >= 40 ? '#0284c7' : '#d97706')};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderCourseTopicDropdown(course) {
      if (!this.dom.courseDropdownList || !course.chapters) return;
      const individual = course.chapters.filter(c => !c.isAll);
      const isAllSelected = individual.length > 0 && individual.every(c => this.selectedChapterIds.has(c.id));
      const totalQuestions = individual.reduce((sum, c) => sum + (c.totalQuestions || 0), 0);

      let listHtml = `
        <button type="button" class="course-dropdown-item ${isAllSelected ? 'is-selected' : ''}" 
                data-topic-id="all" 
                data-search-text="همه مباحث آزمون جامع کل سوالات"
                onclick="window.medicalQuiz.toggleAllCourseTopics(event)">
          <div class="item-content">
            <span class="item-checkbox">${isAllSelected ? '✓' : ''}</span>
            <span style="font-weight: 800;">همه مباحث (آزمون جامع)</span>
          </div>
          <span class="item-badge">${totalQuestions} سوال</span>
        </button>
      `;

      individual.forEach(ch => {
        const isSelected = this.selectedChapterIds.has(ch.id);
        const isSpecial = !!ch.isSpecialExam;
        listHtml += `
          <button type="button" class="course-dropdown-item ${isSelected ? 'is-selected' : ''} ${isSpecial ? 'is-special-item' : ''}" 
                  data-topic-id="${ch.id}" 
                  data-search-text="${this.escapeHtml((isSpecial ? 'منتخب امتحانی تالیف دانشجویان ' : '') + ch.title + ' ' + (ch.shortTitle || ''))}"
                  onclick="window.medicalQuiz.toggleCourseTopic('${ch.id}', event)">
            <div class="item-content">
              <span class="item-checkbox">${isSelected ? '✓' : ''}</span>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ch.title}</span>
            </div>
            <span class="item-badge">${ch.badge || `${ch.totalQuestions} سوال`}</span>
          </button>
        `;
      });

      this.dom.courseDropdownList.innerHTML = listHtml;
    }

    toggleCourseTopic(chapterId, event) {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.selectedChapterIds.has(chapterId)) {
        this.selectedChapterIds.delete(chapterId);
      } else {
        this.selectedChapterIds.add(chapterId);
      }
      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      if (course) {
        this.renderCourseTopicDropdown(course);
        this.renderCourseChaptersGrid(course);
      }
      this.updateCourseFilterBar();
    }

    toggleAllCourseTopics(event) {
      if (event && event.stopPropagation) event.stopPropagation();
      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      if (!course || !course.chapters) return;
      const individual = course.chapters.filter(c => !c.isAll);
      const isAllSelected = individual.every(c => this.selectedChapterIds.has(c.id));

      if (isAllSelected) {
        this.selectedChapterIds.clear();
      } else {
        individual.forEach(c => this.selectedChapterIds.add(c.id));
      }
      this.renderCourseTopicDropdown(course);
      this.renderCourseChaptersGrid(course);
      this.updateCourseFilterBar();
    }

    selectAllCourseTopics(event) {
      if (event && event.stopPropagation) event.stopPropagation();
      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      if (!course || !course.chapters) return;
      const individual = course.chapters.filter(c => !c.isAll);
      individual.forEach(c => this.selectedChapterIds.add(c.id));
      this.renderCourseTopicDropdown(course);
      this.renderCourseChaptersGrid(course);
      this.updateCourseFilterBar();
    }

    clearAllCourseTopics(event) {
      if (event && event.stopPropagation) event.stopPropagation();
      this.selectedChapterIds.clear();
      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      if (course) {
        this.renderCourseTopicDropdown(course);
        this.renderCourseChaptersGrid(course);
      }
      this.updateCourseFilterBar();
    }

    setCourseMode(mode) {
      this.selectedCourseMode = mode;
      this.updateCourseFilterBar();
    }

    updateCourseFilterBar() {
      if (this.dom.courseModeStudy && this.dom.courseModeExam) {
        if (this.selectedCourseMode === 'study') {
          this.dom.courseModeStudy.classList.add('is-active-study');
          this.dom.courseModeExam.classList.remove('is-active-exam');
        } else {
          this.dom.courseModeStudy.classList.remove('is-active-study');
          this.dom.courseModeExam.classList.add('is-active-exam');
        }
      }

      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      const individual = (course && course.chapters && course.chapters.filter(c => !c.isAll)) || [];
      const totalPossible = individual.length;
      const selectedCount = this.selectedChapterIds.size;

      let totalSelectedQuestions = 0;
      let singleSelectedChapter = null;
      individual.forEach(ch => {
        if (this.selectedChapterIds.has(ch.id)) {
          totalSelectedQuestions += (ch.totalQuestions || 0);
          singleSelectedChapter = ch;
        }
      });

      if (this.dom.courseDropdownSelectedText) {
        if (selectedCount === 0) {
          this.dom.courseDropdownSelectedText.textContent = 'هیچ مبحثی انتخاب نشده (لطفاً انتخاب کنید)';
        } else if (selectedCount === totalPossible) {
          this.dom.courseDropdownSelectedText.textContent = `همه ${totalPossible} مبحث (آزمون جامع - ${totalSelectedQuestions} سوال)`;
        } else if (selectedCount === 1 && singleSelectedChapter) {
          this.dom.courseDropdownSelectedText.textContent = `${singleSelectedChapter.title} (${singleSelectedChapter.totalQuestions} سوال)`;
        } else {
          this.dom.courseDropdownSelectedText.textContent = `${selectedCount} مبحث انتخابی (${totalSelectedQuestions} سوال)`;
        }
      }

      if (this.dom.btnStartConfiguredText) {
        if (selectedCount === 0) {
          this.dom.btnStartConfiguredText.textContent = 'لطفاً حداقل یک مبحث را انتخاب کنید';
        } else if (this.selectedCourseMode === 'study') {
          this.dom.btnStartConfiguredText.textContent = `شروع حالت آموزشی (${totalSelectedQuestions} سوال با چیدمان تصادفی)`;
          if (this.dom.btnStartConfiguredQuiz) {
            this.dom.btnStartConfiguredQuiz.classList.remove('is-exam-mode');
          }
        } else {
          this.dom.btnStartConfiguredText.textContent = `شروع شبیه‌ساز آزمون رسمی (${totalSelectedQuestions} سوال)`;
          if (this.dom.btnStartConfiguredQuiz) {
            this.dom.btnStartConfiguredQuiz.classList.add('is-exam-mode');
          }
        }
      }

      // Sticky Floating Bottom Multi-Select Action Bar
      const floatingBar = this.dom.courseFloatingActionBar || document.getElementById('courseFloatingActionBar');
      const floatingText = this.dom.floatingSelectedText || document.getElementById('floatingSelectedText');
      if (floatingBar) {
        if (this.dom.courseView && this.dom.courseView.style.display !== 'none' && selectedCount > 0) {
          floatingBar.style.display = 'block';
          if (floatingText) {
            floatingText.textContent = `${this.toPersianDigits(selectedCount)} مبحث انتخاب شده (${this.toPersianDigits(totalSelectedQuestions)} سوال)`;
          }
        } else {
          floatingBar.style.display = 'none';
        }
      }
    }

    startFloatingQuiz(mode = 'study') {
      this.selectedCourseMode = mode;
      this.startConfiguredCourseQuiz();
    }

    toggleCourseDropdown() {
      if (!this.dom.courseDropdownMenu || !this.dom.courseDropdownTrigger) return;
      const isOpen = this.dom.courseDropdownMenu.style.display === 'block';
      if (isOpen) {
        this.closeCourseDropdown();
      } else {
        this.dom.courseDropdownMenu.style.display = 'block';
        this.dom.courseDropdownTrigger.classList.add('is-open');
        this.dom.courseDropdownTrigger.setAttribute('aria-expanded', 'true');
        if (this.dom.courseTopicSearchInput) {
          this.dom.courseTopicSearchInput.value = '';
          this.filterCourseDropdown('');
          setTimeout(() => this.dom.courseTopicSearchInput.focus(), 60);
        }
      }
    }

    closeCourseDropdown() {
      if (this.dom.courseDropdownMenu) this.dom.courseDropdownMenu.style.display = 'none';
      if (this.dom.courseDropdownTrigger) {
        this.dom.courseDropdownTrigger.classList.remove('is-open');
        this.dom.courseDropdownTrigger.setAttribute('aria-expanded', 'false');
      }
    }

    filterCourseDropdown(query) {
      if (!this.dom.courseDropdownList) return;
      const qNorm = (query || '').trim().toLowerCase();
      const items = this.dom.courseDropdownList.querySelectorAll('.course-dropdown-item');
      items.forEach(item => {
        const text = (item.getAttribute('data-search-text') || '').toLowerCase();
        item.style.display = text.includes(qNorm) ? 'flex' : 'none';
      });
    }

    startSingleChapterQuiz(chapterId, mode = 'study') {
      this.startQuiz(chapterId, mode);
    }

    startConfiguredCourseQuiz() {
      if (this.selectedChapterIds.size === 0) {
        alert("لطفاً حداقل یک مبحث را برای شروع آزمون انتخاب کنید.");
        return;
      }
      const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
      const individual = (course && course.chapters && course.chapters.filter(c => !c.isAll)) || [];
      const isAllSelected = individual.length > 0 && individual.every(c => this.selectedChapterIds.has(c.id));

      if (isAllSelected) {
        this.startQuiz(`${this.currentCourseId}-all`, this.selectedCourseMode);
      } else {
        const selectedList = Array.from(this.selectedChapterIds);
        this.startQuiz(selectedList, this.selectedCourseMode);
      }
    }

    returnToCourseView() {
      if (this.currentQuiz && this.currentQuiz.id === 'smart-review') {
        this.returnToHub();
        return;
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.saveState();

      if (this.dom.activeView) this.dom.activeView.style.display = 'none';
      if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';
      if (this.dom.hubView) this.dom.hubView.style.display = 'none';
      
      this.openCourseTopics(this.currentCourseId || 'ncd');

      window.history.pushState({}, '', window.location.pathname);
    }

    /* ==========================================================================
       START QUIZ & RANDOM QUESTION ORDER ENGINE (حالت مطالعه با چیدمان تصادفی)
       ========================================================================== */
    shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffleCurrentQuestions() {
      if (this.mode !== 'study' || !this.allQuestions || this.allQuestions.length === 0) return;
      this.filteredQuestions = this.shuffleArray([...this.allQuestions]);
      this.currentIndex = 0;
      this.renderCurrentQuestion();
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    loadNextRandomBatch() {
      this.shuffleCurrentQuestions();
    }

    async startQuiz(quizId, initialMode = 'study') {
      try {
        let quizMeta = null;
        if (typeof quizId === 'string') {
          quizMeta = window.QuizRegistry.getQuizById(quizId);
        } else if (Array.isArray(quizId)) {
          const course = window.QuizRegistry.getQuizById(this.currentCourseId || 'ncd');
          quizMeta = {
            id: quizId.join(','),
            title: quizId.length === 1 && course && course.chapters
              ? (course.chapters.find(c => c.id === quizId[0]) || {}).title || 'آزمون مبحث انتخابی'
              : `آزمون مباحث ترکیبی انتخابی (${quizId.length} مبحث)`,
            category: (course && course.category) || 'بیماری‌های غیرواگیر'
          };
        }

        if (!quizMeta) {
          quizMeta = { id: 'custom-quiz', title: 'آزمون تخصصی', category: 'بیماری‌های غیرواگیر' };
        }

        this.currentQuiz = quizMeta;
        this.mode = initialMode;
        this.currentIndex = 0;
        this.activeTopic = 'all';

        // Load Questions via Registry
        this.allQuestions = await window.QuizRegistry.loadQuestions(quizId);
        if (!this.allQuestions || this.allQuestions.length === 0) {
          alert("هنوز سوالی برای این آزمون بارگذاری نشده است. به محض ارسال فایل سوالات، در این بخش قرار خواهد گرفت.");
          return;
        }

        // Restore state from LocalStorage
        this.restoreState();

        if (this.mode === 'study') {
          // Shuffle all questions in randomized order across selected topics!
          this.filteredQuestions = this.shuffleArray([...this.allQuestions]);
          this.currentIndex = 0;
        } else {
          this.filteredQuestions = [...this.allQuestions];
          this.currentIndex = 0;
        }

        // If exam was already submitted, restore Scorecard directly
        if (this.isSubmitted && this.mode === 'exam') {
          this.renderScorecard();
          return;
        }

        // Switch Views
        if (this.dom.hubView) this.dom.hubView.style.display = 'none';
        if (this.dom.courseView) this.dom.courseView.style.display = 'none';
        if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';
        if (this.dom.activeView) this.dom.activeView.style.display = 'block';
        if (this.dom.courseFloatingActionBar) this.dom.courseFloatingActionBar.style.display = 'none';

        // Setup UI
        this.updateHeaderMeta();
        this.updateModePills();
        this.startTimerIfNeeded();

        // Render current question
        this.renderCurrentQuestion();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update URL without reload
        const qParam = Array.isArray(quizId) ? quizId.join(',') : quizId;
        const newUrl = `${window.location.pathname}?quiz=${qParam}&mode=${this.mode}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

      } catch (err) {
        console.error(err);
        alert(`خطا در باز کردن آزمون: ${err.message}`);
      }
    }

    /* ==========================================================================
       VIEW 2: QUESTION RENDERING & INTERACTIONS
       ========================================================================== */
    renderCurrentQuestion() {
      if (this.filteredQuestions.length === 0) {
        this.dom.questionStem.textContent = "هیچ سوالی با این فیلتر یافت نشد.";
        this.dom.optionsList.innerHTML = "";
        this.dom.explanationCard.style.display = "none";
        return;
      }

      const q = this.filteredQuestions[this.currentIndex];
      const qId = q.id;
      const isAnswered = this.answers.hasOwnProperty(qId);
      const selectedKey = this.answers[qId];
      const isCorrect = isAnswered && selectedKey === q.correct_answer;
      const isFlagged = this.flags.has(qId);

      // Meta & Header
      if (this.dom.questionCounter) {
        if (this.mode === 'study') {
          this.dom.questionCounter.textContent = `سوال ${this.currentIndex + 1} از ${this.filteredQuestions.length} (چیدمان تصادفی)`;
        } else {
          this.dom.questionCounter.textContent = `سوال ${this.currentIndex + 1} از ${this.filteredQuestions.length}`;
        }
      }

      if (this.dom.questionTopicTag) {
        if (q.topic) {
          this.dom.questionTopicTag.textContent = q.topic;
          this.dom.questionTopicTag.style.display = 'inline-flex';
        } else {
          this.dom.questionTopicTag.style.display = 'none';
        }
      }
      
      // Progress Bar
      if (this.dom.progressBar) {
        const percent = Math.round(((this.currentIndex + 1) / this.filteredQuestions.length) * 100);
        this.dom.progressBar.style.width = `${percent}%`;
      }

      // Batch Indicator & Shuffle in Active View
      if (this.mode === 'study') {
        if (this.dom.batchIndicatorBadge) {
          this.dom.batchIndicatorBadge.style.display = 'inline-flex';
        }
        if (this.dom.batchIndicatorText) {
          this.dom.batchIndicatorText.textContent = 'چیدمان تصادفی سوالات';
        }
        if (this.dom.btnShuffleOrder) {
          this.dom.btnShuffleOrder.style.display = 'inline-flex';
        }
        if (this.dom.btnNextBatch) {
          this.dom.btnNextBatch.style.display = 'none';
        }
      } else {
        if (this.dom.batchIndicatorBadge) {
          this.dom.batchIndicatorBadge.style.display = 'none';
        }
        if (this.dom.btnShuffleOrder) {
          this.dom.btnShuffleOrder.style.display = 'none';
        }
        if (this.dom.btnNextBatch) {
          this.dom.btnNextBatch.style.display = 'none';
        }
      }

      // Flag button state
      if (this.dom.btnFlag) {
        if (isFlagged) {
          this.dom.btnFlag.classList.add('is-flagged');
          this.dom.btnFlag.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>نشان‌شده</span>
          `;
        } else {
          this.dom.btnFlag.classList.remove('is-flagged');
          this.dom.btnFlag.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>نشان‌کردن سوال</span>
          `;
        }
      }

      // Question Stem
      this.dom.questionStem.textContent = q.stem;

      // Per-Question Pacing Timer Handling
      if (isAnswered) {
        this.stopPacingTimer(qId);
      } else {
        this.startPacingTimer(qId);
      }

      // Render Options
      const showFeedback = (this.mode === 'study' && isAnswered) || this.isSubmitted;
      const qStrikes = (this.strikes && this.strikes[qId]) || new Set();
      let optionsHtml = '';

      q.options.forEach(opt => {
        const optKey = opt.key;
        let optClasses = ['quiz-option'];

        const isStruck = qStrikes.has(optKey);
        if (isStruck) {
          optClasses.push('strikethrough');
        }

        if (this.mode === 'exam' && !this.isSubmitted) {
          if (selectedKey === optKey) {
            optClasses.push('is-selected');
          }
        } else if (showFeedback) {
          if (optKey === q.correct_answer) {
            optClasses.push('is-correct');
          } else if (selectedKey === optKey) {
            optClasses.push('is-wrong');
          }
          optClasses.push('is-disabled');
        }

        let statusIconHtml = '';
        if (showFeedback) {
          if (optKey === q.correct_answer) {
            statusIconHtml = `
              <span class="option-status-icon" style="color: #059669;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            `;
          } else if (selectedKey === optKey) {
            statusIconHtml = `
              <span class="option-status-icon" style="color: #dc2626;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </span>
            `;
          }
        }

        const strikeBtnHtml = `
          <button type="button" class="btn-option-strikethrough ${isStruck ? 'is-active-strike' : ''}" 
                  data-strike-key="${optKey}" 
                  title="${isStruck ? 'حذف خط‌خوردگی گزینه' : 'خط زدن این گزینه (رد گزینه)'}" 
                  aria-label="${isStruck ? 'حذف خط‌خوردگی' : 'خط زدن گزینه'} ${optKey}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;

        optionsHtml += `
          <div role="button" tabindex="0" class="${optClasses.join(' ')}" data-option-key="${optKey}">
            <span class="quiz-option-key">${optKey}</span>
            <span class="quiz-option-text">${this.escapeHtml(opt.text)}</span>
            ${strikeBtnHtml}
            ${statusIconHtml}
          </div>
        `;
      });

      this.dom.optionsList.innerHTML = optionsHtml;

      // Attach option listeners (click, contextmenu, strike button, spacebar)
      this.dom.optionsList.querySelectorAll('.quiz-option').forEach(el => {
        const key = el.getAttribute('data-option-key');

        // Normal click on option selects it (unless strike button was clicked)
        el.addEventListener('click', (e) => {
          if (e.target.closest('.btn-option-strikethrough')) return;
          this.handleOptionSelection(key);
        });

        // Right-click toggles strike-through
        el.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.toggleOptionStrike(qId, key);
        });

        // Keyboard accessibility (Space on focused option)
        el.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            this.handleOptionSelection(key);
          }
        });

        // Strike button click toggles strike-through without selecting
        const strikeBtn = el.querySelector('.btn-option-strikethrough');
        if (strikeBtn) {
          strikeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleOptionStrike(qId, key);
          });
        }
      });

      // Render Explanation Card (Immediately in Study Mode after answering, or in Exam Review)
      if (showFeedback && q.detailed_explanation) {
        this.renderExplanationCard(q);
        this.dom.explanationCard.style.display = 'block';
      } else {
        this.dom.explanationCard.style.display = 'none';
      }

      // Nav buttons state
      this.dom.btnPrev.disabled = (this.currentIndex === 0);
      this.dom.btnNext.disabled = (this.currentIndex === this.filteredQuestions.length - 1);
      this.dom.btnNext.innerHTML = `
        <span>سوال بعدی</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      `;
    }

    handleOptionSelection(optionKey) {
      const q = this.filteredQuestions[this.currentIndex];
      const qId = q.id;

      // In Study Mode, if already answered, don't re-answer unless reset
      if (this.mode === 'study' && this.answers.hasOwnProperty(qId)) {
        return;
      }

      // Stop pacing timer for this question
      this.stopPacingTimer(qId);

      // Record answer
      this.answers[qId] = optionKey;
      this.saveState();

      // Re-render question
      this.renderCurrentQuestion();

      // Auto scroll to explanation if Study Mode
      if (this.mode === 'study') {
        setTimeout(() => {
          if (this.dom.explanationCard) {
            this.dom.explanationCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 150);
      }
    }

    toggleOptionStrike(qId, optKey) {
      if (!this.strikes) this.strikes = {};
      if (!this.strikes[qId]) this.strikes[qId] = new Set();
      
      const qStrikes = this.strikes[qId];
      if (qStrikes.has(optKey)) {
        qStrikes.delete(optKey);
      } else {
        qStrikes.add(optKey);
      }

      if (this.dom.optionsList) {
        const optEl = this.dom.optionsList.querySelector(`.quiz-option[data-option-key="${optKey}"]`);
        if (optEl) {
          const isStruck = qStrikes.has(optKey);
          optEl.classList.toggle('strikethrough', isStruck);
          const btn = optEl.querySelector('.btn-option-strikethrough');
          if (btn) {
            btn.classList.toggle('is-active-strike', isStruck);
            btn.setAttribute('title', isStruck ? 'حذف خط‌خوردگی گزینه' : 'خط زدن این گزینه (رد گزینه)');
            btn.setAttribute('aria-label', `${isStruck ? 'حذف خط‌خوردگی' : 'خط زدن گزینه'} ${optKey}`);
          }
        }
      }
    }

    startPacingTimer(qId) {
      this.clearPacingInterval();
      this.pacingSeconds = (this.questionPacingMap && this.questionPacingMap[qId]) || 0;
      this.updatePacingDisplay(false);

      this.pacingInterval = setInterval(() => {
        this.pacingSeconds++;
        if (this.questionPacingMap) this.questionPacingMap[qId] = this.pacingSeconds;
        this.updatePacingDisplay(false);
      }, 1000);
    }

    stopPacingTimer(qId) {
      this.clearPacingInterval();
      if (qId && this.questionPacingMap) {
        this.questionPacingMap[qId] = this.pacingSeconds;
      }
      this.updatePacingDisplay(true);
    }

    clearPacingInterval() {
      if (this.pacingInterval) {
        clearInterval(this.pacingInterval);
        this.pacingInterval = null;
      }
    }

    updatePacingDisplay(isFrozen = false) {
      const display = this.dom.questionPacingDisplay || document.getElementById('questionPacingDisplay');
      const timerBadge = this.dom.questionPacingTimer || document.getElementById('questionPacingTimer');
      if (!display) return;

      const sec = this.pacingSeconds || 0;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      display.textContent = `⏱ ${this.toPersianDigits(timeFormatted)}`;

      if (timerBadge) {
        if (sec > 90) {
          timerBadge.classList.add('is-slow');
        } else {
          timerBadge.classList.remove('is-slow');
        }
        if (isFrozen) {
          timerBadge.classList.add('is-frozen');
        } else {
          timerBadge.classList.remove('is-frozen');
        }
      }
    }

    getDistractorsList(distractors) {
      if (!distractors) return [];
      if (Array.isArray(distractors)) {
        return distractors.map(item => ({
          key: item.key || item.option || item.opt || '',
          text: item.why_incorrect || item.text || item.correction || (typeof item === 'string' ? item : '')
        })).filter(d => d.key || d.text);
      }
      if (typeof distractors === 'object') {
        return Object.entries(distractors).map(([k, v]) => ({
          key: k,
          text: typeof v === 'object' && v !== null ? (v.why_incorrect || v.text || v.correction || JSON.stringify(v)) : String(v || '')
        })).filter(d => d.key || d.text);
      }
      return [];
    }

    formatMathExpr(raw) {
      if (!raw) return '';
      let s = String(raw).trim();
      s = s.replace(/\\text\{([^}]+)\}/g, '$1');
      s = s.replace(/\\mathrm\{([^}]+)\}/g, '$1');
      s = s.replace(/\^\\circ\s*C/g, '°C');
      s = s.replace(/\^\\circ\s*F/g, '°F');
      s = s.replace(/\\ge/g, '≥').replace(/\\geq/g, '≥');
      s = s.replace(/\\le/g, '≤').replace(/\\leq/g, '≤');
      s = s.replace(/\\pm/g, '±');
      s = s.replace(/\\times/g, '×');
      s = s.replace(/\\approx/g, '≈');
      s = s.replace(/\\sim/g, '~');
      s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2');
      s = s.replace(/\\\s+/g, ' ');
      s = s.replace(/\\%/g, '%').replace(/\\_/g, '_');
      return `<span class="med-measure" dir="ltr">${s}</span>`;
    }

    formatMarkdownTables(text) {
      if (!text) return '';
      return text.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (tableText) => {
        const rows = tableText.trim().split('\n').map(r => r.trim()).filter(Boolean);
        if (rows.length < 2) return tableText;

        let tableHtml = '<div class="table-responsive"><table class="clinical-table" dir="rtl">';
        let isHeader = true;

        rows.forEach((row, rowIdx) => {
          if (row.match(/^\|[\s\-:|]+\|$/)) {
            isHeader = false;
            return;
          }
          const cells = row.split('|').slice(1, -1).map(c => c.trim());
          if (rowIdx === 0 && isHeader) {
            tableHtml += '<thead><tr>' + cells.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
          } else {
            tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
          }
        });

        tableHtml += '</tbody></table></div>';
        return tableHtml;
      });
    }

    formatMarkdownText(text) {
      if (!text) return '';
      let s = this.escapeHtml(text);

      // LaTeX math: $...$
      s = s.replace(/\$([^\$]+)\$/g, (m, mathExpr) => {
        return this.formatMathExpr(mathExpr);
      });

      // Markdown Bold: **text**
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Markdown Italic: *text*
      s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Underline: <u>text</u>
      s = s.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>');

      // Markdown Tables
      if (s.includes('|') && s.includes('\n|')) {
        s = this.formatMarkdownTables(s);
      }

      // Markdown Bullet Lists (- ... or * ...) and numbered lists (1. ...)
      const lines = s.split('\n');
      let inList = false;
      let listType = 'ul';
      const output = [];

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const trimmed = line.trim();

        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);

        if (bulletMatch) {
          if (!inList || listType !== 'ul') {
            if (inList) output.push(`</${listType}>`);
            output.push('<ul>');
            inList = true;
            listType = 'ul';
          }
          output.push(`<li>${bulletMatch[1]}</li>`);
        } else if (numMatch) {
          if (!inList || listType !== 'ol') {
            if (inList) output.push(`</${listType}>`);
            output.push('<ol>');
            inList = true;
            listType = 'ol';
          }
          output.push(`<li>${numMatch[2]}</li>`);
        } else {
          if (inList) {
            output.push(`</${listType}>`);
            inList = false;
          }
          if (trimmed.length > 0) {
            output.push(`<p class="exp-para">${line}</p>`);
          }
        }
      }
      if (inList) {
        output.push(`</${listType}>`);
      }

      return output.join('\n');
    }

    formatDistractorText(text) {
      if (!text) return '';
      // Strip leading redundant 'بررسی گزینه X:'
      let s = String(text).replace(/^(?:-\s*)?(?:\*\*)?بررسی گزینه\s*[A-DА-Яa-d]:(?:\*\*)?\s*/i, '');
      
      let html = this.escapeHtml(s);

      // Format LaTeX math
      html = html.replace(/\$([^\$]+)\$/g, (m, mathExpr) => {
        return this.formatMathExpr(mathExpr);
      });

      // Markdown bold & italic
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Highlight clinical warnings and consequence phrases
      const alertKeywords = [
        /⚠️\s*(?:پیامد بالینی|تله بالینی|هشدار بالینی)?:?/g,
        /\b(?:خطای مرگبار پزشکی|کنترااندیکاسیون مطلق|بزرگ‌ترین دام امتحانی!|بزرگ‌ترین دام امتحانی|Reduction en masse|Flood Syndrome|Flood syndrome)\b/g
      ];

      alertKeywords.forEach(pattern => {
        html = html.replace(pattern, '<span class="clinical-alert-pill">$&</span>');
      });

      return html;
    }

    generateExplanationCardsHtml(question) {
      if (!question) return '';
      const exp = question.detailed_explanation || {};
      const rationale = exp.rationale || "تحلیل گزینه صحیح ثبت نشده است.";
      const distractors = this.getDistractorsList(exp.distractors_correction);
      const miniLesson = exp.mini_lesson || exp.lawrence_lesson || '';

      // CARD 1: Emerald Green Rationale Card (تحلیل پاسخ صحیح و مسیر مدیریت بیمار)
      const card1Html = `
        <div class="exp-card exp-card-correct">
          <div class="exp-card-header exp-header-correct">
            <div class="exp-card-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>✅ ۱. تحلیل پاسخ صحیح و مسیر مدیریت بیمار (گزینه [${question.correct_answer}])</span>
            </div>
            <span class="exp-badge exp-badge-emerald">پاسخ قطعی رفرنس</span>
          </div>
          <div class="exp-card-body exp-body-correct">
            ${this.formatMarkdownText(rationale)}
          </div>
        </div>
      `;

      // CARD 2: Amber/Coral Distractor Subcards (کالبدشکافی سایر گزینه‌ها و دام‌های امتحانی)
      let distCardsHtml = '';
      const wrongOptions = (question.options && Array.isArray(question.options))
        ? question.options.filter(opt => opt.key !== question.correct_answer)
        : [];

      if (wrongOptions.length > 0) {
        distCardsHtml = wrongOptions.map(opt => {
          const matchedDist = distractors.find(d => d.key === opt.key);
          const whyIncorrect = opt.explanation || (matchedDist && matchedDist.text) || 'تحلیل تفکیک‌شده‌ای برای این گزینه موجود نیست.';
          return `
            <div class="distractor-subcard">
              <div class="distractor-subcard-header">
                <div class="distractor-subcard-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>رد گزینه [${opt.key}]</span>
                </div>
                <div class="distractor-subcard-preview" title="${this.escapeHtml(opt.text)}">
                  ${this.escapeHtml(opt.text)}
                </div>
              </div>
              <div class="distractor-subcard-body">
                ${this.formatDistractorText(whyIncorrect)}
              </div>
            </div>
          `;
        }).join('');
      } else if (distractors.length > 0) {
        distCardsHtml = distractors.map(d => `
          <div class="distractor-subcard">
            <div class="distractor-subcard-header">
              <div class="distractor-subcard-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span>رد گزینه [${d.key}]</span>
              </div>
            </div>
            <div class="distractor-subcard-body">
              ${this.formatDistractorText(d.text)}
            </div>
          </div>
        `).join('');
      } else {
        distCardsHtml = '<div style="font-size: 13.5px; color: var(--text-muted); padding: 8px 0;">تحلیل تفکیک‌شده‌ای برای سایر گزینه‌ها موجود نیست.</div>';
      }

      const card2Html = `
        <div class="exp-card exp-card-distractors">
          <div class="exp-card-header exp-header-distractors">
            <div class="exp-card-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>🔍 ۲. کالبدشکافی سایر گزینه‌ها و دام‌های امتحانی</span>
            </div>
            <span class="exp-badge exp-badge-amber">کالبدشکافی دام‌های تستی</span>
          </div>
          <div class="exp-card-body exp-body-distractors">
            ${distCardsHtml}
          </div>
        </div>
      `;

      // CARD 3: Royal Blue / Indigo Mini-Lesson Card (درسنامه مکمل لارنس)
      let card3Html = '';
      if (miniLesson && miniLesson.trim().length > 0) {
        card3Html = `
          <div class="exp-card exp-card-lesson">
            <div class="exp-card-header exp-header-lesson">
              <div class="exp-card-header-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span>📚 ۳. درسنامه مکمل لارنس (نکات پیرامونی و جمع‌بندی طلایی)</span>
              </div>
              <span class="exp-badge exp-badge-indigo">نکات کلیدی های‌ییلد</span>
            </div>
            <div class="exp-card-body exp-body-lesson">
              ${this.formatMarkdownText(miniLesson)}
            </div>
          </div>
        `;
      }

      return `
        <div class="exp-cards-container">
          ${card1Html}
          ${card2Html}
          ${card3Html}
        </div>
      `;
    }

    renderExplanationCard(question) {
      if (!question) return;

      // Render Multi-Card 3-Part Vibrant UI (Card 1: Rationale, Card 2: Distractors, Card 3: Mini-Lesson)
      if (this.dom.explanationCardsContainer) {
        this.dom.explanationCardsContainer.innerHTML = this.generateExplanationCardsHtml(question);
      }

      // Completely disable and hide legacy duplicate boxes so only the new styled cards appear
      if (this.dom.distractorsContainer) {
        this.dom.distractorsContainer.style.display = 'none';
      }
      if (this.dom.distractorsList) {
        this.dom.distractorsList.innerHTML = '';
      }
      if (this.dom.legacyRationaleContainer) {
        this.dom.legacyRationaleContainer.style.display = 'none';
      }
      if (this.dom.rationaleBox) {
        this.dom.rationaleBox.textContent = '';
      }
    }

    /* ==========================================================================
       NAVIGATION & QUESTION MATRIX
       ========================================================================== */
    goToPrevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.renderCurrentQuestion();
      }
    }

    goToNextQuestion() {
      if (this.currentIndex < this.filteredQuestions.length - 1) {
        this.currentIndex++;
        this.renderCurrentQuestion();
      }
    }

    toggleFlagCurrent() {
      const q = this.filteredQuestions[this.currentIndex];
      if (!q) return;
      if (this.flags.has(q.id)) {
        this.flags.delete(q.id);
      } else {
        this.flags.add(q.id);
      }
      this.saveState();
      this.renderCurrentQuestion();
    }

    openMatrixModal() {
      if (!this.dom.matrixModal || !this.dom.matrixGrid) return;
      let gridHtml = '';

      this.filteredQuestions.forEach((q, idx) => {
        const qId = q.id;
        const isAnswered = this.answers.hasOwnProperty(qId);
        const isFlagged = this.flags.has(qId);
        const isActive = idx === this.currentIndex;

        let btnClasses = ['matrix-q-btn'];
        if (isActive) btnClasses.push('is-active-q');
        
        if (this.isSubmitted || this.mode === 'study') {
          if (isAnswered) {
            if (this.answers[qId] === q.correct_answer) {
              btnClasses.push('is-correct');
            } else {
              btnClasses.push('is-wrong');
            }
          }
        } else if (isAnswered) {
          btnClasses.push('is-answered');
        }

        gridHtml += `
          <button type="button" class="${btnClasses.join(' ')}" onclick="window.medicalQuiz.jumpToQuestion(${idx})">
            <span>${idx + 1}</span>
            ${isFlagged ? '<span class="matrix-flag-indicator"></span>' : ''}
          </button>
        `;
      });

      this.dom.matrixGrid.innerHTML = gridHtml;
      this.dom.matrixModal.classList.add('is-open');
    }

    closeMatrixModal() {
      if (this.dom.matrixModal) {
        this.dom.matrixModal.classList.remove('is-open');
      }
    }

    jumpToQuestion(index) {
      if (index >= 0 && index < this.filteredQuestions.length) {
        this.currentIndex = index;
        this.renderCurrentQuestion();
        this.closeMatrixModal();
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    }

    /* ==========================================================================
       MODE SWITCHING & TIMER
       ========================================================================== */
    switchMode(newMode) {
      if (this.mode === newMode) return;
      this.mode = newMode;
      
      if (this.mode === 'study') {
        this.filteredQuestions = this.shuffleArray([...this.allQuestions]);
        this.currentIndex = 0;
      } else {
        this.filteredQuestions = [...this.allQuestions];
        this.currentIndex = 0;
      }

      this.saveState();
      this.updateModePills();
      this.startTimerIfNeeded();
      this.renderCurrentQuestion();
    }

    updateModePills() {
      if (this.dom.btnStudyMode && this.dom.btnExamMode) {
        if (this.mode === 'study') {
          this.dom.btnStudyMode.classList.add('is-active-study');
          this.dom.btnExamMode.classList.remove('is-active-exam');
          if (this.dom.btnSubmit) this.dom.btnSubmit.style.display = 'none';
          if (this.dom.timerWrapper) this.dom.timerWrapper.style.display = 'none';
        } else {
          this.dom.btnStudyMode.classList.remove('is-active-study');
          this.dom.btnExamMode.classList.add('is-active-exam');
          if (this.dom.btnSubmit) this.dom.btnSubmit.style.display = 'inline-flex';
          if (this.dom.timerWrapper) this.dom.timerWrapper.style.display = 'inline-flex';
        }
      }
    }

    startTimerIfNeeded() {
      if (this.mode === 'exam' && !this.isSubmitted) {
        if (!this.timerInterval) {
          this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.updateTimerDisplay();
          }, 1000);
        }
      } else {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }
      this.updateTimerDisplay();
    }

    updateTimerDisplay() {
      if (!this.dom.timerDisplay) return;
      const m = Math.floor(this.timerSeconds / 60);
      const s = this.timerSeconds % 60;
      this.dom.timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    /* ==========================================================================
       EXAM SUBMISSION & SCORECARD (کارنامه و ثبت آزمون)
       ========================================================================== */
    confirmSubmitExam() {
      const total = this.filteredQuestions.length;
      const answered = this.filteredQuestions.filter(q => this.answers.hasOwnProperty(q.id)).length;
      const unanswered = total - answered;

      let msg = `آیا از ثبت نهایی و اتمام آزمون اطمینان دارید؟\n\nتعداد کل سوالات: ${total}\nپاسخ‌داده‌شده: ${answered}`;
      if (unanswered > 0) {
        msg += `\nسوالات بدون پاسخ: ${unanswered} سوال`;
      }

      if (confirm(msg)) {
        this.submitExam();
      }
    }

    submitExam() {
      this.isSubmitted = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.saveState();
      this.renderScorecard();
    }

    renderScorecard() {
      if (!this.dom.scorecardView) return;

      this.dom.activeView.style.display = 'none';
      this.dom.hubView.style.display = 'none';
      this.dom.scorecardView.style.display = 'block';

      const total = this.filteredQuestions.length;
      let correct = 0;
      let wrong = 0;
      let unanswered = 0;

      this.filteredQuestions.forEach(q => {
        if (!this.answers.hasOwnProperty(q.id)) {
          unanswered++;
        } else if (this.answers[q.id] === q.correct_answer) {
          correct++;
        } else {
          wrong++;
        }
      });

      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
      const m = Math.floor(this.timerSeconds / 60);
      const s = this.timerSeconds % 60;
      const timeStr = `${m} دقیقه و ${s} ثانیه`;

      let verdictText = 'تسلط کامل و نتیجه عالی';
      let verdictClass = 'verdict-excellent';
      if (percentage < 50) {
        verdictText = 'نیاز به مطالعه و مرور مجدد مباحث';
        verdictClass = 'verdict-needs-review';
      } else if (percentage < 75) {
        verdictText = 'نتیجه بسیار خوب، قابل ارتقا';
        verdictClass = 'verdict-good';
      }

      // Calculate SVG Circle Dash Offset (Circumference ~ 377px)
      const circumference = 2 * Math.PI * 52;
      const offset = circumference - (percentage / 100) * circumference;

      this.dom.scorecardView.innerHTML = `
        <div class="quiz-scorecard-card">
          <span class="scorecard-badge">کارنامه رسمی خودارزیابی بالینی</span>
          <h2 class="scorecard-title">${this.currentQuiz ? this.currentQuiz.title : 'کارنامه آزمون'}</h2>
          
          <div class="score-circle-wrapper">
            <svg class="score-circle-svg" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#0284c7" />
                  <stop offset="100%" stop-color="#10b981" />
                </linearGradient>
              </defs>
              <circle class="score-circle-bg" cx="60" cy="60" r="52"></circle>
              <circle class="score-circle-bar" cx="60" cy="60" r="52" 
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"></circle>
            </svg>
            <div class="score-circle-text">
              <span class="score-percentage">${percentage}٪</span>
              <span class="score-label">نمره نهایی</span>
            </div>
          </div>

          <div>
            <span class="score-verdict ${verdictClass}">${verdictText}</span>
          </div>

          <div class="score-stats-grid">
            <div class="score-stat-box">
              <div class="score-stat-value text-correct">${correct}</div>
              <div class="score-stat-title">پاسخ‌های صحیح</div>
            </div>
            <div class="score-stat-box">
              <div class="score-stat-value text-wrong">${wrong}</div>
              <div class="score-stat-title">پاسخ‌های نادرست</div>
            </div>
            <div class="score-stat-box">
              <div class="score-stat-value text-unanswered">${unanswered}</div>
              <div class="score-stat-title">بدون پاسخ</div>
            </div>
            <div class="score-stat-box">
              <div class="score-stat-value text-flagged">${this.flags.size}</div>
              <div class="score-stat-title">نشان‌شده‌ها</div>
            </div>
            <div class="score-stat-box">
              <div class="score-stat-value" style="font-size: 16px; color: var(--text-primary);">${timeStr}</div>
              <div class="score-stat-title">زمان صرف‌شده</div>
            </div>
          </div>

          <div class="scorecard-buttons">
            <button type="button" class="btn-mode-exam" onclick="window.medicalQuiz.viewFullReview()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>مشاهده پاسخنامه تشریحی کل سوالات</span>
            </button>
            ${(wrong > 0 || unanswered > 0) ? `
              <button type="button" class="btn-mode-study" onclick="window.medicalQuiz.retakeMistakesOnly()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>آزمون مجدد سوالات غلط و نزده</span>
              </button>
            ` : ''}
            <button type="button" class="btn-reset-quiz" onclick="window.medicalQuiz.confirmResetQuiz()">
              <span>شروع مجدد آزمون</span>
            </button>
            <button type="button" class="btn-back-hub" onclick="window.medicalQuiz.returnToCourseView()">
              <span>بازگشت به فهرست مباحث این درس</span>
            </button>
          </div>
        </div>

        <div id="fullReviewSection" class="quiz-full-review-section" style="display: none;">
          <div class="full-review-header">
            <h3 class="full-review-title">پاسخنامه تشریحی و تحلیل تفکیک‌شده سوالات</h3>
          </div>
          <div id="fullReviewList"></div>
        </div>
      `;

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    viewFullReview() {
      const section = document.getElementById('fullReviewSection');
      const list = document.getElementById('fullReviewList');
      if (!section || !list) return;

      section.style.display = 'block';

      let html = '';
      this.filteredQuestions.forEach((q, idx) => {
        const isAnswered = this.answers.hasOwnProperty(q.id);
        const userChoice = this.answers[q.id];
        const isCorrect = isAnswered && userChoice === q.correct_answer;
        const exp = q.detailed_explanation || {};

        html += `
          <div class="quiz-question-card" style="margin-block-end: var(--space-6);">
            <div class="question-header">
              <span class="question-number-badge">سوال ${idx + 1}</span>
              ${isCorrect ? `
                <span class="explanation-correct-badge" style="margin-inline-start: auto;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>پاسخ صحیح داده‌اید</span>
                </span>
              ` : isAnswered ? `
                <span class="score-stat-value text-wrong" style="font-size: 12px; margin-inline-start: auto;">
                  پاسخ شما [${userChoice}] نادرست بود (گزینه صحیح: [${q.correct_answer}])
                </span>
              ` : `
                <span style="font-size: 12px; color: var(--text-muted); margin-inline-start: auto;">بی‌پاسخ</span>
              `}
            </div>

            <div class="quiz-stem">${this.escapeHtml(q.stem)}</div>

            <div class="quiz-options-list">
              ${q.options.map(opt => {
                let cls = ['quiz-option', 'is-disabled'];
                if (opt.key === q.correct_answer) cls.push('is-correct');
                else if (userChoice === opt.key) cls.push('is-wrong');

                return `
                  <div class="${cls.join(' ')}">
                    <span class="quiz-option-key">${opt.key}</span>
                    <span class="quiz-option-text">${this.escapeHtml(opt.text)}</span>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="quiz-explanation-card" style="display: block; margin-block-start: var(--space-4);">
              <div class="explanation-main-header">
                <div class="explanation-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span>پاسخ تشریحی، مستندات علمی و درسنامه بالینی لارنس</span>
                </div>
                <span class="explanation-correct-badge">پاسخنامه مستند</span>
              </div>
              ${this.generateExplanationCardsHtml(q)}
            </div>
          </div>
        `;
      });

      list.innerHTML = html;
      section.scrollIntoView({ behavior: 'smooth' });
    }

    retakeMistakesOnly() {
      const wrongOrUnanswered = this.filteredQuestions.filter(q => {
        return !this.answers.hasOwnProperty(q.id) || this.answers[q.id] !== q.correct_answer;
      });

      if (wrongOrUnanswered.length === 0) {
        alert("هیچ سوال نادرست یا بدون پاسخی برای مرور وجود ندارد!");
        return;
      }

      this.filteredQuestions = this.shuffleArray(wrongOrUnanswered);
      this.currentIndex = 0;
      this.isSubmitted = false;
      this.mode = 'study'; // Start study mode for smart review
      
      // Clear answers for these questions only
      wrongOrUnanswered.forEach(q => delete this.answers[q.id]);
      this.saveState();

      this.dom.scorecardView.style.display = 'none';
      this.dom.activeView.style.display = 'block';
      this.updateModePills();
      this.renderCurrentQuestion();
    }

    confirmResetQuiz() {
      if (confirm("آیا مطمئن هستید که می‌خواهید پاسخ‌ها را پاک کرده و آزمون را از ابتدا آغاز کنید؟")) {
        this.resetQuiz();
      }
    }

    resetQuiz() {
      if (!this.currentQuiz) return;
      const qId = this.currentQuiz.id;

      localStorage.removeItem(`med_quiz_answers_${qId}`);
      localStorage.removeItem(`med_quiz_flags_${qId}`);
      localStorage.removeItem(`med_quiz_submitted_${qId}`);
      localStorage.removeItem(`med_quiz_time_${qId}`);

      this.answers = {};
      this.flags.clear();
      this.isSubmitted = false;
      this.timerSeconds = 0;
      this.currentIndex = 0;

      this.clearPacingInterval();
      this.pacingSeconds = 0;
      this.questionPacingMap = {};
      this.strikes = {};

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.dom.scorecardView.style.display = 'none';
      this.dom.activeView.style.display = 'block';
      if (this.mode === 'study') {
        this.filteredQuestions = this.shuffleArray([...this.allQuestions]);
      } else {
        this.filteredQuestions = [...this.allQuestions];
      }
      this.updateModePills();
      this.startTimerIfNeeded();
      this.renderCurrentQuestion();
    }

    returnToHub() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.clearPacingInterval();
      this.saveState();
      
      if (this.dom.courseFloatingActionBar) {
        this.dom.courseFloatingActionBar.style.display = 'none';
      }

      this.dom.activeView.style.display = 'none';
      this.dom.scorecardView.style.display = 'none';
      this.dom.hubView.style.display = 'block';
      this.renderHub();

      // Clean URL params
      window.history.pushState({}, '', window.location.pathname);
    }

    /* ==========================================================================
       LOCALSTORAGE PERSISTENCE
       ========================================================================== */
    saveState() {
      if (!this.currentQuiz) return;
      const qId = this.currentQuiz.id;
      try {
        localStorage.setItem(`med_quiz_answers_${qId}`, JSON.stringify(this.answers));
        localStorage.setItem(`med_quiz_flags_${qId}`, JSON.stringify(Array.from(this.flags)));
        localStorage.setItem(`med_quiz_submitted_${qId}`, JSON.stringify(this.isSubmitted));
        localStorage.setItem(`med_quiz_mode_${qId}`, this.mode);
        localStorage.setItem(`med_quiz_topic_${qId}`, this.activeTopic);
        localStorage.setItem(`med_quiz_time_${qId}`, this.timerSeconds.toString());
      } catch (e) {
        console.warn("Could not save quiz state to localStorage:", e);
      }
    }

    restoreState() {
      if (!this.currentQuiz) return;
      const qId = this.currentQuiz.id;
      try {
        this.answers = this.loadStoredAnswers(qId);
        
        const storedFlags = localStorage.getItem(`med_quiz_flags_${qId}`);
        if (storedFlags) this.flags = new Set(JSON.parse(storedFlags));

        const storedSubmitted = localStorage.getItem(`med_quiz_submitted_${qId}`);
        if (storedSubmitted) this.isSubmitted = JSON.parse(storedSubmitted);

        const storedTopic = localStorage.getItem(`med_quiz_topic_${qId}`);
        if (storedTopic) this.activeTopic = storedTopic;

        const storedTime = localStorage.getItem(`med_quiz_time_${qId}`);
        if (storedTime) this.timerSeconds = parseInt(storedTime, 10) || 0;

      } catch (e) {
        console.warn("Could not restore quiz state:", e);
      }
    }

    loadStoredAnswers(quizId) {
      try {
        const stored = localStorage.getItem(`med_quiz_answers_${quizId}`);
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    }

    /* ==========================================================================
       KEYBOARD SHORTCUTS
       ========================================================================== */
    handleKeyboardShortcuts(e) {
      // Don't intercept when focusing input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (!this.dom.activeView || this.dom.activeView.style.display !== 'block') return;

      // Close modal on Escape
      if (this.dom.matrixModal && this.dom.matrixModal.classList.contains('is-open')) {
        if (e.key === 'Escape') {
          this.closeMatrixModal();
        }
        return;
      }

      const q = this.filteredQuestions && this.filteredQuestions[this.currentIndex];
      if (!q) return;

      if (e.key === 'ArrowLeft') {
        // Next in RTL
        e.preventDefault();
        this.goToNextQuestion();
      } else if (e.key === 'Enter') {
        // Next question only when currently answered
        if (this.answers.hasOwnProperty(q.id)) {
          e.preventDefault();
          this.goToNextQuestion();
        }
      } else if (e.key === 'ArrowRight') {
        // Prev in RTL
        e.preventDefault();
        this.goToPrevQuestion();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
        e.preventDefault();
        this.toggleFlagCurrent();
      } else if (e.key === 'Escape') {
        this.closeCourseDropdown();
        this.closeMatrixModal();
      } else if (['1', '2', '3', '4', '۱', '۲', '۳', '۴'].includes(e.key)) {
        e.preventDefault();
        const map = { '1': 1, '2': 2, '3': 3, '4': 4, '۱': 1, '۲': 2, '۳': 3, '۴': 4 };
        const num = map[e.key];
        if (q.options && q.options[num - 1]) {
          this.handleOptionSelection(q.options[num - 1].key);
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        e.preventDefault();
        const letter = e.key.toUpperCase();
        if (q.options) {
          const found = q.options.find(opt => opt.key.toUpperCase() === letter);
          if (found) {
            this.handleOptionSelection(found.key);
          }
        }
      }
    }

    updateHeaderMeta() {
      if (this.dom.activeQuizTitle && this.currentQuiz) {
        this.dom.activeQuizTitle.textContent = this.currentQuiz.title;
      }
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  // Instantiate and expose globally
  window.medicalQuiz = new MedicalQuizEngine();

  document.addEventListener('DOMContentLoaded', () => {
    window.medicalQuiz.init();
  });
})();
