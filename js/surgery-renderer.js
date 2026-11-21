/**
 * SURGERY LIGHTWEIGHT COMPONENT RENDERER
 * Renders pre-compiled Surgery chapters without loading the 615 KB non-surgery component bundle.
 */

window.ComponentRenderer = {
  renderChapter: function (chapter, container) {
    if (!chapter || !container) return;

    var isExamActive = false;
    try {
      isExamActive = window.StudyFeatures && typeof window.StudyFeatures.isExamCramModeActive === 'function'
        ? window.StudyFeatures.isExamCramModeActive()
        : (localStorage.getItem('medicalism_exam_cram_mode') === 'true');
    } catch (e) {
      isExamActive = false;
    }

    var hasExamSummary = Boolean(chapter.examSummaryHtml);
    var sectionsList = Array.isArray(chapter.sections) ? chapter.sections : [];

    var html = '<article class="chapter-article" id="' + chapter.id + '">';

    if (hasExamSummary) {
      html += '' +
        '<div class="chapter-view-mode-bar" id="chapterViewModeBar">' +
          '<div class="view-mode-tabs" role="tablist">' +
            '<button type="button" class="view-mode-tab ' + (!isExamActive ? 'is-active' : '') + '" id="btnTabDetailed" role="tab" aria-selected="' + (!isExamActive) + '" onclick="window.setChapterViewMode ? window.setChapterViewMode(\'detailed\') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>' +
              '<span>📖 درسنامه کامل</span>' +
            '</button>' +
            '<button type="button" class="view-mode-tab ' + (isExamActive ? 'is-active' : '') + '" id="btnTabSummary" role="tab" aria-selected="' + isExamActive + '" onclick="window.setChapterViewMode ? window.setChapterViewMode(\'exam\') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(true, true))">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
              '<span>⚡ حالت آزمون / شب امتحان</span>' +
            '</button>' +
          '</div>' +
          '<div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">' +
            (isExamActive ? '⚡ در حال مطالعه خلاصه آزمونی و مرور سریع' : '📖 در حال مطالعه درسنامه جامع لارنس') +
          '</div>' +
        '</div>';
    }

    var metaTagHtml = '';
    if (chapter.isExam && !chapter.isFlagship) {
      metaTagHtml = '' +
        '<span style="background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); color: #ffffff; padding: 2px 10px; border-radius: var(--radius-full); font-weight: 800; box-shadow: 0 0 12px rgba(236, 72, 153, 0.45);">بخش ویژه کوئیز</span>' +
        '<span>•</span><span>کیس‌های تصویری و شبیه‌ساز بالینی</span><span>•</span><span>' + (chapter.estimatedReadTime || '') + '</span>';
    } else if (chapter.isFlagship) {
      metaTagHtml = '' +
        '<span class="section-heading-badge" style="display:inline-flex;align-items:center;font-size:0.75rem;font-weight:800;padding:2px 10px;border-radius:var(--radius-full);background:var(--accent-primary-subtle);color:var(--accent-primary);border:1px solid var(--border-subtle);">راهنمای جامع OSCE و PMP جراحی</span>' +
        '<span>•</span><span>۳۵ ایستگاه بالینی، کیس‌های PMP و نکات آزمون</span><span>•</span><span>' + (chapter.estimatedReadTime || '') + '</span>';
    } else {
      metaTagHtml = '' +
        '<span>فصل ' + (chapter.number || '') + '</span>' +
        '<span>•</span><span>' + (chapter.totalSections || sectionsList.length) + ' بخش بالینی و اپیدمیولوژیک</span>' +
        '<span>•</span><span>' + (chapter.estimatedReadTime || '') + '</span>';
    }

    html += '' +
      '<div class="detailed-chapter-view" id="detailedChapterView" style="' + (hasExamSummary && isExamActive ? 'display: none;' : '') + '">' +
        '<header class="chapter-hero">' +
          '<div class="chapter-meta-tag">' + metaTagHtml + '</div>' +
          '<h1 class="chapter-title">' + (chapter.title || '') + '</h1>' +
          '<div class="chapter-attribution">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>' +
              '<circle cx="12" cy="7" r="4"></circle>' +
            '</svg>' +
            '<div><strong>مرجع علمی:</strong> ' + (chapter.author || '') + ' — ' + (chapter.authorAffiliation || '') + '</div>' +
          '</div>' +
        '</header>' +
        (chapter.mindMapHtml || '') +
        '<div class="sections-stream">';

    for (var i = 0; i < sectionsList.length; i++) {
      html += this.renderSection(sectionsList[i], chapter.id);
    }

    html += '</div>';

    var isCompleted = false;
    try {
      isCompleted = window.StudyFeatures && typeof window.StudyFeatures.isChapterCompleted === 'function'
        ? window.StudyFeatures.isChapterCompleted(chapter.id)
        : false;
    } catch (e) {
      isCompleted = false;
    }

    html += '' +
      '<div class="chapter-completion-action-bar">' +
        '<button type="button" class="btn-toggle-chapter-completed ' + (isCompleted ? 'is-completed' : '') + '" data-chapter-id="' + chapter.id + '" onclick="window.StudyFeatures && window.StudyFeatures.toggleChapterCompletion(\'' + chapter.id + '\')" aria-label="نشان کردن وضعیت مطالعه فصل">' +
          '<span class="completion-checkbox-box">' + (isCompleted ? '✓' : '') + '</span>' +
          '<span class="completion-text">' + (isCompleted ? 'مطالعه‌شده (ثبت‌شده در کارنامه)' : 'نشان کردن این فصل به عنوان مطالعه‌شده') + '</span>' +
        '</button>' +
      '</div>';

    html += '' +
      '<section class="chapter-quiz-crosslink-card" aria-label="سنجش یادگیری در بانک سوالات">' +
        '<div class="quiz-crosslink-header">' +
          '<div class="quiz-crosslink-icon" aria-hidden="true">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>' +
              '<polyline points="14 2 14 8 20 8"></polyline>' +
              '<line x1="9" y1="15" x2="15" y2="15"></line>' +
            '</svg>' +
          '</div>' +
          '<div class="quiz-crosslink-info">' +
            '<span class="quiz-crosslink-badge">سنجش یادگیری این فصل در بانک سوالات</span>' +
            '<h4 class="quiz-crosslink-title">بانک جامع سوالات و آزمون‌های تحلیلی</h4>' +
            '<p class="quiz-crosslink-desc">شبیه‌ساز آزمون‌های پزشکی، تحلیل سناریوهای بالینی کشوری و کارنامه هوشمند عملکرد</p>' +
          '</div>' +
        '</div>' +
        '<div class="quiz-crosslink-action" style="display: flex; flex-wrap: wrap; gap: 10px;">' +
          '<a href="./quiz.html?course=surgery" class="btn-quiz-crosslink">' +
            '<span>ورود به بانک سوالات جراحی و سنجش یادگیری</span>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);">' +
              '<line x1="5" y1="12" x2="19" y2="12"></line>' +
              '<polyline points="12 5 19 12 12 19"></polyline>' +
            '</svg>' +
          '</a>' +
        '</div>' +
      '</section>';

    var chapters = window.ACTIVE_REGISTRY || window.SURGERY_INDEX || [];
    var currentIndex = -1;
    for (var j = 0; j < chapters.length; j++) {
      if (chapters[j] && chapters[j].id === chapter.id) {
        currentIndex = j;
        break;
      }
    }
    var prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    var nextChapter = (currentIndex >= 0 && currentIndex < chapters.length - 1) ? chapters[currentIndex + 1] : null;

    if (prevChapter || nextChapter) {
      html += '<footer class="chapter-nav-footer"><div class="chapter-nav-cards">';
      if (prevChapter) {
        html += '' +
          '<a href="#' + prevChapter.id + '" class="chapter-nav-card prev-chapter-card" data-chapter-target="' + prevChapter.id + '">' +
            '<div class="card-direction">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
              'فصل قبلی' +
            '</div>' +
            '<div class="card-ch-title">فصل ' + prevChapter.number + ': ' + (prevChapter.shortTitle || prevChapter.title) + '</div>' +
            '<div class="card-meta">' + prevChapter.totalSections + ' بخش • ' + (prevChapter.estimatedReadTime || '') + '</div>' +
          '</a>';
      } else {
        html += '<div></div>';
      }
      if (nextChapter) {
        html += '' +
          '<a href="#' + nextChapter.id + '" class="chapter-nav-card next-chapter-card" data-chapter-target="' + nextChapter.id + '">' +
            '<div class="card-direction">' +
              'فصل بعدی' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
            '</div>' +
            '<div class="card-ch-title">فصل ' + nextChapter.number + ': ' + (nextChapter.shortTitle || nextChapter.title) + '</div>' +
            '<div class="card-meta">' + nextChapter.totalSections + ' بخش • ' + (nextChapter.estimatedReadTime || '') + '</div>' +
          '</a>';
      } else {
        html += '<div></div>';
      }
      html += '</div></footer>';
    }

    html += '</div>';

    if (hasExamSummary) {
      html += '<div class="exam-summary-view" id="examSummaryView" style="' + (isExamActive ? '' : 'display: none;') + '">' + chapter.examSummaryHtml + '</div>';
    }

    html += '</article>';

    container.innerHTML = html;

    try {
      this.bindSectionActions(container);
    } catch (e) {
      console.warn('Section actions bind warning:', e);
    }

    var toggleMindmapBtn = container.querySelector('#btnToggleMindmap, .btn-toggle-mindmap');
    if (toggleMindmapBtn) {
      toggleMindmapBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.toggleMindmapSection === 'function') {
          window.toggleMindmapSection(toggleMindmapBtn);
        }
      });
    }
  },

  renderSection: function (section, chapterId) {
    var isBookmarked = false;
    try {
      isBookmarked = window.appState ? window.appState.isBookmarked(section.id) : false;
    } catch (e) {
      isBookmarked = false;
    }

    var sectionBody = section.contentHtml || '<p>' + (section.summary || '') + '</p>';

    return '' +
      '<section class="study-section" id="' + section.id + '" data-chapter-id="' + chapterId + '">' +
        '<div class="section-header-row">' +
          '<div>' +
            '<h2>' +
              (section.badge ? '<span class="section-heading-badge" style="display: inline-flex; align-items: center; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full); background: rgba(225, 29, 72, 0.12); color: #e11d48; margin-inline-end: 8px; border: 1px solid rgba(225, 29, 72, 0.25); vertical-align: middle;">' + section.badge + '</span>' : '') +
              '<span>' + (section.title || '') + '</span>' +
            '</h2>' +
            (section.latinTitle ? '<div class="brand-subtitle latin-term">' + section.latinTitle + '</div>' : '') +
          '</div>' +
          '<div class="section-actions">' +
            '<button class="action-mini-btn btn-bookmark ' + (isBookmarked ? 'is-bookmarked' : '') + '" data-section-id="' + section.id + '" title="' + (isBookmarked ? 'حذف نشانک' : 'افزودن نشانک') + '" aria-label="نشانک‌گذاری این بخش">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="' + (isBookmarked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' +
            '</button>' +
            '<button class="action-mini-btn btn-copy-link" data-section-id="' + section.id + '" title="کپی لینک مستقیم به این بخش" aria-label="کپی لینک بخش">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="section-content">' + sectionBody + '</div>' +
      '</section>';
  },

  bindSectionActions: function (container) {
    container.querySelectorAll('.btn-bookmark').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var secId = btn.getAttribute('data-section-id');
        if (window.appState && secId) {
          var isAdded = window.appState.toggleBookmark(secId);
          btn.classList.toggle('is-bookmarked', isAdded);
          btn.setAttribute('title', isAdded ? 'حذف نشانک' : 'افزودن نشانک');
          var svg = btn.querySelector('svg');
          if (svg) svg.setAttribute('fill', isAdded ? 'currentColor' : 'none');
          if (typeof window.showToast === 'function') {
            window.showToast(isAdded ? 'بخش به نشانک‌ها اضافه شد' : 'بخش از نشانک‌ها حذف شد');
          }
        }
      });
    });

    container.querySelectorAll('.btn-copy-link').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var secId = btn.getAttribute('data-section-id');
        var url = window.location.origin + window.location.pathname + '#' + secId;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            if (typeof window.showToast === 'function') window.showToast('لینک بخش در کلیپ‌بورد کپی شد');
          }).catch(function () {
            if (typeof window.showToast === 'function') window.showToast('آدرس مستقیم: #' + secId);
          });
        } else if (typeof window.showToast === 'function') {
          window.showToast('آدرس مستقیم: #' + secId);
        }
      });
    });

    container.querySelectorAll('.chapter-nav-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        var chTarget = card.getAttribute('data-chapter-target');
        if (chTarget && window.appState) {
          window.appState.setActiveChapter(chTarget);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          history.pushState(null, null, '#' + chTarget);
        }
      });
    });
  }
};

window.applyOSCEFilter = function (filterType) {
  var container = document.getElementById('chapterContentArea') || document.getElementById('main-content') || document.body;
  var filterBar = document.getElementById('osceQuickFilterBar');
  if (!filterBar) return;

  filterBar.querySelectorAll('.osce-filter-btn').forEach(function (btn) {
    btn.classList.toggle('is-active', btn.getAttribute('data-filter') === filterType);
  });

  var countEl = document.getElementById('osceFilterActiveCount');
  var sections = container.querySelectorAll('.study-section[data-chapter-id="surg-osce-pmp"]');

  if (filterType === 'all') {
    sections.forEach(function (sec) {
      sec.style.display = '';
      sec.querySelectorAll('[data-card-type], .osce-general-block, .osce-intro-block, .branch-card').forEach(function (el) {
        el.style.display = '';
      });
    });
    if (countEl) countEl.textContent = 'نمایش ۱۰۰٪ محتوای بسته جامع آزمون (۳۵ ایستگاه)';
    return;
  }

  var totalVisibleItems = 0;

  sections.forEach(function (sec) {
    var hasMatch = false;
    var cards = sec.querySelectorAll('.case-vignette-card, .epmp-positive-box, .epmp-negative-box, .order-sheet-card, .stagery-topic-card, .osce-part-card, .osce-table-wrapper, .branch-card, .osce-intro-block, .osce-general-block');

    cards.forEach(function (card) {
      var matches = false;
      var cardType = card.getAttribute('data-card-type');

      if (filterType === 'cases') {
        if (card.classList.contains('case-vignette-card') || cardType === 'case' ||
            card.classList.contains('epmp-positive-box') || card.classList.contains('epmp-negative-box') ||
            card.classList.contains('branch-card')) {
          matches = true;
        }
      } else if (filterType === 'negative') {
        if (card.classList.contains('epmp-negative-box') || cardType === 'negative-trap') {
          matches = true;
        }
      } else if (filterType === 'orders') {
        if (card.classList.contains('order-sheet-card') || cardType === 'order') {
          matches = true;
        }
      } else if (filterType === 'tables') {
        if (card.classList.contains('osce-table-wrapper') || cardType === 'table' ||
            card.classList.contains('stagery-topic-card') || cardType === 'stagery') {
          matches = true;
        }
      }

      if (matches) {
        card.style.display = '';
        hasMatch = true;
        totalVisibleItems++;
      } else {
        card.style.display = 'none';
      }
    });

    sec.style.display = hasMatch ? '' : 'none';
  });

  if (countEl) {
    if (filterType === 'cases') {
      countEl.innerHTML = '<span style="color: #4f46e5; font-weight: 800;">🖥️ ' + totalVisibleItems + ' سناریو و اقدام بالینی در کیس‌های PMP و KF</span>';
    } else if (filterType === 'negative') {
      countEl.innerHTML = '<span style="color: #e11d48; font-weight: 800;">⛔ ' + totalVisibleItems + ' تله نمره منفی در EPMP (مرور سریع ۲ دقیقه‌ای)</span>';
    } else if (filterType === 'orders') {
      countEl.innerHTML = '<span style="color: #d97706; font-weight: 800;">📝 ' + totalVisibleItems + ' برگه اوردر استاندارد بیمارستانی</span>';
    } else if (filterType === 'tables') {
      countEl.innerHTML = '<span style="color: #0f766e; font-weight: 800;">📊 ' + totalVisibleItems + ' جدول مقایسه‌ای و مبحث های‌یلد استاجری</span>';
    }
  }
};
