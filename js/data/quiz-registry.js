/**
 * MEDICAL STUDY WEBAPP - MODULAR QUIZ REGISTRY (معماری رجیستری بانک سوالات)
 * 
 * Provides a modular, extensible registry for medical quiz banks.
 * New quizzes are registered dynamically when JSON files are provided.
 */

(function () {
  'use strict';

  // Initial registered major quiz modules with their chapters
  const INITIAL_QUIZZES = [
    {
      id: 'ncd',
      title: 'بانک جامع سوالات بیماری‌های غیرواگیر (NCDs)',
      shortTitle: 'بیماری‌های غیرواگیر',
      category: 'بیماری‌های غیرواگیر',
      categoryColor: '#0284c7',
      description: 'مجموعه سوالات تخصصی و تحلیلی بر اساس راهنماهای بالینی، سند ملی افق ۱۴۰۴ و بسته خدمت کشوری Ira-PEN.',
      chapters: [
        {
          id: 'ncd-all',
          title: 'همه مباحث (آزمون جامع بیماری‌های غیرواگیر)',
          shortTitle: 'آزمون جامع غیرواگیر',
          badge: '۲۹۵ سوال',
          totalQuestions: 295,
          estimatedMinutes: 240,
          isAll: true
        },
        {
          id: 'ncd-student-exam-1',
          title: '⭐ بخش اول سوالات تالیفی دانشجویان (تب روماتیسمی، ریزمغذی‌ها و تیروئید نوزادان)',
          shortTitle: 'تالیفی ۱: تب روماتیسمی، ریزمغذی‌ها، تیروئید',
          badge: '⭐ ۳۰ سوال (طرح کلاسی)',
          totalQuestions: 30,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/ncd_student_exam_part1_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_STUDENT_EXAM_PART1_DATA)) ? window.NCD_STUDENT_EXAM_PART1_DATA : [],
          isSpecialExam: true,
          specialTag: '⭐ سوالات تالیف کلاسی (احتمال بالای آزمون)',
          description: 'مجموعه ۳۰ سوال کلیدی طرح‌شده توسط دانشجویان تحویل شده به استاد جهت آزمون؛ شامل اپیدمیولوژی و پاتوژنز تب روماتیسمی، اختلالات تغذیه‌ای و گرسنگی پنهان، و غربالگری کم‌کاری مادرزادی تیروئید.'
        },
        {
          id: 'ncd-student-exam-2',
          title: '⭐ بخش دوم سوالات تالیفی دانشجویان (مبانی غیرواگیر، هرم سلامت و سطوح پیشگیری)',
          shortTitle: 'تالیفی ۲: مبانی، هرم سلامت، سطوح پیشگیری',
          badge: '⭐ ۲۴ سوال (طرح کلاسی)',
          totalQuestions: 24,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_student_exam_part2_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_STUDENT_EXAM_PART2_DATA)) ? window.NCD_STUDENT_EXAM_PART2_DATA : [],
          isSpecialExam: true,
          specialTag: '⭐ سوالات تالیف کلاسی (احتمال بالای آزمون)',
          description: 'مجموعه ۲۴ سوال تحلیلی طرح‌شده توسط دانشجویان؛ شامل ویژگی‌ها و بار بیماری‌های مزمن، مدل‌های سلامت، هرم سلامت فریدن و تفکیک سطوح پیشگیری مقدماتی، ۱، ۲، ۳ و ۴.'
        },
        {
          id: 'ncd-ihd-irapen',
          title: '۱. بیماری‌های ایسکمیک قلب (IHD) و برنامه ملی Ira-PEN',
          shortTitle: 'ایسکمی قلب و Ira-PEN',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_ihd_irapen_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_IHD_IRAPEN_DATA)) ? window.NCD_IHD_IRAPEN_DATA : []
        },
        {
          id: 'ncd-obesity',
          title: '۲. اپیدمیولوژی، ارزیابی بالینی و مدیریت چاقی',
          shortTitle: 'ارزیابی و مدیریت چاقی',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_obesity_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_OBESITY_DATA)) ? window.NCD_OBESITY_DATA : []
        },
        {
          id: 'ncd-cancer',
          title: '۳. اپیدمیولوژی، کنترل و برنامه ملی ثبت سرطان',
          shortTitle: 'کنترل و ثبت سرطان',
          badge: '۱۶ سوال',
          totalQuestions: 16,
          estimatedMinutes: 20,
          fileUrl: './data/quizzes/ncd_cancer_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_CANCER_DATA)) ? window.NCD_CANCER_DATA : []
        },
        {
          id: 'ncd-stroke',
          title: '۴. مدیریت جامع سکته مغزی حاد و برنامه ملی «کد سما»',
          shortTitle: 'سکته مغزی و کد سما',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_stroke_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_STROKE_DATA)) ? window.NCD_STROKE_DATA : []
        },
        {
          id: 'ncd-mental-health',
          title: '۵. اپیدمیولوژی سلامت روان، اختلال افسردگی و پیشگیری از خودکشی',
          shortTitle: 'سلامت روان و خودکشی',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_mental_health_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_MENTAL_HEALTH_DATA)) ? window.NCD_MENTAL_HEALTH_DATA : []
        },
        {
          id: 'ncd-diabetes',
          title: '۶. اپیدمیولوژی دیابت، چارچوب خدمات (NSF) و نقشه تحول نظام سلامت',
          shortTitle: 'دیابت، چارچوب NSF و تحول سلامت',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_diabetes_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_DIABETES_DATA)) ? window.NCD_DIABETES_DATA : []
        },
        {
          id: 'ncd-substance-abuse',
          title: '۷. اپیدمیولوژی، بار بیماری و پیشگیری از اعتیاد و سوءمصرف مواد',
          shortTitle: 'اعتیاد و سوءمصرف مواد',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_substance_abuse_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_SUBSTANCE_ABUSE_DATA)) ? window.NCD_SUBSTANCE_ABUSE_DATA : []
        },
        {
          id: 'ncd-cancer-pathobiology',
          title: '۸. پاتوبیولوژی تومور، غربالگری و نظام جامع ثبت سرطان',
          shortTitle: 'پاتوبیولوژی و ثبت سرطان',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_cancer_pathobiology_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_CANCER_PATHOBIOLOGY_DATA)) ? window.NCD_CANCER_PATHOBIOLOGY_DATA : []
        },
        {
          id: 'ncd-hypertension',
          title: '۹. اپیدمیولوژی، پاتوفیزیولوژی و کنترل پرفشاری خون (Hypertension)',
          shortTitle: 'پرفشاری خون (فشار خون)',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_hypertension_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_HYPERTENSION_DATA)) ? window.NCD_HYPERTENSION_DATA : []
        },
        {
          id: 'ncd-tobacco-control',
          title: '۱۰. اپیدمیولوژی، الگوهای مصرف و کنترل دخانیات (سیگار و قلیان)',
          shortTitle: 'کنترل دخانیات و قلیان',
          badge: '۲۵ سوال',
          totalQuestions: 25,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/ncd_tobacco_control_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.NCD_TOBACCO_CONTROL_DATA)) ? window.NCD_TOBACCO_CONTROL_DATA : []
        }
      ]
    }
  ];

  class QuizRegistryService {
    constructor() {
      this.quizzes = [...INITIAL_QUIZZES];
      this.questionsCache = new Map();

      // Prepopulate cache from fallback questions of chapters
      this.quizzes.forEach(q => {
        if (q.chapters && Array.isArray(q.chapters)) {
          q.chapters.forEach(ch => {
            if (ch.fallbackQuestions && Array.isArray(ch.fallbackQuestions) && ch.fallbackQuestions.length > 0) {
              this.questionsCache.set(ch.id, ch.fallbackQuestions);
              ch.totalQuestions = ch.fallbackQuestions.length;
              ch.badge = `${ch.fallbackQuestions.length} سوال`;
            }
          });
        } else if (q.fallbackQuestions && Array.isArray(q.fallbackQuestions) && q.fallbackQuestions.length > 0) {
          this.questionsCache.set(q.id, q.fallbackQuestions);
          q.totalQuestions = q.fallbackQuestions.length;
          q.badge = `${q.fallbackQuestions.length} سوال`;
        }
      });
    }

    /**
     * Get all registered quizzes that have questions
     */
    getAllQuizzes() {
      return this.quizzes.map(q => {
        if (q.chapters && Array.isArray(q.chapters)) {
          const individual = q.chapters.filter(c => !c.isAll);
          let sum = 0;
          individual.forEach(c => {
            const cached = this.questionsCache.get(c.id);
            const count = (cached && cached.length) || c.totalQuestions || (c.fallbackQuestions && c.fallbackQuestions.length) || 0;
            sum += count;
          });
          q.totalQuestions = sum;
          q.totalChapters = individual.length;
          q.badge = `${sum} سوال در ${individual.length} مبحث`;

          // Update 'all' chapter count and badge
          const allCh = q.chapters.find(c => c.isAll);
          if (allCh) {
            allCh.totalQuestions = sum;
            allCh.badge = `${sum} سوال`;
          }
        }
        return q;
      }).filter(q => (q.totalQuestions || 0) > 0);
    }

    /**
     * Get single quiz or chapter metadata by ID
     */
    getQuizById(id) {
      for (const q of this.quizzes) {
        if (q.id === id) return q;
        if (q.chapters && Array.isArray(q.chapters)) {
          const ch = q.chapters.find(c => c.id === id);
          if (ch) {
            return {
              ...ch,
              category: q.category,
              categoryColor: q.categoryColor,
              parentQuizId: q.id
            };
          }
        }
      }
      return null;
    }

    /**
     * Set questions for a quiz or chapter
     */
    setQuizQuestions(quizId, questions) {
      if (!Array.isArray(questions) || questions.length === 0) return false;
      this.questionsCache.set(quizId, questions);
      const quiz = this.getQuizById(quizId);
      if (quiz) {
        quiz.totalQuestions = questions.length;
        quiz.badge = `${questions.length} سوال`;
        quiz.fallbackQuestions = questions;
      }
      return true;
    }

    /**
     * Register a new quiz dynamically
     */
    registerQuiz(quizConfig) {
      if (!quizConfig || !quizConfig.id) {
        console.error("Quiz configuration must have an id");
        return false;
      }
      
      const existingIdx = this.quizzes.findIndex(q => q.id === quizConfig.id);
      if (existingIdx >= 0) {
        this.quizzes[existingIdx] = { ...this.quizzes[existingIdx], ...quizConfig };
      } else {
        this.quizzes.push(quizConfig);
      }

      if (quizConfig.questions && Array.isArray(quizConfig.questions) && quizConfig.questions.length > 0) {
        this.questionsCache.set(quizConfig.id, quizConfig.questions);
        quizConfig.totalQuestions = quizConfig.questions.length;
        quizConfig.badge = `${quizConfig.questions.length} سوال`;
      }

      return true;
    }

    /**
     * Load questions for a specific quiz, chapter, or combined all
     */
    async loadQuestions(quizId) {
      // 0. Array or comma-separated list of chapters
      if (Array.isArray(quizId)) {
        const arrays = await Promise.all(quizId.map(id => this.loadQuestions(id)));
        return arrays.flat();
      }
      if (typeof quizId === 'string' && quizId.includes(',')) {
        const ids = quizId.split(',').map(s => s.trim()).filter(Boolean);
        const arrays = await Promise.all(ids.map(id => this.loadQuestions(id)));
        return arrays.flat();
      }

      // 1. Combined all questions for a course (e.g. 'ncd-all' or 'ncd')
      if (quizId === 'ncd-all' || quizId === 'ncd') {
        if (this.questionsCache.has('ncd-all')) {
          const cached = this.questionsCache.get('ncd-all');
          if (cached && cached.length > 0) return cached;
        }

        const ncdQuiz = this.getQuizById('ncd');
        if (ncdQuiz && ncdQuiz.chapters) {
          const individual = ncdQuiz.chapters.filter(c => !c.isAll);
          const arrays = await Promise.all(individual.map(c => this.loadQuestions(c.id)));
          const combined = arrays.flat();
          if (combined.length > 0) {
            this.questionsCache.set('ncd-all', combined);
            return combined;
          }
        }
      }

      const quiz = this.getQuizById(quizId);
      if (!quiz) {
        throw new Error(`آزمونی با شناسه "${quizId}" یافت نشد.`);
      }

      // Check memory cache first
      if (this.questionsCache.has(quizId)) {
        const cached = this.questionsCache.get(quizId);
        if (cached && cached.length > 0) {
          quiz.totalQuestions = cached.length;
          quiz.badge = `${cached.length} سوال`;
          return cached;
        }
      }

      // Try fetching from fileUrl
      if (quiz.fileUrl) {
        try {
          const response = await fetch(quiz.fileUrl);
          if (response.ok) {
            const data = await response.json();
            const questions = Array.isArray(data) ? data : (data && Array.isArray(data.questions) ? data.questions : []);
            if (questions.length > 0) {
              this.questionsCache.set(quizId, questions);
              quiz.totalQuestions = questions.length;
              quiz.badge = `${questions.length} سوال`;
              return questions;
            }
          }
        } catch (fetchErr) {
          console.warn(`Fetch for quiz ${quizId}:`, fetchErr.message);
        }
      }

      // Use embedded fallback if available
      if (quiz.fallbackQuestions && Array.isArray(quiz.fallbackQuestions) && quiz.fallbackQuestions.length > 0) {
        this.questionsCache.set(quizId, quiz.fallbackQuestions);
        quiz.totalQuestions = quiz.fallbackQuestions.length;
        quiz.badge = `${quiz.fallbackQuestions.length} سوال`;
        return quiz.fallbackQuestions;
      }

      return [];
    }

    /**
     * Extract unique topics from questions array
     */
    extractTopics(questions) {
      if (!Array.isArray(questions)) return [];
      const topicMap = new Map();
      questions.forEach(q => {
        const t = (q.topic || 'عمومی').trim();
        topicMap.set(t, (topicMap.get(t) || 0) + 1);
      });
      return Array.from(topicMap.entries()).map(([topic, count]) => ({ topic, count }));
    }
  }

  // Export globally
  window.QuizRegistry = new QuizRegistryService();
  window.QUIZ_REGISTRY = window.QuizRegistry.getAllQuizzes();
})();
