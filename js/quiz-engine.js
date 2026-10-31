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
    renderHub() {
      if (!this.dom.hubView) return;
      this.dom.hubView.style.display = 'block';
      if (this.dom.courseView) this.dom.courseView.style.display = 'none';
      if (this.dom.activeView) this.dom.activeView.style.display = 'none';
      if (this.dom.scorecardView) this.dom.scorecardView.style.display = 'none';

      const quizzes = window.QuizRegistry ? window.QuizRegistry.getAllQuizzes() : [];
      if (!this.dom.quizzesGrid) return;

      if (quizzes.length === 0) {
        this.dom.quizzesGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--bg-surface); border: 1px dashed var(--border-default); border-radius: var(--radius-xl);">
            <div style="width: 48px; height: 48px; margin: 0 auto 12px; border-radius: 50%; background: var(--bg-body-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 8px 0;">هیچ آزمونی در حال حاضر ثبت نشده است</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin: 0;">بانک سوالات به محض بارگذاری فایل‌های مربوطه در این بخش نمایش داده خواهند شد.</p>
          </div>
        `;
        return;
      }

      this.dom.quizzesGrid.innerHTML = quizzes.map(q => {
        const individualChapters = (q.chapters && q.chapters.filter(c => !c.isAll)) || [];
        const chaptersCount = individualChapters.length;

        return `
          <div class="quiz-card" data-quiz-id="${q.id}">
            <div>
              <div class="quiz-card-header">
                <span class="quiz-card-category" style="color: ${q.categoryColor || '#0284c7'}; background: ${q.categoryColor ? q.categoryColor + '18' : 'rgba(2, 132, 199, 0.1)'};">
                  ${q.category || 'آزمون تخصصی'}
                </span>
                <span class="quiz-card-badge">${q.badge || `${q.totalQuestions} سوال`}</span>
              </div>
              <h3 class="quiz-card-title">${q.title}</h3>
              <p class="quiz-card-desc">${q.description}</p>
            </div>
            <div>
              <div class="quiz-card-meta">
                <div class="quiz-card-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>${chaptersCount} سرفصل و مبحث آموزشی</span>
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
                <button type="button" class="btn-open-course" onclick="window.medicalQuiz.openCourseTopics('${q.id}')">
                  <span>مشاهده سرفصل‌ها و ورود به آزمون</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
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
        const storedAnswers = this.loadStoredAnswers(ch.id);
        const answeredCount = Object.keys(storedAnswers).length;
        const hasProgress = answeredCount > 0;
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
                ${hasProgress ? `<span style="color: var(--accent-primary); font-weight: 700;">✓ ${answeredCount} پاسخ داده شده</span>` : ''}
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

      // Render Options
      const showFeedback = (this.mode === 'study' && isAnswered) || this.isSubmitted;
      let optionsHtml = '';

      q.options.forEach(opt => {
        const optKey = opt.key;
        let optClasses = ['quiz-option'];

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

        optionsHtml += `
          <button type="button" class="${optClasses.join(' ')}" data-option-key="${optKey}">
            <span class="quiz-option-key">${optKey}</span>
            <span class="quiz-option-text">${this.escapeHtml(opt.text)}</span>
            ${statusIconHtml}
          </button>
        `;
      });

      this.dom.optionsList.innerHTML = optionsHtml;

      // Attach option click listeners
      this.dom.optionsList.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-option-key');
          this.handleOptionSelection(key);
        });
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

    renderExplanationCard(question) {
      const exp = question.detailed_explanation || {};
      const rationale = exp.rationale || "توضیحاتی برای این گزینه ثبت نشده است.";
      const distractors = this.getDistractorsList(exp.distractors_correction);

      // Rationale Box
      if (this.dom.rationaleBox) {
        this.dom.rationaleBox.textContent = rationale;
      }

      // Distractors Breakdown
      if (this.dom.distractorsList) {
        let distractorsHtml = '';

        if (distractors.length > 0) {
          distractors.forEach(item => {
            distractorsHtml += `
              <div class="distractor-item">
                <div class="distractor-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>تحلیل گزینه [${item.key}]: علت رد و نکته تستی</span>
                </div>
                <p class="distractor-text">${this.escapeHtml(item.text)}</p>
              </div>
            `;
          });
        } else {
          distractorsHtml = '<div style="font-size: 13px; color: var(--text-muted); padding: 8px 0;">تحلیل تفکیک‌شده‌ای برای سایر گزینه‌ها موجود نیست.</div>';
        }

        this.dom.distractorsList.innerHTML = distractorsHtml;
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

            <div class="quiz-explanation-card" style="display: block; margin-block-start: var(--space-3);">
              <div class="rationale-container">
                <div class="rationale-label">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>تحلیل گزینه صحیح (${q.correct_answer}) و مبانی علمی:</span>
                </div>
                <p class="rationale-text">${this.escapeHtml(exp.rationale || '')}</p>
              </div>

              ${(() => {
                const distList = this.getDistractorsList(exp.distractors_correction);
                if (distList.length === 0) return '';
                return `
                  <div class="distractors-container">
                    <div class="distractors-label">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <span>بررسی دام‌های تستی و علت رد سایر گزینه‌ها:</span>
                    </div>
                    ${distList.map(d => `
                      <div class="distractor-item">
                        <div class="distractor-header">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                          <span>رد گزینه [${d.key}]:</span>
                        </div>
                        <p class="distractor-text">${this.escapeHtml(d.text)}</p>
                      </div>
                    `).join('')}
                  </div>
                `;
              })()}
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
      this.saveState();
      
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
      if (this.dom.activeView.style.display !== 'block') return;

      if (e.key === 'ArrowLeft') {
        // Next in RTL
        this.goToNextQuestion();
      } else if (e.key === 'ArrowRight') {
        // Prev in RTL
        this.goToPrevQuestion();
      } else if (e.key === 'f' || e.key === 'F' || e.key === 'ب') {
        this.toggleFlagCurrent();
      } else if (e.key === 'Escape') {
        this.closeCourseDropdown();
        this.closeMatrixModal();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const num = parseInt(e.key, 10);
        const q = this.filteredQuestions && this.filteredQuestions[this.currentIndex];
        if (q && q.options && q.options[num - 1]) {
          this.handleOptionSelection(q.options[num - 1].key);
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const letter = e.key.toUpperCase();
        const q = this.filteredQuestions && this.filteredQuestions[this.currentIndex];
        if (q && q.options) {
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
