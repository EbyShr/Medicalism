/**
 * MEDICAL STUDY WEBAPP - COMPONENT RENDERER
 * Multi-chapter support:
 * - Chapter 1: اپیدمیولوژی، سیر بالینی و راهبردهای مهار عفونت HIV/AIDS (11 sections)
 * - Chapter 2: گزارش جامع بالینی و اپیدمیولوژیک سل (Tuberculosis) (7 sections)
 */

window.ComponentRenderer = {
  /**
   * Renders the complete chapter content into the reading container
   */
  renderChapter(chapter, container) {
    if (!chapter || !container) return;

    let html = `
      <article class="chapter-article" id="${chapter.id}">
        <!-- Chapter Hero Banner -->
        <header class="chapter-hero">
          <div class="chapter-meta-tag">
            <span>فصل ${chapter.number}</span>
            <span>•</span>
            <span>${chapter.totalSections} بخش بالینی و اپیدمیولوژیک</span>
            <span>•</span>
            <span>${chapter.estimatedReadTime}</span>
          </div>
          <h1 class="chapter-title">${chapter.title}</h1>
          <div class="chapter-attribution">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>
              <strong>مرجع علمی:</strong> ${chapter.author} — ${chapter.authorAffiliation}
            </div>
          </div>
        </header>

        <!-- Sections Stream -->
        <div class="sections-stream">
    `;

    chapter.sections.forEach(section => {
      html += this.renderSection(section, chapter.id);
    });

    html += `
        </div>
    `;

    // Chapter Navigation Footer (Progression between chapters)
    const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
    const currentIndex = chapters.findIndex(c => c.id === chapter.id);
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    if (prevChapter || nextChapter) {
      html += `
        <footer class="chapter-nav-footer">
          <div class="chapter-nav-cards">
            ${prevChapter ? `
              <a href="#${prevChapter.id}" class="chapter-nav-card prev-chapter-card" data-chapter-target="${prevChapter.id}">
                <div class="card-direction">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(180deg);"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  فصل قبلی
                </div>
                <div class="card-ch-title">فصل ${prevChapter.number}: ${prevChapter.shortTitle || prevChapter.title}</div>
                <div class="card-meta">${prevChapter.totalSections} بخش • ${prevChapter.estimatedReadTime}</div>
              </a>
            ` : '<div></div>'}
            ${nextChapter ? `
              <a href="#${nextChapter.id}" class="chapter-nav-card next-chapter-card" data-chapter-target="${nextChapter.id}">
                <div class="card-direction">
                  فصل بعدی
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
                <div class="card-ch-title">فصل ${nextChapter.number}: ${nextChapter.shortTitle || nextChapter.title}</div>
                <div class="card-meta">${nextChapter.totalSections} بخش • ${nextChapter.estimatedReadTime}</div>
              </a>
            ` : '<div></div>'}
          </div>
        </footer>
      `;
    }

    html += `
      </article>
    `;

    container.innerHTML = html;
    this.bindSectionActions(container);
    if (window.RadiologyModule && typeof window.RadiologyModule.bindContainerEvents === 'function') {
      window.RadiologyModule.bindContainerEvents(container);
    }
  },

  /**
   * Renders an individual section with its specialized educational view
   */
  renderSection(section, chapterId) {
    const isBookmarked = window.appState ? window.appState.isBookmarked(section.id) : false;

    let sectionBody = '';

    if (chapterId === 'ch-01') {
      sectionBody = this.renderChapter1Section(section);
    } else if (chapterId === 'ch-02') {
      sectionBody = this.renderChapter2Section(section);
    } else if (chapterId === 'ch-03') {
      sectionBody = this.renderChapter3Section(section);
    } else if (chapterId === 'ch-04') {
      sectionBody = this.renderChapter4Section(section);
    } else if (chapterId === 'ch-05') {
      sectionBody = this.renderChapter5Section(section);
    } else if (chapterId === 'ch-06') {
      sectionBody = this.renderChapter6Section(section);
    } else if (chapterId === 'ch-07') {
      sectionBody = this.renderChapter7Section(section);
    } else if (chapterId === 'ch-08') {
      sectionBody = this.renderChapter8Section(section);
    } else if (chapterId === 'ch-09') {
      sectionBody = this.renderChapter9Section(section);
    } else if (chapterId === 'ch-10') {
      sectionBody = this.renderChapter10Section(section);
    } else if (chapterId === 'ch-11') {
      sectionBody = this.renderChapter11Section(section);
    } else if (chapterId === 'ch-12') {
      sectionBody = this.renderChapter12Section(section);
    } else if (chapterId === 'ch-13') {
      sectionBody = this.renderChapter13Section(section);
    } else if (chapterId === 'ch-14') {
      sectionBody = this.renderChapter14Section(section);
    } else if (chapterId === 'ch-15') {
      sectionBody = this.renderChapter15Section(section);
    } else if (chapterId === 'ch-16') {
      sectionBody = this.renderChapter16Section(section);
    } else if (chapterId === 'ch-17') {
      sectionBody = this.renderChapter17Section(section);
    } else if (chapterId === 'ch-18') {
      sectionBody = this.renderChapter18Section(section);
    } else if (chapterId === 'ch-19') {
      sectionBody = this.renderChapter19Section(section);
    } else if (chapterId === 'ch-20') {
      sectionBody = this.renderChapter20Section(section);
    } else if (chapterId === 'ch-22') {
      sectionBody = this.renderChapter22Section(section);
    } else if (chapterId === 'ch-23') {
      sectionBody = this.renderChapter23Section(section);
    } else if (chapterId === 'ch-24') {
      sectionBody = this.renderChapter24Section(section);
    } else if (chapterId === 'ch-25') {
      sectionBody = this.renderChapter25Section(section);
    } else if (chapterId === 'ch-26') {
      sectionBody = this.renderChapter26Section(section);
    } else if (chapterId === 'ch-27') {
      sectionBody = this.renderChapter27Section(section);
    } else if (chapterId === 'ch-28') {
      sectionBody = this.renderChapter28Section(section);
    } else if (chapterId === 'ch-29') {
      sectionBody = this.renderChapter29Section(section);
    } else if (chapterId === 'ch-30') {
      sectionBody = this.renderChapter30Section(section);
    } else if (chapterId === 'ch-31') {
      sectionBody = this.renderChapter31Section(section);
    } else if (chapterId === 'ch-32' || chapterId === 'rad-ch01') {
      sectionBody = this.renderChapter32Section(section, chapterId);
    } else {
      sectionBody = `<p>${section.summary || ''}</p>`;
    }

    return `
      <section class="study-section" id="${section.id}" data-chapter-id="${chapterId}">
        <div class="section-header-row">
          <div>
            <h2 style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
              <span>${section.title}</span>
              <span class="section-id-badge" data-id="${section.id}" title="شناسه بخش در مانیفست تصاویر (کلیک جهت کپی)">#${section.id}</span>
            </h2>
            ${section.latinTitle ? `<div class="brand-subtitle latin-term">${section.latinTitle}</div>` : ''}
          </div>
          <div class="section-actions">
            <button class="action-mini-btn btn-bookmark ${isBookmarked ? 'is-bookmarked' : ''}" 
                    data-section-id="${section.id}" 
                    title="${isBookmarked ? 'حذف نشانک' : 'افزودن نشانک'}" 
                    aria-label="نشانک‌گذاری این بخش">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button class="action-mini-btn btn-copy-link" 
                    data-section-id="${section.id}" 
                    title="کپی لینک مستقیم به این بخش" 
                    aria-label="کپی لینک بخش">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="section-content">
          ${sectionBody}
        </div>
      </section>
    `;
  },

  /* =========================================================================
     CHAPTER 1 RENDERERS (HIV/AIDS)
     ========================================================================= */
  renderChapter1Section(section) {
    switch (section.number) {
      case 1: return this.renderCh1Sec1(section);
      case 2: return this.renderCh1Sec2(section);
      case 3: return this.renderCh1Sec3(section);
      case 4: return this.renderCh1Sec4(section);
      case 5: return this.renderCh1Sec5(section);
      case 6: return this.renderCh1Sec6(section);
      case 7: return this.renderCh1Sec7(section);
      case 8: return this.renderCh1Sec8(section);
      case 9: return this.renderCh1Sec9(section);
      case 10: return this.renderCh1Sec10(section);
      case 11: return this.renderCh1Sec11(section);
      default: return `<p>${section.summary || ''}</p>`;
    }
  },

  renderCh1Sec1(sec) {
    let items = sec.points.map(p => `
      <li style="margin-block-end: var(--space-3);">
        <strong>${p.label}:</strong> ${p.text}
      </li>
    `).join('');
    return `
      <p>ویروس نقص ایمنی انسانی (<span class="latin-term">HIV</span>) یک رتروویروس حاوی RNA با سیر بیماری‌زایی مزمن و بسیار کند است:</p>
      <ul>${items}</ul>
      <div class="medical-callout callout-info">
        <div class="callout-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <div class="callout-content">
          <p><strong>نتیجه بالینی نهایی:</strong> تضعیف پیشرونده سیستم ایمنی که زمینه را برای بروز عفونت‌های فرصت‌طلب (<span class="latin-term">Opportunistic Infections</span>) و بدخیمی‌های نادر فراهم می‌کند.</p>
        </div>
      </div>
    `;
  },

  renderCh1Sec2(sec) {
    let tableRows = sec.tableData.map(row => `
      <tr>
        <td><strong>${row.stage}</strong></td>
        <td><strong>${row.name}</strong></td>
        <td>${row.features}</td>
        <td>${row.epidemiology}</td>
      </tr>
    `).join('');
    let cards = sec.tableData.map((row, idx) => `
      <div class="stage-step-card stage-${idx + 1}">
        <div class="stage-header">
          <div class="stage-title">${row.name}</div>
          <div class="stage-badge">${row.stage}</div>
        </div>
        <div class="stage-grid">
          <div class="stage-info-block">
            <div class="stage-info-label">ویژگی‌های ایمونولوژیک و بالینی</div>
            <div class="stage-info-value">${row.features}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label">وضعیت انتقال و پایش</div>
            <div class="stage-info-value">${row.epidemiology}</div>
          </div>
        </div>
      </div>
    `).join('');
    return `
      <p>سیر بیماری با پایش زمان در برابر افت شمارش سلول‌های <span class="latin-term">CD4+</span> ارزیابی می‌شود:</p>
      <div class="natural-history-container">${cards}</div>
      <div class="table-scroll-container">
        <table class="medical-table">
          <thead><tr><th>مرحله</th><th>نام مرحله بالینی</th><th>ویژگی‌های ایمونولوژیک و بالینی</th><th>وضعیت انتقال و پایش</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    `;
  },

  renderCh1Sec3(sec) {
    let routesHtml = sec.routes.map((r, i) => `
      <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start: 3px solid var(--accent-primary);">
        <div class="stage-info-label" style="color: var(--text-primary); font-size: var(--font-size-sm);">${i + 1}. ${r.title}</div>
        <div class="stage-info-value">${r.desc}</div>
      </div>
    `).join('');
    let factorsHtml = sec.facilitatingFactors.map(f => `<li>${f}</li>`).join('');
    return `
      <h3 style="margin-block-end: var(--space-3);">مسیرهای سرایت</h3>
      ${routesHtml}
      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">عوامل تسهیل‌کننده و تشدیدکننده انتقال</h3>
      <ul>${factorsHtml}</ul>
      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">پدیده دوره پنجره (Window Period)</h3>
      <div class="medical-callout callout-warning">
        <div class="callout-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        </div>
        <div class="callout-content">
          <p><strong>تعریف:</strong> ${sec.windowPeriod.definition}</p>
          <p style="margin-block-start: var(--space-2);"><strong>اهمیت بالینی:</strong> ${sec.windowPeriod.significance}</p>
        </div>
      </div>
    `;
  },

  renderCh1Sec4(sec) {
    let defsHtml = sec.caseDefinitions.map(d => {
      let crit = d.criteria ? `<ol style="margin-block-start: var(--space-2); padding-inline-start: var(--space-5);">${d.criteria.map(c => `<li>${c}</li>`).join('')}</ol>` : '';
      return `<div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start: 3px solid var(--accent-secondary);"><div class="stage-info-label" style="color: var(--text-primary); font-size: var(--font-size-sm);">${d.title}</div><div class="stage-info-value">${d.desc}</div>${crit}</div>`;
    }).join('');
    let fiveCsHtml = sec.fiveCs.map(c => `<div class="ethics-card"><div class="ethics-num-badge">${c.id}</div><div class="ethics-card-body"><div class="ethics-card-title">${c.title}</div><div class="ethics-card-latin">${c.latin}</div><div class="ethics-card-text">${c.desc}</div></div></div>`).join('');
    let modalitiesHtml = sec.modalities.map(m => `<div class="stage-info-block" style="margin-block-end: var(--space-3);"><div class="stage-info-label" style="font-size: var(--font-size-sm); color: var(--accent-primary);">${m.name}</div><div class="stage-info-value" style="margin-block-start: 4px;">${m.desc}</div></div>`).join('');
    return `
      <h3 style="margin-block-end: var(--space-3);">تعریف تشخیصی مورد (Case Definition)</h3>
      ${defsHtml}
      <h3 style="margin-block-start: var(--space-8); margin-block-end: var(--space-3);">ارکان پنج‌گانه اخلاقی انجام آزمایش (5 Cs of Testing)</h3>
      <div class="ethics-5c-grid">${fiveCsHtml}</div>
      <h3 style="margin-block-start: var(--space-8); margin-block-end: var(--space-3);">روش‌های آزمایشگاهی ارزیابی</h3>
      ${modalitiesHtml}
    `;
  },

  renderCh1Sec5(sec) {
    let levelsCards = sec.levels.map(lvl => `
      <div class="level-card ${lvl.isIran ? 'is-iran' : ''}">
        ${lvl.isIran ? `<span class="level-iran-flag">وضعیت ایران</span>` : ''}
        <div class="level-title">${lvl.name}</div>
        <div class="level-metric-row"><span class="level-metric-label">شیوع در جمعیت عمومی:</span><span class="level-metric-value">${lvl.generalPop}</span></div>
        <div class="level-metric-row"><span class="level-metric-label">شیوع در گروه‌های پرخطر:</span><span class="level-metric-value">${lvl.riskPop}</span></div>
        <div class="level-metric-row"><span class="level-metric-label">الگو و ویژگی:</span><span class="level-metric-value">${lvl.features}</span></div>
      </div>
    `).join('');
    let shiftHtml = sec.phaseShift.map(ps => `<div class="shift-node"><div class="shift-date-badge">${ps.phase}</div><div class="stage-info-value">${ps.desc}</div></div>`).join('');
    return `
      <h3 style="margin-block-end: var(--space-3);">سطوح گستردگی اپیدمیولوژی در جمعیت</h3>
      <div class="levels-grid">${levelsCards}</div>
      <h3 style="margin-block-start: var(--space-8); margin-block-end: var(--space-3);">تغییر فاز اپیدمیولوژیک در ایران (از تزریق به تماس جنسی)</h3>
      <div class="shift-timeline">${shiftHtml}</div>
      <div class="medical-callout callout-warning">
        <div class="callout-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
        <div class="callout-content"><p><strong>چالش انتقال ثانویه:</strong> ${sec.secondaryChallenge}</p></div>
      </div>
    `;
  },

  renderCh1Sec6(sec) {
    let cards = sec.groups.map(g => `
      <div class="stage-step-card" style="margin-block-end: var(--space-4);">
        <div class="stage-header"><div class="stage-title">${g.name}</div></div>
        <div class="stage-grid">
          <div class="stage-info-block"><div class="stage-info-label">جمعیت برآوردی</div><div class="stage-info-value">${g.pop}</div></div>
          <div class="stage-info-block"><div class="stage-info-label">نرخ شیوع</div><div class="stage-info-value">${g.prev}</div></div>
        </div>
        <div class="stage-info-value" style="margin-block-start: var(--space-3); color: var(--text-secondary);">${g.notes}</div>
      </div>
    `).join('');
    return `<p>داشبورد تحلیل جمعیت‌های کلیدی و اپیدمیولوژی آن‌ها در ایران:</p>${cards}`;
  },

  renderCh1Sec7(sec) {
    let barriersHtml = sec.barriers.map((b, i) => `<li style="margin-block-end: var(--space-2);"><strong>${i + 1}.</strong> ${b}</li>`).join('');
    return `
      <div class="diagnostic-gap-card">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h4 style="margin: 0;">بار واقعی بیماری و شکاف تشخیصی کشوری</h4>
          <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--accent-primary);">تخمین واقعی: ${sec.estimate.total}</span>
        </div>
        <div class="gap-bars-wrapper">
          <div class="gap-bar-container">
            <div class="gap-bar-segment-identified" style="width: 40%;">حساسیت تشخیصی (۴۰٪)</div>
            <div class="gap-bar-segment-hidden" style="width: 60%;">شکاف تشخیصی پنهان (۶۰٪)</div>
          </div>
        </div>
        <div class="gap-legend-grid">
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--accent-primary);">${sec.official.cases}</span><span class="gap-legend-label">کل مبتلایان کشف‌شده رسمی</span></div>
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--state-warning);">${sec.official.aids}</span><span class="gap-legend-label">واردشده به فاز بالینی ایدز</span></div>
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--text-secondary);">${sec.official.deaths}</span><span class="gap-legend-label">موارد فوت قطعی ثبت‌شده</span></div>
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--state-danger);">${sec.estimate.total}</span><span class="gap-legend-label">تخمین مبتلایان واقعی</span></div>
        </div>
      </div>
      <div class="medical-callout callout-info">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content"><p><strong>شکاف تشخیصی سیستم کشوری:</strong> ${sec.estimate.gap}</p></div>
      </div>
      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">موانع تشخیصی</h3>
      <ul style="list-style: none; padding-inline-start: 0;">${barriersHtml}</ul>
    `;
  },

  renderCh1Sec8(sec) {
    let cards = sec.methods.map(m => `<div class="sampling-card"><div class="sampling-card-title">${m.name}</div><div class="sampling-detail-row" style="margin-block-start: var(--space-2);">${m.desc}</div></div>`).join('');
    return `<p>${sec.intro}</p><div class="sampling-methods-grid">${cards}</div>`;
  },

  renderCh1Sec9(sec) {
    let levelsHtml = sec.levels.map(lvl => {
      let itemsList = lvl.items.map(it => `<li>${it}</li>`).join('');
      return `<div class="stage-step-card" style="margin-block-end: var(--space-4);"><div class="stage-header"><div class="stage-title">${lvl.level}</div></div><ul style="margin: 0; padding-inline-start: var(--space-5);">${itemsList}</ul></div>`;
    }).join('');
    return `
      <h3 style="margin-block-end: var(--space-3);">سطوح سه‌گانه پیشگیری</h3>
      ${levelsHtml}
      <div class="medical-callout callout-warning">
        <div class="callout-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
        <div class="callout-content"><h4 style="margin: 0 0 6px 0; color: var(--text-primary);">${sec.paradox.title}</h4><p>${sec.paradox.desc}</p></div>
      </div>
      <div class="medical-callout callout-info" style="border-inline-start-color: var(--state-danger);">
        <div class="callout-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg></div>
        <div class="callout-content"><h4 style="margin: 0 0 6px 0; color: var(--text-primary);">${sec.quarantine.title}</h4><p>${sec.quarantine.desc}</p></div>
      </div>
    `;
  },

  renderCh1Sec10(sec) {
    let cascadeBars = sec.cascadeFlow.map(cf => `
      <div class="cascade-step-bar">
        <div class="cascade-step-header"><div class="cascade-step-name">${cf.step}</div><div class="cascade-step-metric">${cf.percent}٪</div></div>
        <div class="cascade-progress-track"><div class="cascade-progress-fill" style="width: ${cf.percent}%;"></div></div>
        <div class="cascade-target-90"><span>${cf.label}</span></div>
      </div>
    `).join('');
    let targetsHtml = sec.targets.map(t => `<li><strong>${t.title}:</strong> ${t.desc}</li>`).join('');
    return `
      <p>ابزار تحلیل زنجیره ریزش بیماران از آغاز آلودگی تا مهار بیولوژیک جهت اصلاح تخصیص منابع:</p>
      <div class="cascade-pipeline">${cascadeBars}</div>
      <h3 style="margin-block-start: var(--space-8); margin-block-end: var(--space-3);">اهداف جهانی ۹۰-۹۰-۹۰ (چشم‌انداز مهار ۲۰۳۰)</h3>
      <ul>${targetsHtml}</ul>
      <div class="medical-callout callout-success">
        <div class="callout-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div>
        <div class="callout-content"><p><strong>عملکرد کشور ایران:</strong> ${sec.iranRanking}</p></div>
      </div>
    `;
  },

  renderCh1Sec11(sec) {
    let cards = sec.strategies.map(s => `
      <div class="stage-step-card" style="margin-block-end: var(--space-4);">
        <div class="stage-header"><div class="stage-title">${s.title}</div><span class="stage-latin">${s.latin}</span></div>
        <div class="stage-info-value">${s.desc}</div>
      </div>
    `).join('');
    return `<p>چشم‌انداز بیماریابی فعال و پایش در نظام سلامت ایران شامل سه محور راهبردی زیر است:</p>${cards}`;
  },

  /* =========================================================================
     CHAPTER 2 RENDERERS (TUBERCULOSIS)
     ========================================================================= */
  renderChapter2Section(section) {
    switch (section.number) {
      case 1: return this.renderCh2Sec1(section);
      case 2: return this.renderCh2Sec2(section);
      case 3: return this.renderCh2Sec3(section);
      case 4: return this.renderCh2Sec4(section);
      case 5: return this.renderCh2Sec5(section);
      case 6: return this.renderCh2Sec6(section);
      case 7: return this.renderCh2Sec7(section);
      default: return `<p>${section.summary || ''}</p>`;
    }
  },

  renderCh2Sec1(sec) {
    let afbHtml = sec.afbFeatures.map(f => `
      <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start: 3px solid var(--accent-primary);">
        <div class="stage-info-label" style="color: var(--text-primary); font-size: var(--font-size-sm);">${f.label}</div>
        <div class="stage-info-value">${f.text}</div>
      </div>
    `).join('');

    let speciesHtml = sec.species.map(s => `
      <div class="stage-step-card" style="margin-block-end: var(--space-3);">
        <div class="stage-header"><div class="stage-title">${s.name}</div></div>
        <div class="stage-info-value">${s.desc}</div>
      </div>
    `).join('');

    return `
      <h3 style="margin-block-end: var(--space-3);">تاریخچه و تعریف بیماری</h3>
      <div class="medical-callout callout-info">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content">
          <p><strong>قدمت تاریخی:</strong> ${sec.history.antiquity}</p>
          <p style="margin-block-start: var(--space-2);"><strong>تعریف:</strong> ${sec.history.definition}</p>
        </div>
      </div>

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">ویژگی‌های باسیل‌های اسید فست (AFB)</h3>
      ${afbHtml}

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">گونه‌های مهم مایکوباکتریوم</h3>
      ${speciesHtml}
    `;
  },

  renderCh2Sec2(sec) {
    let latentList = sec.latentTB.map(item => `<li>${item}</li>`).join('');

    return `
      <h3 style="margin-block-end: var(--space-3);">مکانیسم انتقال و پاتوژنز</h3>
      <div class="stage-info-block" style="margin-block-end: var(--space-4);">
        <p><strong>قطرات تنفسی عفونی:</strong> ${sec.dropletSize}</p>
      </div>

      <div class="shift-timeline">
        <div class="shift-node">
          <div class="shift-date-badge">مرحله ۱: تماس و استنشاق</div>
          <div class="stage-info-value">استنشاق قطرات تنفسی حاوی باسیل سل (< 5 μm) توسط فرد مستعد.</div>
        </div>
        <div class="shift-node">
          <div class="shift-date-badge">مرحله ۲: مهار ایمونولوژیک</div>
          <div class="stage-info-value">فاگوسیتوز باسیل توسط ماکروفاژها و محصور شدن در گرانولوم؛ ورود به فاز عفونت نهفته (Latent TB).</div>
        </div>
        <div class="shift-node">
          <div class="shift-date-badge">مرحله ۳: فعال‌سازی مجدد</div>
          <div class="stage-info-value">فعال‌سازی در ۱۰٪ از کل مبتلایان نهفته در طول عمر (نیمی از موارد فعال‌سازی طی ۲ سال اول مواجهه رخ می‌دهد).</div>
        </div>
      </div>

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">عفونت نهفته (Latent TB)</h3>
      <ul>${latentList}</ul>

      <div class="medical-callout callout-warning">
        <div class="callout-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
        <div class="callout-content">
          <p><strong>خطر فعال شدن:</strong> ${sec.activeConversion.lifetimeRisk} (${sec.activeConversion.timeWindow})</p>
          <p style="margin-block-start: var(--space-2);"><strong>پیش‌آگهی در غیاب درمان:</strong> ${sec.activeConversion.prognosis}</p>
        </div>
      </div>
    `;
  },

  renderCh2Sec3(sec) {
    let mildHtml = sec.extrapulmonary.mildForms.map(f => `<li>${f}</li>`).join('');
    let severeHtml = sec.extrapulmonary.severeForms.map(f => `<li>${f}</li>`).join('');

    return `
      <div class="stage-step-card" style="margin-block-end: var(--space-5);">
        <div class="stage-header">
          <div class="stage-title">سل ریوی (Pulmonary TB)</div>
          <span class="stage-badge" style="background-color: var(--accent-primary);">${sec.pulmonary.percentage}</span>
        </div>
        <div class="stage-grid">
          <div class="stage-info-block">
            <div class="stage-info-label">نشانه‌های عمومی و سیستمیک</div>
            <div class="stage-info-value">${sec.pulmonary.systemic}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label">نشانه‌های تنفسی اختصاصی</div>
            <div class="stage-info-value">${sec.pulmonary.respiratory}</div>
          </div>
        </div>
      </div>

      <div class="stage-step-card" style="margin-block-end: var(--space-5);">
        <div class="stage-header">
          <div class="stage-title">سل خارج ریوی (Extrapulmonary TB)</div>
          <span class="stage-badge" style="background-color: var(--accent-secondary);">${sec.extrapulmonary.percentage}</span>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-3);">${sec.extrapulmonary.definition}</p>
        <div class="stage-grid">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--text-primary); font-weight: 700;">اشکال با شدت کمتر</div>
            <ul style="margin: 0; padding-inline-start: var(--space-4);">${mildHtml}</ul>
          </div>
          <div class="stage-info-block" style="border-inline-start: 3px solid var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger); font-weight: 700;">اشکال بالینی شدید</div>
            <ul style="margin: 0; padding-inline-start: var(--space-4);">${severeHtml}</ul>
          </div>
        </div>
      </div>

      <div class="medical-callout callout-info">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content">
          <p><strong>نکته تشخیصی در کودکان:</strong> ${sec.pediatricNote}</p>
        </div>
      </div>
    `;
  },

  renderCh2Sec4(sec) {
    let testRows = sec.diagnosticTests.map(t => `
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.sensitivity}</td>
        <td>${t.time}</td>
        <td>${t.features}</td>
      </tr>
    `).join('');

    let algoHtml = sec.smearNegativeAlgorithm.map(a => `
      <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start: 3px solid var(--accent-secondary);">
        <div class="stage-info-label" style="font-size: var(--font-size-sm); color: var(--text-primary);">${a.route}</div>
        <div class="stage-info-value">${a.desc}</div>
      </div>
    `).join('');

    return `
      <h3 style="margin-block-end: var(--space-3);">مقایسه آزمون‌های آزمایشگاهی و سرولوژیک</h3>
      <div class="table-scroll-container">
        <table class="medical-table">
          <thead><tr><th>روش تشخیصی</th><th>حساسیت و دقت</th><th>زمان نتیجه‌گیری</th><th>ویژگی‌ها، مزایا و محدودیت‌ها</th></tr></thead>
          <tbody>${testRows}</tbody>
        </table>
      </div>

      <h3 style="margin-block-start: var(--space-8); margin-block-end: var(--space-3);">الگوریتم رویکرد به بیمار مشکوک با اسمیر مستقیم منفی</h3>
      <p>در صورت منفی بودن اسمیر مستقیم در فرد مشکوک، تأیید سل اسمیر منفی از طریق یکی از سه مسیر بالینی زیر انجام می‌شود:</p>
      ${algoHtml}
    `;
  },

  renderCh2Sec5(sec) {
    let cards = sec.risks.map(r => `
      <div class="stage-step-card" style="margin-block-end: var(--space-3);">
        <div class="stage-header"><div class="stage-title">${r.title}</div></div>
        <div class="stage-info-value">${r.impact}</div>
      </div>
    `).join('');
    return `
      <p>عوامل کلینیکی و محیطی که خطر ابتلا یا تبدیل عفونت نهفته به سل فعال را تشدید می‌کنند:</p>
      ${cards}
    `;
  },

  renderCh2Sec6(sec) {
    let levelsHtml = sec.preventionLevels.map(lvl => `
      <div class="stage-step-card" style="margin-block-end: var(--space-3);">
        <div class="stage-header"><div class="stage-title">${lvl.level}</div></div>
        <div class="stage-info-value">${lvl.desc}</div>
      </div>
    `).join('');

    let targetsHtml = sec.endTBTargets.map(t => `
      <div class="gap-legend-item">
        <span class="gap-legend-val" style="color: var(--accent-primary);">${t.metric}</span>
        <span class="gap-legend-label">${t.label}</span>
      </div>
    `).join('');

    return `
      <h3 style="margin-block-end: var(--space-3);">سطوح پیشگیری سه‌گانه</h3>
      ${levelsHtml}

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">اهداف راهبرد پایان سل تا سال ۲۰۳۰ (End TB Strategy)</h3>
      <div class="gap-legend-grid">${targetsHtml}</div>
    `;
  },

  renderCh2Sec7(sec) {
    let trendRows = sec.historicalTrend.map(t => `
      <tr>
        <td><strong>${t.year}</strong></td>
        <td><strong>${t.rate}</strong></td>
        <td>${t.cause}</td>
      </tr>
    `).join('');

    return `
      <div class="diagnostic-gap-card">
        <h4 style="margin-block-end: var(--space-3);">وضعیت جهانی و تضاد منطقه‌ای سل</h4>
        <div class="gap-legend-grid">
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--accent-primary);">${sec.globalStats.cases}</span><span class="gap-legend-label">بروز سالانه جهانی</span></div>
          <div class="gap-legend-item"><span class="gap-legend-val" style="color: var(--state-danger);">${sec.globalStats.deaths}</span><span class="gap-legend-label">مرگ سالانه جهانی</span></div>
        </div>
        <div class="stage-info-value" style="margin-block-start: var(--space-3);"><strong>تضاد منطقه‌ای:</strong> ${sec.globalStats.highestVolume} در برابر بالاترین سرانه در ${sec.globalStats.highestPerCapita}.</div>
      </div>

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">وضعیت اپیدمیولوژیک سل در ایران</h3>
      <div class="stage-grid" style="margin-block-end: var(--space-4);">
        <div class="stage-info-block"><div class="stage-info-label">میزان بروز سالانه کشوری</div><div class="stage-info-value">${sec.iranStats.incidenceRate} (${sec.iranStats.annualCases})</div></div>
        <div class="stage-info-block"><div class="stage-info-label">مرگ‌ومیر سالانه</div><div class="stage-info-value">${sec.iranStats.annualDeaths}</div></div>
      </div>
      <div class="stage-info-block" style="margin-block-end: var(--space-4);">
        <p><strong>کانون‌های پرشیوع در داخل کشور:</strong> ${sec.iranStats.hotspots}</p>
        <p style="margin-block-start: var(--space-2);"><strong>نقش مهاجرت:</strong> ${sec.iranStats.migration}</p>
      </div>

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">روند تاریخی ۵۰ ساله کاهش بروز سل در ایران (۱۹۶۵ تا ۲۰۱۵)</h3>
      <div class="table-scroll-container">
        <table class="medical-table">
          <thead><tr><th>سال میلادی</th><th>میزان بروز (در ۱۰۰,۰۰۰ نفر)</th><th>عامل اصلی موفقیت کشوری</th></tr></thead>
          <tbody>${trendRows}</tbody>
        </table>
      </div>

      <h3 style="margin-block-start: var(--space-6); margin-block-end: var(--space-3);">تحلیل بار اقتصادی سل</h3>
      <div class="stage-info-block" style="margin-block-end: var(--space-3);">
        <div class="stage-info-label" style="color: var(--text-primary);">هزینه‌های مستقیم (Direct Costs)</div>
        <div class="stage-info-value">${sec.economicCosts.direct}</div>
      </div>
      <div class="stage-info-block" style="margin-block-end: var(--space-3);">
        <div class="stage-info-label" style="color: var(--text-primary);">هزینه‌های غیرمستقیم (Indirect Costs)</div>
        <div class="stage-info-value">${sec.economicCosts.indirect}</div>
      </div>
      <div class="medical-callout callout-info">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content"><p><strong>راهبرد نهایی کنترل:</strong> ${sec.economicCosts.strategy}</p></div>
      </div>
    `;
  },

  /**
   * Renders specialized educational view for Chapter 3 sections (IHD & Ira-PEN)
   */
  renderChapter3Section(sec) {
    if (sec.id === 'ch03-sec01') {
      const defCards = sec.definitions.map(d => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${d.term}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${d.desc}</div>
        </div>
      `).join('');

      const tableRows = sec.comparisonTable.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td>${r.cad}</td>
          <td>${r.acs}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف و تمایز مفاهیم پایه قلبی عروقی</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${defCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه تحلیلی بیماری عروق کرونر (CAD) در برابر سندرم حاد کرونری (ACS)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>ویژگی بالینی</th><th>بیماری عروق کرونر (CAD)</th><th>سندرم حاد عروق کرونر (ACS)</th></tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-start: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p><strong>نکته بالینی کلیدی:</strong> ${sec.clinicalPearl}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch03-sec02') {
      const iranCards = sec.iranStats.map(s => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">${s.metric}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');

      const globalCards = sec.globalStats.map(s => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-secondary);">
          <div class="stat-metric" style="color: var(--accent-secondary); font-size: var(--font-size-lg);">${s.metric}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت اپیدمیولوژیک بیماری‌های قلبی عروقی در ایران</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${iranCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت اپیدمیولوژیک بیماری‌های قلبی عروقی در سطح جهانی</h3>
        <div class="stat-cards-grid">
          ${globalCards}
        </div>
      `;
    }

    if (sec.id === 'ch03-sec03') {
      const dynamicCards = sec.dynamics.map((d, i) => `
        <div class="stage-step-card stage-${i + 1}">
          <div class="stage-header">
            <div class="stage-title">${d.period}</div>
          </div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${d.desc}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دینامیک خطر بیماری‌های قلبی عروقی در طول عمر</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-6);">
          ${dynamicCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">خطر بروز مرگ کرونری در سنین میانسالی (${sec.mortalityRisk.ageRange})</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);">
          <div class="stat-card" style="border-inline-start: 4px solid #3b82f6;">
            <div class="stat-metric" style="color: #3b82f6;">${sec.mortalityRisk.menRate}</div>
            <div class="stat-label">خطر مرگ کرونری در مردان (${sec.mortalityRisk.ageRange})</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899;">${sec.mortalityRisk.womenRate}</div>
            <div class="stat-label">خطر مرگ کرونری در زنان (${sec.mortalityRisk.ageRange})</div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch03-sec04') {
      const tierRows = sec.riskTiers.map(t => `
        <tr>
          <td style="font-weight: 700; white-space: nowrap;">${t.tier}</td>
          <td>${t.factors.map(f => `<span class="badge" style="display: inline-block; margin: 2px 4px; padding: 2px 8px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">${f}</span>`).join('')}</td>
          <td>${t.effect}</td>
        </tr>
      `).join('');

      const markerCards = sec.inflammatoryMarkers.map(m => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 700;">${m.name}</div>
          <div class="stage-info-value">${m.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی جامع عوامل خطر قلبی عروقی بر اساس قابلیت مداخله</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>طبقه ریسک‌فاکتور</th><th>عوامل و متغیرها</th><th>وضعیت اثر مداخلات درمانی</th></tr>
            </thead>
            <tbody>${tierRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سایر نشانگرهای التهابی پیشگویی‌کننده</h3>
        <div style="margin-block-end: var(--space-6);">
          ${markerCards}
        </div>

        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>نکته طبقه‌بندی منبع:</strong> ${sec.classificationNote}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch03-sec05') {
      const earlyRows = sec.chronologyOddsRatio.earlyOnset.map(item => `
        <div class="odds-ratio-card">
          <span style="font-weight: 700; color: var(--text-primary);">${item.factor}</span>
          <span class="odds-ratio-badge">OR = ${item.or}</span>
        </div>
      `).join('');

      const lateRows = sec.chronologyOddsRatio.lateOnset.map(item => `
        <div class="odds-ratio-card">
          <span style="font-weight: 700; color: var(--text-primary);">${item.factor}</span>
          <span class="odds-ratio-badge" style="background: var(--bg-surface-elevated); color: var(--text-secondary); border: 1px solid var(--border-default);">OR = ${item.or}</span>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ضریب فزاینده دخانیات در جمعیت ایرانی</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--text-primary);">بار مورتالیتی</div>
          <div class="stage-info-value">${sec.smokingImpact.mainCause}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--text-primary);">شیب دوز-پاسخ</div>
          <div class="stage-info-value">${sec.smokingImpact.doseResponse}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-6);">
          <div class="stage-info-label" style="color: var(--text-primary);">سهم در مرگ‌های سیگار</div>
          <div class="stage-info-value">${sec.smokingImpact.attributableFraction}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دوقلوهای خطر زودرس (Early-Onset Twins)</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>هیپرلیپیدمی (OR = ${sec.earlyTwins.hyperlipidemiaOR}) و مصرف تریاک (OR = ${sec.earlyTwins.opiumOR}):</strong> ${sec.earlyTwins.clinicalNote}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">کرونولوژی بروز CAD بر اساس نسبت شانس (Odds Ratio)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-6);">
          <div>
            <h4 style="color: var(--state-danger); margin-block-end: var(--space-2);">عوامل آغازگر بروز زودرس (Early-Onset)</h4>
            ${earlyRows}
          </div>
          <div>
            <h4 style="color: var(--text-muted); margin-block-end: var(--space-2);">عوامل مرتبط با بروز دیررس (Late-Onset)</h4>
            ${lateRows}
          </div>
        </div>

        <div class="medical-callout callout-info">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>الگوی اپیدمیولوژیک و پارادوکس بالینی:</strong> ${sec.chronologyOddsRatio.insight}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch03-sec06') {
      const targetItems = sec.nationalTargets.map(t => `
        <li style="margin-block-end: var(--space-2);">${t}</li>
      `).join('');

      const behavioralBadges = sec.behavioralRisks.map(b => `
        <span class="badge" style="display: inline-block; margin: 2px 6px; padding: 4px 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-full); font-weight: 700;">${b}</span>
      `).join('');

      const earlyFactorsList = sec.entryCriteria.earlyRiskFactors.map(f => `
        <li style="margin-block-end: var(--space-1);">${f}</li>
      `).join('');

      const riskRows = sec.riskTiersTable.map(r => `
        <tr>
          <td style="font-weight: 800; white-space: nowrap;">${r.risk}</td>
          <td><strong>${r.classification}</strong></td>
          <td>${r.actions}</td>
          <td style="font-weight: 800; color: var(--accent-primary); white-space: nowrap;">${r.followUp}</td>
        </tr>
      `).join('');

      const stepCards = [
        { tier: "کمتر از ۱۰٪ (کم‌خطر)", interval: "۱۲ ماه بعد", class: "tier-low" },
        { tier: "۱۰ تا ۲۰٪ (خطر متوسط)", interval: "۹ ماه بعد", class: "tier-moderate" },
        { tier: "۲۰ تا ۳۰٪ (پرخطر)", interval: "۶ ماه بعد", class: "tier-high" },
        { tier: "۳۰٪ و بالاتر (بسیار شدید)", interval: "۳ ماه بعد", class: "tier-veryhigh" }
      ].map(s => `
        <div class="irapen-step-card ${s.class}">
          <div class="irapen-tier-header">
            <span class="irapen-tier-title">${s.tier}</span>
            <span class="irapen-tier-interval">${s.interval}</span>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">پیگیری و غربالگری مجدد</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اهداف کمی سند ملی پیشگیری و کنترل بیماری‌های غیرواگیر (افق ۱۴۰۴)</h3>
        <ul style="padding-inline-start: var(--space-5); margin-block-end: var(--space-4);">
          ${targetItems}
        </ul>

        <div style="margin-block-end: var(--space-6);">
          <strong>عوامل خطر چهارگانه رفتاری برنامه:</strong> ${behavioralBadges}
        </div>

        <h3 style="margin-block-end: var(--space-3);">معیارهای ورود به غربالگری ۱۰ ساله قلبی عروقی (پروتکل Ira-PEN)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">۱. ورود روتین سنی</div>
            <div class="stage-info-value">${sec.entryCriteria.routineAge}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-secondary);">۲. ورود زودرس بر اساس ریسک‌فاکتورها (۳۰ تا ۴۰ سال)</div>
            <div class="stage-info-value">
              <p style="margin: 0 0 var(--space-2) 0;">${sec.entryCriteria.earlyEntryAge}</p>
              <ul style="padding-inline-start: var(--space-4); margin: 0;">
                ${earlyFactorsList}
              </ul>
            </div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح خطر، مداخلات بالینی الزامی و فواصل فالوآپ (Ira-PEN)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>سطح خطر ۱۰ ساله</th><th>طبقه‌بندی</th><th>اقدامات و مداخلات بالینی الزامی</th><th>فاصله ارزیابی مجدد</th></tr>
            </thead>
            <tbody>${riskRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-2);">قاعده سرانگشتی پیگیری (Rule of Thumb for Follow-up)</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-block-end: var(--space-3);">${sec.ruleOfThumb.text}</p>
        <div class="irapen-stepper-container">
          ${stepCards}
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /**
   * Renders specialized educational view for Chapter 4 sections (Obesity in Iran)
   */
  renderChapter4Section(sec) {
    if (sec.id === 'ch04-sec01') {
      const compRows = sec.comparison.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td>${r.general}</td>
          <td>${r.central}</td>
        </tr>
      `).join('');

      const toolsCards = sec.complementaryTools.map(t => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${t.name}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${t.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه چاقی عمومی (General Obesity) در برابر چاقی شکمی (Central Obesity)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>شاخص بالینی</th><th>چاقی عمومی (BMI)</th><th>چاقی شکمی (اندازه دور کمر)</th></tr>
            </thead>
            <tbody>${compRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روش‌های مکمل و دقیق‌تر سنجش ترکیب بدن</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          ${toolsCards}
        </div>
      `;
    }

    if (sec.id === 'ch04-sec02') {
      const trendCards = sec.globalTrends.map(t => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">${t.metric}</div>
          <div class="stat-label">${t.label}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روندهای کلان اپیدمیولوژیک چاقی در جهان</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${trendCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">شیوع چاقی در منطقه خاورمیانه و شمال آفریقا (MENA)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4);">
          <div class="stat-card" style="border-inline-start: 4px solid #3b82f6;">
            <div class="stat-metric" style="color: #3b82f6;">${sec.menaRegion.menRate}</div>
            <div class="stat-label">شیوع چاقی در مردان منطقه MENA</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899;">${sec.menaRegion.womenRate}</div>
            <div class="stat-label">شیوع چاقی در زنان منطقه MENA</div>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-start: var(--space-2);">${sec.menaRegion.note}</p>
      `;
    }

    if (sec.id === 'ch04-sec03') {
      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">توزیع جنسیتی و جمعیتی چاقی در ایران (پیمایش STEP)</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899;">${sec.stepSurvey.women}</div>
            <div class="stat-label">شیوع چاقی در زنان ایران (حدود ۲ برابر مردان)</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #3b82f6;">
            <div class="stat-metric" style="color: #3b82f6;">${sec.stepSurvey.men}</div>
            <div class="stat-label">شیوع چاقی در مردان ایران</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary);">${sec.stepSurvey.urban}</div>
            <div class="stat-label">شیوع در مناطق شهری کشور</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-secondary);">
            <div class="stat-metric" style="color: var(--accent-secondary);">${sec.stepSurvey.rural}</div>
            <div class="stat-label">شیوع در مناطق روستایی کشور</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شیب جغرافیایی چاقی در کشور</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #10b981;">کمترین میانگین کشوری:</div>
          <div class="stage-info-value">${sec.geographicGradient.lowest}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-6);">
          <div class="stage-info-label" style="color: #ef4444;">بیشترین میانگین کشوری (قطب بحران):</div>
          <div class="stage-info-value">${sec.geographicGradient.highest}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شتاب چاقی شکمی در پایتخت (مطالعه قند و لیپید تهران - TLGS)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-6);">
          ${sec.tlgsTehran.map(t => `
            <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
              <div style="font-weight: 800; font-size: var(--font-size-base); color: var(--text-primary); margin-block-end: 4px;">${t.group}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${t.stat}</div>
            </div>
          `).join('')}
        </div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت کودکان و نوجوانان (مطالعه CASPIAN)</h3>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>شیوع در کودکان و نوجوانان (CASPIAN-III):</strong> اضافه وزن: ${sec.pediatricCaspian.overweight} | چاقی: ${sec.pediatricCaspian.obesity}</p>
            <p style="margin-block-start: 4px;">${sec.pediatricCaspian.trend}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch04-sec04') {
      const triadCards = sec.etiologyTriad.map((t, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${t.pillar}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${t.desc}</p>
        </div>
      `).join('');

      const predictorRows = sec.riskPredictors.map(p => `
        <tr>
          <td><strong>${p.factor}</strong></td>
          <td><span class="badge" style="padding: 2px 8px; border-radius: var(--radius-sm); background: var(--bg-surface-elevated); border: 1px solid var(--border-default);">${p.pattern}</span></td>
          <td>${p.mechanism}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مثلث تعاملی اتیولوژی چاقی</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-6);">
          ${triadCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">متغیرهای پیش‌بینی‌کننده و جمعیت‌های پرخطر</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>عامل / گروه جمعیتی</th><th>الگوی تغییر خطر</th><th>سازوکار یا ویژگی همراه</th></tr>
            </thead>
            <tbody>${predictorRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch04-sec05') {
      const riskCards = sec.centralRisks.map(r => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger); font-size: var(--font-size-sm);">${r.outcome}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${r.impact}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">خطرات مستقل چاقی شکمی و متابولیک</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${riskCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">تضاد چاقی (The Obesity Paradox)</h3>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>قاعده عمومی:</strong> ${sec.obesityParadox.generalRule}</p>
            <p style="margin-block: 4px;"><strong>استثنای بالینی (پارادوکس):</strong> ${sec.obesityParadox.exception}</p>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted);"><strong>مفهوم فیزیوپاتولوژیک:</strong> ${sec.obesityParadox.pathophysiology}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch04-sec06') {
      const funnelCards = sec.frictionFunnel.map((f, i) => `
        <div class="irapen-step-card tier-${i === 0 ? 'veryhigh' : i === 1 ? 'high' : 'moderate'}">
          <div class="irapen-tier-header">
            <span class="irapen-tier-title">${f.wall}</span>
          </div>
          <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">${f.desc}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">قیف اصطکاک تغییر رفتار در نوجوانان ایرانی (Friction Funnel)</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-block-end: var(--space-3);">
          مسیر انتقال «قصد اتخاذ سبک زندگی سالم» به «عمل» با ۳ مانع ساختاری متوالی مسدود می‌شود:
        </p>
        <div class="irapen-stepper-container" style="margin-block-end: var(--space-6);">
          ${funnelCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">استراتژی‌های مداخله‌ای و برنامه‌های ملی کنترل چاقی</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">مداخلات بزرگسالان (محیط کار):</div>
          <div class="stage-info-value">${sec.nationalInterventions.adultWorkplace}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-secondary);">برنامه ملی ایران اکو (IRAN-ECHO):</div>
          <div class="stage-info-value">${sec.nationalInterventions.iranEcho}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--text-primary);">بهداشت مدارس:</div>
          <div class="stage-info-value">${sec.nationalInterventions.schoolHealth}</div>
        </div>
        <div class="stage-info-block">
          <div class="stage-info-label" style="color: var(--state-warning);">گروه‌های جمعیتی دارای اولویت مداخله:</div>
          <div class="stage-info-value">${sec.nationalInterventions.priorityGroups}</div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 5 sections (Cancer Registry in Iran)
   */
  renderChapter5Section(sec) {
    if (sec.id === 'ch05-sec01') {
      const rankRows = sec.genderRankings.map(r => `
        <tr>
          <td><strong>${r.gender}</strong></td>
          <td style="color: var(--state-danger); font-weight: 700;">${r.rank1}</td>
          <td style="color: var(--accent-primary); font-weight: 700;">${r.rank2}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بار جهانی سرطان و شاخص سال‌های از دست‌رفته عمر (AYLL)</h3>
        <div class="stat-card" style="margin-block-end: var(--space-6); border-inline-start: 4px solid var(--state-danger);">
          <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-xl);">۲۳۲.۵ میلیون سال</div>
          <div class="stat-label">${sec.globalAYLL}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">رتبه‌بندی بار بیماری (AYLL) بر حسب جنسیت</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>جنسیت</th><th>رتبه اول بار بیماری (AYLL)</th><th>رتبه دوم بار بیماری (AYLL)</th></tr>
            </thead>
            <tbody>${rankRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch05-sec02') {
      const stepCards = sec.carcinogenesisSteps.map((s, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${s.step}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${s.desc}</p>
        </div>
      `).join('');

      const ageCards = sec.agePatterns.map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 700;">${p.cancer}</div>
          <div class="stage-info-value">${p.trend}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مسیر تحول سلول از نخستین ناهنجاری تا شناسایی بالینی</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-4);">
          ${stepCards}
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-6);">${sec.latencyWindow}</p>

        <h3 style="margin-block-end: var(--space-3);">الگوی سنی بروز سرطان‌های شایع در ایران</h3>
        <div>
          ${ageCards}
        </div>
      `;
    }

    if (sec.id === 'ch05-sec03') {
      const pillarCards = sec.nccpPillars.map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${p.pillar}</div>
          <div class="stage-info-value">${p.desc}</div>
        </div>
      `).join('');

      const iarcRows = sec.iarcTiers.map(t => `
        <tr>
          <td><strong>${t.group}</strong></td>
          <td>${t.definition}</td>
          <td style="font-weight: 800; color: var(--accent-primary);">${t.count}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ارکان پنج‌گانه برنامه جامع ملی مهار سرطان (NCCP)</h3>
        <div style="margin-block-end: var(--space-6);">
          ${pillarCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی آژانس بین‌المللی تحقیقات سرطان (IARC)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-4);">
          <table class="medical-table">
            <thead>
              <tr><th>رده IARC</th><th>تعریف استاندارد</th><th>شمار عوامل شناخته‌شده</th></tr>
            </thead>
            <tbody>${iarcRows}</tbody>
          </table>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted);">${sec.multifactorialModel}</p>
      `;
    }

    if (sec.id === 'ch05-sec04') {
      const infectionRows = sec.infectiousAgents.map(i => `
        <tr>
          <td><strong>${i.pathogen}</strong></td>
          <td>${i.target}</td>
        </tr>
      `).join('');

      const occRows = sec.occupationalRisks.map(o => `
        <tr>
          <td>${o.industry}</td>
          <td style="font-weight: 700; color: var(--state-danger);">${o.chemical}</td>
          <td>${o.cancer}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوامل بیولوژیک و عفونی سرطان‌زا (۲۶٪ در کشورهای در حال توسعه)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>پاتوژن عامل</th><th>ارگان و بیماری هدف</th></tr>
            </thead>
            <tbody>${infectionRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مواجهه‌های شغلی و کانون‌های بدخیمی</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>نوع صنعت / حرفه</th><th>عامل شیمیایی / فیزیکی</th><th>کانون بدخیمی اولیه</th></tr>
            </thead>
            <tbody>${occRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مکانیسم‌های ژنتیکی: انکوژن‌ها در برابر ژن‌های سرکوب‌کننده تومور</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">انکوژن‌ها (Oncogenes):</div>
          <div class="stage-info-value">${sec.geneticMechanisms.oncogenes}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">ژن‌های سرکوب‌کننده تومور (Tumor Suppressors):</div>
          <div class="stage-info-value">${sec.geneticMechanisms.tumorSuppressors}</div>
        </div>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.geneticMechanisms.syndrome}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch05-sec05') {
      const timeCards = sec.timeline.map(t => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 800;">سال ${t.year}:</div>
          <div class="stage-info-value">${t.event}</div>
        </div>
      `).join('');

      const tierRows = sec.dataTiers.map(t => `
        <tr>
          <td style="font-weight: 700; white-space: nowrap;">${t.tier}</td>
          <td>${t.items}</td>
          <td>${t.purpose}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار توسعه نظام ثبت سرطان در ایران</h3>
        <div style="margin-block-end: var(--space-6);">
          ${timeCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی متغیرهای ورودی به سیستم ثبت سرطان</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>دسته اطلاعاتی</th><th>اقلام داده‌ای</th><th>هدف و الزام کاربردی</th></tr>
            </thead>
            <tbody>${tierRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">چرخه جریان داده از مبدأ تا سطح سیاست‌گذاری</h3>
        <div class="medical-callout callout-info">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.dataFlow}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch05-sec06') {
      const achItems = sec.achievements.map(a => `<li style="margin-block-end: var(--space-2);">${a}</li>`).join('');
      const chalItems = sec.challenges.map(c => `<li style="margin-block-end: var(--space-2);">${c}</li>`).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">استانداردهای بین‌المللی کدگذاری (ICD-O-3)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">توپوگرافی:</div>
            <div class="stage-info-value">${sec.icdO3.topography}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-secondary);">مورفولوژی:</div>
            <div class="stage-info-value">${sec.icdO3.morphology}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--state-warning);">رفتار تومور (Behavior):</div>
            <div class="stage-info-value">${sec.icdO3.behavior}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مسیر رهگیری موارد صرفاً بر پایه گواهی فوت (DCO)</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.dcoAlgorithm}</p></div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
          <div>
            <h4 style="color: #10b981; margin-block-end: var(--space-2);">دستاوردهای سیستم ثبت سرطان</h4>
            <ul style="padding-inline-start: var(--space-5);">${achItems}</ul>
          </div>
          <div>
            <h4 style="color: var(--state-danger); margin-block-end: var(--space-2);">چالش‌ها و موانع پیش‌رو</h4>
            <ul style="padding-inline-start: var(--space-5);">${chalItems}</ul>
          </div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 6 sections (Stroke)
   */
  renderChapter6Section(sec) {
    if (sec.id === 'ch06-sec01') {
      const compRows = sec.subtypesComparison.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td style="color: var(--accent-primary); font-weight: 700;">${r.ischemic}</td>
          <td style="color: var(--state-danger); font-weight: 700;">${r.hemorrhagic}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p><strong>${sec.definitions.urgency}</strong></p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه سکته مغزی ایسکمیک در برابر هموراژیک</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-4);">
          <table class="medical-table">
            <thead>
              <tr><th>ویژگی پاتولوژیک</th><th>سکته ایسکمیک (شایع‌ترین)</th><th>سکته هموراژیک (فرم اقلیت)</th></tr>
            </thead>
            <tbody>${compRows}</tbody>
          </table>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted);">${sec.minorCausesNote}</p>
      `;
    }

    if (sec.id === 'ch06-sec02') {
      const gbdCards = sec.gbdStats.map(s => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">${s.rank}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بار جهانی بیماری سکته مغزی (GBD 2017)</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${gbdCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت اپیدمیولوژیک و شکاف جنسیتی در ایران</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">روند بروز:</div>
          <div class="stage-info-value">${sec.iranTrends.incidence}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-secondary);">سن ابتلا:</div>
          <div class="stage-info-value">${sec.iranTrends.ageOfOnset}</div>
        </div>
        <div class="stage-info-block">
          <div class="stage-info-label" style="color: #ec4899;">شکاف جنسیتی:</div>
          <div class="stage-info-value">${sec.iranTrends.genderGap}</div>
        </div>
      `;
    }

    if (sec.id === 'ch06-sec03') {
      const polypillPills = sec.polypillData.components.map(c => `
        <span class="badge" style="display: inline-block; margin: 3px 6px; padding: 4px 12px; background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-full); font-weight: 700;">${c}</span>
      `).join('');

      const whoStepCards = sec.whoFramework.map((w, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${w.step}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${w.desc}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پرفشاری خون (HTN): مهم‌ترین عامل خطر مداخله‌پذیر</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-xl);">۳.۹۹ برابر</div>
            <div class="stat-label">ریسک نسبی سکته مغزی در افراد دارای هایپرتانسیون</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-xl);">۵۴ درصد</div>
            <div class="stat-label">شیوع پرفشاری خون در میان بیماران سکته مغزی ایران</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">راهکار دارویی پیشگیری اولیه: قرص ترکیبی پلی‌پیل (Polypill)</h3>
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-4);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>مطالعه کوهورت گلستان:</strong> ${sec.polypillData.evidence}</p>
            <p style="margin-block-start: 4px;"><strong>پیامد:</strong> ${sec.polypillData.mortalityReduction} | ${sec.polypillData.whoApproval}</p>
          </div>
        </div>
        <div style="margin-block-end: var(--space-6);">
          <strong>ترکیبات چهارگانه قرص پلی‌پیل:</strong><br>
          ${polypillPills}
        </div>

        <h3 style="margin-block-end: var(--space-3);">چارچوب سه‌مرحله‌ای سازمان جهانی بهداشت (مدل WHO)</h3>
        <div class="natural-history-container">
          ${whoStepCards}
        </div>
      `;
    }

    if (sec.id === 'ch06-sec04') {
      const erosionCards = sec.timeErosionLevels.map(l => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger); font-size: var(--font-size-sm);">${l.level}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${l.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">واحدهای مراقبت سکته مغزی (Stroke Care Unit - SCU)</h3>
        <ul style="padding-inline-start: var(--space-5); margin-block-end: var(--space-6);">
          ${sec.scuBenefits.map(b => `<li style="margin-block-end: var(--space-2);">${b}</li>`).join('')}
        </ul>

        <h3 style="margin-block-end: var(--space-3);">سطوح سه‌گانه اتلاف وقت (Time Erosion)</h3>
        <div style="margin-block-end: var(--space-6);">
          ${erosionCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">الگوریتم پروتکل ملی نجات زمان: «کد سما»</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p><strong>فرایند فراخوان سریع کد سما:</strong> ${sec.codeSamaProtocol}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شکنندگی زنجیره خدمت: درس‌آموخته پاندمی کووید-۱۹</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">${sec.covid19Lessons}</p>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 7 sections (ARF & RHD)
   */
  renderChapter7Section(sec) {
    if (sec.id === 'ch07-sec01') {
      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پاتوژنز و اثر دومینویی پیوسته بیماری</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p><strong>مسیر بیماری‌زایی:</strong> ${sec.pathogenesisDomino}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">نقش محوری پروتئین M و واکنش ایمنی متقاطع (Molecular Mimicry)</h3>
        <ul style="padding-inline-start: var(--space-5); margin-block-end: var(--space-4);">
          ${sec.mProtein.map(p => `<li style="margin-block-end: var(--space-2);">${p}</li>`).join('')}
        </ul>
        <div class="stage-info-block">
          <div class="stage-info-label" style="color: var(--accent-primary);">مکانیسم تقلید مولکولی:</div>
          <div class="stage-info-value">${sec.molecularMimicry}</div>
        </div>
      `;
    }

    if (sec.id === 'ch07-sec02') {
      const majorCards = sec.majorCriteria.map(m => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger); font-size: var(--font-size-sm); font-weight: 800;">${m.sign}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${m.desc}</div>
        </div>
      `).join('');

      const minorCards = sec.minorCriteria.map(m => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--text-primary); font-size: var(--font-size-sm);">${m.sign}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${m.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>فرمول تشخیصی جونز:</strong> ${sec.diagnosticFormula}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">معیارهای اصلی جونز (Major Criteria)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${majorCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">معیارهای فرعی جونز (Minor Criteria)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">
          ${minorCards}
        </div>
      `;
    }

    if (sec.id === 'ch07-sec03') {
      const compRows = sec.comparisonTable.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td>${r.arf}</td>
          <td style="font-weight: 700; color: var(--state-danger);">${r.rhd}</td>
        </tr>
      `).join('');

      const secRows = sec.secondaryProphylaxis.map(s => `
        <tr>
          <td><strong>${s.group}</strong></td>
          <td style="font-weight: 800; color: var(--accent-primary);">${s.duration}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه ساختاری تب روماتیسمی حاد (ARF) در برابر آسیب مزمن (RHD)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>ویژگی بالینی</th><th>تب روماتیسمی حاد (ARF)</th><th>بیماری روماتیسمی قلب (RHD)</th></tr>
            </thead>
            <tbody>${compRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیشگیری اولیه (Primary Prophylaxis)</h3>
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>هدف:</strong> ${sec.primaryProphylaxis.goal}</p>
            <p style="margin-block: 4px;"><strong>پنجره طلایی:</strong> ${sec.primaryProphylaxis.window}</p>
            <p><strong>رژیم دارویی:</strong> ${sec.primaryProphylaxis.regimen}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مدت زمان استاندارد پیشگیری ثانویه (Secondary Prophylaxis)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>طبقه‌بندی بالینی بیمار</th><th>طول دوره الزامی پیشگیری ثانویه</th></tr>
            </thead>
            <tbody>${secRows}</tbody>
          </table>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 8 sections (Mental Health)
   */
  renderChapter8Section(sec) {
    if (sec.id === 'ch08-sec01') {
      const genRows = sec.generations.map(g => `
        <tr>
          <td><strong>${g.gen}</strong></td>
          <td>${g.desc}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>هشدار اپیدمیولوژیک ملی:</strong> ${sec.epidemiologicWarning}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تکامل ۴ نسل اپیدمیولوژی روان‌پزشکی</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>نسل و دوره</th><th>ویژگی‌های روش‌شناختی و ابزارهای سنجش</th></tr>
            </thead>
            <tbody>${genRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سهم اختلالات روانی از بار بیماری‌ها در ایران</h3>
        <div class="stat-cards-grid">
          ${sec.burdenMetrics.map(b => `
            <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
              <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">${b.metric}</div>
              <div class="stat-label">${b.label}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (sec.id === 'ch08-sec02') {
      const criteriaList = sec.diagnosticCriteria.map((c, i) => `<li style="margin-block-end: var(--space-1);">${i + 1}. ${c}</li>`).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">معیارهای تشخیصی اختلال افسردگی اساسی (MDD)</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-block-end: var(--space-2);">
          احراز حداقل ۵ معیار از ۹ معیار زیر به مدت دست‌کم ۲ هفته (ضرورت وجود حداقل یکی از معیارهای ۱ یا ۲):
        </p>
        <ul style="padding-inline-start: var(--space-5); margin-block-end: var(--space-6);">
          ${criteriaList}
        </ul>

        <h3 style="margin-block-end: var(--space-3);">سیمای اپیدمیولوژی در ایران (پیمایش IranMHS)</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary);">${sec.iranMhsStats.prevalence}</div>
            <div class="stat-label">شیوع ۱۲ ماهه کل کشور</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899;">${sec.iranMhsStats.women}</div>
            <div class="stat-label">شیوع ۱۲ ماهه در زنان</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #3b82f6;">
            <div class="stat-metric" style="color: #3b82f6;">${sec.iranMhsStats.men}</div>
            <div class="stat-label">شیوع ۱۲ ماهه در مردان</div>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6);">
          <div class="stage-info-label" style="color: var(--state-danger);">جایگاه در نظام سلامت:</div>
          <div class="stage-info-value">${sec.iranMhsStats.rank}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر بالینی و پیش‌آگهی بیمار (Patient Trajectory)</h3>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p>${sec.patientTrajectory}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch08-sec03') {
      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیوستار بالینی خودکشی (Suicidal Continuum)</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>پیوستار رفتار:</strong> ${sec.continuum}</p>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-start: 4px;">${sec.underreporting}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه الگوهای جمعیتی خودکشی: ایران در برابر جهان</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">نرخ میانگین مرگ در ایران:</div>
            <div class="stage-info-value">${sec.iranVsGlobal.iranMortality} (تغییر پیک به سمت جوانان ۱۵ تا ۳۴ سال)</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--text-muted);">نرخ میانگین مرگ در جهان:</div>
            <div class="stage-info-value">${sec.iranVsGlobal.globalMortality} (اوج شیوع در سالمندان بالای ۶۰ و ۷۵ تا ۸۴ سال)</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جغرافیای خطر: توزیع استانی در ایران</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #ef4444;">مناطق با بالاترین ثبت (قرمز):</div>
          <div class="stage-info-value">${sec.geography.redZones}</div>
        </div>
        <div class="stage-info-block">
          <div class="stage-info-label" style="color: #10b981;">مناطق با کمترین ثبت (سبز):</div>
          <div class="stage-info-value">${sec.geography.greenZones}</div>
        </div>
      `;
    }

    if (sec.id === 'ch08-sec04') {
      const pyramidCards = sec.iomPyramid.map((p, idx) => `
        <div class="irapen-step-card tier-${idx === 0 ? 'low' : idx === 1 ? 'moderate' : 'veryhigh'}">
          <div class="irapen-tier-header">
            <span class="irapen-tier-title">${p.level}</span>
          </div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: 4px;">جامعه هدف: ${p.target}</div>
          <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">${p.action}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">هرم سطوح پیشگیری (مدل IOM)</h3>
        <div class="irapen-stepper-container" style="margin-block-end: var(--space-6);">
          ${pyramidCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">مداخلات ساختاری مبتنی بر شواهد</h3>
        <div style="margin-block-end: var(--space-6);">
          ${sec.structuralInterventions.map(s => `
            <div class="stage-info-block" style="margin-block-end: var(--space-3);">
              <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${s.intervention}</div>
              <div class="stage-info-value" style="font-size: var(--font-size-sm);">${s.desc}</div>
            </div>
          `).join('')}
        </div>

        <h3 style="margin-block-end: var(--space-3);">شکاف درمان (Treatment Gap) و راهبرد ادغام در مراقبت‌های بهداشتی (PHC)</h3>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>شکاف درمان:</strong> ${sec.treatmentGap.percentage}</p>
            <p style="margin-block: 4px;"><strong>تنگناها:</strong> ${sec.treatmentGap.constraints}</p>
            <p><strong>راهبرد اولویت‌دار:</strong> ${sec.treatmentGap.prioritySolution}</p>
          </div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /**
   * Renders specialized educational view for Chapter 9 sections (NCD Roadmap & Health System 2025)
   */
  renderChapter9Section(sec) {
    if (sec.id === 'ch09-sec01') {
      const pillarItems = sec.governanceChart.pillars.map(p => `
        <li style="margin-block-end: var(--space-2); display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-primary); font-weight: 800;">◄</span>
          <span>${p}</span>
        </li>
      `).join('');

      const structuralCards = sec.threeStructuralPillars.map((p, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${p.pillar}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${p.desc}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ساختار حاکمیتی و بازوهای عملیاتی کمیته ملی بیماری‌های غیرواگیر (INCDC)</h3>
        <div class="stat-card" style="margin-block-end: var(--space-4); border-inline-start: 4px solid var(--accent-primary);">
          <div style="font-size: var(--font-size-sm); color: var(--text-muted); margin-block-end: 4px;">نهاد بالادستی راهبردی:</div>
          <div style="font-size: var(--font-size-lg); font-weight: 800; color: var(--text-primary);">${sec.governanceChart.supremeCouncil}</div>
          <div style="margin-block-start: var(--space-3); padding-block-start: var(--space-2); border-block-start: 1px dashed var(--border-default);">
            <strong>کمیته ملی بیماری‌های غیرواگیر (INCDC):</strong>
            <ul style="list-style: none; padding-inline-start: 0; margin-block-start: var(--space-2);">
              ${pillarItems}
            </ul>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-6);">${sec.strategicFunction}</p>

        <h3 style="margin-block-end: var(--space-3);">ارکان سه‌گانه تحول ساختاری نظام سلامت در افق ۱۴۰۴</h3>
        <div class="natural-history-container">
          ${structuralCards}
        </div>
      `;
    }

    if (sec.id === 'ch09-sec02') {
      const metricRows = sec.metricsTable.map(m => `
        <tr>
          <td><strong>${m.indicator}</strong></td>
          <td style="color: var(--text-secondary);">${m.baseline}</td>
          <td style="color: var(--state-danger); font-weight: 700;">${m.forecast}</td>
          <td style="font-weight: 600;">${m.analysis}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <div class="stat-card" style="margin-block-end: var(--space-6); border-inline-start: 4px solid var(--state-danger);">
          <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-xl);">۵۰,۰۰۰ مورد مرگ</div>
          <div class="stat-label">${sec.criticalStat}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های پایش، چشم‌انداز و تحلیل بار اقتصادی و بالینی دیابت در ایران</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>شاخص پایش ملی</th><th>مقدار پایه / گذشته</th><th>چشم‌انداز آینده</th><th>تحلیل پیامد و بار بیماری</th></tr>
            </thead>
            <tbody>${metricRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch09-sec03') {
      const goalCards = sec.nsfGoals.map(g => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm); font-weight: 800;">${g.num}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${g.target}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اهداف شش‌گانه چارچوب ملی خدمات دیابت (NSF) تا سال ۲۰۲۵</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          ${goalCards}
        </div>
      `;
    }

    if (sec.id === 'ch09-sec04') {
      const bottleneckCards = sec.sixBottlenecks.map(b => `
        <div class="irapen-step-card tier-high">
          <div class="irapen-tier-header">
            <span class="irapen-tier-title">${b.num}</span>
          </div>
          <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">${b.desc}</p>
        </div>
      `).join('');

      const deficitCards = sec.referralDeficits.map(d => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${d.feature}:</div>
          <div class="stage-info-value">${d.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شش گلوگاه ساختاری مهار دیابت در کشور</h3>
        <div class="irapen-stepper-container" style="margin-block-end: var(--space-6);">
          ${bottleneckCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">گسیختگی در زنجیره ارجاع بیماران دیابتی</h3>
        <div style="margin-block-end: var(--space-6);">
          ${deficitCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">موانع و چالش‌های بیماران و کادر درمان</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #ec4899;">موانع روان‌شناختی بیماران:</div>
          <div class="stage-info-value">${sec.patientProviderBarriers.patient}</div>
        </div>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #3b82f6;">چالش‌های پزشکان و کادر درمان:</div>
          <div class="stage-info-value">${sec.patientProviderBarriers.provider}</div>
        </div>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>بحران کلینیک‌های پای دیابتی:</strong> ${sec.patientProviderBarriers.footUlcer}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch09-sec05') {
      const fundRows = sec.rareDiseasesFundComparison.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td style="color: var(--text-secondary);">${r.before}</td>
          <td style="color: var(--accent-primary); font-weight: 700;">${r.after}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بازمهندسی برنامه پزشک خانواده شهری و نظام سلامت جمعیت‌محور</h3>
        <div class="stat-card" style="margin-block-end: var(--space-4); border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">${sec.familyMedicineFormula.ratio}</div>
          <div class="stat-label">${sec.familyMedicineFormula.scale}</div>
        </div>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-block-end: var(--space-6);">
          ${sec.familyMedicineFormula.proactiveCare} (${sec.familyMedicineFormula.pilot})
        </p>

        <h3 style="margin-block-end: var(--space-3);">پرونده الکترونیک سلامت و بازدهی اقتصادی (ماده ۶۹ برنامه هفتم)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">الزام قانونی:</div>
            <div class="stage-info-value">${sec.ehrAndEconomics.mandate}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #10b981;">بودجه تخصیصی:</div>
            <div class="stage-info-value">${sec.ehrAndEconomics.budget}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--state-danger);">هدف صرفه‌جویی کلان:</div>
            <div class="stage-info-value">${sec.ehrAndEconomics.savingsTarget}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">صندوق بیماری‌های خاص و صعب‌العلاج: مقایسه وضع موجود با افق ۱۴۰۴</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>محور حمایتی</th><th>وضعیت سنتی قبلی</th><th>افق تحول صندوق ۱۴۰۴</th></tr>
            </thead>
            <tbody>${fundRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch09-sec06') {
      const intersectoralCards = sec.intersectoralPillars.map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${p.domain}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${p.action}</div>
        </div>
      `).join('');

      const ecosystemCards = sec.ecosystemPillars.map((p, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${p.pillar}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${p.components}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مداخلات فرابخشی و همه‌جانبه مهار بیماری‌های غیرواگیر</h3>
        <div style="margin-block-end: var(--space-6);">
          ${intersectoralCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">اکوسیستم نوین سلامت ایران در افق ۱۴۰۴</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-4);">
          ${ecosystemCards}
        </div>
        <div class="medical-callout callout-info">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>پیامد راهبردی اکوسیستم:</strong> ${sec.ecosystemOutcome}</p></div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 10 sections (Substance Abuse in Iran)
   */
  renderChapter10Section(sec) {
    if (sec.id === 'ch10-sec01') {
      const hiddenCards = sec.hiddenVariables.map(v => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger); font-size: var(--font-size-sm);">${v.factor}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${v.impact}</div>
        </div>
      `).join('');

      const limitCards = sec.systemicLimits.map(l => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${l.limit}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${l.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">متغیرهای پنهان جمعیتی و خطای کم‌شماری (Underreporting)</h3>
        <div style="margin-block-end: var(--space-6);">
          ${hiddenCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">محدودیت‌های ساختاری و سیستمی ثبت داده‌ها</h3>
        <div>
          ${limitCards}
        </div>
      `;
    }

    if (sec.id === 'ch10-sec02') {
      const legalRows = sec.legalVsIllegalTable.map(r => `
        <tr>
          <td><strong>${r.substance}</strong></td>
          <td><span class="badge" style="padding: 2px 8px; border-radius: var(--radius-sm); ${r.legalStatus === 'قانونی' ? 'background: rgba(16,185,129,0.15); color: #10b981;' : 'background: rgba(239,68,68,0.15); color: #ef4444;'}">${r.legalStatus}</span></td>
          <td>${r.globalBurden}</td>
          <td style="font-weight: 700; color: var(--accent-primary);">${r.iranStatus}</td>
        </tr>
      `).join('');

      const dalysCards = sec.dalysGrowth.map(d => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${d.growth}</div>
          <div class="stat-label">${d.substance}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیمای بار جهانی بیماری‌ها (GBD): مواد قانونی در برابر غیرقانونی</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>ماده مخدر / محرک</th><th>وضعیت حقوقی</th><th>شاخص‌های جهانی مرگ و بار</th><th>وضعیت مصرف در ایران</th></tr>
            </thead>
            <tbody>${legalRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تغییرات بار بیماری ناشی از مواد غیرقانونی (DALYs)</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${dalysCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوارض عفونی سوءمصرف تزریقی (PWID)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-lg);">۱۱.۳ میلیون نفر</div>
            <div class="stat-label">${sec.pwidInfections.population}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-lg);">۱۰ درصد (~۱ میلیون)</div>
            <div class="stat-label">${sec.pwidInfections.hivPrevalence}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-lg);">۵۰ درصد (~۵.۵ میلیون)</div>
            <div class="stat-label">${sec.pwidInfections.hcvPrevalence}</div>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-start: var(--space-2);">${sec.pwidInfections.genderDynamics}</p>
      `;
    }

    if (sec.id === 'ch10-sec03') {
      const yldRows = sec.yldAgeTable.map(r => `
        <tr>
          <td><strong>${r.age}</strong></td>
          <td style="color: var(--state-danger); font-weight: 800;">${r.iran}</td>
          <td>${r.emro}</td>
        </tr>
      `).join('');

      const basketCards = sec.substanceBasket.map(b => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary);">${b.share}</div>
          <div style="font-weight: 700; color: var(--text-primary); margin-block: 2px;">${b.name}</div>
          <div class="stat-label">${b.pattern}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>موقعیت ژئوپلیتیک هلال طلایی (Golden Crescent):</strong> ${sec.goldenCrescentContext}</p>
            <p style="margin-block-start: 4px;">${sec.focalAgeInsight}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه نرخ YLD اعتیاد (در ۱۰۰ هزار نفر): ایران در برابر منطقه EMRO</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>گروه سنی</th><th>نرخ YLD در ایران (۲۰۰۳)</th><th>نرخ YLD در منطقه مدیترانه شرقی (۲۰۰۲)</th></tr>
            </thead>
            <tbody>${yldRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سبد توزیع و سهم ترکیبات مصرفی در ایران</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-4);">
          ${basketCards}
        </div>
        <div style="display: flex; gap: var(--space-4); flex-wrap: wrap;">
          <span class="badge" style="padding: 6px 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-default);">میانگین سن شروع: ${sec.demographicMetrics.onsetAge}</span>
          <span class="badge" style="padding: 6px 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-default);">${sec.demographicMetrics.genderRatio}</span>
        </div>
      `;
    }

    if (sec.id === 'ch10-sec04') {
      const milestoneCards = sec.surveillanceMilestones.map((m, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${m.method}</div></div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: 4px;">متدولوژی: ${m.approach}</div>
          <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">دستاورد / چالش: ${m.limitation}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر تحول نظام مراقبت و پایش اعتیاد در ایران</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-6);">
          ${milestoneCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">داده‌های اپیدمیولوژی فضایی پاتوق‌ها (طرح کشوری ۱۳۹۷)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary);">${sec.spatialEpidemiology.cities}</div>
            <div class="stat-label">شهرهای تحت پوشش سراسری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger);">${sec.spatialEpidemiology.hotspots}</div>
            <div class="stat-label">پاتوق فعال شناسایی‌شده با GIS</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #10b981;">
            <div class="stat-metric" style="color: #10b981;">${sec.spatialEpidemiology.coverage}</div>
            <div class="stat-label">پوشش مصرف‌کنندگان تزریقی کشور</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مدل زیستی-روانی-اجتماعی (Biopsychosocial) و چرخه اعتیاد WHO</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">تعریف ماهیت اعتیاد:</div>
          <div class="stage-info-value">${sec.biopsychosocialEtiology.definition}</div>
        </div>
        <div style="margin-block-end: var(--space-4);">
          ${sec.biopsychosocialEtiology.threeTriggers.map(t => `
            <div class="stage-info-block" style="margin-block-end: var(--space-2);">
              <div class="stage-info-label" style="color: var(--text-primary); font-size: var(--font-size-sm);">${t.trigger}:</div>
              <div class="stage-info-value" style="font-size: var(--font-size-sm);">${t.detail}</div>
            </div>
          `).join('')}
        </div>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p><strong>چرخه اتیولوژیک اعتیاد:</strong> ${sec.biopsychosocialEtiology.whoCycle}</p></div>
        </div>
      `;
    }

    if (sec.id === 'ch10-sec05') {
      const paradigmRows = sec.dualParadigm.map(p => `
        <tr>
          <td><strong>${p.axis}</strong></td>
          <td>${p.approach}</td>
          <td style="font-weight: 700; color: ${p.axis.includes('عرضه') ? 'var(--state-danger)' : '#10b981'};">${p.assessment}</td>
        </tr>
      `).join('');

      const nidaCards = sec.nidaFramework.map((n, idx) => `
        <div class="stage-step-card stage-${idx + 1}">
          <div class="stage-header"><div class="stage-title">${n.level}</div></div>
          <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">${n.actions}</p>
        </div>
      `).join('');

      const principleCards = sec.effectivenessPrinciples.map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${p.principle}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${p.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پارادایم دوگانه کنترل: کاهش عرضه در برابر کاهش تقاضا</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>محور کنترل</th><th>اقدامات و رویکردها</th><th>کارآمدی و ارزیابی اپیدمیولوژیک</th></tr>
            </thead>
            <tbody>${paradigmRows}</tbody>
          </table>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content"><p><strong>هشدار آموزشی:</strong> ${sec.scareTacticsWarning}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">چارچوب مداخلات سه‌گانه NIDA</h3>
        <div class="natural-history-container" style="margin-block-end: var(--space-6);">
          ${nidaCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های پنج‌گانه اثربخشی در برنامه‌های پیشگیری</h3>
        <div>
          ${principleCards}
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Renders specialized educational view for Chapter 11 sections (Tobacco Control in Iran)
   */
  renderChapter11Section(sec) {
    if (sec.id === 'ch11-sec01') {
      const trendCards = sec.iranTemporalTrends.map(t => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${t.rate}</div>
          <div class="stat-label">سال ${t.year}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">کلیات و سیمای جهانی مصرف دخانیات</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">جمعیت مصرف‌کننده:</div>
            <div class="stage-info-value">${sec.globalOverview.consumers}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--state-danger);">مرگ‌ومیر سالانه:</div>
            <div class="stage-info-value">${sec.globalOverview.mortality}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #ec4899;">شکاف جنسیتی جهانی:</div>
            <div class="stage-info-value">${sec.globalOverview.globalGenderRatio}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روند زمانی شیوع مصرف دخانیات در ایران (۱۳۷۰ تا ۱۴۰۰)</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${trendCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت دموگرافیک، جنسیتی و منطقه‌ای (سال ۱۴۰۱)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
          <div class="stat-card" style="border-inline-start: 4px solid #3b82f6;">
            <div class="stat-metric" style="color: #3b82f6;">${sec.demographicAndRegionalGap.menRate}</div>
            <div class="stat-label">شیوع در مردان ایرانی</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899;">${sec.demographicAndRegionalGap.womenRate}</div>
            <div class="stat-label">شیوع در زنان ایرانی</div>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-start: var(--space-2);">${sec.demographicAndRegionalGap.genderGap} (${sec.demographicAndRegionalGap.regionalStanding})</p>
      `;
    }

    if (sec.id === 'ch11-sec02') {
      const ageRows = sec.stepsAgeTable.map(r => `
        <tr>
          <td><strong>${r.ageGroup}</strong></td>
          <td style="color: var(--state-danger); font-weight: 800;">${r.rate}</td>
          <td>${r.pattern}</td>
        </tr>
      `).join('');

      const compRows = sec.cigaretteVsHookahTable.map(r => `
        <tr>
          <td><strong>${r.feature}</strong></td>
          <td>${r.cigarette}</td>
          <td style="color: var(--state-danger); font-weight: 700;">${r.hookah}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شیوع سنی مصرف سیگار بر اساس پیمایش ملی STEPS</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>گروه سنی</th><th>شیوع مصرف سیگار</th><th>وضعیت و الگوی سنی</th></tr>
            </thead>
            <tbody>${ageRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پراکندگی جغرافیایی و نابرابری‌های منطقه‌ای</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--state-danger);">بیشترین شیوع سیگار:</div>
            <div class="stage-info-value">${sec.geographicInequality.cigaretteHigh}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #10b981;">کمترین شیوع سیگار:</div>
            <div class="stage-info-value">${sec.geographicInequality.cigaretteLow}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #ec4899;">کانون‌های بحران قلیان:</div>
            <div class="stage-info-value">${sec.geographicInequality.hookahHotspots}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">شکاف شهری-روستایی:</div>
            <div class="stage-info-value">${sec.geographicInequality.ruralUrbanShift}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دگرگونی الگوی مصرف: مقایسه تفصیلی سیگار در برابر قلیان</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>متغیر بالینی و رفتاری</th><th>سیگار</th><th>قلیان</th></tr>
            </thead>
            <tbody>${compRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch11-sec03') {
      const uniCards = sec.universityStudentsData.map(u => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${u.stat}</div>
          <div class="stat-label">${u.label}</div>
        </div>
      `).join('');

      const causationCards = sec.webOfCausation.map(w => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-size: var(--font-size-sm);">${w.domain}</div>
          <div class="stage-info-value" style="font-size: var(--font-size-sm);">${w.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بحران مصرف دخانیات در نوجوانان</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">روزانه ۸۰ تا ۱۰۰ هزار</div>
            <div class="stat-label">${sec.adolescentMetrics.incidence}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">۲۰ درصد نوجوانان</div>
            <div class="stat-label">${sec.adolescentMetrics.globalPrevalence} (${sec.adolescentMetrics.genderRatio})</div>
          </div>
        </div>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-6);">${sec.adolescentMetrics.heavySmokerRisk}</p>

        <h3 style="margin-block-end: var(--space-3);">بحران مصرف و باورهای غلط در دانشجویان دانشگاه‌ها</h3>
        <div class="stat-cards-grid" style="margin-block-end: var(--space-6);">
          ${uniCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">شبکه علیت (Web of Causation) آغاز مصرف در نوجوانان</h3>
        <div style="margin-block-end: var(--space-6);">
          ${causationCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">مواجهه با دود تحمیلی دست دوم (Secondhand Smoke)</h3>
        <div class="medical-callout callout-warning">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>قربانیان دود دست دوم:</strong> ${sec.secondhandSmokeStats.globalDeaths} (${sec.secondhandSmokeStats.vulnerableVictims})</p>
            <p style="margin-block: 4px;"><strong>مواجهه در منزل:</strong> ${sec.secondhandSmokeStats.homeExposure}</p>
            <p><strong>شیوع مواجهه مستمر در ایران:</strong> ${sec.secondhandSmokeStats.iranPrevalence}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch11-sec04') {
      const mpowerCards = sec.mpowerFramework.map(m => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 800;">${m.letter}</div>
          <div class="stage-info-value">${m.desc}</div>
        </div>
      `).join('');

      const lawCards = sec.nationalLaw1385.map(l => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${l.rule}</div>
          <div class="stage-info-value">${l.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">استراتژی شش‌گانه جهانی WHO (چارچوب MPOWER)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${mpowerCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">قانون جامع کنترل و مبارزه ملی با دخانیات (مصوب ۱۳۸۵)</h3>
        <div style="margin-block-end: var(--space-6);">
          ${lawCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">واقعیت‌های بالینی ترک و موانع ساختاری</h3>
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-4);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>نرخ بقای ترک:</strong> ${sec.clinicalCessationFacts.oneYearSuccess}</p>
            <p style="margin-block: 4px;"><strong>رویکرد رفتاری برتر:</strong> ${sec.clinicalCessationFacts.coldTurkeyVsGradual}</p>
            <p><strong>اثربخشی دارویی:</strong> ${sec.clinicalCessationFacts.pharmacotherapy}</p>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6);">
          <div class="stage-info-label" style="color: var(--state-danger);">موانع ساختاری و قاچاق:</div>
          <div class="stage-info-value">${sec.structuralBarriers.contraband} (${sec.structuralBarriers.implementationGap})</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">افق و محورهای راهبردی پزشکی پیشگیری</h3>
        <div>
          ${sec.futurePreventionStrategy.map(s => `
            <div class="stage-info-block" style="margin-block-end: var(--space-3);">
              <div class="stage-info-label" style="color: #10b981;">${s.strategy}</div>
              <div class="stage-info-value">${s.desc}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Bind event listeners for section actions (Bookmark, Copy Link)
   */

  /**
   * Chapter 12: Congenital Hypothyroidism
   */
  renderChapter12Section(sec) {
    if (sec.id === 'ch12-sec01') {
      const classCards = (sec.classifications || []).map(c => `
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-4);">
          <h4 style="color: var(--accent-primary); margin-block-end: var(--space-3); font-size: var(--font-size-sm);">${c.axis || ''}</h4>
          ${(c.types || []).map(t => `
            <div class="stage-info-block" style="margin-block-end: var(--space-2);">
              <div class="stage-info-label">${t.name || ''}</div>
              <div class="stage-info-value">${t.desc || ''}</div>
            </div>
          `).join('')}
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>آبشار پاتوفیزیولوژی آسیب مغزی:</strong></p>
            <p style="margin-block-start: 6px; font-weight: 600; color: var(--state-danger); direction: ltr; text-align: center;">${sec.damageCascade || 'نقص بیولوژیک (ساختاری یا سنتز) ← افت هورمون‌های تیروئید ← اختلال متابولیک ← آسیب پایدار تکامل مغز'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">محورهای سه‌گانه طبقه‌بندی بالینی کم‌کاری مادرزادی تیروئید</h3>
        <div>${classCards}</div>
      `;
    }

    if (sec.id === 'ch12-sec02') {
      const epi = sec.epidemiology || sec.incidenceComparison || {};
      const rfList = sec.riskCategories || sec.riskFactorsTable || [];
      const rfRows = rfList.map(r => `
        <tr>
          <td style="white-space: nowrap; font-weight: 600; color: var(--accent-primary);">${r.category || ''}</td>
          <td>${r.criteria || r.factors || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های مقایسه‌ای شیوع در ایران و جهان</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">${epi.iranRate || epi.iran || '۱ در ۳۱۶ تولد زنده'}</div>
            <div class="stat-label">نرخ بروز در ایران (میزان شیوع بسیار بالاتر از میانگین جهانی)</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${epi.globalRate || epi.global || '۱ در ۲,۳۷۲ تولد زنده'}</div>
            <div class="stat-label">نرخ بروز جهانی (ایالات متحده - روند افزایشی)</div>
          </div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>استعداد نژادی و ژنتیکی:</strong> ${epi.ethnicPredisposition || epi.racialPredisposition || epi.ethnic || 'نژاد آسیایی در مقایسه با نژاد قفقازی حساسیت ژنتیکی بالاتری نشان می‌دهد.'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دسته‌بندی عوامل خطر و متغیرهای مداخله‌گر</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th style="width: 25%;">رده عامل خطر</th><th>متغیرها و معیارهای شناسایی</th></tr>
            </thead>
            <tbody>${rfRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch12-sec03') {
      const tt = sec.timelineTable || [];
      const timelineCards = tt.map(col => `
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <h4 style="color: #ec4899; margin-block-end: var(--space-3); font-size: var(--font-size-sm); border-bottom: 2px solid #ec4899; padding-bottom: var(--space-2);">${col.column || ''}</h4>
          <ul style="padding-inline-start: var(--space-4); margin: 0; font-size: var(--font-size-sm); line-height: 1.8;">
            ${(col.items || []).map(it => `<li>${it}</li>`).join('')}
          </ul>
        </div>
      `).join('');

      const dmList = sec.detailedManifestations || sec.timelineStages || [];
      const dmBlocks = dmList.map(d => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${d.period || d.stage || ''}</div>
          <div class="stage-info-value">${d.signs || d.features || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>هشدار تشخیصی حیاتی:</strong> ${sec.diagnosticWarning || ''}</p>
          </div>
        </div>

        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        ${tt.length > 0 ? `
          <h3 style="margin-block-end: var(--space-3);">جدول سیر زمانی تظاهرات بالینی در ۳ ماه اول زندگی</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-6);">
            ${timelineCards}
          </div>
        ` : ''}

        <h3 style="margin-block-end: var(--space-3);">شرح تفصیلی تظاهرات بالینی نوزاد</h3>
        <div>${dmBlocks}</div>
      `;
    }

    if (sec.id === 'ch12-sec04') {
      const steps = (sec.sixSteps || []).map(s => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${s.step || ''}: ${s.title || ''}</div>
          <div class="stage-info-value">${s.desc || s.details || ''}</div>
        </div>
      `).join('');

      const lt = sec.laboratoryThresholds || sec.diagnosticCutoffs || {};

      return `
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>اصل طلایی برنامه غربالگری:</strong> ${sec.goldenStandard || 'استاندارد طلایی برنامه غربالگری، اجرای صحیح و بی‌نقص زنجیره نمونه‌گیری است.'}</p>
          </div>
        </div>

        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">زنجیره اجرایی ۶ گام پروتکل کشوری غربالگری</h3>
        <div style="margin-block-end: var(--space-6);">${steps}</div>

        <h3 style="margin-block-end: var(--space-3);">${lt.title || 'آستانه‌های آزمایشگاهی تشخیص قطعی و شروع فوری درمان'}</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 2px solid var(--state-danger); margin-block-end: var(--space-6);">
          <p style="font-weight: 600; margin-block-end: var(--space-3);">${lt.rule || 'مداخله فوری زمانی آغاز می‌شود که نتایج آزمایش سرمی نشان‌دهنده مقادیر زیر باشد:'}</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
            <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
              <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">${lt.tsh || 'TSH > 10 mU/L'}</div>
              <div class="stat-label">سنجش سرمی TSH</div>
            </div>
            <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
              <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">${lt.t4 || 'Free T4 < 6.5 µg/dL یا T4 < 6.5 µg/dL'}</div>
              <div class="stat-label">سنجش سرمی Free T4 یا T4</div>
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch12-sec05') {
      const hr = sec.replacementProtocol || sec.treatmentProtocol || {};
      const com = (sec.associatedAnomalies || sec.comorbidities || []).map(c => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${c.title || c.domain || ''}</div>
          <div class="stage-info-value">${c.desc || ''}</div>
        </div>
      `).join('');

      const p3 = sec.threeYearProtocol || {};
      const isP3Obj = typeof p3 === 'object' && p3 !== null;

      return `
        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>اصل کلیدی درمان:</strong> ${sec.keyPrinciple || sec.goldenRule || 'در پروتکل درمانی CH، «زمان، بافت مغزی است». هرگونه تأخیر به از دست رفتن پتانسیل شناختی می‌انجامد.'}</p>
          </div>
        </div>

        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل جایگزینی هورمونی</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${hr.drug || 'لووتیروکسین (Levothyroxine)'}</div>
            <div class="stat-label">داروی انتخابی خط اول جایگزینی</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #10b981;">
            <div class="stat-metric" style="color: #10b981; font-size: var(--font-size-base);">${hr.timing || hr.window || 'هفته‌های ۲ تا ۳ پس از تولد'}</div>
            <div class="stat-label">اثربخشی بالینی: ${hr.efficacy || '۱۰۰٪ حفظ ضریب هوشی (IQ) نرمال'}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">غربالگری ناهنجاری‌های همراه مادرزادی</h3>
        <p style="margin-block-end: var(--space-3); color: var(--text-muted); font-size: var(--font-size-sm);">کلیه نوزادان با تشخیص قطعی CH باید بلافاصله جهت بررسی ناهنجاری‌های مادرزادی تحت مشاوره‌های تخصصی زیر قرار گیرند:</p>
        <div style="margin-block-end: var(--space-6);">${com}</div>

        <h3 style="margin-block-end: var(--space-3);">${isP3Obj ? (p3.title || 'پروتکل تفکیک کم‌کاری دائمی از گذرا در ۳ سالگی') : 'پروتکل تفکیک کم‌کاری دائمی از گذرا در ۳ سالگی'}</h3>
        <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
          <div class="stage-info-label" style="color: #8b5cf6;">پروتکل بازسنجی بالینی ۳ سالگی:</div>
          <div class="stage-info-value">
            ${isP3Obj ? `
              <p style="margin-block-end: var(--space-2);">• ${p3.phase1 || ''}</p>
              <p style="margin: 0;">• ${p3.phase2 || ''}</p>
            ` : `<p style="margin: 0;">${p3 || ''}</p>`}
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch12-sec06') {
      const ind = sec.nationalIndicators || sec.nationalMetrics || [];
      const indCards = ind.map(m => `
        <div class="stat-card" style="border-inline-start: 4px solid #10b981;">
          <div class="stat-metric" style="color: #10b981; font-size: var(--font-size-base);">${m.metric || m.value || ''}</div>
          <div class="stat-label"><strong>${m.label || m.desc || ''}:</strong> ${m.desc || ''}</div>
        </div>
      `).join('');

      const hmis = sec.hmisWorkflow || sec.hmisStructure || {};
      const prev = sec.primaryPrevention || [];
      const prevList = prev.map(p => {
        if (typeof p === 'string') {
          return `<li style="margin-block-end: var(--space-2);">${p}</li>`;
        }
        return `<li style="margin-block-end: var(--space-2);"><strong>${p.title || ''}:</strong> ${p.desc || ''}</li>`;
      }).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های عملکردی برنامه در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${indCards}
        </div>

        <h3 style="margin-block-end: var(--space-3);">ساختار گزارش‌دهی و پایش سیستم (HMIS)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <div style="margin-block-end: var(--space-3);">
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">سطح محیطی (مراکز نمونه‌گیری):</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${hmis.peripheral || hmis.screeningCenter || 'مراکز نمونه‌گیری: موظف به ثبت و ارسال گزارش‌های روزانه و پیگیری بدون وقفه موارد فراخوان‌شده.'}</p>
          </div>
          <div>
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">سطح ستادی (وزارت بهداشت):</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${hmis.headquarters || hmis.central || 'سطح ستادی (اداره غدد و متابولیک وزارت بهداشت): پایش پیوسته شاخص‌ها و تحلیل عملکرد استانی در فواصل سه‌ماهه (فصلی).'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اقدامات پیشگیرانه اولیه مکمل</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <ul style="padding-inline-start: var(--space-4); margin: 0; line-height: 1.8;">
            ${prevList}
          </ul>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Chapter 13: Hypertension
   */
  renderChapter13Section(sec) {
    if (sec.id === 'ch13-sec01') {
      const sRows = (sec.stagingTable || []).map(s => `
        <tr>
          <td><strong>${s.stage || s.category || ''}</strong></td>
          <td><span class="medical-badge badge-primary">${s.sbp || ''}</span></td>
          <td><span class="medical-badge badge-neutral">${s.dbp || ''}</span></td>
        </tr>
      `).join('');

      const dt = sec.diagnosticThresholds || {};
      const et = sec.etiology || {};
      const hi = sec.hemodynamicIndices || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>تعریف بالینی پرفشاری خون (BP):</strong> ${sec.definition || 'سطحی از فشار خون (BP) که منجر به افزایش عوارض قلبی‌عروقی و مرگ‌ومیر گردد.'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">آستانه‌های تشخیصی و اهداف درمانی فشار خون</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">≥ 140 / 90 mmHg</div>
            <div class="stat-label"><strong>آستانه تشخیصی در جمعیت عمومی:</strong> ${dt.general || ''}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #10b981;">
            <div class="stat-metric" style="color: #10b981; font-size: var(--font-size-base);">< 130 / 80 mmHg</div>
            <div class="stat-label"><strong>تارگت درمانی در گروه‌های پرخطر:</strong> ${dt.highRiskTarget || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مراحل طبقه‌بندی بالینی پرفشاری خون</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>مرحله (Stage)</th><th>فشار خون سیستولی (mmHg)</th><th>فشار خون دیاستولی (mmHg)</th></tr>
            </thead>
            <tbody>${sRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اتیولوژی بیماری</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">پرفشاری خون اولیه (Essential):</div>
            <div class="stage-info-value">${et.essential || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #ec4899;">
            <div class="stage-info-label" style="color: #ec4899;">پرفشاری خون ثانویه:</div>
            <div class="stage-info-value">${et.secondary || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های همودینامیک و نقش پیشگویی‌کننده در وقایع قلبی‌عروقی</h3>
        <div class="stage-info-block" style="border-inline-start-color: #10b981;">
          <div class="stage-info-label" style="color: #10b981;">شاخص‌های همودینامیک (PP & MAP):</div>
          <div class="stage-info-value">
            <p style="margin-block-end: var(--space-2);">• ${hi.sbpAndDbp || 'فشار خون سیستولی و دیاستولی هر دو در بروز حوادث قلبی‌عروقی نقش دارند.'}</p>
            <p style="margin-block-end: var(--space-2);">• <strong>فشار نبض (Pulse Pressure = سیستول - دیاستول):</strong> ${hi.pulsePressure || ''}</p>
            <p style="margin: 0;">• <strong>فشار متوسط شریانی (MAP):</strong> ${hi.mapFormula || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch13-sec02') {
      const gt = sec.globalTrends || {};
      const cascade = (sec.cascadeOfCare || []).map(c => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${c.rate || ''}</div>
          <div class="stat-label"><strong>${c.step || ''}:</strong> ${c.desc || ''}</div>
        </div>
      `).join('');

      const awList = (sec.awarenessVariables || []).map(a => `
        <li style="margin-block-end: var(--space-2);">${a}</li>
      `).join('');

      const rf = sec.riskFactors || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روند جهانی پرفشاری خون (۱۹۹۹ تا ۲۰۱۹)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <ul style="padding-inline-start: var(--space-4); margin: 0; line-height: 1.8;">
            <li><strong>روند شمار مطلق:</strong> ${gt.doubling || ''}</li>
            <li><strong>شیوع استانداردشده سنی:</strong> ${gt.ageStandardized || ''}</li>
            <li><strong>تغییرات بر حسب وضعیت اقتصادی:</strong> ${gt.economicTrend || ''}</li>
            <li><strong>رتبه بار جهانی بیماری:</strong> ${gt.dalyRank || ''}</li>
            <li><strong>توزیع منطقه‌ای:</strong> ${gt.regionalDistribution || ''}</li>
          </ul>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شیوع کلی و زنجیره مراقبت (Cascade of Care)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${cascade}
        </div>

        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>پیامد بالینی حیاتی:</strong> ${sec.clinicalImpact || 'کنترل مؤثر پرفشاری خون منجر به کاهش ۴۰ درصدی در بروز سکته مغزی و کاهش ۱۵ درصدی در وقوع سکته قلبی می‌شود.'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">متغیرهای مرتبط با آگاهی از بیماری</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <ul style="padding-inline-start: var(--space-4); margin: 0; line-height: 1.8;">
            ${awList}
          </ul>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس عوامل خطر و ارزیابی بالینی</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">عوامل خطر قابل اصلاح:</div>
            <div class="stage-info-value">${rf.modifiable || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--text-muted);">
            <div class="stage-info-label" style="color: var(--text-muted);">عوامل خطر غیرقابل اصلاح:</div>
            <div class="stage-info-value">${rf.nonModifiable || ''}</div>
          </div>
        </div>

        <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
          <div class="stage-info-label" style="color: #8b5cf6;">ارزیابی خطر بالینی:</div>
          <div class="stage-info-value">${rf.framinghamScore || '«تابع خطر فرامینگهام» (Framingham Risk Score) جهت پیش‌بینی خطرات قلبی‌عروقی در جمعیت ایران دارای اعتبار بالینی اثبات‌شده است.'}</div>
        </div>
      `;
    }

    if (sec.id === 'ch13-sec03') {
      const ag = sec.ageAndGender || {};
      const gd = sec.geographicAndDemographics || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روند سنی و تفکیک جنسیتی در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">+۰/۵۴٪ به ازای هر سال</div>
            <div class="stat-label"><strong>شیب سنی افزایش شیوع:</strong> ${ag.slope || ''}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">تفاوت جنسیتی</div>
            <div class="stat-label"><strong>الگوی تفکیک جنسیتی:</strong> ${ag.genderGap || ''}</div>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6); border-inline-start-color: #10b981;">
          <div class="stage-info-label" style="color: #10b981;">عوامل مستقل و همبستگی‌ها:</div>
          <div class="stage-info-value">
            <p style="margin-block-end: var(--space-2);">• ${ag.independentFactors || 'پرفشاری خون در هر دو جنس به طور مستقل با متغیرهای سن، وزن، قند خون و کلسترول رابطه مستقیم دارد.'}</p>
            <p style="margin: 0;">• ${ag.educationAndSmoking || 'تحصیلات بالاتر در هر دو جنس و ترک سیگار در مردان، با کاهش شیوع پرفشاری خون همبستگی دارد.'}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">توزیع جغرافیایی، جمعیتی و اجتماعی</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <div style="margin-block-end: var(--space-3);">
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">شهر در برابر روستا و پدیده مهاجرت:</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${gd.ruralVsUrban || ''}</p>
          </div>
          <div style="margin-block-end: var(--space-3);">
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">نظام مراقبت اولیه روستایی و نقش بهورزان:</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${gd.behvarzRole || ''}</p>
          </div>
          <div style="margin-block-end: var(--space-3);">
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">توزیع استانی و شاخص توسعه انسانی (HDI):</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${gd.provincialDistribution || ''} ${gd.hdiAndEthnicity || ''}</p>
          </div>
          <div>
            <div style="font-weight: 600; color: var(--accent-primary); margin-block-end: 4px;">شاخص وضعیت اقتصادی:</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${gd.economicStatus || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch13-sec04') {
      const cvCards = (sec.cardiovascularRisks || sec.cardiovascularImpact || []).map(c => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${c.factor || ''}</div>
          <div class="stage-info-value">${c.impact || ''}</div>
        </div>
      `).join('');

      const dp = sec.dietaryPatterns || {};
      const prev = (sec.preventionLevels || []).map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${p.level || ''}</div>
          <div class="stage-info-value">${p.action || ''}</div>
        </div>
      `).join('');

      const cm = sec.careModels || {};
      const cc = cm.collaborativeCare || {};
      const steps = (cc.components || []).map(s => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2);">
          <div class="stage-info-label" style="color: #ec4899;">گام ${s.step || ''}: ${s.title || ''}</div>
          <div class="stage-info-value">${s.desc || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">خطرات بیماری‌های قلبی‌عروقی و بار اختصاصی</h3>
        <div style="margin-block-end: var(--space-6);">${cvCards}</div>

        <h3 style="margin-block-end: var(--space-3);">تأثیر الگوهای تغذیه‌ای</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">الگوی غذایی غربی:</div>
            <div class="stage-info-value">${dp.western || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
            <div class="stage-info-label" style="color: #8b5cf6;">الگوی غذایی ایرانی:</div>
            <div class="stage-info-value">${dp.iranian || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح سه‌گانه پیشگیری بالینی</h3>
        <div style="margin-block-end: var(--space-6);">${prev}</div>

        <h3 style="margin-block-end: var(--space-3);">${cc.title || 'مدل مراقبت مشارکتی (Collaborative Care Model)'}</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-muted); margin-block-end: var(--space-3);">${cc.description || ''}</p>
        <div style="margin-block-end: var(--space-6);">${steps}</div>

        <div class="stage-info-block" style="border-inline-start-color: #10b981;">
          <div class="stage-info-label" style="color: #10b981;">برنامه ملی ادغام‌یافته:</div>
          <div class="stage-info-value">${cm.integratedProgram || 'برنامه جامع و مشترک مراقبت ادغام‌یافته پرفشاری خون و دیابت از سال ۱۳۸۳ در نظام سلامت کشور به مرحله اجرا درآمده است.'}</div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Chapter 14: Micronutrient Deficiencies & IDD
   */
  renderChapter14Section(sec) {
    if (sec.id === 'ch14-sec01') {
      const hh = sec.hiddenHunger || {};
      const mRows = (sec.micronutrientsMatrix || []).map(m => `
        <tr>
          <td><strong>${m.nutrient || ''}</strong></td>
          <td><span class="medical-badge badge-danger">${m.globalBurden || ''}</span></td>
          <td>${m.clinicalFeatures || ''}</td>
          <td>${m.iranStatus || ''}</td>
        </tr>
      `).join('');

      const stratCards = (sec.fourStrategies || []).map(s => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${s.title || ''}</div>
          <div class="stage-info-value">${s.desc || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>تعریف گرسنگی پنهان (Hidden Hunger):</strong> ${hh.definition || sec.hiddenHungerConcept || ''}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-warning);">
            <div class="stage-info-label" style="color: var(--state-warning);">عوامل خطر کلیدی:</div>
            <div class="stage-info-value">${hh.riskFactors || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">پیامدهای کلان بهداشتی و اقتصادی:</div>
            <div class="stage-info-value">${hh.macroImpacts || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">استراتژی‌های چهارگانه مهار گرسنگی پنهان در ایران</h3>
        <div style="margin-block-end: var(--space-6);">${stratCards}</div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس تحلیلی ۴ ریزمغذی کلیدی، بار بیماری و وضعیت در ایران</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th>ریزمغذی</th>
                <th>بار اپیدمیولوژیک جهانی</th>
                <th>تظاهرات بالینی و عوارض اختصاصی</th>
                <th>سیمای شیوع در ایران</th>
              </tr>
            </thead>
            <tbody>${mRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch14-sec02') {
      const lcCards = (sec.lifeCycleConsequences || []).map(l => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #ec4899;">${l.stage || ''}</div>
          <div class="stage-info-value">${l.consequences || l.impact || ''}</div>
        </div>
      `).join('');

      const gRows = (sec.whoGoiterGrading || []).map(g => `
        <tr>
          <td><span class="medical-badge ${g.grade.includes('0') ? 'badge-neutral' : (g.grade.includes('1') ? 'badge-warning' : 'badge-danger')}">${g.grade || ''}</span></td>
          <td><strong>${g.definition || g.desc || ''}</strong></td>
          <td>${g.method || 'معاینه بالینی'}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>نقش بیولوژیک ید:</strong> ید پیش‌ساز اساسی سنتز هورمون‌های تیروئیدی بوده و برای رشد و تمایز بافت مغزی ضروری است.</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیامدهای بالینی کمبود ید در چرخه حیات انسان</h3>
        <div style="margin-block-end: var(--space-6);">${lcCards}</div>

        <h3 style="margin-block-end: var(--space-3);">درجه‌بندی گواتر بر اساس استاندارد سازمان جهانی بهداشت (WHO)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th>درجه گواتر (Grade)</th>
                <th>مشخصات و معیارهای تشخیصی</th>
                <th>روش ارزیابی بالینی</th>
              </tr>
            </thead>
            <tbody>${gRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch14-sec03') {
      const epi = sec.epidemiologyIran || {};
      const milestones = epi.milestones || sec.milestones || [];
      const mCards = milestones.map(m => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #10b981;">سال ${m.year || ''}</div>
          <div class="stage-info-value">${m.event || ''}</div>
        </div>
      `).join('');

      const sCards = (sec.nationalStrategies || []).map(s => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${s.pillar || s.title || ''}</div>
          <div class="stage-info-value">${s.details || s.actions || s.desc || ''}</div>
        </div>
      `).join('');

      const tCards = (sec.emergingThreats || []).map(t => `
        <div class="stage-info-block" style="border-inline-start-color: var(--state-danger); margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${t.threat || ''}</div>
          <div class="stage-info-value">${t.desc || t.danger || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار اپیدمیولوژی و روندهای آماری کنترل ید در ایران</h3>
        <div style="margin-block-end: var(--space-6);">${mCards}</div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6); border-inline-start-color: var(--accent-primary);">
          <div class="stage-info-label" style="color: var(--accent-primary);">وضعیت آهن و روی در بررسی‌های ملی:</div>
          <div class="stage-info-value">${epi.ironAndZincStatus || ''}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">استراتژی‌های اجرایی پیشگیری و کنترل در ایران</h3>
        <div style="margin-block-end: var(--space-6);">${sCards}</div>

        <h3 style="margin-block-end: var(--space-3); color: var(--state-danger);">چالش‌های بهداشتی نوظهور</h3>
        <div>${tCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /**
   * Chapter 15: NCDs Epidemiology & Prevention
   */
  renderChapter15Section(sec) {
    if (sec.id === 'ch15-sec01') {
      const critBadges = (sec.chronicDiseaseCriteria || []).map((c, idx) => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: var(--accent-primary);">
          <div class="stage-info-value"><span class="medical-badge badge-primary" style="margin-inline-end: 6px;">${idx + 1}</span>${c}</div>
        </div>
      `).join('');

      const excCards = (sec.infectiousExceptions || []).map(e => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start-color: #ec4899;">
          <div class="stage-info-label" style="color: #ec4899; font-weight: 700;">${e.cancer || ''}</div>
          <div class="stage-info-value">
            <p><strong>عامل اتیولوژیک / پاتوژن:</strong> ${e.pathogen || e.cause || ''}</p>
            <p style="margin-block-start: 4px;"><strong>سازوکار و پیشگیری:</strong> ${e.prevention || e.mechanism || ''}</p>
          </div>
        </div>
      `).join('');

      const gg = sec.globalGroups || {};
      const fourList = gg.fourGlobal || gg.fourMain || [];
      const fourBadges = fourList.map(g => `<span class="medical-badge badge-primary" style="margin: 4px; display: inline-block; padding: 6px 12px; font-size: var(--font-size-sm);">${g}</span>`).join('');

      const whoStats = (gg.whoMortalityStats || []).map(s => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base); font-weight: 700;">${s.metric || ''}</div>
          <div class="stat-label">${s.label || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>گذار اپیدمیولوژیک:</strong> ${sec.transitionConcept || ''}</p>
            ${sec.developmentGoals ? `<p style="margin-block-start: 6px;"><strong>جایگاه در اهداف توسعه:</strong> ${sec.developmentGoals}</p>` : ''}
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">معیارهای ۶‌گانه تعریف بیماری‌های مزمن و غیرواگیر</h3>
        <div style="margin-block-end: var(--space-6);">${critBadges}</div>

        <h3 style="margin-block-end: var(--space-3);">۴ گروه اصلی جهانی بیماری‌های مزمن و گروه پنجم در ایران</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <div style="margin-block-end: var(--space-3);">${fourBadges}</div>
          <div style="margin-block-start: var(--space-3); padding-block-start: var(--space-3); border-block-start: 1px dashed var(--border-default);">
            <strong>تعدیل اختصاصی در ایران (گروه پنجم):</strong>
            <span class="medical-badge badge-warning" style="margin-inline-start: 8px;">${gg.iranFifthGroup || gg.iranFifth || 'بیماری‌های روانی'}</span>
          </div>
          <div style="margin-block-start: var(--space-3); padding: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md); border-inline-start: 3px solid #f59e0b;">
            <strong>جایگاه چاقی مفرط:</strong> ${gg.obesityStatus || gg.obesityNote || 'چاقی مفرط یک بیماری مستقل نیازمند درمان است.'}
          </div>
        </div>

        ${whoStats ? `
          <h3 style="margin-block-end: var(--space-3);">شاخص‌های کلیدی مرگ‌ومیر و بار بیماری‌ها (WHO)</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
            ${whoStats}
          </div>
        ` : ''}

        <h3 style="margin-block-end: var(--space-3);">استثناهای سرطانی وابسته به عفونت (قابل مهار با واکسن و آنتی‌بیوتیک)</h3>
        <div>${excCards}</div>
      `;
    }

    if (sec.id === 'ch15-sec02') {
      const rh = sec.riskHierarchy || {};
      const nonMod = Array.isArray(rh.nonModifiable) ? rh.nonModifiable.join('، ') : (rh.nonModifiable || '');
      const modBehav = Array.isArray(rh.modifiableBehavioral) ? rh.modifiableBehavioral.join('، ') : (Array.isArray(rh.behavioral) ? rh.behavioral.join('، ') : (rh.modifiableBehavioral || ''));
      const interMet = Array.isArray(rh.intermediateMetabolic) ? rh.intermediateMetabolic.join('، ') : (Array.isArray(rh.metabolic) ? rh.metabolic.join('، ') : (rh.intermediateMetabolic || ''));

      const lbCards = (sec.lifestyleBurdenStats || []).map(l => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start-color: var(--state-danger);">
          <div class="stage-info-label" style="color: var(--state-danger); font-weight: 700;">${l.factor || ''}</div>
          <div class="stage-info-value">
            <p><strong>سهم بار بیماری و مرگ‌ومیر:</strong> ${l.burden || l.attributableBurden || ''}</p>
            ${l.iranContext || l.detail ? `<p style="margin-block-start: 4px; font-size: var(--font-size-xs); color: var(--text-muted);">${l.iranContext || l.detail}</p>` : ''}
          </div>
        </div>
      `).join('');

      const expRows = (sec.exposureMatrix || []).map(row => `
        <tr>
          <td><strong style="color: var(--accent-primary);">${row.factor || ''}</strong></td>
          <td>${row.consequences || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سلسله‌مراتب و طبقه‌بندی عوامل خطر بیماری‌های غیرواگیر</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-4);">
          <div class="stage-info-block" style="border-inline-start-color: #64748b;">
            <div class="stage-info-label" style="color: #64748b;">عوامل غیرقابل اصلاح (Non-modifiable):</div>
            <div class="stage-info-value">${nonMod}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #ec4899;">
            <div class="stage-info-label" style="color: #ec4899;">۴ رفتار بنیادین قابل اصلاح:</div>
            <div class="stage-info-value">${modBehav}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">پیامدهای میانی متابولیک و فیزیولوژیک:</div>
            <div class="stage-info-value">${interMet}</div>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6); border-inline-start-color: #10b981;">
          <div class="stage-info-label" style="color: #10b981; font-weight: 700;">همپوشانی پیشگیرانه عوامل خطر (Synergistic Overlap):</div>
          <div class="stage-info-value">${rh.preventiveOverlap || 'مهار یک عامل خطر به‌طور همزمان از چند بیماری مزمن جلوگیری می‌کند.'}</div>
        </div>

        ${expRows ? `
          <h3 style="margin-block-end: var(--space-3);">ماتریس جامع مواجهه و بیماری‌زایی (عوامل خطر و پیامدها)</h3>
          <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
            <table class="medical-table">
              <thead>
                <tr>
                  <th style="min-inline-size: 180px;">عامل خطر / مواجهه</th>
                  <th>پیامدهای پاتولوژیک و بیماری‌های مرتبط</th>
                </tr>
              </thead>
              <tbody>${expRows}</tbody>
            </table>
          </div>
        ` : ''}

        <h3 style="margin-block-end: var(--space-3);">سهم بار بیماری‌های منتسب به تغذیه، بی‌تحرکی و الکل</h3>
        <div>${lbCards}</div>
      `;
    }

    if (sec.id === 'ch15-sec03') {
      const te = sec.tobaccoEconomics || {};
      const orgCards = (sec.organicComplications || []).map(o => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start-color: var(--accent-primary);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 700;">${o.system || o.organ || ''}</div>
          <div class="stage-info-value">${o.diseases || o.manifestations || ''}</div>
        </div>
      `).join('');

      const tfCards = (sec.tobaccoForms || []).map(t => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start-color: #ec4899;">
          <div class="stage-info-label" style="color: #ec4899; font-weight: 700;">${t.form || ''}</div>
          <div class="stage-info-value">${t.impact || t.riskProfile || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">آمار کلیدی اپیدمیولوژی و عدم توازن اقتصادی دخانیات</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base); font-weight: 700;">۱/۶ مرگ‌های NCDs (۱۶٫۶٪)</div>
            <div class="stat-label">${te.mortalityShare || 'سهم مرگ‌ومیر جهانی دخانیات'}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base); font-weight: 700;">۲ برابر در مردان</div>
            <div class="stat-label">${te.genderDisparity || 'ضریب آسیب‌رسانی و تلفات در مردان'}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #f59e0b;">
            <div class="stat-metric" style="color: #f59e0b; font-size: var(--font-size-base); font-weight: 700;">+۲۵٪ در نوجوانان</div>
            <div class="stat-label">${te.youthGrowth || 'رشد شیوع در کشورهای در حال توسعه'}</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base); font-weight: 700;">۱ دلار در برابر ۵۰۰ دلار</div>
            <div class="stat-label">${te.economicImbalance || 'بودجه مهار WHO در برابر بازاریابی دخانیات'}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوارض ارگانیک و آسیب‌های سیستمیک دخانیات</h3>
        <div style="margin-block-end: var(--space-6);">${orgCards}</div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های انواع فرم‌های مصرفی دخانیات</h3>
        <div>${tfCards}</div>
      `;
    }

    if (sec.id === 'ch15-sec04') {
      const pTiers = (sec.friedenPyramid || []).map((p, idx) => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3); border-inline-start-color: ${idx === 0 ? '#10b981' : idx === 1 ? '#0ea5e9' : idx === 2 ? '#6366f1' : idx === 3 ? '#f59e0b' : '#ec4899'};">
          <div class="stage-info-label" style="color: ${idx === 0 ? '#10b981' : idx === 1 ? '#0ea5e9' : idx === 2 ? '#6366f1' : idx === 3 ? '#f59e0b' : '#ec4899'}; font-weight: 700;">
            طبقه ${p.tier || (idx + 1)}: ${p.title || p.name || ''}
          </div>
          <div class="stage-info-value">
            <p><strong>اثرگذاری جمعیتی:</strong> <span class="medical-badge badge-primary">${p.impact || ''}</span> | <strong>تلاش فردی مورد نیاز:</strong> <span class="medical-badge badge-neutral">${p.effort || ''}</span></p>
            <p style="margin-block-start: 6px;"><strong>نمونه مداخلات:</strong> ${p.examples || p.action || ''}</p>
          </div>
        </div>
      `).join('');

      const fos = sec.failureOfSuccess || {};
      const sed = sec.socioeconomicDynamics || {};
      const threeCons = (sed.threeConsequences || []).map(c => `
        <li style="margin-block-end: 4px;">${c}</li>
      `).join('');

      const stages = (sec.naturalHistoryStages || []).map(st => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: #8b5cf6;">
          <div class="stage-info-label" style="color: #8b5cf6; font-weight: 700;">${st.step || ''}: ${st.name || ''}</div>
          <div class="stage-info-value">${st.desc || ''}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">هرم عوامل مؤثر بر سلامت جامعه (Frieden Health Impact Pyramid)</h3>
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-4);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>قاعده طلایی هرم فریدن:</strong> هرچه از رأس هرم (آموزش فردی) به سمت قاعده هرم (عوامل اقتصادی-اجتماعی و محیطی) حرکت کنیم، اثربخشی جمعیتی افزایش یافته و به تلاش ارادی فردی کمتری نیاز است.</p>
          </div>
        </div>
        <div style="margin-block-end: var(--space-6);">${pTiers}</div>

        <h3 style="margin-block-end: var(--space-3);">دینامیک اقتصادی-اجتماعی سلامت و موانع توسعه</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          ${sed.commercialForces ? `<p style="margin-block-end: var(--space-3);"><strong>نیروهای تجاری و ساختاری:</strong> ${sed.commercialForces}</p>` : ''}
          ${threeCons ? `
            <strong>پیامدهای سه‌گانه گسترش بیماری‌های غیرواگیر:</strong>
            <ul style="margin-block-start: var(--space-2); padding-inline-start: var(--space-4);">${threeCons}</ul>
          ` : ''}
        </div>

        <h3 style="margin-block-end: var(--space-3);">پدیده شکست موفقیت و فشرده‌سازی عوارض (Compression of Morbidity)</h3>
        <div class="stage-info-block" style="margin-block-end: var(--space-4); border-inline-start-color: var(--state-danger);">
          <div class="stage-info-label" style="color: var(--state-danger); font-weight: 700;">سازوکار پدیده شکست موفقیت (Failure of Success):</div>
          <div class="stage-info-value">${fos.mechanism || fos.definition || ''}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981; font-weight: 700;">راهبرد فشرده‌سازی عوارض:</div>
            <div class="stage-info-value">${fos.compressionOfMorbidity || fos.counterStrategy || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #0ea5e9;">
            <div class="stage-info-label" style="color: #0ea5e9; font-weight: 700;">جهت‌گیری ادراکی جامعه:</div>
            <div class="stage-info-value">${fos.perceptionShift || 'اصلاح باور عمومی: بیماری‌های مزمن سرنوشت محتوم سالمندی نیستند.'}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #f59e0b;">
            <div class="stage-info-label" style="color: #f59e0b; font-weight: 700;">هدف‌گذاری WHO (۲۵×۲۵):</div>
            <div class="stage-info-value">${fos.whoTarget || 'کاهش ۲۵ درصدی مرگ‌های زودرس ناشی از NCDs تا سال ۲۰۲۵.'}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر طبیعی بیماری‌های مزمن (مدل خطی ۵ مرحله‌ای)</h3>
        <div style="margin-block-end: var(--space-4);">${stages}</div>
        <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
          <div class="stage-info-label" style="color: #8b5cf6; font-weight: 700;">نقاط بهینه مداخله:</div>
          <div class="stage-info-value">تمرکز حداکثری بر مراحل ۱ تا ۳ جهت تأخیر اساسی در ورود به مراحل ۴ و ۵.</div>
        </div>
      `;
    }

    if (sec.id === 'ch15-sec05') {
      const lRows = (sec.fourLevelsComparison || []).map(l => `
        <tr>
          <td><strong style="color: var(--accent-primary);">${l.level || ''}</strong></td>
          <td>${l.target || ''}</td>
          <td>${l.goal || ''}</td>
          <td><span class="medical-badge badge-neutral">${l.metric || ''}</span></td>
          <td>${l.example || ''}</td>
        </tr>
      `).join('');

      const prim = sec.primordialStrategies || {};
      const ex = sec.exerciseStandards || {};
      const tob = sec.tobaccoPolicies || {};
      const ttm = (sec.ttmStages || []).map(t => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: #ec4899;">
          <div class="stage-info-label" style="color: #ec4899; font-weight: 700;">${t.stage || ''}</div>
          <div class="stage-info-value">${t.desc || ''}</div>
        </div>
      `).join('');

      const sc = sec.secondaryScreening || {};
      const scProgs = (sc.standardPrograms || []).map(p => `<li style="margin-block-end: 4px;">${p}</li>`).join('');
      const scBadges = (sec.screeningFourCriteria || []).map(c => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: var(--accent-primary);">
          <div class="stage-info-value">${c}</div>
        </div>
      `).join('');

      const hd = sec.healthDataPriority || {};
      const hdCrit = (hd.threeCriteria || []).map(c => `<li style="margin-block-end: 4px;">${c}</li>`).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه ساختاری سطوح چهارگانه پیشگیری بالینی و همگانی</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="min-inline-size: 140px;">سطح پیشگیری</th>
                <th>جامعه هدف</th>
                <th>هدف اختصاصی</th>
                <th>تأثیر بر شاخص‌ها</th>
                <th>نمونه مداخلات</th>
              </tr>
            </thead>
            <tbody>${lRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیشگیری مقدماتی (Primordial Prevention)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>منشأ مفهوم:</strong> ${prim.origin || 'نخستین بار توسط US CDC برای پیشگیری از استقرار ریسک‌فاکتورها معرفی شد.'}</p>
          <p style="margin-block-start: 6px;"><strong>چارچوب اکولوژیک تغذیه:</strong> ${prim.ecologicalDiet || ''}</p>
          <p style="margin-block-start: 6px;"><strong>موانع تجاری و تبلیغات:</strong> ${prim.commercialMarketing || ''}</p>
          <p style="margin-block-start: 6px;"><strong>نقش الگوهای خانوادگی:</strong> ${prim.familyPatterns || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">استانداردهای تجویز فعالیت فیزیکی و مبلمان شهری</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>ورزش هوازی متوسط:</strong> ${ex.aerobic || ''}</p>
          <p style="margin-block-start: 6px;"><strong>فعالیت سنگین و قدرتی:</strong> ${ex.resistance || ''}</p>
          <p style="margin-block-start: 6px;"><strong>ابزارهای سنجش:</strong> ${ex.tools || ''}</p>
          ${ex.urbanPlanning ? `<p style="margin-block-start: 6px;"><strong>مداخله در ساختار شهرسازی:</strong> ${ex.urbanPlanning}</p>` : ''}
        </div>

        <h3 style="margin-block-end: var(--space-3);">راهبردهای قانونی و محیطی مهار دخانیات</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: #f59e0b;">
            <div class="stage-info-label" style="color: #f59e0b; font-weight: 700;">سن آغاز مصرف:</div>
            <div class="stage-info-value">${tob.initiationAge || '۸۰٪ موارد پیش از ۱۸ سالگی آغاز می‌شود؛ لزوم آموزش از کلاس پنجم.'}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981; font-weight: 700;">مؤثرترین مداخله اقتصادی:</div>
            <div class="stage-info-value">${tob.taxation || 'افزایش مالیات بر خرده‌فروشی سیگار.'}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #0ea5e9;">
            <div class="stage-info-label" style="color: #0ea5e9; font-weight: 700;">محیط‌های پاک:</div>
            <div class="stage-info-value">${tob.smokeFree || 'ایجاد محیط‌های ۱۰۰٪ عاری از دخانیات و ممنوعیت کامل تبلیغات.'}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مدل فرانظریه‌ای مراحل تغییر رفتار (Transtheoretical Model - TTM)</h3>
        <div style="margin-block-end: var(--space-6);">${ttm}</div>

        <h3 style="margin-block-end: var(--space-3);">پیشگیری سطح دوم و معیارهای چهارگانه اجرای غربالگری</h3>
        ${scProgs ? `
          <div style="background: var(--bg-surface-raised); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-default); margin-block-end: var(--space-4);">
            <strong>برنامه‌های غربالگری استاندارد سرطان‌ها:</strong>
            <ul style="margin-block-start: var(--space-2); padding-inline-start: var(--space-4);">${scProgs}</ul>
          </div>
        ` : ''}
        <div style="margin-block-end: var(--space-6);">${scBadges}</div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: #0ea5e9;">
            <div class="stage-info-label" style="color: #0ea5e9; font-weight: 700;">پیشگیری سطح سوم (Tertiary Prevention):</div>
            <div class="stage-info-value">${sec.tertiaryCare || 'پایش مستمر بیماران علامت‌دار با هدف جلوگیری از ناتوانی، بازتوانی و کاهش مرگ؛ مانند مراقبت رتینوپاتی و پای دیابتی.'}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
            <div class="stage-info-label" style="color: #8b5cf6; font-weight: 700;">پیشگیری سطح چهارم (Quaternary Prevention):</div>
            <div class="stage-info-value">${sec.quaternaryPrevention || 'اقدامات بالینی جهت ممانعت از اقدامات مازاد و غیرضروری (Over-medicalization).'}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">نظام داده‌ها و معیارهای سه‌گانه اولویت‌بندی سلامت</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <p style="margin-block-end: var(--space-3);"><strong>پایه‌ای‌ترین داده سلامت:</strong> ${hd.primaryDataSource || 'داده‌های مرگ‌ومیر (Mortality Data)'}</p>
          ${hdCrit ? `
            <strong>معیارهای سه‌گانه انتخاب بیماری‌ها برای مداخله و تخصیص بودجه:</strong>
            <ul style="margin-block-start: var(--space-2); padding-inline-start: var(--space-4);">${hdCrit}</ul>
          ` : ''}
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Chapter 16: Nosocomial Infections
   */
  renderChapter16Section(sec) {
    if (sec.id === 'ch16-sec01') {
      const orig = sec.origins || {};
      const etRows = (sec.etiologyTable || []).map(e => `
        <tr>
          <td><strong>${e.agentClass}</strong></td>
          <td>${e.pathogens}</td>
          <td>${e.transmission}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content">
            <p><strong>تعریف پایه:</strong> ${sec.definition || ''}</p>
          </div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>معیار زمانی تفکیک:</strong> ${sec.temporalRule || ''}</p>
            <p style="margin-block-start: 4px;"><strong>تعریف گسترش‌یافته WHO:</strong> ${sec.whoExtendedDef || ''}</p>
          </div>
        </div>

        ${sec.ssiTimeline ? `
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6); border-inline-start: 4px solid #f59e0b;">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div class="callout-content">
            <p><strong>بازه زمانی عفونت‌های محل جراحی (SSI) و ایمپلنت‌ها:</strong> ${sec.ssiTimeline}</p>
          </div>
        </div>` : ''}

        ${sec.highRiskWards && sec.highRiskWards.length ? `
        <h3 style="margin-block-end: var(--space-3);">بخش‌های پرخطر بیمارستانی (High-Risk Wards)</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          ${sec.highRiskWards.map(w => `
            <div class="key-fact-card" style="border-inline-start: 4px solid var(--state-danger); padding: var(--space-3); background: var(--bg-surface-raised); border-radius: var(--radius-md); border: 1px solid var(--border-default);">
              <div class="card-label" style="font-weight: bold; color: var(--state-danger);">${w.ward || ''}</div>
              <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: 4px;">${w.risk || ''}</p>
            </div>
          `).join('')}
        </div>` : ''}

        <h3 style="margin-block-end: var(--space-3);">منشأ عفونت: درون‌زاد در برابر برون‌زاد</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">منشأ درون‌زاد (Endogenous):</div>
            <div class="stage-info-value">${orig.endogenous || ''}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #ec4899;">منشأ برون‌زاد (Exogenous):</div>
            <div class="stage-info-value">${orig.exogenous || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جدول اتیولوژی عوامل میکروبی عفونت‌های بیمارستانی</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>کلاس پاتوژن</th><th>عوامل میکروبی شایع</th><th>مسیر و ابزار انتقال</th></tr>
            </thead>
            <tbody>${etRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch16-sec02') {
      const rfc = (sec.riskFactorsCategories || []).map(r => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${r.category}</div>
          <div class="stage-info-value">${r.factors}</div>
        </div>
      `).join('');

      const gc = sec.globalComparison || {};
      const ie = sec.iranEpidemiology || {};
      const ageCards = (ie.ageDistribution || []).map(a => `
        <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${a.topInfection}</div>
          <div class="stat-label">${a.ageGroup}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دسته‌بندی عوامل خطرساز بیمارستانی</h3>
        <div style="margin-block-end: var(--space-6);">${rfc}</div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه الگوی جهانی و کانون‌های شایع</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">کشورهای توسعه‌یافته:</div>
            <div class="stage-info-value">${gc.developed || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">کشورهای در حال توسعه:</div>
            <div class="stage-info-value">${gc.developing || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیمای اپیدمیولوژی بیمارستانی در ایران</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>شایع‌ترین عفونت‌ها:</strong> ${ie.mostCommon || ''}</p>
          <p style="margin-block: 4px;"><strong>بالاترین بروز بخشی:</strong> ${ie.highestIncidence || ''}</p>
          <p><strong>بالاترین مرگ‌ومیر بخشی:</strong> ${ie.highestMortality || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شایع‌ترین عفونت بر حسب رده سنی در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">${ageCards}</div>
      `;
    }

    if (sec.id === 'ch16-sec03') {
      const nnis = (sec.nnisTimeline || []).map(n => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #10b981;">سال ${n.year}</div>
          <div class="stage-info-value">${n.event}</div>
        </div>
      `).join('');

      const prev = (sec.preventionLevels || []).map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${p.level}</div>
          <div class="stage-info-value">${p.actions}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار توسعه نظام مراقبت عفونت‌های بیمارستانی (NNIS)</h3>
        <div style="margin-block-end: var(--space-6);">${nnis}</div>

        <h3 style="margin-block-end: var(--space-3);">سطوح سه‌گانه پیشگیری و مهار عفونت‌های بیمارستانی</h3>
        <div>${prev}</div>
      `;
    }

    if (sec.id === 'ch16-sec04') {
      const cdcBadges = (sec.cdcRespiratoryProtocol || []).map(c => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2);">
          <div class="stage-info-value">${c}</div>
        </div>
      `).join('');

      const steps = (sec.outbreakSteps || []).map(s => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${s.step}</div>
          <div class="stage-info-value">${s.desc}</div>
        </div>
      `).join('');

      const disBadges = (sec.naturalDisasterMeasures || []).map(d => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2);">
          <div class="stage-info-value">${d}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دستورالعمل بهداشت تنفسی و آداب سرفه (CDC 2003)</h3>
        <div style="margin-block-end: var(--space-6);">${cdcBadges}</div>

        ${sec.infectionControlTeam && sec.infectionControlTeam.length ? `
        <h3 style="margin-block-end: var(--space-3);">اعضای تیم کنترل عفونت بیمارستانی</h3>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2); margin-block-end: var(--space-6);">
          ${sec.infectionControlTeam.map(member => `
            <span class="stage-badge" style="background: var(--bg-surface-raised); border: 1px solid var(--border-default); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-weight: 600; color: var(--accent-primary);">🩺 ${member}</span>
          `).join('')}
        </div>` : ''}

        <h3 style="margin-block-end: var(--space-3);">گام‌های بررسی و مهار طغیان‌های بیمارستانی</h3>
        <div style="margin-block-end: var(--space-6);">${steps}</div>

        <h3 style="margin-block-end: var(--space-3);">کنترل عفونت در بلایای طبیعی (سیل، زلزله)</h3>
        <div>${disBadges}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /**
   * Chapter 17: Antimicrobial Resistance (AMR)
   */
  renderChapter17Section(sec) {
    if (sec.id === 'ch17-sec01') {
      const defCards = (sec.basicDefinitions || []).map(d => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary); font-weight: 700;">${d.term}</div>
          <div class="stage-info-value">${d.desc}</div>
        </div>
      `).join('');

      const outcomesList = (sec.clinicalOutcomes || []).map(o => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: var(--state-danger);">
          <div class="stage-info-value">${o}</div>
        </div>
      `).join('');

      const fRows = (sec.influencingFactorsTable || []).map(f => `
        <tr>
          <td><strong>${f.category}</strong></td>
          <td><span class="medical-badge badge-primary">${f.factor}</span></td>
          <td>${f.mechanism}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف و مفاهیم پایه مقاومت دارویی</h3>
        <div style="margin-block-end: var(--space-6);">${defCards}</div>

        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
          <div class="callout-content">
            <p><strong>آبشار پاتوفیزیولوژی:</strong> ${sec.pathophysiologyCascade || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیامدهای بالینی و بهداشتی مقاومت میکروبی</h3>
        <div style="margin-block-end: var(--space-6);">${outcomesList}</div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس ۱۰‌گانه عوامل مؤثر بر بروز و گسترش مقاومت میکروبی</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>دسته عامل</th><th>عوامل اختصاصی</th><th>سازوکار اثر بالینی و اپیدمیولوژیک</th></tr>
            </thead>
            <tbody>${fRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch17-sec02') {
      const pt = sec.priorityTiers || {};
      const critCards = (pt.critical || []).map(c => `
        <div class="stage-info-block" style="border-inline-start-color: var(--state-danger); margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--state-danger);">${c.pathogen}</div>
          <div class="stage-info-value">${c.resistance}</div>
        </div>
      `).join('');

      const highCards = (pt.high || []).map(h => `
        <div class="stage-info-block" style="border-inline-start-color: #ec4899; margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: #ec4899;">${h.pathogen}</div>
          <div class="stage-info-value">${h.resistance}</div>
        </div>
      `).join('');

      const medCards = (pt.medium || []).map(m => `
        <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary); margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${m.pathogen}</div>
          <div class="stage-info-value">${m.resistance}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3); color: var(--state-danger);">رده ۱: اولویت بحرانی (Critical Priority)</h3>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-3);">پاتوژن‌های عامل عفونت‌های شدید بیمارستانی فاقد گزینه‌های درمانی خط اول:</p>
        <div style="margin-block-end: var(--space-6);">${critCards}</div>

        <h3 style="margin-block-end: var(--space-3); color: #ec4899;">رده ۲: اولویت بالا و شدید (High Priority)</h3>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-3);">پاتوژن‌های عامل عفونت‌های شایع در جامعه و بیمارستان:</p>
        <div style="margin-block-end: var(--space-6);">${highCards}</div>

        <h3 style="margin-block-end: var(--space-3); color: var(--accent-primary);">رده ۳: اولویت متوسط (Medium Priority)</h3>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-block-end: var(--space-3);">پاتوژن‌های تنفسی و گوارشی نیازمند نظارت و پایش پیوسته:</p>
        <div>${medCards}</div>
      `;
    }

    if (sec.id === 'ch17-sec03') {
      const v = sec.viralAMR || {};
      const p = sec.parasiticAMR || {};
      const f = sec.fungalAMR || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">۱. وضعیت مقاومت دارویی در ویروس‌ها</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">ویروس نقص ایمنی انسانی (HIV):</div>
            <div class="stage-info-value"><strong>علت اصلی مقاومت:</strong> ${v.hiv?.cause || ''}<br/><strong>الگوی ایران:</strong> ${v.hiv?.iranPattern || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #ec4899;">
            <div class="stage-info-label" style="color: #ec4899;">ویروس هپاتیت B (HBV):</div>
            <div class="stage-info-value">${v.hbv || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
            <div class="stage-info-label" style="color: #8b5cf6;">آنفلوانزا (Influenza):</div>
            <div class="stage-info-value">${v.flu || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">۲. مقاومت ضدانگلی (مالاریا)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>چالش بالینی:</strong> ${p.plasmodiumChallenge || ''}</p>
          <p style="margin-block: 4px;"><strong>توصیه سازمان جهانی بهداشت (WHO):</strong> ${p.whoRecommendation || ''}</p>
          <p><strong>سیمای مقاومت در ایران:</strong> ${p.iranStatus || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">۳. مقاومت در عفونت‌های قارچی</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981;">واژینیت کاندیدیایی:</div>
            <div class="stage-info-value">${f.candidalVaginitis || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-warning);">
            <div class="stage-info-label" style="color: var(--state-warning);">کاندیدیاز دهانی در دیابتی‌ها:</div>
            <div class="stage-info-value">${f.oralCandidiasisDiabetic || ''}</div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch17-sec04') {
      const u = sec.iranDrugUsage || {};
      const resList = (u.increasingResistance || []).map(r => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: var(--state-danger);">
          <div class="stage-info-value">${r}</div>
        </div>
      `).join('');

      const vh = sec.veterinaryHazards || {};
      const cpCards = (sec.controlProtocols || []).map(c => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">پروتکل ${c.step}: ${c.title}</div>
          <div class="stage-info-value">${c.desc}</div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیمای مصرف آنتی‌بیوتیک در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${u.oralTop || ''}</div>
            <div class="stat-label">پرمصرف‌ترین آنتی‌بیوتیک‌های خوراکی در ایران</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">${u.ivTop || ''}</div>
            <div class="stat-label">پرمصرف‌ترین آنتی‌بیوتیک تزریقی در ایران</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روندهای افزایشی مقاومت باکتریایی در ایران</h3>
        <div style="margin-block-end: var(--space-6);">${resList}</div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>مخاطرات دامپزشکی:</strong> ${vh.misuseRole || ''}</p>
            <p style="margin-block-start: 4px;"><strong>عوارض و پیامدها:</strong> ${vh.adverseOutcomes || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل‌های ۵‌گانه مهار و کنترل مقاومت میکروبی</h3>
        <div>${cpCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /**
   * Chapter 18: Vaccine-Preventable Diseases (Part 1)
   */
  renderChapter18Section(sec) {
    if (sec.id === 'ch18-sec01') {
      const pt = sec.pathogenAndTransmission || {};
      const cp = sec.clinicalPhases || {};
      const comp = sec.complications || {};
      const iv = sec.immunityAndVaccine || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های اپیدمیولوژیک و سرایت‌پذیری سرخک</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-metric" style="color: var(--state-danger); font-size: var(--font-size-base);">${pt.attackRate || ''}</div>
            <div class="stat-label">میزان حمله ثانویه در افراد حساس</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${pt.incubation || ''}</div>
            <div class="stat-label">دوره کمون بیماری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">${pt.contagionPeriod || ''}</div>
            <div class="stat-label">دوره واگیری</div>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6); border-inline-start-color: var(--state-warning);">
          <div class="stage-info-label" style="color: var(--state-warning);">توزیع جنسی، مرگ‌ومیر و وضعیت تغذیه:</div>
          <div class="stage-info-value"><strong>توزیع جنسی:</strong> ${pt.genderAndMortality || ''}<br/><strong>اثر سوءتغذیه:</strong> ${pt.nutritionEffect || ''}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر تظاهرات بالینی سرخک</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>دوره مقدماتی (Prodromal):</strong> ${cp.prodrome || ''}</p>
          <p style="margin-block: 6px; color: var(--accent-primary);"><strong>لکه‌های کوپلیک (Koplik Spots):</strong> ${cp.koplikSpots || ''}</p>
          <p><strong>بثورات جلدی (Exanthem):</strong> ${cp.exanthem || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوارض بالینی سرخک</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">اوتیت میانی:</div>
            <div class="stage-info-value">${comp.otitisMedia || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">پنومونی:</div>
            <div class="stage-info-value">${comp.pneumonia || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
            <div class="stage-info-label" style="color: #8b5cf6;">SSPE:</div>
            <div class="stage-info-value">${comp.sspe || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #ec4899;">
            <div class="stage-info-label" style="color: #ec4899;">سایر عوارض:</div>
            <div class="stage-info-value">${comp.others || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های ایمنی و واکسیناسیون</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <p><strong>ماهیت ایمنی و واکسن:</strong> ${iv.nature || ''}</p>
          <p style="margin-block: 4px;"><strong>برنامه و اثربخشی:</strong> ${iv.schedule || ''}</p>
          <p style="margin-block: 4px;"><strong>انواع شکست واکسن:</strong> ${iv.failureTypes || ''}</p>
          <p><strong>اقدامات پیشگیری ثانویه:</strong> ${iv.preventionMeasures || ''}</p>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec02') {
      const cm = sec.contactManagement || {};
      const sp = sec.surveillanceProcess || {};
      const cd = sec.caseDefinitions || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مدیریت مواجهه و طغیان در اطرافیان</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981;">سنین ۹ ماه تا ۲۵ سال:</div>
            <div class="stage-info-value">${cm.family9mTo25y || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">گروه‌های پرخطر:</div>
            <div class="stage-info-value">${cm.highRiskGroups || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-warning);">
            <div class="stage-info-label" style="color: var(--state-warning);">عدم امکان واکسیناسیون:</div>
            <div class="stage-info-value">${cm.noVaccineProtocol || ''}</div>
          </div>
        </div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <p><strong>سرخک در دوران بارداری:</strong> ${sec.measlesInPregnancy || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">نظام مراقبت و شاخص‌های حذف کشوری</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>گزارش‌دهی و پایش:</strong> ${sp.zeroReporting || ''}</p>
          <p style="margin-block: 4px;"><strong>ارسال نمونه‌ها:</strong> ${sp.sampleShipment || ''}</p>
          <p style="margin-block: 4px;"><strong>تعریف رسمی حذف سرخک:</strong> ${sp.eliminationDefinition || ''}</p>
          <p style="margin-block: 4px;"><strong>دستاوردهای ایمن‌سازی:</strong> ${sp.achievements || ''}</p>
          <p><strong>اهداف جهانی:</strong> ${sp.globalTargets || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف استاندارد مورد سرخک</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-warning);">
            <div class="stage-info-label" style="color: var(--state-warning);">مورد مشکوک (Suspected Case):</div>
            <div class="stage-info-value">${cd.suspected || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">مورد قطعی (Confirmed Case):</div>
            <div class="stage-info-value">${cd.confirmed || ''}</div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec03') {
      const ve = sec.virologyAndEpidemiology || {};
      const crs = sec.crsPathology || {};
      const ie = sec.iranEpidemiology || {};
      const pc = sec.preventionAndContact || {};
      const cd = sec.caseDefinitions || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های ویروس‌شناختی و سرایت سرخجه</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${ve.incubation || ''}</div>
            <div class="stat-label">دوره کمون بیماری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">${ve.contagion || ''}</div>
            <div class="stat-label">دوره واگیری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #8b5cf6;">
            <div class="stat-metric" style="color: #8b5cf6; font-size: var(--font-size-base);">${ve.subclinicalRate || ''}</div>
            <div class="stat-label">سهم عفونت‌های تحت‌بالینی</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3); color: var(--state-danger);">سندرم سرخجه مادرزادی (CRS)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p style="color: var(--state-danger);"><strong>خطر انتقال جفتی در سه‌ماهه اول:</strong> ${crs.transplacentalRisk || ''}</p>
          <p style="margin-block: 4px;"><strong>میزان بروز:</strong> ${crs.incidence || ''}</p>
          <p style="margin-block: 4px;"><strong>علائم اصلی بالینی:</strong> ${crs.mainFeatures || ''}</p>
          <p><strong>ناهنجاری‌های اختصاصی چشمی:</strong> ${crs.ocularDefects || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیمای اپیدمیولوژی سرخجه در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: var(--accent-primary);">وضعیت شیوع:</div>
            <div class="stage-info-value">${ie.endemicStatus || ''}</div>
          </div>
          <div class="stage-info-block">
            <div class="stage-info-label" style="color: #ec4899;">زنان سنین باروری:</div>
            <div class="stage-info-value">${ie.susceptibleWomenPercent || ''} (${ie.urbanRural || ''})</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981;">دستاورد واکسیناسیون ۱۳۸۲:</div>
            <div class="stage-info-value">${ie.nationwideCampaign1382 || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیشگیری، کنترل و تعاریف مورد</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <p><strong>راهبرد پیشگیری:</strong> ${pc.strategy || ''}</p>
          <p style="margin-block: 4px;"><strong>جداسازی بیمار:</strong> ${pc.isolation || ''}</p>
          <p style="margin-block: 4px;"><strong>جداسازی نوزادان CRS:</strong> ${pc.crsIsolation || ''}</p>
          <p style="margin-block: 4px;"><strong>مواجهه زنان باردار:</strong> ${pc.pregnantContactManagement || ''}</p>
          <div style="margin-block-start: var(--space-3); padding-block-start: var(--space-2); border-block-start: 1px dashed var(--border-default);">
            <strong>مورد مشکوک:</strong> ${cd.suspected || ''}<br/>
            <strong>مورد قطعی:</strong> ${cd.confirmed || ''}
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec04') {
      const eb = sec.epidemiologyBasics || {};
      const cc = sec.clinicalComplications || {};
      const ps = sec.preventionAndSurveillance || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های اپیدمیولوژیک اوریون</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--accent-primary);">
            <div class="stat-metric" style="color: var(--accent-primary); font-size: var(--font-size-base);">${eb.commonAge || ''}</div>
            <div class="stat-label">سن شایع ابتلا</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #8b5cf6;">
            <div class="stat-metric" style="color: #8b5cf6; font-size: var(--font-size-base);">${eb.incubation || ''}</div>
            <div class="stat-label">دوره کمون بیماری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #ec4899;">
            <div class="stat-metric" style="color: #ec4899; font-size: var(--font-size-base);">${eb.contagion || ''}</div>
            <div class="stat-label">دوره واگیری</div>
          </div>
        </div>

        <div class="stage-info-block" style="margin-block-end: var(--space-6);">
          <div class="stage-info-label" style="color: var(--accent-primary);">تظاهرات سنی و الگوی فصلی:</div>
          <div class="stage-info-value"><strong>الگوی سنی:</strong> ${eb.ageSpecificFeatures || ''}<br/><strong>الگوی فصلی:</strong> ${eb.seasonality || ''}</div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوارض بالینی و ارگانیک اوریون</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">ارکیت (Orchitis):</div>
            <div class="stage-info-value">${cc.orchitis || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #8b5cf6;">
            <div class="stage-info-label" style="color: #8b5cf6;">مننژیت و انسفالیت:</div>
            <div class="stage-info-value"><strong>مننژیت آسپتیک:</strong> ${cc.asepticMeningitis || ''}<br/><strong>انسفالیت:</strong> ${cc.encephalitis || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: #ec4899;">
            <div class="stage-info-label" style="color: #ec4899;">کری حسی-عصبی و بارداری:</div>
            <div class="stage-info-value"><strong>کری:</strong> ${cc.sensorineuralHearingLoss || ''}<br/><strong>بارداری:</strong> ${cc.miscarriageRisk || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیشگیری و پایش</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <p><strong>درمان و جداسازی:</strong> ${ps.treatment || ''} (${ps.isolation || ''})</p>
          <p style="margin-block: 4px;"><strong>اثربخشی واکسن:</strong> ${ps.vaccineEfficacy || ''}</p>
          <p><strong>وضعیت در ایران:</strong> ${ps.iranMMRIntegration || ''} - <span style="color: var(--state-danger);">${ps.surveillanceStatus || ''}</span></p>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec05') {
      const et = sec.etiologyAndTransmission || {};
      const rfList = (sec.riskFactorsForParalysis || []).map(r => `
        <div class="stage-info-block" style="margin-block-end: var(--space-2); border-inline-start-color: var(--state-danger);">
          <div class="stage-info-value">${r}</div>
        </div>
      `).join('');

      const pillars = (sec.fourPillarsWHO || []).map(p => `
        <div class="stage-info-block" style="margin-block-end: var(--space-3);">
          <div class="stage-info-label" style="color: var(--accent-primary);">${p.pillar}</div>
          <div class="stage-info-value">${p.desc}</div>
        </div>
      `).join('');

      const ie = sec.iranEradicationAndVaccine || {};
      const afp = sec.afpSurveillance || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اتیولوژی، انتقال و طیف بالینی پولیو</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>ویروس عامل:</strong> ${et.agent || ''} (${et.noCrossImmunity || ''})</p>
          <p style="margin-block: 4px;"><strong>دوره کمون و دفع:</strong> کمون ${et.incubation || ''} | دفع ترشحات: ${et.shedding || ''}</p>
          <p style="margin-block: 4px;"><strong>طیف بالینی:</strong> ${et.clinicalSpectrum || ''}</p>
          <p><strong>توزیع سنی:</strong> ${et.ageDistribution || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">عوامل مستعدکننده آسیب عصبی شدید و فلج بولبار</h3>
        <div style="margin-block-end: var(--space-6);">${rfList}</div>

        <h3 style="margin-block-end: var(--space-3);">ارکان چهارگانه ریشه‌کنی سازمان جهانی بهداشت (WHO)</h3>
        <div style="margin-block-end: var(--space-6);">${pillars}</div>

        <h3 style="margin-block-end: var(--space-3);">وضعیت ریشه‌کنی و جدول واکسیناسیون در ایران</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: #10b981;">
            <div class="stage-info-label" style="color: #10b981;">گواهی ریشه‌کنی:</div>
            <div class="stage-info-value">${ie.certificationYear || ''} (${ie.borderRisk || ''})</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">برنامه واکسیناسیون جاری:</div>
            <div class="stage-info-value"><strong>خوراکی bOPV:</strong> ${ie.bopvSchedule || ''}<br/><strong>تزریقی IPV:</strong> ${ie.ipvAddition || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">الزامات پایش نظام مراقبت فلج شل حاد (AFP)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default);">
          <p><strong>جامعه هدف:</strong> ${afp.ageCriterion || ''}</p>
          <p style="margin-block: 4px;"><strong>ارسال فرم:</strong> ${afp.formTiming || ''}</p>
          <p style="margin-block: 4px; color: var(--state-danger);"><strong>نمونه‌های مدفوع:</strong> ${afp.stoolSamples || ''}</p>
          <p style="margin-block: 4px;"><strong>پیگیری بالینی:</strong> ${afp.followup60Days || ''}</p>
          <p><strong>مدیریت طغیان:</strong> ${afp.outbreakResponse || ''}</p>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec06') {
      const sRows = (sec.clinicalStagesTable || []).map(s => `
        <tr>
          <td><strong>${s.stage}</strong></td>
          <td><span class="medical-badge badge-primary">${s.duration}</span></td>
          <td>${s.features}</td>
        </tr>
      `).join('');

      const db = sec.diseaseBurdenAndTransmission || {};
      const ti = sec.treatmentAndIsolation || {};
      const pep = sec.pepManagement || {};
      const ve = sec.vaccineEvolution || {};

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مراحل سه‌گانه بالینی سیاه سرفه (Pertussis)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>مرحله بالینی</th><th>مدت زمان</th><th>علائم و ویژگی‌های شاخص</th></tr>
            </thead>
            <tbody>${sRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بار بیماری، آسیب‌پذیری شیرخواران و مخزن بزرگسالان</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-6);">
          <div class="stage-info-block" style="border-inline-start-color: var(--state-danger);">
            <div class="stage-info-label" style="color: var(--state-danger);">مرگ در شیرخواران:</div>
            <div class="stage-info-value">${db.infantsMortality || ''}</div>
          </div>
          <div class="stage-info-block" style="border-inline-start-color: var(--accent-primary);">
            <div class="stage-info-label" style="color: var(--accent-primary);">مخزن بزرگسالان:</div>
            <div class="stage-info-value">${db.adultReservoir || ''}</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">درمان، جداسازی و پروفیلاکسی پس از مواجهه (PEP)</h3>
        <div style="background: var(--bg-surface-raised); padding: var(--space-4); border-radius: var(--radius-lg); border: 1px solid var(--border-default); margin-block-end: var(--space-6);">
          <p><strong>زمان‌بندی آنتی‌بیوتیک:</strong> ${ti.antibioticTiming || ''}</p>
          <p style="margin-block: 4px;"><strong>مدت جداسازی:</strong> با درمان ${ti.isolationDaysTreated || ''} | بدون درمان: ${ti.isolationUntreated || ''}</p>
          <p style="margin-block: 4px;"><strong>پروفیلاکسی دارویی (PEP):</strong> ${pep.erythromycinRegimen || ''}</p>
          <p style="margin-block: 4px;"><strong>واکسیناسیون زیر ۷ سال:</strong> ${pep.under7VaccineDose || ''}</p>
          <p><strong>قرنطینه تماس‌ها:</strong> ${pep.contactQuarantine || ''}</p>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تحول فناوری و واکسیناسیون ملی</h3>
        <div class="stage-info-block" style="border-inline-start-color: #10b981;">
          <div class="stage-info-label" style="color: #10b981;">واکسن‌های نوین و تولید ملی:</div>
          <div class="stage-info-value"><strong>واکسن بی‌سلولی:</strong> ${ve.apVsWp || ''} (${ve.alumAdjuvant || ''})<br/><strong>تولید ملی مجدد:</strong> ${ve.nationalProduction1404 || ''}</div>
        </div>
      `;
    }

    if (sec.id === 'ch18-sec07') {
      const cRows = (sec.comparativeMatrix || []).map(c => `
        <tr>
          <td><strong>${c.disease}</strong></td>
          <td><span class="medical-badge badge-primary">${c.agent}</span></td>
          <td>${c.incubation}</td>
          <td>${c.contagion}</td>
          <td><span class="medical-badge badge-warning">${c.secondaryAttackRate}</span></td>
          <td style="color: var(--state-danger);"><strong>${c.hallmarkComplication}</strong></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس مقایسه تطبیقی ۵ بیماری عفونی هدف واکسیناسیون</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th>نام بیماری</th>
                <th>عامل اتیولوژیک و خانواده</th>
                <th>دوره کمون</th>
                <th>دوره واگیری</th>
                <th>شاخص سرایت ثانویه</th>
                <th>عارضه شاخص یا تهدیدکننده حیات</th>
              </tr>
            </thead>
            <tbody>${cRows}</tbody>
          </table>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /* =========================================================================
     CHAPTER 19 RENDERERS (COMMUNICABLE DISEASES & SURVEILLANCE)
     ========================================================================= */
  renderChapter19Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch19-sec01') {
      const def = sec.definition || '';
      const hist = sec.historicalEvolution || [];
      const gv = sec.globalVillageChallenges || {};
      const pathogens = sec.pathogensClassification || [];

      const histCards = hist.map(h => `
        <div class="key-fact-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="card-label">نظریه علمی / مکتب تاریخی</div>
          <div class="card-value" style="font-size: 1.1rem; margin-block-end: 6px;">${h.theory || ''}</div>
          <p style="margin: 0; color: var(--text-secondary); line-height: var(--line-height-relaxed);">${h.desc || ''}</p>
        </div>
      `).join('');

      const pathRows = pathogens.map(p => `
        <tr>
          <td style="width: 130px;"><strong>${p.group || ''}</strong></td>
          <td>${p.nature || ''}</td>
          <td><span class="badge badge-subtle">${p.examples || ''}</span></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary);">
          <div class="historical-milestone-header">
            <span class="icon" style="font-size: 1.3rem;">📖</span>
            <strong>تعریف بیماری واگیر (Communicable Disease)</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${def}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر تکامل دیدگاه‌ها در گذر تاریخ</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${histCards}</div>

        <h3 style="margin-block-end: var(--space-3);">چالش‌های نوظهور در مفهوم دهکده جهانی (Global Village)</h3>
        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-primary text-white d-flex align-center gap-2">
            <span class="icon">✈️</span>
            <strong>سرعت سرسام‌آور سرایت جهانی و مقایسه تاریخی</strong>
          </div>
          <div class="card-body">
            <p style="margin-block-end: var(--space-3); font-weight: 600; color: var(--text-primary);">${gv.travelSpeed || ''}</p>
            <div class="grid-2">
              <div class="hazard-card hazard-health" style="box-shadow: none;">
                <div class="hazard-badge">بیماری‌های نوپدید (Emerging)</div>
                <p style="margin: 0; font-size: var(--font-size-sm);">${gv.emergingExamples || ''}</p>
              </div>
              <div class="hazard-card hazard-food" style="box-shadow: none;">
                <div class="hazard-badge">بیماری‌های بازپدید (Re-emerging)</div>
                <p style="margin: 0; font-size: var(--font-size-sm);">${gv.reemergingExamples || ''}</p>
              </div>
            </div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی ساختاری پاتوژن‌ها بر حسب بیولوژی</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="width: 130px;">گروه بیولوژیک</th>
                <th>ماهیت و ساختار زیستی</th>
                <th>بیماری‌های نمونه و پاتوژن‌ها</th>
              </tr>
            </thead>
            <tbody>${pathRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch19-sec02') {
      const triangle = sec.epidemiologicTriangle || {};
      const chain = sec.chainOfInfection || [];
      const triad = sec.triadVariables || {};

      const chainSteps = chain.map((c, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; font-size: var(--font-size-base);">${c.link || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${c.desc || ''}</span>
          </div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مثلث اپیدمیولوژیک سنتی (Epidemiologic Triangle)</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-primary text-white d-flex align-center gap-2">
              <span class="icon">🔬</span><strong>عامل بیماری‌زا (Agent)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${triangle.agent || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-info text-white d-flex align-center gap-2">
              <span class="icon">👤</span><strong>میزبان (Host)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${triangle.host || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-warning text-white d-flex align-center gap-2">
              <span class="icon">🌍</span><strong>محیط (Environment)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${triangle.environment || ''}</p></div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">زنجیره ۶‌گانه سرایت عفونت (Chain of Infection)</h3>
        <div class="cycle-flow-container" style="margin-block-end: var(--space-6);">${chainSteps}</div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">اصل کلیدی مداخله بهداشتی:</strong>
            <p style="margin: 0;">${sec.interventionPoint || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سه‌گانه متغیرهای توصیفی اپیدمیولوژی (شخص، مکان، زمان)</h3>
        <div class="grid-3">
          <div class="key-fact-card">
            <div class="card-label">متغیر فردی (Person)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${triad.person || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">متغیر مکانی (Place)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${triad.place || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">متغیر زمانی (Time)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${triad.time || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch19-sec03') {
      const indicators = sec.biologicalIndicators || [];
      const clinicalSpec = sec.clinicalSpectrum || {};
      const carriers = sec.carrierTypes || [];
      const periods = sec.timePeriods || [];
      const herd = sec.herdImmunity || {};

      const indRows = indicators.map(ind => `
        <tr>
          <td style="width: 170px;"><strong>${ind.name || ''}</strong></td>
          <td style="width: 170px;"><code>${ind.formula || ''}</code></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${ind.desc || ''}</p></td>
        </tr>
      `).join('');

      const carrierCards = carriers.map(c => `
        <div class="stage-step-card">
          <div class="step-num-badge">حامل</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${c.type || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${c.desc || ''}</span>
          </div>
        </div>
      `).join('');

      const periodRows = periods.map(p => `
        <tr>
          <td style="width: 160px;"><strong>${p.period || ''}</strong></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${p.definition || ''}</p></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های زیست‌شناختی ارزیابی پاتوژن در جمعیت</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="width: 170px;">شاخص بیولوژیک</th>
                <th style="width: 170px;">فرمول محاسبه / سنجش</th>
                <th>مفهوم اپیدمیولوژیک و کاربرد بالینی</th>
              </tr>
            </thead>
            <tbody>${indRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طیف بالینی بیماری: استعاره کوه یخ (Iceberg Concept)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-danger text-white d-flex align-center gap-2">
              <span class="icon">🏔️</span><strong>تظاهرات بالینی آشکار (نوک کوه یخ)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${clinicalSpec.clinical || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-info text-white d-flex align-center gap-2">
              <span class="icon">🌊</span><strong>موارد تحت‌بالینی و مخفی (پیکره زیر آب)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${clinicalSpec.subclinical || ''}</p></div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">انواع ناقلین و حاملان بیماری (Carriers)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${carrierCards}</div>

        <h3 style="margin-block-end: var(--space-3);">مقاطع و دوره‌های زمانی در فرآیند سرایت</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th style="width: 160px;">دوره زمانی</th><th>تعریف و اهمیت در اپیدمیولوژی</th></tr></thead>
            <tbody>${periodRows}</tbody>
          </table>
        </div>

        <div class="clinical-card">
          <div class="card-header bg-primary text-white d-flex align-center gap-2">
            <span class="icon">🛡️</span><strong>ایمنی جمعی (Herd Immunity)</strong>
          </div>
          <div class="card-body">
            <p style="margin-block-end: var(--space-2);"><strong>مکانیسم اثر:</strong> ${herd.mechanism || ''}</p>
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <strong>پیامد جمعیتی:</strong> ${herd.outcome || ''}
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch19-sec04') {
      const erad = sec.eradicationContinuum || [];
      const goals = sec.surveillanceGoals || {};
      const cycle = sec.operationalCycle5Steps || [];
      const infoFlow = sec.informationFlow || {};

      const eradSteps = erad.map((e, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; font-size: var(--font-size-base);">${e.stage || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${e.definition || ''}</span>
            <div style="margin-block-start: 4px;"><span class="badge badge-subtle">مثال: ${e.example || ''}</span></div>
          </div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      const cycleSteps = cycle.map(c => `
        <div class="stage-step-card">
          <div class="step-num-badge">${c.step || ''}</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${c.title || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${c.desc || ''}</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پیوستار سطوح مدیریت و مهار بیماری‌های واگیر</h3>
        <div class="cycle-flow-container" style="margin-block-end: var(--space-6);">${eradSteps}</div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">📊</span>
            <strong>مفهوم محوری نظام مراقبت (Surveillance Core Concept)</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.surveillanceCoreConcept || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اهداف سه‌گانه نظام مراقبت اپیدمیولوژیک</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-primary text-white d-flex align-center gap-2">
              <span class="icon">📈</span><strong>هدف توصیفی (Descriptive)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${goals.descriptive || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-info text-white d-flex align-center gap-2">
              <span class="icon">🔍</span><strong>هدف تشخیصی / هشدار (Diagnostic)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${goals.diagnostic || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-success text-white d-flex align-center gap-2">
              <span class="icon">✅</span><strong>هدف ارزشیابی (Evaluative)</strong>
            </div>
            <div class="card-body"><p style="margin: 0;">${goals.evaluative || ''}</p></div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">چرخه عملیاتی ۵ مرحله‌ای نظام مراقبت</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${cycleSteps}</div>

        <h3 style="margin-block-end: var(--space-3);">جریان گردش اطلاعات و بازخورد در شبکه بهداشت</h3>
        <div class="grid-3">
          <div class="key-fact-card">
            <div class="card-label">نقطه مبدا داده</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${infoFlow.origin || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">سلسله‌مراتب شبکه</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${infoFlow.networkHierarchy || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">نقش حیاتی بازخورد (Feedback)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${infoFlow.feedbackRole || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch19-sec05') {
      const activePassive = sec.activeVsPassive || [];
      const caseDefs = sec.caseDefinitions || {};
      const twoByTwo = sec.twoByTwoTable || {};
      const gradient = sec.serviceLevelsGradient || {};
      const attrs = sec.systemQualitativeAttributes || [];
      const protocols = sec.nationalReportingProtocols || {};

      const apRows = activePassive.map(ap => `
        <tr>
          <td><strong>${ap.attribute || ''}</strong></td>
          <td>${ap.passive || ''}</td>
          <td>${ap.active || ''}</td>
        </tr>
      `).join('');

      const attrCards = attrs.map(a => `
        <div class="key-fact-card">
          <div class="card-label">${a.name || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${a.desc || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه ساختاری مراقبت غیرفعال (Passive) در برابر فعال (Active)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr><th>ویژگی ساختاری</th><th>مراقبت غیرفعال (Passive)</th><th>مراقبت فعال (Active)</th></tr>
            </thead>
            <tbody>${apRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سلسله‌مراتب تعاریف استاندارد مورد بیماری (Case Definitions)</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-warning text-white d-flex align-center gap-2">
              <span class="icon">❓</span><strong>مورد مظنون (Suspected)</strong>
            </div>
            <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${caseDefs.suspected || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-primary text-white d-flex align-center gap-2">
              <span class="icon">🔍</span><strong>مورد محتمل (Probable)</strong>
            </div>
            <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${caseDefs.probable || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-success text-white d-flex align-center gap-2">
              <span class="icon">✅</span><strong>مورد قطعی (Confirmed)</strong>
            </div>
            <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${caseDefs.confirmed || ''}</p></div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جدول ۲×۲ ارزیابی عملکرد تشخیصی نظام مراقبت</h3>
        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-body">
            <div class="grid-2" style="margin-block-end: var(--space-3);">
              <div class="stage-info-block" style="border-inline-start-color: var(--state-success);">
                <div class="stage-info-label">حساسیت (Sensitivity): ${twoByTwo.sensitivityFormula || ''}</div>
                <div class="stage-info-value">مثبت واقعی (TP): ${twoByTwo.tp || ''} | منفی کاذب (FN): ${twoByTwo.fn || ''}</div>
              </div>
              <div class="stage-info-block" style="border-inline-start-color: var(--state-info);">
                <div class="stage-info-label">ارزش اخباری مثبت (PPV): ${twoByTwo.ppvFormula || ''}</div>
                <div class="stage-info-value">مثبت کاذب (FP): ${twoByTwo.fp || ''} | منفی واقعی (TN): ${twoByTwo.tn || ''}</div>
              </div>
            </div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گرادیان سطح‌بندی خدمات در سطوح مختلف نظام سلامت</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">
          <div class="key-fact-card">
            <div class="card-label">خانه بهداشت / بهورز</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gradient.healthHouse || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">مرکز خدمات جامع سلامت</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gradient.healthCenter || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">بیمارستان و ارجاع تخصصی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gradient.hospital || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های کیفی ۷‌گانه نظام مراقبت بهداشتی</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${attrCards}</div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل‌های کشوری گزارش‌دهی بیماری‌های واگیر</h3>
        <div class="grid-2">
          <div class="hazard-card hazard-health">
            <div class="hazard-badge">گزارش تلفنی فوری (Immediate Phone)</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${protocols.immediatePhoneReporting || ''}</p>
          </div>
          <div class="hazard-card hazard-env">
            <div class="hazard-badge">گزارش کتبی و ماهانه (Monthly Written)</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${protocols.monthlyWrittenReporting || ''}</p>
          </div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 20 RENDERERS (EMERGING & RE-EMERGING INFECTIONS)
     ========================================================================= */
  renderChapter20Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch20-sec01') {
      const statusClass = sec.statusClassification || [];
      const emergingAttrs = sec.emergingAttributes || {};
      const timeline = sec.discoveryTimeline || [];

      const emCards = [
        { label: 'سهم پاتوژن‌های زئونوتیک', val: emergingAttrs.zoonoticShare },
        { label: 'نقش ویروس‌های RNA', val: emergingAttrs.virusRole },
        { label: 'پاتوژن‌های شاخص نوپدید', val: emergingAttrs.hallmarkPathogens }
      ].map(a => `
        <div class="key-fact-card" style="border-inline-start: 4px solid var(--accent-primary);">
          <div class="card-label">${a.label}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${a.val || ''}</p>
        </div>
      `).join('');

      const scCards = statusClass.map(sc => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white d-flex align-center gap-2">
            <strong>${sc.status || ''}</strong>
          </div>
          <div class="card-body">
            <p style="margin-block-end: var(--space-2); font-size: var(--font-size-sm);">${sc.definition || ''}</p>
            <div style="background: var(--color-surface-subtle); padding: 8px 12px; border-radius: var(--radius-sm);">
              <span style="font-size: var(--font-size-xs); color: var(--text-secondary);"><strong>محرک‌های کلیدی:</strong> ${sc.drivers || ''}</span>
            </div>
          </div>
        </div>
      `).join('');

      const timeRows = timeline.map(t => `
        <div class="timeline-card">
          <div class="timeline-badge">${t.decade || t.year || ''}</div>
          <div class="timeline-content">
            <strong>${t.pathogens || t.pathogen || ''}</strong>
            <p>${t.context || t.significance || ''}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی وضعیت اپیدمیولوژیک بیماری‌های عفونی</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${scCards}</div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های بیولوژیک پاتوژن‌های نوپدید (Emerging)</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${emCards}</div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار تاریخی کشف پاتوژن‌های شاخص نوپدید</h3>
        <div class="timeline-container">${timeRows}</div>
      `;
    }

    if (sec.id === 'ch20-sec02') {
      const outbreaks = sec.iranHistoricalOutbreaks || [];
      const globalRe = sec.globalReemergingExamples || [];
      const drivers = sec.macroDrivers6 || [];

      const obCards = outbreaks.map(o => `
        <div class="clinical-card">
          <div class="card-header bg-danger text-white d-flex align-center gap-2">
            <span class="icon">📍</span><strong>${o.province || ''} — ${o.disease || ''}</strong>
          </div>
          <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${o.features || ''}</p></div>
        </div>
      `).join('');

      const glCards = globalRe.map(g => `
        <div class="key-fact-card">
          <div class="card-label">${g.disease || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${g.impact || ''}</p>
        </div>
      `).join('');

      const driverCards = drivers.map((d, i) => `
        <div class="hazard-card hazard-health">
          <div class="hazard-badge">محرک کلان ${i + 1}: ${d.driver || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm);">${d.detail || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--state-danger); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">⚠️</span>
            <strong>علل ریشه‌ای بازپدیدی بیماری‌ها (Re-emergence Determinants)</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.reemergenceCauses || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طغیان‌های شاخص بازپدید در تاریخ اپیدمیولوژی ایران</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${obCards}</div>

        <h3 style="margin-block-end: var(--space-3);">نمونه‌های برجسته جهانی بازپدیدی بیماری‌ها</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${glCards}</div>

        <h3 style="margin-block-end: var(--space-3);">محرک‌های شش‌گانه کلان بازپدیدی بیماری‌های عفونی</h3>
        <div class="grid-2">${driverCards}</div>
      `;
    }

    if (sec.id === 'ch20-sec03') {
      const eco = sec.ecologicalInterventions || [];
      const noso = sec.nosocomialResistance || {};
      const foodChainAndTravel = sec.foodChainAndTravel || {};
      const vanishing = sec.vanishingDiseases || {};
      const pillars = sec.infrastructurePillars || [];

      const ecoRows = eco.map(e => `
        <tr>
          <td style="width: 170px;"><strong>${e.site || ''}</strong></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${e.mechanism || ''}</p></td>
        </tr>
      `).join('');

      const pillarCards = pillars.map(p => `
        <div class="key-fact-card">
          <div class="card-label">${p.pillar || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${p.desc || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مداخلات اکولوژیک و تغییرات محیطی ساخت دست بشر</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th style="width: 170px;">عرصه مداخله اکولوژیک</th><th>سازوکار تغییر ریسک اپیدمیولوژیک</th></tr></thead>
            <tbody>${ecoRows}</tbody>
          </table>
        </div>

        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-danger text-white d-flex align-center gap-2">
              <span class="icon">🏥</span><strong>مقاومت دارویی و عفونت‌های بیمارستانی</strong>
            </div>
            <div class="card-body">
              <p style="margin-block-end: var(--space-2);">${noso.mechanism || ''}</p>
              <span class="badge badge-danger">پاتوژن شاخص: ${noso.hallmarkPathogen || ''}</span>
            </div>
          </div>

          <div class="clinical-card">
            <div class="card-header bg-warning text-white d-flex align-center gap-2">
              <span class="icon">🍗</span><strong>جهانی‌شدن صنایع غذایی و تجارت بین‌الملل</strong>
            </div>
            <div class="card-body">
              <p style="margin-block-end: var(--space-1); font-size: var(--font-size-sm);"><strong>غذای صنعتی:</strong> ${foodChainAndTravel.industrialFood || ''}</p>
              <p style="margin-block-end: var(--space-1); font-size: var(--font-size-sm);"><strong>سفرهای هوایی:</strong> ${foodChainAndTravel.internationalTravelers || ''}</p>
              <span class="badge badge-warning">پاتوژن نمونه: ${foodChainAndTravel.pathogen || ''}</span>
            </div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بیماری‌های ناپدید (Vanishing Diseases) و کاندیدهای ریشه‌کنی</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="hazard-card hazard-env">
            <div class="hazard-badge">بیماری‌های کاملاً ریشه‌کن شده</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${vanishing.eradicated || ''}</p>
          </div>
          <div class="hazard-card hazard-health">
            <div class="hazard-badge">کاندیداهای نابودی و ریشه‌کنی جهانی</div>
            <p style="margin: 0; font-size: var(--font-size-sm);">${vanishing.candidates || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ارکان چهارگانه زیرساخت مهار و آمادگی در نظام سلامت</h3>
        <div class="grid-2">${pillarCards}</div>
      `;
    }

    if (sec.id === 'ch20-sec04') {
      const diff = sec.infectionVsDisease || {};
      const chain = sec.infectionChain6Links || [];
      const humanRes = sec.humanReservoirDetails || {};
      const otherRes = sec.animalAndInanimateReservoirs || {};

      const chainSteps = chain.map((link, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); font-size: var(--font-size-base);">${link}</strong>
          </div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-info text-white"><strong>عفونت (Infection)</strong></div>
            <div class="card-body"><p style="margin: 0;">${diff.infection || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-danger text-white"><strong>بیماری عفونی (Infectious Disease)</strong></div>
            <div class="card-body"><p style="margin: 0;">${diff.disease || ''}</p></div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">حلقه‌های شش‌گانه زنجیره انتقال عفونت</h3>
        <div class="cycle-flow-container" style="margin-block-end: var(--space-6);">${chainSteps}</div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">اصل ضعیف‌ترین حلقه (Weakest Link Principle):</strong>
            <p style="margin: 0;">${sec.weakestLinkPrinciple || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جزئیات مخازن انسانی عفونت</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="key-fact-card">
            <div class="card-label">اشکال بالینی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${humanRes.clinicalForms || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">تعاریف موارد</div>
            ${Array.isArray(humanRes.caseClassifications) ? `
              <ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-xs); line-height: var(--line-height-relaxed); color: var(--text-secondary);">
                ${humanRes.caseClassifications.map(c => `<li style="margin-block-end: 4px;"><strong style="color: var(--text-primary);">${c.term}:</strong> ${c.desc}</li>`).join('')}
              </ul>
            ` : `<p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${humanRes.caseClassifications || ''}</p>`}
          </div>
          <div class="key-fact-card">
            <div class="card-label">بیماران سرپایی (Ambulant Cases)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${humanRes.ambulantRisk || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">وضعیت‌های حاملین (Carriers)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${humanRes.carrierStates || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مخازن حیوانی و بی‌جان</h3>
        <div class="grid-2">
          <div class="clinical-card">
            <div class="card-header bg-warning text-white"><strong>مخازن حیوانی (زئونوزها)</strong></div>
            <div class="card-body"><p style="margin: 0;">${otherRes.animal || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-primary text-white"><strong>مخازن بی‌جان (محیطی و خاک)</strong></div>
            <div class="card-body"><p style="margin: 0;">${otherRes.inanimate || ''}</p></div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch20-sec05') {
      const direct = sec.directTransmission || [];
      const indirect = sec.indirectTransmission || {};
      const hosts = sec.susceptibleHostDeterminants || [];

      const directCards = direct.map(d => `
        <div class="stage-step-card">
          <div class="step-num-badge">مستقیم</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${d.mode || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${d.desc || ''}</span>
          </div>
        </div>
      `).join('');

      let vectorBorneHtml = '';
      if (typeof indirect.vectorBorne === 'object' && indirect.vectorBorne) {
        const mech = indirect.vectorBorne.mechanical ? `<p style="margin: 0 0 6px 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);"><strong>مکانیکی:</strong> ${indirect.vectorBorne.mechanical}</p>` : '';
        const bio = Array.isArray(indirect.vectorBorne.biological) ? indirect.vectorBorne.biological.map(b => `<li style="margin-block-end: 3px;"><strong>${b.type}:</strong> ${b.desc}</li>`).join('') : '';
        vectorBorneHtml = `
          ${mech}
          ${bio ? `<div><strong style="font-size: var(--font-size-xs); color: var(--text-primary); display: block; margin-block-end: 4px;">بیولوژیک:</strong><ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-xs); line-height: var(--line-height-relaxed);">${bio}</ul></div>` : ''}
        `;
      } else {
        vectorBorneHtml = `<p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${indirect.vectorBorne || ''}</p>`;
      }

      const basicIndirect = [
        { label: 'انتقال از طریق وسیله نقلیه مشترک (Vehicle-borne)', val: indirect.vehicleBorne },
        { label: 'انتقال از طریق وسایل آلوده (Fomite-borne)', val: indirect.fomiteBorne },
        { label: 'مدل پنجگانه مدفوعی-دهانی (5 Fs Model)', val: indirect.fiveFsModel },
        { label: 'انتقال هوابرد (Airborne - قطره‌ریز و گردوغبار)', val: indirect.airBorne }
      ].map(item => `
        <div class="hazard-card hazard-health">
          <div class="hazard-badge">${item.label}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${item.val || ''}</p>
        </div>
      `).join('');

      const vectorCard = `
        <div class="hazard-card hazard-health" style="grid-column: 1 / -1;">
          <div class="hazard-badge">انتقال از طریق ناقلین بیولوژیک و مکانیکی (Vector-borne)</div>
          ${vectorBorneHtml}
        </div>
      `;

      const indirectItems = basicIndirect + vectorCard;

      const hostCards = hosts.map(h => `
        <div class="key-fact-card">
          <div class="card-label">${h.factor || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${h.detail || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">🚪</span>
            <strong>انطباق دروازه‌های خروج و ورود پاتوژن‌ها</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.portalsOfExitAndEntry || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روش‌های پنج‌گانه انتقال مستقیم (Direct Transmission)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${directCards}</div>

        <h3 style="margin-block-end: var(--space-3);">شیوه‌های انتقال غیرمستقیم (Indirect Transmission)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${indirectItems}</div>

        <h3 style="margin-block-end: var(--space-3);">عوامل مؤثر بر حساسیت میزبان (Susceptible Host Determinants)</h3>
        <div class="grid-2">${hostCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 22 RENDERERS (SYNDROMIC SURVEILLANCE & REPORTING)
     ========================================================================= */
  renderChapter22Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch22-sec01') {
      const tiers = sec.reportingTiers || [];

      const tierRows = tiers.map(t => {
        let badgeClass = 'badge-primary';
        const dl = t.deadline || '';
        if (dl.includes('۶ ساعت') || dl.includes('فوریتی')) badgeClass = 'badge-danger';
        else if (dl.includes('۲۴ ساعت') || dl.includes('فوری')) badgeClass = 'badge-warning';

        return `
          <tr>
            <td style="width: 150px;"><strong>${t.tier || ''}</strong></td>
            <td style="width: 140px;"><span class="badge ${badgeClass}">${t.deadline || ''}</span></td>
            <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${t.diseases || t.conditions || ''}</p></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">⚖️</span>
            <strong>چارچوب قانونی و الزامات گزارش‌دهی کشوری</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.mandatoryFramework || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح زمانی سه‌گانه گزارش‌دهی بیماری‌های واگیر</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="width: 150px;">رده گزارش‌دهی</th>
                <th style="width: 140px;">مهلت زمانی</th>
                <th>فهرست بیماری‌ها و شرایط تحت مراقبت</th>
              </tr>
            </thead>
            <tbody>${tierRows}</tbody>
          </table>
        </div>
      `;
    }

    // Sections 2 through 5: Clinical syndromes
    const syndromes = sec.syndromes || [];
    const synCards = syndromes.map(s => {
      let bodyContent = '';

      if (s.types && s.types.length > 0) {
        bodyContent = s.types.map(t => {
          const tDdxList = Array.isArray(t.ddx) ? t.ddx : (t.ddx ? [t.ddx] : []);
          const tDdxBadges = tDdxList.map(d => `<span class="disease-tag">${d}</span>`).join(' ');
          return `
            <div style="background: var(--color-surface-subtle); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-block-end: var(--space-3);">
              <strong style="color: var(--color-primary); display: block; margin-block-end: 4px; font-size: 0.95rem;">${t.subtype || ''}</strong>
              <p style="margin: 0 0 var(--space-2) 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${t.definition || ''}</p>
              <div class="d-flex flex-wrap gap-1">${tDdxBadges}</div>
            </div>
          `;
        }).join('');
      } else {
        const ddxList = Array.isArray(s.ddx) ? s.ddx : (s.ddx ? [s.ddx] : []);
        const ddxBadges = ddxList.map(d => `<span class="disease-tag">${d}</span>`).join(' ');
        
        let extraFields = '';
        if (s.hypoperfusion) {
          const hypoItems = typeof s.hypoperfusion === 'object' && s.hypoperfusion ? [
            { k: 'همودینامیک', v: s.hypoperfusion.hemodynamic },
            { k: 'محیطی', v: s.hypoperfusion.peripheral },
            { k: 'کلیوی', v: s.hypoperfusion.renal },
            { k: 'مغزی', v: s.hypoperfusion.cerebral },
            { k: 'ریوی', v: s.hypoperfusion.pulmonary }
          ].filter(x => x.v).map(x => `<li style="margin-block-end: 4px;"><strong>${x.k}:</strong> ${x.v}</li>`).join('') : '';

          extraFields += `
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); margin-block-end: var(--space-3); border-inline-start: 3px solid var(--state-danger);">
              <strong style="color: var(--state-danger); font-size: var(--font-size-xs); display: block; margin-block-end: 6px;">علائم هیپوپرفیوژن و شوک:</strong>
              ${typeof s.hypoperfusion === 'object' ? `<ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-xs); color: var(--text-primary); line-height: var(--line-height-relaxed);">${hypoItems}</ul>` : `<span style="font-size: var(--font-size-xs); color: var(--text-primary); display: block;">${s.hypoperfusion}</span>`}
            </div>
          `;
        }
        if (s.targetGroups) {
          const targetItems = typeof s.targetGroups === 'object' && s.targetGroups ? [
            { k: 'نوزادان', v: s.targetGroups.neonates },
            { k: 'زنان', v: s.targetGroups.women },
            { k: 'مردان', v: s.targetGroups.men },
            { k: 'مشترک', v: s.targetGroups.shared }
          ].filter(x => x.v).map(x => `<li style="margin-block-end: 4px;"><strong>${x.k}:</strong> ${x.v}</li>`).join('') : '';

          extraFields += `
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); margin-block-end: var(--space-3); border-inline-start: 3px solid var(--state-info);">
              <strong style="color: var(--state-info); font-size: var(--font-size-xs); display: block; margin-block-end: 6px;">گروه‌های هدف و پرخطر:</strong>
              ${typeof s.targetGroups === 'object' ? `<ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-xs); color: var(--text-primary); line-height: var(--line-height-relaxed);">${targetItems}</ul>` : `<span style="font-size: var(--font-size-xs); color: var(--text-primary); display: block;">${s.targetGroups}</span>`}
            </div>
          `;
        }

        bodyContent = `
          ${s.definition ? `
            <div style="margin-block-end: var(--space-3);">
              <strong style="color: var(--color-primary); display: block; margin-block-end: 4px; font-size: 0.95rem;">تعریف بالینی و علائم تشخیصی:</strong>
              <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${s.definition}</p>
            </div>
          ` : ''}
          ${extraFields}
          ${ddxBadges ? `
            <div>
              <strong style="color: var(--text-secondary); font-size: var(--font-size-xs); display: block; margin-block-end: 6px;">تشخیص‌های افتراقی (DDx) و بیماری‌های واگیر مرتبط:</strong>
              <div class="d-flex flex-wrap gap-1">${ddxBadges}</div>
            </div>
          ` : ''}
        `;
      }

      return `
        <div class="clinical-card mb-4">
          <div class="card-header bg-primary text-white d-flex justify-between align-center">
            <strong>سندرم ${s.number || ''}: ${s.name || ''}</strong>
            <span class="badge badge-subtle" style="background: rgba(255,255,255,0.2); color: #fff;">مراقبت سندرمیک کشوری</span>
          </div>
          <div class="card-body">
            ${bodyContent}
          </div>
        </div>
      `;
    }).join('');

    let extraAedes = '';
    if (sec.aedesVectorEvidence) {
      extraAedes = `
        <div class="historical-milestone-card" style="border-inline-start-color: var(--state-danger); margin-block-start: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">🦟</span>
            <strong>شواهد استقرار ناقل آئدس (Aedes) در ایران و ارتباط با مراقبت سندرمیک</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.aedesVectorEvidence}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content"><p>${sec.summary || ''}</p></div>
      </div>

      <h3 style="margin-block-end: var(--space-3);">سندرم‌های بالینی مشمول مراقبت سندرمیک کشوری</h3>
      <div class="grid-2">${synCards}</div>
      ${extraAedes}
    `;
  },

  /* =========================================================================
     CHAPTER 23 RENDERERS (NOSOCOMIAL INFECTIONS)
     ========================================================================= */
  renderChapter23Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch23-sec01') {
      const wards = sec.highRiskWards || [];
      const wardCards = wards.map(w => `
        <div class="key-fact-card" style="border-inline-start: 4px solid var(--state-danger);">
          <div class="card-label">${w.ward || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${w.risk || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">🏥</span><strong>تعریف استاندارد عفونت بیمارستانی (HAI)</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.definition || ''}</p>
          </div>
        </div>

        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-warning text-white"><strong>بازه زمانی عفونت‌های محل جراحی (SSI)</strong></div>
          <div class="card-body"><p style="margin: 0;">${sec.ssiTimeline || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بخش‌های پرخطر بیمارستانی</h3>
        <div class="grid-3">${wardCards}</div>
      `;
    }

    if (sec.id === 'ch23-sec02') {
      const ms = sec.milestones || [];
      const timeRows = ms.map(m => `
        <div class="timeline-card">
          <div class="timeline-badge">${m.year || ''}</div>
          <div class="timeline-content">
            <strong>${m.title || ''}</strong>
            <p>${m.desc || ''}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار توسعه نظام مراقبت کشوری NNIS در ایران</h3>
        <div class="timeline-container">${timeRows}</div>
      `;
    }

    if (sec.id === 'ch23-sec03') {
      const levels = sec.levels || [];
      const levelCards = levels.map(l => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white"><strong>${l.level || ''}</strong></div>
          <div class="card-body"><p style="margin: 0; line-height: var(--line-height-relaxed);">${l.actions || ''}</p></div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح سه‌گانه پیشگیری و استانداردهای کنترل عفونت</h3>
        <div class="grid-3">${levelCards}</div>
      `;
    }

    if (sec.id === 'ch23-sec04') {
      const chain = (sec.outbreakChain || '').split('->').map(s => s.trim()).filter(Boolean);
      const chainSteps = chain.map((step, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;"><strong style="color: var(--text-primary); font-size: var(--font-size-base);">${step}</strong></div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      const disaster = sec.disasterActions || [];
      const disCards = disaster.map(d => `
        <div class="hazard-card hazard-health">
          <div class="hazard-badge">${d.category || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm);">${d.detail || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">زنجیره مراحل بررسی و مهار طغیان بیمارستانی</h3>
        <div class="cycle-flow-container" style="margin-block-end: var(--space-6);">${chainSteps}</div>

        <h3 style="margin-block-end: var(--space-3);">اقدامات حیاتی کنترل عفونت در بلایا و بحران‌ها</h3>
        <div class="grid-2">${disCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 24 RENDERERS (MALARIA COMPREHENSIVE GUIDE)
     ========================================================================= */
  renderChapter24Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch24-sec01') {
      const who = sec.whoMetrics || {};
      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بار بیماری مالاریا در آمار جهانی (WHO)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="key-fact-card">
            <div class="card-label">موارد سالانه در جهان</div>
            <div class="card-value">${who.cases || ''}</div>
          </div>
          <div class="key-fact-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="card-label">مرگ‌های سالانه</div>
            <div class="card-value" style="color: var(--state-danger);">${who.deaths || ''}</div>
          </div>
          <div class="key-fact-card">
            <div class="card-label">سهم قاره آفریقا</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${who.africaShare || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">سهم کودکان زیر ۵ سال</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${who.under5Share || ''}</p>
          </div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-success);">
          <div class="historical-milestone-header">
            <span class="icon">🎯</span><strong>وضعیت اپیدمیولوژیک ایران در افق حذف مالاریا</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.iranStatus || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch24-sec02') {
      const sp = sec.speciesTable || [];
      const rows = sp.map(s => `
        <tr>
          <td><strong>${s.species || ''}</strong></td>
          <td>${s.period || ''}</td>
          <td>${s.schizogony || ''}</td>
          <td><span class="badge badge-subtle">${s.targetRbc || ''}</span></td>
          <td>${s.hypnozoite || ''}</td>
          <td>${s.pattern || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مقایسه بیولوژیک و انگل‌شناسی گونه‌های پلاسمودیوم</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th>گونه پلاسمودیوم</th>
                <th>دوره انکوباسیون</th>
                <th>شیزوگونی گلبولی</th>
                <th>سلول هدف (RBC)</th>
                <th>فاز هیپنوزوئیت (کبدی)</th>
                <th>الگوی تب</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch24-sec03') {
      const stages = sec.paroxysmStages || [];
      const stageCards = stages.map((s, idx) => `
        <div class="stage-step-card">
          <div class="step-num-badge">${idx + 1}</div>
          <div style="flex: 1;">
            <div class="d-flex justify-between align-center" style="margin-block-end: 4px;">
              <strong style="color: var(--text-primary); font-size: 1.05rem;">${s.stage || ''}</strong>
              <span class="badge badge-warning">${s.duration || ''}</span>
            </div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${s.symptoms || ''}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مراحل سه‌گانه حمله کلاسیک پاروکسیسم مالاریا</h3>
        <div class="grid-3">${stageCards}</div>
      `;
    }

    if (sec.id === 'ch24-sec04') {
      const diag = sec.diagnostics || [];
      const diagCards = diag.map(d => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white"><strong>${d.method || ''}</strong></div>
          <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${d.application || ''}</p></div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روش‌های تشخیصی آزمایشگاهی و سریع مالاریا</h3>
        <div class="grid-3">${diagCards}</div>
      `;
    }

    if (sec.id === 'ch24-sec05') {
      const tr = sec.treatmentRegimens || [];
      const rows = tr.map(t => `
        <tr>
          <td style="width: 170px;"><strong>${t.target || ''}</strong></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${t.regimen || ''}</p></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل‌های کشوری درمان مالاریا بر اساس گونه و شدت</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th style="width: 170px;">گروه هدف / گونه انگل</th><th>رژیم دارویی استاندارد کشوری</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 25 RENDERERS (KALA-AZAR / VISCERAL LEISHMANIASIS)
     ========================================================================= */
  renderChapter25Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch25-sec01') {
      const comp = sec.comparison || [];
      const rows = comp.map(c => `
        <tr>
          <td><strong>${c.feature || ''}</strong></td>
          <td>${c.zvl || ''}</td>
          <td>${c.avl || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تمایز بالینی و اپیدمیولوژیک لیشمانیوز احشایی زئونوتیک (ZVL) و آنتروپونوتیک (AVL)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr><th>ویژگی</th><th>فرم زئونوتیک (ZVL - شایع در ایران)</th><th>فرم آنتروپونوتیک (AVL)</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch25-sec02') {
      const pp = sec.pathophysiology || [];
      const ppCards = pp.map(p => `
        <div class="clinical-card">
          <div class="card-header bg-danger text-white"><strong>عضو درگیر: ${p.organ || ''}</strong></div>
          <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${p.effect || ''}</p></div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پاتوفیزیولوژی درگیری سیستم رتیکولوآندوتلیال</h3>
        <div class="grid-3">${ppCards}</div>
      `;
    }

    if (sec.id === 'ch25-sec03') {
      const defs = sec.caseDefinitions || [];
      const defCards = defs.map(d => `
        <div class="key-fact-card">
          <div class="card-label">${d.type || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${d.desc || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف مورد بیماری کالا آزار</h3>
        <div class="grid-3">${defCards}</div>
      `;
    }

    if (sec.id === 'ch25-sec04') {
      const inter = sec.interventions || [];
      const interCards = inter.map(i => `
        <div class="hazard-card hazard-health">
          <div class="hazard-badge">${i.domain || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm);">${i.measures || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل‌های درمانی و راهبردهای مهار مخازن و ناقل</h3>
        <div class="grid-3">${interCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 26 RENDERERS (SURVEILLANCE CASE DEFINITIONS)
     ========================================================================= */
  renderChapter26Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch26-sec06') {
      const matrix = sec.matrix || [];
      const rows = matrix.map(m => `
        <tr>
          <td><strong>${m.disease || ''}</strong></td>
          <td><span class="badge ${m.channel.includes('فوری') || m.channel.includes('تلفنی') ? 'badge-danger' : 'badge-primary'}">${m.channel || ''}</span></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${m.requirement || ''}</p></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس جامع مقایسه‌ای ۱۷ بیماری تحت مراقبت کشوری</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th>بیماری</th><th>کانال گزارش‌دهی</th><th>الزامات و اقدامات کلیدی</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    // Sections 1 through 5: Diseases array
    const diseases = sec.diseases || [];
    const disCards = diseases.map(d => `
      <div class="clinical-card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-between align-center">
          <strong>${d.name || ''}</strong>
          <span class="badge badge-subtle" style="background: rgba(255,255,255,0.2); color: #fff;">تعریف مورد استاندارد</span>
        </div>
        <div class="card-body">
          <div class="grid-3" style="margin-block-end: var(--space-3);">
            <div class="key-fact-card">
              <div class="card-label">مورد مظنون (Suspected)</div>
              <p style="margin: 0; font-size: var(--font-size-sm);">${d.suspected || ''}</p>
            </div>
            <div class="key-fact-card">
              <div class="card-label">مورد محتمل (Probable)</div>
              <p style="margin: 0; font-size: var(--font-size-sm);">${d.probable || ''}</p>
            </div>
            <div class="key-fact-card" style="border-inline-start: 4px solid var(--state-success);">
              <div class="card-label">مورد قطعی (Confirmed)</div>
              <p style="margin: 0; font-size: var(--font-size-sm);">${d.confirmed || ''}</p>
            </div>
          </div>
          <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <strong style="color: var(--state-danger); font-size: var(--font-size-xs);">پروتکل گزارش‌دهی و اقدام فوری:</strong>
            <p style="margin: 4px 0 0 0; font-size: var(--font-size-xs);">${d.protocol || ''}</p>
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
        <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
        <div class="callout-content"><p>${sec.summary || ''}</p></div>
      </div>

      <h3 style="margin-block-end: var(--space-3);">تعاریف مورد بالینی و پروتکل‌های اجرایی</h3>
      <div>${disCards}</div>
    `;
  },

  /* =========================================================================
     CHAPTER 27 RENDERERS (COMMUNICABLE PRINCIPLES & PATHOGENS)
     ========================================================================= */
  renderChapter27Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch27-sec01') {
      const pathogenClasses = sec.pathogenClasses || [];
      const pillMap = {
        'باکتریایی': 'pill-bacteria',
        'ویروسی': 'pill-virus',
        'قارچی': 'pill-fungus',
        'انگلی': 'pill-parasite',
        'پریونی': 'pill-prion'
      };

      const rows = pathogenClasses.map(p => {
        const pClass = pillMap[p.category] || 'badge-primary';
        const exList = (p.examples || '').split(/[،,]/).map(s => s.trim()).filter(Boolean);
        const exTags = exList.map(e => `<span class="disease-tag">${e}</span>`).join(' ');

        return `
          <tr>
            <td style="width: 130px;"><span class="pathogen-pill ${pClass}">${p.category}</span></td>
            <td><div class="d-flex flex-wrap gap-1">${exTags}</div></td>
          </tr>
        `;
      }).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">🔬</span>
            <strong>سیر تاریخی: گذار از نظریه میاسما به نظریه میکروبی کخ</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 1.05rem;">${sec.miasmaVsKoch || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">طبقه‌بندی ۵ گانه عوامل بیماری‌زای واگیر</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th style="width: 130px;">رده میکروبیولوژیک</th><th>پاتوژن‌ها و بیماری‌های شاخص نمونه</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch27-sec02') {
      const indicators = sec.indicators || [];
      const indRows = indicators.map(ind => `
        <tr>
          <td style="width: 190px;"><strong>${ind.name || ''}</strong></td>
          <td style="width: 190px;"><code>${ind.formula || ''}</code></td>
          <td><p style="margin: 0; line-height: var(--line-height-relaxed);">${ind.interpretation || ''}</p></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">شاخص‌های زیست‌شناختی عوامل عفونی</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th style="width: 190px;">شاخص</th><th style="width: 190px;">فرمول محاسبه</th><th>تفسیر اپیدمیولوژیک</th></tr></thead>
            <tbody>${indRows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch27-sec03') {
      const tc = sec.temporalConcepts || [];
      const tcCards = tc.map(t => `
        <div class="key-fact-card">
          <div class="card-label">${t.concept || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${t.definition || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">مفاهیم دینامیک زمانی انتقال و دوره‌های اپیدمیولوژیک</h3>
        <div class="grid-3">${tcCards}</div>
      `;
    }

    if (sec.id === 'ch27-sec04') {
      const erad = sec.eradicationLevels || [];
      const eradSteps = erad.map((e, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; font-size: var(--font-size-base);">${e.level || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${e.desc || ''}</span>
          </div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-primary text-white"><strong>فرمول محاسبه میزان حمله ثانویه (SAR)</strong></div>
          <div class="card-body">
            <code>${sec.sarFormula || ''}</code>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح چهارگانه مبارزه با بیماری‌های واگیر</h3>
        <div class="cycle-flow-container">${eradSteps}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 28 RENDERERS (CUTANEOUS LEISHMANIASIS - SALAK)
     ========================================================================= */
  renderChapter28Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch28-sec01') {
      const chain = (sec.lifeCycle || '').split('->').map(s => s.trim()).filter(Boolean);
      const chainSteps = chain.map((step, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;"><strong style="color: var(--text-primary); font-size: var(--font-size-base);">${step}</strong></div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">چرخه زیستی انگل لیشمانیا در ناقل و ماکروفاژها</h3>
        <div class="cycle-flow-container">${chainSteps}</div>
      `;
    }

    if (sec.id === 'ch28-sec02') {
      const forms = sec.atypicalForms || [];
      const formCards = forms.map(f => `
        <div class="key-fact-card">
          <div class="card-label">${f.form || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${f.desc || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اشکال بالینی غیرمعمول (Atypical Forms) سالک</h3>
        <div class="grid-2">${formCards}</div>
      `;
    }

    if (sec.id === 'ch28-sec03') {
      const comp = sec.comparisonTable || [];
      const rows = comp.map(c => `
        <tr>
          <td><strong>${c.param || ''}</strong></td>
          <td>${c.acl || ''}</td>
          <td>${c.zcl || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جدول جامع مقایسه سالک شهری (ACL) در برابر سالک روستایی (ZCL)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th>پارامتر</th><th>سالک شهری (ACL - نوع خشک)</th><th>سالک روستایی (ZCL - نوع مرطوب)</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch28-sec04') {
      const defs = sec.caseDefinitions || [];
      const defCards = defs.map(d => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white"><strong>${d.type || ''}</strong></div>
          <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${d.desc || ''}</p></div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف مورد بیماری سالک در نظام مراقبت</h3>
        <div class="grid-3">${defCards}</div>
      `;
    }

    if (sec.id === 'ch28-sec05') {
      const proto = sec.fieldProtocols || [];
      const protoCards = proto.map(p => `
        <div class="hazard-card hazard-health">
          <div class="hazard-badge">${p.type || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm);">${p.actions || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل‌های میدانی جونده‌کشی و سمپاشی</h3>
        <div class="grid-3">${protoCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

  /* =========================================================================
     CHAPTER 29 RENDERERS (MALARIA LIFECYCLE & CONTROL)
     ========================================================================= */
  renderChapter29Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch29-sec01') {
      const stages = sec.lifeCycleStages || [];
      const rows = stages.map(s => `
        <tr>
          <td><strong>${s.phase || ''}</strong></td>
          <td>${s.site || ''}</td>
          <td>${s.outcome || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">چرخه زیستی دوگانه پلاسمودیوم (انسان و پشه آنوفل)</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead><tr><th>فاز چرخه زیستی</th><th>محل در بدن میزبان</th><th>پیامد بیولوژیک و مرحله تکاملی</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (sec.id === 'ch29-sec02') {
      const sp = sec.speciesTable || [];
      const rec = sec.recurrenceDiff || {};

      const rows = sp.map(s => `
        <tr>
          <td><strong>${s.species || ''}</strong></td>
          <td>${s.incubation || ''}</td>
          <td>${s.pattern || ''}</td>
          <td>${s.clinical || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">جدول تمایز گونه‌های پلاسمودیوم و دوره‌های انکوباسیون</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th>گونه</th><th>دوره انکوباسیون</th><th>الگوی تب</th><th>ویژگی‌های کلینیکی</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تفاوت پاتوفیزیولوژیک عود حقیقی (Relapse) و عود کاذب (Recrudescence)</h3>
        <div class="grid-2">
          <div class="clinical-card">
            <div class="card-header bg-warning text-white"><strong>عود حقیقی (Relapse)</strong></div>
            <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${rec.relapse || ''}</p></div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-danger text-white"><strong>عود مجدد (Recrudescence)</strong></div>
            <div class="card-body"><p style="margin: 0; font-size: var(--font-size-sm);">${rec.recrudescence || ''}</p></div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch29-sec03') {
      const timelineSteps = (sec.prophylaxisTimeline || '').split('->').map(s => s.trim()).filter(Boolean);
      const stepItems = timelineSteps.map((s, idx) => `
        <div class="flow-step">
          <span class="step-badge">${idx + 1}</span>
          <div style="flex: 1;"><strong style="color: var(--text-primary); font-size: var(--font-size-base);">${s}</strong></div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      const vec = sec.vectorControl || [];
      const vecCards = vec.map(v => `
        <div class="key-fact-card">
          <div class="card-label">${v.strategy || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${v.action || ''}</p>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">گاهشمار شیمی‌پروفیلاکسی مالاریا در مسافران</h3>
        <div class="cycle-flow-container" style="margin-block-end: var(--space-6);">${stepItems}</div>

        <h3 style="margin-block-end: var(--space-3);">راهبردهای کنترل ناقل آنوفل</h3>
        <div class="grid-3">${vecCards}</div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

    
  /* =========================================================================
     CHAPTER 30 RENDERERS (RABIES & BRUCELLOSIS)
     ========================================================================= */
  renderChapter30Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch30-sec01') {
      const pa = sec.pathogenAttributes || {};
      const patterns = sec.epidemiologicPatterns || [];
      const de = sec.descriptiveEpidemiology || {};
      const iran = sec.iranStatus || {};

      const patternCards = patterns.map(p => `
        <div class="clinical-card">
          <div class="card-header bg-danger text-white d-flex align-center gap-2">
            <span class="icon">🐺</span><strong>${p.pattern || ''}</strong>
          </div>
          <div class="card-body">
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${p.cycle || ''}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-value" style="color: var(--state-danger); font-size: 1.65rem; font-weight: 800;">۱۰۰٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">کشندگی پس از ظهور علائم بالینی</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="stat-value" style="color: var(--state-success); font-size: 1.65rem; font-weight: 800;">۱۰۰٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">قابلیت پیشگیری با واکسیناسیون به موقع</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="stat-value" style="color: var(--color-primary); font-size: 1.65rem; font-weight: 800;">۱۸۰,۰۰۰+</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">حیوان‌گزیدگی سالانه ثبت‌شده در ایران</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid #4338ca;">
            <div class="stat-value" style="color: #4338ca; font-size: 1.65rem; font-weight: 800;">۷۰۰+</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">مرکز درمان و پیشگیری هاری در کشور</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ویژگی‌های عمومی و زیست‌شناختی ویروس هاری</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="key-fact-card">
            <div class="card-label">عامل اتیولوژیک</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.etiology || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">ماهیت عفونت</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.nature || ''}</p>
          </div>
          <div class="key-fact-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="card-label" style="color: var(--state-danger);">میزان کشندگی (CFR)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.caseFatalityRate || ''}</p>
          </div>
          <div class="key-fact-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="card-label" style="color: var(--color-primary);">ویژگی منحصربه‌فرد کلینیکی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.uniqueFeature || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">میزبانان و مخازن طبیعی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.naturalReservoirs || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">حساسیت و مقاومت ذاتی انسان</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${pa.susceptibility || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">الگوهای سه‌گانه اپیدمیولوژیک هاری</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${patternCards}</div>

        <h3 style="margin-block-end: var(--space-3);">اپیدمیولوژی توصیفی (فرد، مکان، زمان)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-primary text-white"><strong>سیمای سنی و جنسی</strong></div>
            <div class="card-body">
              <p style="margin-block-end: var(--space-2); font-size: var(--font-size-sm);"><strong>توزیع سنی:</strong> ${de.age || ''}</p>
              <p style="margin: 0; font-size: var(--font-size-sm);"><strong>توزیع جنسی:</strong> ${de.gender || ''}</p>
            </div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-info text-white"><strong>مشاغل پرخطر و فصول بروز</strong></div>
            <div class="card-body">
              <p style="margin-block-end: var(--space-2); font-size: var(--font-size-sm);"><strong>گروه‌های شغلی:</strong> ${de.highRiskOccupations || ''}</p>
              <p style="margin: 0; font-size: var(--font-size-sm);"><strong>توزیع زمانی (فصل):</strong> ${de.seasonality || ''}</p>
            </div>
          </div>
          <div class="clinical-card" style="grid-column: 1 / -1;">
            <div class="card-header bg-accent text-white"><strong>بار جهانی بیماری و مناطق گرمسیری</strong></div>
            <div class="card-body">
              <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${de.globalBurden || ''}</p>
            </div>
          </div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--state-danger);">
          <div class="historical-milestone-header">
            <span class="icon">📍</span>
            <strong>وضعیت اپیدمیولوژیک هاری در ایران و هدف‌گذاری WHO</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin-block-end: var(--space-2);"><strong>اندامیسیته:</strong> ${iran.endemicity || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>کانون‌های پرخطر:</strong> ${iran.highRiskHotspots || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>سهم حیوانات گزنده:</strong> ${iran.animalBitesShare || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>آمار سالیانه:</strong> ${iran.annualIncidence || ''}</p>
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border-inline-start: 4px solid var(--state-success); margin-block-start: 8px;">
              <strong style="color: var(--state-success);">چشم‌انداز ۲۰۳۰:</strong> ${iran.who2030Goal || ''}
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch30-sec02') {
      const trans = sec.transmissionRoutes || {};
      const primaryTrans = trans.primary || [];
      const rareTrans = trans.rare || [];
      const tissueFacts = trans.tissueViabilityFacts || [];
      const inc = sec.incubationFactors || {};
      const incDet = inc.keyDeterminants || [];
      const stages = sec.clinicalStages || [];

      const primaryCards = primaryTrans.map(t => `
        <div class="stage-step-card">
          <div class="step-num-badge" style="background: var(--color-primary); color: #fff;">اصلی</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${t.mode || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${t.detail || ''}</span>
          </div>
        </div>
      `).join('');

      const rareCards = rareTrans.map(t => `
        <div class="stage-step-card">
          <div class="step-num-badge" style="background: var(--state-warning); color: #fff;">نادر</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${t.mode || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${t.detail || ''}</span>
          </div>
        </div>
      `).join('');

      const incCards = incDet.map(d => `
        <div class="key-fact-card">
          <div class="card-label">${d.factor || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${d.desc || ''}</p>
        </div>
      `).join('');

      const stageCards = stages.map((st, idx) => `
        <div class="flow-step" style="padding: 16px 20px; align-items: flex-start;">
          <span class="step-badge" style="${idx === 3 ? 'background: var(--state-danger);' : ''}">${idx + 1}</span>
          <div style="flex: 1;">
            <div class="d-flex justify-between align-center flex-wrap gap-1" style="margin-block-end: 6px;">
              <strong style="color: var(--text-primary); font-size: 1.05rem;">${st.stage || ''}</strong>
              <span class="badge badge-warning">${st.duration || ''}</span>
            </div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${st.symptoms || ''}</p>
          </div>
        </div>
      `).join('<div class="flow-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="7 10 12 15 17 10"></polyline></svg></div>');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary); margin-block-end: var(--space-6);">
          <div class="historical-milestone-header">
            <span class="icon">🧠</span>
            <strong>مکانیسم پاتوژنز و صعود رتروگراد آکسونی ویروس</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin: 0; font-size: 0.95rem; line-height: var(--line-height-relaxed);">${sec.pathogenesisMechanism || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">راه‌های اولیه و متداول انتقال</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${primaryCards}</div>

        <h3 style="margin-block-end: var(--space-3);">مسیرهای نادر انتقال و نکات بافتی ویروس</h3>
        <div class="grid-2" style="margin-block-end: var(--space-4);">${rareCards}</div>

        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-info text-white"><strong>نکات کلیدی زیست‌پذیری بافتی ویروس هاری</strong></div>
          <div class="card-body">
            <ul style="margin: 0; padding-inline-start: 20px; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
              ${tissueFacts.map(f => `<li style="margin-block-end: 6px;">${f}</li>`).join('')}
            </ul>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">دوره نهفتگی (کمون) و عوامل مؤثر بر آن</h3>
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-block-end: var(--space-3);"><strong>طول دوره معمول:</strong> ${inc.typicalDuration || ''}</p>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${incCards}</div>

        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px; font-size: 1rem;">قانون زرین ۱۰ روزه قرنطینه حیوان مهاجم (سگ و گربه):</strong>
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${inc.tenDayQuarantineRule || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سیر بالینی و مراحل چهارگانه بیماری هاری در انسان</h3>
        <div class="cycle-flow-container">${stageCards}</div>
      `;
    }

    if (sec.id === 'ch30-sec03') {
      const defs = sec.caseDefinitions || [];
      const lab = sec.laboratoryDiagnosis || {};
      const antemortem = lab.antemortem || [];
      const postmortem = lab.postmortem || [];
      const primary = sec.primaryPrevention || [];
      const prep = sec.prepProtocol || {};

      const defCards = defs.map(d => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white d-flex justify-between align-center">
            <strong>${d.type || ''}</strong>
            <span class="badge badge-subtle">تعریف استاندارد کشوری</span>
          </div>
          <div class="card-body">
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${d.criteria || ''}</p>
          </div>
        </div>
      `).join('');

      const anteItems = antemortem.map(a => `
        <li style="margin-block-end: 8px;">
          <strong style="color: var(--color-primary);">${a.method || ''}:</strong>
          <span style="font-size: var(--font-size-sm); color: var(--text-secondary);"> ${a.desc || ''}</span>
        </li>
      `).join('');

      const postItems = postmortem.map(p => `
        <li style="margin-block-end: 8px;">
          <strong style="color: var(--state-danger);">${p.method || ''}:</strong>
          <span style="font-size: var(--font-size-sm); color: var(--text-secondary);"> ${p.desc || ''}</span>
        </li>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف استاندارد نظام مراقبت هاری</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${defCards}</div>

        <h3 style="margin-block-end: var(--space-3);">روش‌های تشخیص آزمایشگاهی اختصاصی هاری</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-info text-white"><strong>آزمون‌های پیش از مرگ (Antemortem)</strong></div>
            <div class="card-body">
              <ul style="margin: 0; padding-inline-start: 18px; line-height: var(--line-height-relaxed);">${anteItems}</ul>
            </div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-danger text-white"><strong>آزمون‌های پس از مرگ (Postmortem - استاندارد طلایی)</strong></div>
            <div class="card-body">
              <ul style="margin: 0; padding-inline-start: 18px; line-height: var(--line-height-relaxed);">${postItems}</ul>
            </div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">اقدامات پیشگیری اولیه در سطح جامعه (Primary Prevention)</h3>
        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-success text-white"><strong>محورهای پنج‌گانه استراتژی پیشگیری اولیه در جمعیت‌های انسانی و حیوانی</strong></div>
          <div class="card-body">
            <ul style="margin: 0; padding-inline-start: 20px; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
              ${primary.map(p => `<li style="margin-block-end: 6px;">${p}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary);">
          <div class="historical-milestone-header">
            <span class="icon">💉</span>
            <strong>واکسیناسیون قبل از مواجهه (PrEP - Pre-Exposure Prophylaxis)</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin-block-end: var(--space-2);"><strong>گروه‌های هدف:</strong> ${prep.targetGroups || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>رژیم واکسیناسیون:</strong> ${prep.regimen || ''}</p>
            <p style="margin: 0;"><strong>پایش تیتر آنتی‌بادی:</strong> ${prep.monitoring || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch30-sec04') {
      const steps = sec.woundManagementSteps || [];
      const cats = sec.whoCategories || [];
      const rig = sec.rigAdministration || {};
      const regs = sec.vaccinationRegimens || [];
      const special = sec.specialConsiderations || {};

      const stepCards = steps.map(s => `
        <div class="stage-step-card">
          <div class="step-num-badge" style="background: var(--color-primary); color: #fff;">${s.step}</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); font-size: 1rem; display: block; margin-block-end: 4px;">${s.name || ''}</strong>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${s.detail || ''}</p>
          </div>
        </div>
      `).join('');

      const catRows = cats.map(c => `
        <tr>
          <td style="width: 170px;"><strong>${c.category || ''}</strong></td>
          <td>${c.exposureType || ''}</td>
          <td><strong style="color: var(--color-primary);">${c.recommendedAction || ''}</strong></td>
        </tr>
      `).join('');

      const regCards = regs.map(r => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white"><strong>${r.name || ''}</strong></div>
          <div class="card-body">
            <div style="background: var(--color-surface-subtle); padding: 8px 12px; border-radius: var(--radius-sm); margin-block-end: var(--space-3); border-inline-start: 3px solid var(--color-primary);">
              <strong style="font-size: var(--font-size-xs); color: var(--color-primary);">برنامه زمانی:</strong>
              <span style="font-size: var(--font-size-sm); display: block; font-weight: 700; margin-block-start: 2px;">${r.schedule || ''}</span>
            </div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${r.details || ''}</p>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">پروتکل ۵ مرحله‌ای مدیریت فوری زخم حیوان‌گزیدگی</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${stepCards}</div>

        <h3 style="margin-block-end: var(--space-3);">رده‌بندی مواجهه و اقدامات درمانی طبق سازمان جهانی بهداشت (WHO)</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="width: 170px;">رده مواجهه</th>
                <th>نوع تماس با حیوان مشکوک</th>
                <th>اقدام درمانی توصیه شده</th>
              </tr>
            </thead>
            <tbody>${catRows}</tbody>
          </table>
        </div>

        <div class="clinical-card" style="margin-block-end: var(--space-6); border-inline-start: 4px solid var(--state-danger);">
          <div class="card-header bg-danger text-white"><strong>راهنمای تجویز ایمونوگلوبولین اختصاصی هاری (RIG)</strong></div>
          <div class="card-body">
            <p style="margin-block-end: var(--space-2); font-size: var(--font-size-sm);"><strong>اندیکاسیون:</strong> ${rig.indication || ''}</p>
            <p style="margin-block-end: var(--space-2); font-size: var(--font-size-sm);"><strong>دوزاژ:</strong> ${rig.dose || ''}</p>
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);"><strong>تکنیک اینفیلتراسیون:</strong> ${rig.technique || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">رژیم‌های واکسیناسیون پس از مواجهه (PEP Regimens)</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${regCards}</div>

        <div class="grid-2">
          <div class="key-fact-card">
            <div class="card-label">مواجهه با جوندگان و خرگوش‌ها</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${special.rodentsAndRabbits || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">پروتکل تجربی میلواکی (Milwaukee)</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${special.milwaukeeProtocol || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch30-sec05') {
      const gc = sec.generalConcepts || {};
      const chron = gc.chronicityClassification || [];
      const species = sec.brucellaSpecies || [];
      const env = sec.environmentalSurvival || [];
      const econ = sec.economicImpacts || [];
      const desc = sec.descriptiveLandscape || {};

      const chronCards = chron.map(c => `
        <div class="key-fact-card">
          <div class="card-label">${c.phase || ''}</div>
          <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${c.duration || ''}</p>
        </div>
      `).join('');

      const spRows = species.map(s => `
        <tr>
          <td><span class="badge badge-subtle" style="font-family: monospace; font-size: 0.95rem; font-weight: 700;">${s.species || ''}</span></td>
          <td><strong>${s.primaryHost || ''}</strong></td>
          <td style="font-size: var(--font-size-sm);">${s.humanPathogenicity || ''}</td>
        </tr>
      `).join('');

      const envRows = env.map(e => `
        <tr>
          <td>${e.medium || ''}</td>
          <td><span class="badge badge-warning">${e.survivalTime || ''}</span></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-3" style="margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="stat-value" style="color: var(--color-primary); font-size: 1.65rem; font-weight: 800;">۸ به ۱</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">نسبت عفونت‌های بدون‌علامت (ساب‌کلینیکال) به علامت‌دار</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-warning);">
            <div class="stat-value" style="color: var(--state-warning); font-size: 1.65rem; font-weight: 800;">۲ الی ۳ ماه</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">حداقل ماندگاری پنیر سنتی در آب‌نمک ۱۷٪ جهت سلامت</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-value" style="color: var(--state-danger); font-size: 1.65rem; font-weight: 800;">B. melitensis ۱</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">شایع‌ترین، حادترین و مهاجم‌ترین سویه بومی در ایران</div>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">کلیات و تابلوی بالینی تب مالت (بروسلوز)</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="key-fact-card">
            <div class="card-label">ماهیت و اسامی مترادف</div>
            <p style="margin-block-end: var(--space-1); font-size: var(--font-size-sm); color: var(--text-secondary);">${gc.nature || ''}</p>
            <p style="margin: 0; font-size: var(--font-size-xs); color: var(--color-primary);"><strong>اسامی:</strong> ${gc.synonyms || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">سیمای بالینی عمومی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gc.clinicalPicture || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">میزان کشندگی</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gc.caseFatality || ''}</p>
          </div>
          <div class="key-fact-card">
            <div class="card-label">نسبت ساب‌کلینیکال به علامت‌دار</div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);">${gc.subclinicalRatio || ''}</p>
          </div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">تقسیم‌بندی بالینی بروسلوز بر اساس مدت زمان بیماری</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${chronCards}</div>

        <h3 style="margin-block-end: var(--space-3);">گونه‌های باکتری بروسلا و مخازن اصلی</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th>گونه باکتری</th><th>میزبان و مخزن اولیه</th><th>بیماری‌زایی در انسان و ویژگی‌های اپیدمیولوژیک</th></tr></thead>
            <tbody>${spRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">بقای بروسلا در فرآورده‌های دامی و محیط زیست</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th>محیط / فرآورده دامی</th><th>مدت زمان بقا</th></tr></thead>
            <tbody>${envRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">خسارات دامی و اقتصادی بروسلوز</h3>
        <div class="clinical-card" style="margin-block-end: var(--space-6);">
          <div class="card-header bg-warning text-white"><strong>پیامدهای اقتصادی و خسارات سنگین به صنعت دامپروری</strong></div>
          <div class="card-body">
            <ul style="margin: 0; padding-inline-start: 20px; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
              ${econ.map(ec => `<li style="margin-block-end: 6px;">${ec}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary);">
          <div class="historical-milestone-header">
            <span class="icon">📊</span>
            <strong>اپیدمیولوژی توصیفی، وضعیت جهانی و سیمای بروسلوز در ایران</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin-block-end: var(--space-2);"><strong>سن و جنس:</strong> ${desc.age || ''} — ${desc.gender || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>مشاغل پرخطر:</strong> ${desc.highRiskJobs || ''}</p>
            <p style="margin-block-end: var(--space-2);"><strong>سیمای جهانی:</strong> ${desc.globalStatus || ''}</p>
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border-inline-start: 4px solid var(--state-warning); margin-block-start: 8px;">
              <strong style="color: var(--state-warning);">وضعیت ایران و موانع ریشه‌کنی:</strong> ${desc.iranStatus || ''}
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch30-sec06') {
      const trans = sec.transmissionToHumans || [];
      const organ = sec.organManifestations || [];
      const cases = sec.caseDefinitions || [];
      const sero = sec.serologyAndKinetics || {};
      const kinetics = sero.kinetics || [];
      const tests = sero.tests || [];
      const prev = sec.preventionAndTreatment || {};
      const anPrev = prev.animalPrevention || [];
      const huPrev = prev.humanPrevention || [];
      const tx = prev.treatmentRegimens || {};

      const transCards = trans.map(t => `
        <div class="stage-step-card">
          <div class="step-num-badge" style="background: var(--color-primary); color: #fff;">انتقال</div>
          <div style="flex: 1;">
            <strong style="color: var(--text-primary); display: block; margin-block-end: 4px;">${t.route || ''}</strong>
            <span style="font-size: var(--font-size-sm); color: var(--text-secondary); line-height: var(--line-height-relaxed);">${t.detail || ''}</span>
          </div>
        </div>
      `).join('');

      const organCards = organ.map(o => `
        <div class="clinical-card">
          <div class="card-header bg-primary text-white"><strong>${o.system || ''}</strong></div>
          <div class="card-body">
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${o.detail || ''}</p>
          </div>
        </div>
      `).join('');

      const caseCards = cases.map(c => `
        <div class="clinical-card">
          <div class="card-header bg-info text-white d-flex justify-between align-center">
            <strong>${c.level || ''}</strong>
            <span class="badge badge-subtle">نظام مراقبت کشوری</span>
          </div>
          <div class="card-body">
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${c.desc || ''}</p>
          </div>
        </div>
      `).join('');

      const kinRows = kinetics.map(k => `
        <tr>
          <td style="width: 180px;"><strong>${k.period || ''}</strong></td>
          <td>${k.status || ''}</td>
        </tr>
      `).join('');

      const testRows = tests.map(t => `
        <tr>
          <td style="width: 200px;"><code style="font-weight: 700; color: var(--color-primary);">${t.name || ''}</code></td>
          <td style="font-size: var(--font-size-sm);">${t.role || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">راه‌های پنج‌گانه انتقال بروسلا به انسان</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${transCards}</div>

        <h3 style="margin-block-end: var(--space-3);">تظاهرات بالینی عضو-محور و عوارض سیستمیک</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">${organCards}</div>

        <h3 style="margin-block-end: var(--space-3);">تعاریف استاندارد مورد بیماری در نظام مراقبت کشوری</h3>
        <div class="grid-3" style="margin-block-end: var(--space-6);">${caseCards}</div>

        <h3 style="margin-block-end: var(--space-3);">کینتیک زمانی تولید آنتی‌بادی‌های بروسلا</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th style="width: 180px;">مقطع زمانی بیماری</th><th>وضعیت ترشح و کلاس آنتی‌بادی</th></tr></thead>
            <tbody>${kinRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">روش‌های سرولوژی و آزمون‌های آزمایشگاهی استاندارد</h3>
        <div class="table-scroll-container" style="margin-block-end: var(--space-6);">
          <table class="medical-table">
            <thead><tr><th style="width: 200px;">نام آزمون</th><th>کاربرد بالینی و ویژگی تشخیصی</th></tr></thead>
            <tbody>${testRows}</tbody>
          </table>
        </div>

        <h3 style="margin-block-end: var(--space-3);">سطوح پیشگیری و رژیم‌های درمانی دو دارویی استاندارد کشوری</h3>
        <div class="grid-2" style="margin-block-end: var(--space-6);">
          <div class="clinical-card">
            <div class="card-header bg-success text-white"><strong>پیشگیری در جمعیت حیوانی (اساس ریشه‌کنی)</strong></div>
            <div class="card-body">
              <ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                ${anPrev.map(p => `<li style="margin-block-end: 6px;">${p}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="clinical-card">
            <div class="card-header bg-info text-white"><strong>پیشگیری در جمعیت انسانی</strong></div>
            <div class="card-body">
              <ul style="margin: 0; padding-inline-start: 18px; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">
                ${huPrev.map(p => `<li style="margin-block-end: 6px;">${p}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="historical-milestone-card" style="border-inline-start-color: var(--color-primary);">
          <div class="historical-milestone-header">
            <span class="icon">💊</span>
            <strong>پروتکل درمان دارویی کشوری تب مالت</strong>
          </div>
          <div class="historical-milestone-body">
            <p style="margin-block-end: var(--space-2);"><strong>استراتژی:</strong> ${tx.strategy || ''}</p>
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border-inline-start: 4px solid var(--color-primary); margin-block-end: 8px;">
              <strong style="color: var(--color-primary);">خط اول درمان:</strong> ${tx.firstLine || ''}
            </div>
            <div style="background: var(--color-surface-subtle); padding: 10px 14px; border-radius: var(--radius-sm); border-inline-start: 4px solid var(--state-info); margin-block-end: 8px;">
              <strong style="color: var(--state-info);">خط دوم (کودکان زیر ۸ سال و بارداری):</strong> ${tx.secondLine || ''}
            </div>
            <p style="margin: 0; font-size: var(--font-size-sm); color: var(--text-secondary);"><strong>مراقبت و گزارش‌دهی:</strong> ${tx.reporting || ''}</p>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch30-sec07') {
      const matrix = sec.matrixComparison || [];
      const rows = matrix.map(m => `
        <tr>
          <td style="width: 180px; font-weight: 700; background-color: var(--color-surface-subtle);">${m.parameter || ''}</td>
          <td style="border-inline-start: 2px solid var(--state-danger-subtle);">
            ${m.rabies || ''}
          </td>
          <td style="border-inline-start: 2px solid var(--color-primary-light);">
            ${m.brucellosis || ''}
          </td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <h3 style="margin-block-end: var(--space-3);">ماتریس مقایسه تطبیقی جامع ویژگی‌های اپیدمیولوژیک و مراقبتی هاری و تب مالت</h3>
        <div class="table-scroll-container">
          <table class="medical-table">
            <thead>
              <tr>
                <th style="width: 180px;">مؤلفه مقایسه</th>
                <th style="background: rgba(220, 38, 38, 0.08); color: var(--state-danger); font-weight: 800;">هاری (Rabies)</th>
                <th style="background: rgba(2, 132, 199, 0.08); color: var(--color-primary); font-weight: 800;">تب مالت (Brucellosis)</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },

    bindSectionActions(container) {
    container.querySelectorAll('.btn-bookmark').forEach(btn => {
      btn.addEventListener('click', () => {
        const secId = btn.getAttribute('data-section-id');
        if (window.appState && secId) {
          const isAdded = window.appState.toggleBookmark(secId);
          btn.classList.toggle('is-bookmarked', isAdded);
          btn.setAttribute('title', isAdded ? 'حذف نشانک' : 'افزودن نشانک');
          const svg = btn.querySelector('svg');
          if (svg) svg.setAttribute('fill', isAdded ? 'currentColor' : 'none');
          
          window.showToast(isAdded ? 'بخش به نشانک‌ها اضافه شد' : 'بخش از نشانک‌ها حذف شد');
        }
      });
    });

    container.querySelectorAll('.btn-copy-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const secId = btn.getAttribute('data-section-id');
        const url = `${window.location.origin}${window.location.pathname}#${secId}`;
        navigator.clipboard.writeText(url).then(() => {
          window.showToast('لینک بخش در کلیپ‌بورد کپی شد');
        }).catch(() => {
          window.showToast('آدرس مستقیم: #' + secId);
        });
      });
    });

    container.querySelectorAll('.chapter-nav-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const chTarget = card.getAttribute('data-chapter-target');
        if (chTarget && window.appState) {
          window.appState.setActiveChapter(chTarget);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          history.pushState(null, null, `#${chTarget}`);
        }
      });
    });
  },

  /* =========================================================================
   CHAPTER 31 RENDERERS (VACCINE-PREVENTABLE DISEASES PART 2 & SURVEILLANCE)
   ========================================================================= */
  renderChapter31Section(sec) {
    if (!sec) return '';

    if (sec.id === 'ch31-sec01') {
      const cd = sec.caseDefinitions || {};
      const td = sec.transmissionDynamics || {};
      const path = sec.pathogenesis || {};
      const organs = sec.targetOrgans || [];
      const spectrum = sec.clinicalSpectrum || {};
      const unvac = spectrum.unvaccinated || {};
      const vac = spectrum.vaccinated || {};
      const interventions = sec.interventionsImpact || [];

      const organCards = organs.map(o => `
        <div class="clinical-card" style="border-inline-start: 4px solid var(--state-danger);">
          <div class="card-header bg-danger text-white d-flex align-center gap-2" style="font-weight: 700;">
            <span>🫀</span> ${o.organ || ''} — ${o.pathology || ''}
          </div>
          <div class="card-body">
            <p style="margin: 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${o.clinicalImpact || ''}</p>
          </div>
        </div>
      `).join('');

      const interventionRows = interventions.map(it => `
        <tr>
          <td><strong>${it.intervention || ''}</strong></td>
          <td>${it.action || ''}</td>
          <td><span class="badge badge-danger">${it.mortalityEffect || ''}</span></td>
          <td><span class="badge badge-info">${it.transmissionEffect || ''}</span></td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-value" style="color: var(--state-danger); font-size: 1.6rem; font-weight: 800;">100 ng/kg</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">دوز کشنده اگزوتوکسین دیفتری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="stat-value" style="color: var(--color-primary); font-size: 1.6rem; font-weight: 800;">۲ تا ۷ روز</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">دوره کمون دیفتری</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-warning);">
            <div class="stat-value" style="color: var(--state-warning); font-size: 1.6rem; font-weight: 800;">۲ تا ۶ هفته</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">واگیری بدون درمان مؤثر</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="stat-value" style="color: var(--state-success); font-size: 1.6rem; font-weight: 800;">حداکثر ۴ روز</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">قطع سرایت با آنتی‌بیوتیک</div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">تعاریف استاندارد مورد در نظام مراقبت دیفتری</h3>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div class="clinical-card">
              <div class="card-header bg-primary text-white" style="font-weight: 700;">مورد بالینی (Clinical Case)</div>
              <div class="card-body"><p style="margin:0;">${cd.clinical || ''}</p></div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-primary text-white" style="font-weight: 700;">مورد محتمل (Probable Case)</div>
              <div class="card-body"><p style="margin:0;">${cd.probable || ''}</p></div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-success text-white" style="font-weight: 700;">مورد قطعی (Confirmed Case)</div>
              <div class="card-body"><p style="margin:0;">${cd.confirmed || ''}</p></div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-warning text-dark" style="font-weight: 700;">مورد مشکوک (Suspected Case)</div>
              <div class="card-body"><p style="margin:0; font-weight: bold; color: var(--state-danger);">${cd.suspected || ''}</p></div>
            </div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">پاتوژنز و ارگان‌های هدف اگزوتوکسین</h3>
          <div class="medical-callout callout-warning" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">⚠️</div>
            <div class="callout-content">
              <strong>مکانیسم بدون باکتریمی:</strong> ${path.localInvasion || ''}<br>
              <strong>توکسمی و مرگ سلولی:</strong> ${path.molecularMechanism || ''}
            </div>
          </div>
          <div class="grid-3" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4);">
            ${organCards}
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">سیر بالینی بر اساس وضعیت واکسیناسیون</h3>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div class="clinical-card" style="border-top: 4px solid var(--state-danger);">
              <div class="card-header" style="font-weight: 700; color: var(--state-danger);">افراد واکسینه‌نشده (Unvaccinated)</div>
              <div class="card-body">
                <ul class="styled-list">
                  <li><strong>مرحله پرودرومال:</strong> ${unvac.prodromeRate || ''}</li>
                  <li><strong>پیشرفت به فرم غشایی:</strong> ${unvac.membranousRate || ''}</li>
                  <li><strong>میزان کشندگی:</strong> ${unvac.fatalityRate || ''}</li>
                </ul>
              </div>
            </div>
            <div class="clinical-card" style="border-top: 4px solid var(--state-success);">
              <div class="card-header" style="font-weight: 700; color: var(--state-success);">افراد واکسینه‌شده (Vaccinated)</div>
              <div class="card-body">
                <ul class="styled-list">
                  <li><strong>حامل بدون علامت:</strong> ${vac.asymptomaticRate || ''}</li>
                  <li><strong>علائم پرودرومال:</strong> ${vac.prodromeRate || ''}</li>
                  <li><strong>فرم غشایی:</strong> ${vac.membranousRate || ''}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">مقایسه اثر مداخلات درمانی بر مرگ‌ومیر و انتقال</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th>مداخله درمانی</th>
                  <th>مکانیسم و هدف</th>
                  <th>اثر بر مورتالیتی</th>
                  <th>اثر بر سرایت و دفع باسیل</th>
                </tr>
              </thead>
              <tbody>
                ${interventionRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch31-sec02') {
      const ep = sec.epidemiology || {};
      const milestones = ep.iranMilestones || [];
      const demoData = sec.demographicData1388 || [];
      const mgmt = sec.clinicalManagement || {};
      const iso = sec.isolationProtocols || {};
      const contactMgmt = sec.contactAndCarrierManagement || {};
      const carriers = contactMgmt.carrierProtocols || [];
      const contacts = contactMgmt.closeContactsProtocols || [];

      const demoRows = demoData.map(d => `
        <tr ${d.ageGroup === 'مجموع کل' ? 'style="font-weight: bold; background-color: var(--surface-secondary);"' : ''}>
          <td>${d.ageGroup || ''}</td>
          <td>${d.population || ''}</td>
          <td>${d.totalCases || ''}</td>
          <td>${d.incidencePer100k || ''}</td>
          <td>${d.maleCases || ''}</td>
          <td>${d.femaleCases || ''}</td>
          <td>${d.urbanCases || ''}</td>
          <td>${d.ruralCases || ''}</td>
          <td>${d.iranianCases || ''}</td>
          <td>${d.nonIranianCases || ''}</td>
        </tr>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="stat-value" style="color: var(--state-success); font-size: 1.6rem; font-weight: 800;">۰.۰۵</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">بروز در ۱۰۰ هزار نفر (سال ۱۳۸۸)</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="stat-value" style="color: var(--color-primary); font-size: 1.6rem; font-weight: 800;">۹۹٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">پوشش نوبت سوم ثلاث (DTP3)</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="stat-value" style="color: var(--state-success); font-size: 1.6rem; font-weight: 800;">۰٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">میزان کشندگی در سال ۱۳۸۸</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-warning);">
            <div class="stat-value" style="color: var(--state-warning); font-size: 1.6rem; font-weight: 800;">۶۰٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">موارد در سن بالای ۱۵ سال</div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">سیمای اپیدمیولوژی توصیفی در جهان و ایران</h3>
          <p style="line-height: var(--line-height-relaxed);">${ep.global || ''}</p>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-block-start: var(--space-4);">
            ${milestones.map(m => `
              <div class="clinical-card">
                <div class="card-header bg-primary text-white" style="font-weight: 700;">سال ${m.year} — ${m.event}</div>
                <div class="card-body"><p style="margin:0;">${m.details}</p></div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">جدول دموگرافیک و توزیع موارد دیفتری در سال ۱۳۸۸ ایران</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th>گروه سنی</th>
                  <th>جمعیت</th>
                  <th>کل موارد: N (%)</th>
                  <th>بروز در ۱۰۰ هزار</th>
                  <th>مرد: N (%)</th>
                  <th>زن: N (%)</th>
                  <th>شهری: N (%)</th>
                  <th>روستایی: N (%)</th>
                  <th>ایرانی: N (%)</th>
                  <th>غیرایرانی: N (%)</th>
                </tr>
              </thead>
              <tbody>
                ${demoRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">اصول درمان بالینی و قوانین جداسازی (Isolation)</h3>
          <div class="medical-callout callout-danger" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">🚨</div>
            <div class="callout-content">
              <strong>قاعده حیاتی ایمنی‌شناسی:</strong> ${mgmt.postRecoveryVaccine || ''}
            </div>
          </div>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div class="clinical-card">
              <div class="card-header bg-primary text-white" style="font-weight: 700;">درمان دارویی بیمار</div>
              <div class="card-body">
                <ul class="styled-list">
                  <li><strong>آنتی‌توکسین:</strong> ${mgmt.antitoxin || ''}</li>
                  <li><strong>آنتی‌بیوتیک:</strong> ${mgmt.antibiotics || ''}</li>
                  <li><strong>کشت مثبت مداوم:</strong> ${mgmt.persistentCulture || ''}</li>
                </ul>
              </div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-warning text-dark" style="font-weight: 700;">پروتکل‌های جداسازی (Isolation)</div>
              <div class="card-body">
                <ul class="styled-list">
                  <li><strong>فرم تنفسی:</strong> ${iso.respiratory || ''}</li>
                  <li><strong>عدم دسترسی به کشت:</strong> ${iso.noCulture || ''}</li>
                  <li><strong>فرم پوستی:</strong> ${iso.cutaneous || ''}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">مدیریت ناقلان (Carriers) و تماس‌های نزدیک (Close Contacts)</h3>
          <div class="medical-callout callout-warning" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">⛔</div>
            <div class="callout-content">
              <strong>ممنوعیت قطعی:</strong> ${contactMgmt.contraindication || ''}
            </div>
          </div>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div class="clinical-card">
              <div class="card-header bg-info text-white" style="font-weight: 700;">مدیریت ناقلان بدون علامت</div>
              <div class="card-body">
                <ul class="styled-list">
                  ${carriers.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-info text-white" style="font-weight: 700;">مدیریت تماس‌های نزدیک</div>
              <div class="card-body">
                <ul class="styled-list">
                  ${contacts.map(c => `<li>${c}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch31-sec03') {
      const cd = sec.caseDefinitions || {};
      const agent = sec.agentAndTransmission || {};
      const elim = sec.eliminationTargets || {};
      const iranTrends = elim.iranTrends || [];
      const strategies = sec.therapeuticAndPreventiveStrategies || [];

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="grid-4" style="grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); margin-block-end: var(--space-6);">
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="stat-value" style="color: var(--state-danger); font-size: 1.6rem; font-weight: 800;">> ۹۵٪</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">نرخ کشندگی کزاز نوزادی</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--color-primary);">
            <div class="stat-value" style="color: var(--color-primary); font-size: 1.6rem; font-weight: 800;">۳ تا ۲۸ روز</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">بازه سنی بروز علائم بالینی</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="stat-value" style="color: var(--state-success); font-size: 1.6rem; font-weight: 800;">< ۱ در ۱۰۰۰</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">شاخص حذف در سطح شهرستان</div>
          </div>
          <div class="stat-card" style="border-inline-start: 4px solid var(--state-info);">
            <div class="stat-value" style="color: var(--state-info); font-size: 1.6rem; font-weight: 800;">تا ۵ ماهگی</div>
            <div class="stat-label" style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-block-start: 4px;">محافظت با آنتی‌بادی مادری</div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">تعاریف استاندارد مورد در کزاز نوزادی</h3>
          <div class="medical-callout callout-warning" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">🔍</div>
            <div class="callout-content">
              <strong>ویژگی منحصر‌به‌فرد تشخیصی:</strong> ${cd.diagnosticNature || ''}
            </div>
          </div>
          <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div class="clinical-card">
              <div class="card-header bg-warning text-dark" style="font-weight: 700;">مورد مشکوک (Suspected Case)</div>
              <div class="card-body"><p style="margin:0;">${cd.suspected || ''}</p></div>
            </div>
            <div class="clinical-card">
              <div class="card-header bg-danger text-white" style="font-weight: 700;">مورد قطعی (Confirmed Case)</div>
              <div class="card-body"><p style="margin:0;">${cd.confirmed || ''}</p></div>
            </div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">عامل بیماری‌زا، مقاومت و ویژگی‌های انتقال</h3>
          <div class="clinical-card" style="border-top: 4px solid var(--color-primary);">
            <div class="card-body">
              <ul class="styled-list">
                <li><strong>عامل اتیولوژیک و اسپورها:</strong> ${agent.etiology || ''}</li>
                <li><strong>مخزن باکتری:</strong> ${agent.reservoir || ''}</li>
                <li><strong>راه انتقال:</strong> ${agent.transmission || ''}</li>
                <li><strong>دوره کمون و شاخص‌ها:</strong> ${agent.clinicalMetrics || ''}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-6);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">شاخص‌های حذف جهانی و وضعیت در ایران</h3>
          <div class="medical-callout callout-info" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">🌍</div>
            <div class="callout-content">
              <strong>هدف جهانی:</strong> ${elim.globalTarget || ''}<br>
              <strong>طبیعت بیماری:</strong> ${elim.eradiationNature || ''} (${elim.underreporting || ''})
            </div>
          </div>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th>مقطع زمانی</th>
                  <th>شاخص و وضعیت کنترل کزاز نوزادی در ایران</th>
                </tr>
              </thead>
              <tbody>
                ${iranTrends.map(t => `
                  <tr>
                    <td><strong>${t.year}</strong></td>
                    <td>${t.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">راهبردهای درمانی و پیشگیری</h3>
          <div class="clinical-card" style="border-inline-start: 4px solid var(--state-success);">
            <div class="card-body">
              <ul class="styled-list">
                ${strategies.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (sec.id === 'ch31-sec04') {
      const diseases = sec.diseases || [];

      const diseaseCards = diseases.map(d => `
        <div class="clinical-card" style="margin-block-end: var(--space-4); border-top: 4px solid var(--state-danger);">
          <div class="card-header bg-light d-flex justify-between align-center" style="padding: var(--space-3) var(--space-4);">
            <div class="d-flex align-center gap-2">
              <span class="badge badge-danger" style="font-weight: 800;">${d.number}</span>
              <h4 style="margin:0; font-size: 1.1rem; font-weight: 700;">${d.name}</h4>
            </div>
            <span class="badge badge-danger">گزارش تلفنی فوری</span>
          </div>
          <div class="card-body" style="padding: var(--space-4);">
            <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-3);">
              <div style="background: var(--surface-secondary); padding: var(--space-3); border-radius: var(--radius-sm);">
                <strong style="color: var(--state-warning);">مورد مشکوک / محتمل:</strong>
                <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm);">${d.probable || d.suspected || ''}</p>
              </div>
              <div style="background: var(--surface-secondary); padding: var(--space-3); border-radius: var(--radius-sm);">
                <strong style="color: var(--state-success);">مورد قطعی:</strong>
                <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm);">${d.confirmed || ''}</p>
              </div>
            </div>
            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: var(--space-3); border-radius: var(--radius-sm);">
              <strong style="color: var(--state-danger);">اقدامات مراقبت و پیشگیری:</strong>
              <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${d.surveillanceActions || ''}</p>
            </div>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-6);">
          <div class="callout-icon">📞</div>
          <div class="callout-content">
            <strong>اصل بنیادین مراقبت تلفنی:</strong> ${sec.reportingPrinciple || ''}
          </div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-4);">بیماری‌های ۸ گانه اولویت‌دار مشمول گزارش تلفنی فوری</h3>
          ${diseaseCards}
        </div>
      `;
    }

    if (sec.id === 'ch31-sec05') {
      const diseases = sec.diseases || [];

      const diseaseCards = diseases.map(d => `
        <div class="clinical-card" style="margin-block-end: var(--space-4); border-top: 4px solid var(--color-primary);">
          <div class="card-header bg-light d-flex justify-between align-center" style="padding: var(--space-3) var(--space-4);">
            <div class="d-flex align-center gap-2">
              <span class="badge badge-primary" style="font-weight: 800;">${d.number}</span>
              <h4 style="margin:0; font-size: 1.1rem; font-weight: 700;">${d.name}</h4>
            </div>
            <span class="badge badge-info">گزارش کتبی / دوره‌ای</span>
          </div>
          <div class="card-body" style="padding: var(--space-4);">
            <div class="grid-2" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-3);">
              <div style="background: var(--surface-secondary); padding: var(--space-3); border-radius: var(--radius-sm);">
                <strong style="color: var(--text-primary);">مورد مشکوک:</strong>
                <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm);">${d.suspected || ''}</p>
              </div>
              <div style="background: var(--surface-secondary); padding: var(--space-3); border-radius: var(--radius-sm);">
                <strong style="color: var(--color-primary);">مورد محتمل / قطعی:</strong>
                <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm);">${d.confirmed || d.probable || ''}</p>
              </div>
            </div>
            <div style="background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); padding: var(--space-3); border-radius: var(--radius-sm);">
              <strong style="color: var(--color-primary);">اقدامات مراقبت و زمان‌بندی:</strong>
              <p style="margin: var(--space-1) 0 0 0; font-size: var(--font-size-sm); line-height: var(--line-height-relaxed);">${d.surveillanceActions || ''}</p>
            </div>
          </div>
        </div>
      `).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon">📋</div>
          <div class="callout-content">
            <strong>اصل گزارش‌دهی کتبی:</strong> ${sec.reportingPrinciple || ''}
          </div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-4);">بیماری‌های ۷ گانه مشمول گزارش کتبی غیرفوری</h3>
          ${diseaseCards}
        </div>
      `;
    }

    if (sec.id === 'ch31-sec06') {
      const matrix = sec.matrix || [];

      const matrixRows = matrix.map((row, i) => {
        const isImmediate = row.reportingType.includes('فوری');
        const badgeClass = isImmediate ? 'badge-danger' : 'badge-info';

        return `
          <tr>
            <td style="font-weight: 700; white-space: nowrap;">${row.disease}</td>
            <td style="white-space: nowrap;"><span class="badge ${badgeClass}">${row.reportingType}</span></td>
            <td>${row.clinicalKey}</td>
            <td><strong style="color: var(--color-primary);">${row.labCriteria}</strong></td>
            <td>${row.specificActions}</td>
          </tr>
        `;
      }).join('');

      return `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-6);">
          <div class="callout-icon">📊</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="content-block">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">جدول مقایسه‌ای الگوریتم مراقبت ۱۷ بیماری نظام کشوری</h3>
          <div class="table-responsive" style="max-height: 700px; overflow-y: auto;">
            <table class="medical-data-table" style="font-size: var(--font-size-sm);">
              <thead style="position: sticky; top: 0; background: var(--surface-primary); z-index: 2;">
                <tr>
                  <th style="min-width: 140px;">بیماری</th>
                  <th style="min-width: 130px;">نوع و زمان گزارش‌دهی</th>
                  <th style="min-width: 180px;">نشانه بالینی کلیدی</th>
                  <th style="min-width: 170px;">معیار آزمایشگاهی تأیید قطعی</th>
                  <th style="min-width: 220px;">اقدامات اختصاصی مراقبت و قرنطینه</th>
                </tr>
              </thead>
              <tbody>
                ${matrixRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    return `<p>${sec.summary || ''}</p>`;
  },


  /* =========================================================================
     CHAPTER RENDERERS (RADIOLOGY & SKELETAL TRAUMA - rad-ch01 / ch-32)
     ========================================================================= */
  renderChapter32Section(sec, chapterId = 'rad-ch01') {
    let contentHtml = '';
    const activeChId = chapterId || 'rad-ch01';
    const getGallery = (secId) => {
      if (window.RadiologyModule && typeof window.RadiologyModule.renderGallery === 'function') {
        return window.RadiologyModule.renderGallery(secId, activeChId);
      }
      return '';
    };

    if (sec.id === 's1') {
      const boneApps = (sec.boneAppearance || []).map(b => `
        <div class="clinical-card" style="margin-block-end: var(--space-3); border-inline-start: 4px solid var(--accent-primary);">
          <div class="card-body" style="padding: var(--space-3) var(--space-4);">
            <strong style="color: var(--accent-primary); font-size: 0.95rem;">${b.structure}:</strong>
            <p style="margin: var(--space-1) 0 0 0; font-size: 0.9rem; line-height: 1.7;">${b.findings}</p>
          </div>
        </div>
      `).join('');

      const divisions = (sec.longBoneDivisions || []).map(d => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-3); border-radius: var(--radius-md);">
          <strong style="color: var(--accent-primary);">${d.division}</strong>
          <p style="margin: var(--space-1) 0 0 0; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">${d.desc}</p>
        </div>
      `).join('');

      const syn = sec.synovialJoint || {};

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">💡</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">نمای رادیولوژیک و سی‌تی‌اسکن استخوان نرمال (Normal Bone Appearance)</h3>
          ${boneApps}
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">ساختار مفصل سینوویال حقیقی و تظاهر در تصویربرداری</h3>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-3);">
            <strong style="color: var(--text-primary);">اجزای شش‌گانه آناتومیک:</strong>
            <p style="margin: var(--space-1) 0 0 0; font-size: 0.9rem; line-height: 1.7;">${syn.components || ''}</p>
          </div>
          <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
            <div style="background: rgba(2, 132, 199, 0.05); border: 1px solid rgba(2, 132, 199, 0.2); padding: var(--space-4); border-radius: var(--radius-md);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: var(--accent-primary); font-size: 0.95rem;">تظاهر در رادیوگرافی ساده (Plain Radiography)</h4>
              <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${syn.plainRadiography || ''}</p>
            </div>
            <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); padding: var(--space-4); border-radius: var(--radius-md);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: #6366f1; font-size: 0.95rem;">تظاهر در ام‌آر‌آی (T1-Weighted MRI)</h4>
              <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${syn.mriT1 || ''}</p>
            </div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">تقسیم‌بندی ساختاری استخوان‌های طویل (Long Bone Divisions)</h3>
          <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3);">
            ${divisions}
          </div>
        </div>

        ${getGallery('s1')}
      `;
    } else if (sec.id === 's2') {
      const rows = (sec.checklist || []).map(item => `
        <tr>
          <td style="font-weight: 800; white-space: nowrap; color: var(--accent-primary);">${item.part}</td>
          <td>
            <ul style="margin: 0; padding-inline-start: 20px; font-size: 0.88rem; line-height: 1.7;">
              ${item.variables.map(v => `<li>${v}</li>`).join('')}
            </ul>
          </td>
          <td style="font-size: 0.88rem; line-height: 1.7;">${item.note}</td>
        </tr>
      `).join('');

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">📋</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">چک‌لیست سیستماتیک تفسیر رادیوگرافی استخوان</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th style="width: 22%; min-width: 120px;">جزء ارزیابی</th>
                  <th style="width: 40%; min-width: 180px;">متغیرهای کلیدی بررسی</th>
                  <th style="width: 38%; min-width: 180px;">اهمیت بالینی و نکات تشخیصی</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>

        ${getGallery('s2')}
      `;
    } else if (sec.id === 's3') {
      const patternRows = (sec.patterns || []).map(p => {
        let badgeClass = 'badge-info';
        if (p.name.includes('یکپارچه')) badgeClass = 'badge-primary';
        else if (p.name.includes('پوست')) badgeClass = 'badge-warning';
        else badgeClass = 'badge-danger';

        return `
          <tr>
            <td style="font-weight: 700; white-space: nowrap;">
              ${p.name}
              <div style="margin-block-start: 4px;"><span class="badge ${badgeClass}">${p.name.includes('یکپارچه') ? 'خوش‌خیم' : 'تهاجمی'}</span></div>
            </td>
            <td style="font-size: 0.88rem; line-height: 1.7;">${p.morphology}</td>
            <td style="font-size: 0.88rem; line-height: 1.7;"><strong style="color: var(--text-primary);">${p.aggressiveness}</strong></td>
          </tr>
        `;
      }).join('');

      contentHtml = `
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">⚠️</div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">پاتوفیزیولوژی و علت‌شناسی:</strong>
            <p style="margin: 0; line-height: 1.7;">${sec.pathophysiology || ''}</p>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">الگوهای چهارگانه واکنش پریوستی و میزان تهاجم ضایعه</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th style="width: 24%; min-width: 130px;">الگوی واکنش پریوستی</th>
                  <th style="width: 46%; min-width: 180px;">ویژگی مورفولوژیک</th>
                  <th style="width: 30%; min-width: 140px;">درجه تهاجم / ماهیت بالینی</th>
                </tr>
              </thead>
              <tbody>
                ${patternRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="medical-callout callout-danger" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">🚨</div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">نکته تفسیری ضایعات تهاجمی استخوان:</strong>
            <p style="margin: 0; line-height: 1.7;">${sec.interpretivePearl || ''}</p>
          </div>
        </div>

        ${getGallery('s3')}
      `;
    } else if (sec.id === 's4') {
      const coreParams = (sec.coreParameters || []).map(cp => `
        <div class="clinical-card" style="margin-block-end: var(--space-4); border-inline-start: 4px solid var(--accent-primary);">
          <div class="card-header bg-light d-flex justify-between align-center" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-secondary);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-primary" style="font-weight: 800; border-radius: var(--radius-full);">${cp.num}</span>
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700;">${cp.name}</h4>
            </div>
          </div>
          <div class="card-body" style="padding: var(--space-4);">
            <ul style="margin: 0; padding-inline-start: 20px; font-size: 0.9rem; line-height: 1.75;">
              ${cp.details.map(d => `<li style="margin-block-end: 4px;">${d}</li>`).join('')}
            </ul>
          </div>
        </div>
      `).join('');

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">🔍</div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">تظاهرات اختلال کورتکس:</strong>
            <p style="margin: 0 0 4px 0;">${sec.corticalDisruption ? sec.corticalDisruption.margins : ''}</p>
            <p style="margin: 0;">${sec.corticalDisruption ? sec.corticalDisruption.continuity : ''}</p>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-4);">پارامترهای شش‌گانه توصیف جامع شکستگی (Six Core Fracture Parameters)</h3>
          ${coreParams}
        </div>

        ${getGallery('s4')}
      `;
    } else if (sec.id === 's5') {
      const fCards = (sec.fractureTypes || []).map(f => `
        <div class="clinical-card" style="margin-block-end: var(--space-4); border-top: 4px solid var(--state-warning);">
          <div class="card-header bg-light" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-secondary);">
            <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${f.name}</h4>
          </div>
          <div class="card-body" style="padding: var(--space-4);">
            <div style="margin-block-end: var(--space-2);"><strong style="color: var(--accent-primary);">مکانیسم تروما:</strong> <span style="font-size: 0.9rem;">${f.mechanism}</span></div>
            <div style="margin-block-end: var(--space-2);"><strong style="color: var(--state-warning);">تظاهر رادیولوژیک:</strong> <span style="font-size: 0.9rem;">${f.manifestation}</span></div>
            <div><strong style="color: var(--text-secondary);">شایع‌ترین محل درگیری:</strong> <span style="font-size: 0.9rem;">${f.commonSite}</span></div>
          </div>
        </div>
      `).join('');

      contentHtml = `
        <div class="medical-callout callout-warning" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">👶</div>
          <div class="callout-content">
            <strong style="display: block; margin-block-end: 4px;">ویژگی‌های عمومی رادیوگرافی شکستگی‌های ناقص در اطفال:</strong>
            <ul style="margin: 0; padding-inline-start: 20px; line-height: 1.7;">
              ${(sec.generalFeatures || []).map(gf => `<li>${gf}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-4);">انواع شایع شکستگی‌های ناقص اطفال</h3>
          <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
            ${fCards}
          </div>
        </div>

        ${getGallery('s5')}
      `;
    } else if (sec.id === 's6') {
      const pitRows = (sec.pitfalls || []).map(p => `
        <tr>
          <td style="font-weight: 800; white-space: nowrap; color: var(--accent-primary);">${p.structure}</td>
          <td style="font-size: 0.88rem; line-height: 1.7; background: rgba(16, 185, 129, 0.03);">${p.differentialFeatures}</td>
          <td style="font-size: 0.88rem; line-height: 1.7; background: rgba(239, 68, 68, 0.03);"><strong style="color: var(--state-danger);">${p.acuteFeatures}</strong></td>
        </tr>
      `).join('');

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">🎯</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">تشخیص‌های افتراقی و خطاهای تشخیصی شکستگی (Pitfalls in Fracture Diagnosis)</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th style="width: 24%; min-width: 130px;">ساختار غیرشکستگی</th>
                  <th style="width: 38%; min-width: 180px; color: var(--state-success);">ویژگی‌های تفریقی ساختار طبیعی</th>
                  <th style="width: 38%; min-width: 180px; color: var(--state-danger);">ویژگی‌های شکستگی واقعی</th>
                </tr>
              </thead>
              <tbody>
                ${pitRows}
              </tbody>
            </table>
          </div>
        </div>

        ${getGallery('s6')}
      `;
    } else if (sec.id === 's7') {
      const cvs = sec.collesVsSmith || {};
      const colles = cvs.colles || {};
      const smith = cvs.smith || {};

      const fifthMeta = (sec.fifthMetatarsal || []).map(m => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-3);">
          <strong style="color: var(--accent-primary); font-size: 0.95rem;">${m.type}:</strong>
          <p style="margin: var(--space-1) 0 0 0; font-size: 0.9rem; line-height: 1.7;">${m.desc}</p>
        </div>
      `).join('');

      const handWrist = (sec.handAndWrist || []).map(hw => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-3);">
          <strong style="color: var(--accent-primary); font-size: 0.95rem;">${hw.name}:</strong>
          <p style="margin: var(--space-1) 0 0 0; font-size: 0.9rem; line-height: 1.7;">${hw.desc}</p>
        </div>
      `).join('');

      const march = sec.marchFracture || {};
      const hip = sec.hipAndFemur || {};
      const nonunion = sec.nonunionAndPseudarthrosis || {};

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">⚡</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <!-- March Fracture -->
        <div class="clinical-card" style="margin-block-end: var(--space-5); border-inline-start: 4px solid var(--accent-primary);">
          <div class="card-body" style="padding: var(--space-4);">
            <h4 style="margin: 0 0 var(--space-2) 0; color: var(--accent-primary);">شکستگی استرسی / رژه (Stress / March Fracture)</h4>
            <p style="margin: 0 0 var(--space-2) 0; font-size: 0.9rem; line-height: 1.7;">${march.def || ''}</p>
            <div style="background: var(--bg-surface-secondary); padding: var(--space-3); border-radius: var(--radius-sm); font-size: 0.88rem; line-height: 1.7;">
              <strong>رفتار رادیولوژیک وابسته به زمان:</strong> ${march.timeBehavior || ''}
            </div>
          </div>
        </div>

        <!-- Colles vs Smith Table -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">شکستگی‌های انتهای دیستال رادیوس (کالیس در برابر اسمیت)</h3>
          <div class="table-responsive">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th style="width: 26%; min-width: 120px;">ویژگی تفریقی</th>
                  <th style="width: 37%; min-width: 150px; color: var(--accent-primary);">${colles.name || 'شکستگی کالیس'}</th>
                  <th style="width: 37%; min-width: 150px; color: #6366f1;">${smith.name || 'شکستگی اسمیت'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700;">مکانیسم تروما</td>
                  <td>${colles.mechanism || ''}</td>
                  <td>${smith.mechanism || ''}</td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">راستای قطعه دیستال</td>
                  <td><strong style="color: var(--accent-primary);">${colles.angulation || ''}</strong></td>
                  <td><strong style="color: #6366f1;">${smith.angulation || ''}</strong></td>
                </tr>
                <tr>
                  <td style="font-weight: 700;">ضایعات همراه شایع</td>
                  <td>${colles.associated || ''}</td>
                  <td>${smith.associated || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5th Metatarsal Spectrum -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">طیف شکستگی‌های قاعده متاتارس پنجم (5th Metatarsal Base Lesions)</h3>
          ${fifthMeta}
        </div>

        <!-- Hand & Wrist Fractures -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">شکستگی‌های اختصاصی دست، مچ و شست</h3>
          ${handWrist}
        </div>

        <!-- Hip Fractures & Nonunion -->
        <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-5);">
          <div class="clinical-card" style="border-inline-start: 4px solid var(--state-warning);">
            <div class="card-body" style="padding: var(--space-4);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: var(--state-warning);">شکستگی‌های پروگزیمال فمور و هیپ</h4>
              <p style="font-size: 0.88rem; line-height: 1.7; margin-block-end: var(--space-2);"><strong>طبقه‌بندی:</strong> ${hip.classification || ''}</p>
              <p style="font-size: 0.88rem; line-height: 1.7;"><strong>شکستگی فشرده ساب‌کپیتال:</strong> ${hip.impactedSubcapital || ''}</p>
            </div>
          </div>

          <div class="clinical-card" style="border-inline-start: 4px solid var(--state-danger);">
            <div class="card-body" style="padding: var(--space-4);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: var(--state-danger);">جوش‌نخوردگی و مفصل کاذب (Nonunion & Pseudarthrosis)</h4>
              <p style="font-size: 0.88rem; line-height: 1.7; margin-block-end: var(--space-2);"><strong>تعریف:</strong> ${nonunion.def || ''}</p>
              <p style="font-size: 0.88rem; line-height: 1.7;"><strong>یافته‌های رادیوگرافی:</strong> ${nonunion.findings || ''}</p>
            </div>
          </div>
        </div>

        ${getGallery('s7')}
      `;
    } else if (sec.id === 's8') {
      const defs = (sec.alignmentDefinitions || []).map(d => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-3);">
          <strong style="color: var(--accent-primary);">${d.term}:</strong>
          <p style="margin: var(--space-1) 0 0 0; font-size: 0.9rem; line-height: 1.7;">${d.desc}</p>
        </div>
      `).join('');

      const shoulder = sec.shoulderDislocations || {};
      const elbow = sec.elbowFatPads || {};
      const wrist = sec.wristAndAHL || {};

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">🔍</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">تعاریف اختلالات همراستایی مفصلی</h3>
          ${defs}
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">دررفتگی‌های مفصل شانه (قدامی در برابر خلفی)</h3>
          <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
            <div style="background: rgba(2, 132, 199, 0.05); border: 1px solid rgba(2, 132, 199, 0.2); padding: var(--space-4); border-radius: var(--radius-md);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: var(--accent-primary);">دررفتگی قدامی (شایع‌ترین)</h4>
              <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${shoulder.anterior || ''}</p>
            </div>
            <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); padding: var(--space-4); border-radius: var(--radius-md);">
              <h4 style="margin: 0 0 var(--space-2) 0; color: var(--state-warning);">دررفتگی خلفی (علامت حباب لامپ)</h4>
              <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${shoulder.posterior || ''}</p>
            </div>
          </div>
        </div>

        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">نشانه‌های چربی مفصل آرنج و افیوژن مفصلی</h3>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-3);">
            <p style="margin: 0 0 var(--space-2) 0; font-size: 0.9rem; line-height: 1.7;"><strong>آناتومی بالشتک‌ها:</strong> ${elbow.normal || ''}</p>
            <p style="margin: 0 0 var(--space-2) 0; font-size: 0.9rem; line-height: 1.7;"><strong>تغییرات پاتولوژیک:</strong> ${elbow.pathologic || ''}</p>
          </div>
          <div class="medical-callout callout-danger">
            <div class="callout-icon">🚨</div>
            <div class="callout-content">
              <strong>تفسیر بالینی کلیدی:</strong> ${elbow.clinicalPearl || ''}
            </div>
          </div>
        </div>

        <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3); margin-block-end: var(--space-5);">
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-4); border-radius: var(--radius-md);">
            <h4 style="margin: 0 0 var(--space-2) 0; color: var(--accent-primary);">خط چربی پروناتور کوادراتوس</h4>
            <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${wrist.pronatorFat || ''}</p>
          </div>
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-4); border-radius: var(--radius-md);">
            <h4 style="margin: 0 0 var(--space-2) 0; color: var(--accent-primary);">خط هومرال قدامی اطفال (AHL)</h4>
            <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${wrist.ahl || ''}</p>
          </div>
        </div>

        ${getGallery('s8')}
      `;
    } else if (sec.id === 's9') {
      const cLines = (sec.cervicalLines || []).map(cl => `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); margin-block-end: var(--space-2);">
          <strong style="color: var(--accent-primary);">${cl.line}:</strong>
          <span style="font-size: 0.88rem; color: var(--text-secondary); margin-inline-start: 6px;">${cl.desc}</span>
        </div>
      `).join('');

      const denisRows = (sec.denisModel || []).map(dm => {
        let badge = 'badge-primary';
        if (dm.column.includes('میانی')) badge = 'badge-danger';
        else if (dm.column.includes('خلفی')) badge = 'badge-warning';

        return `
          <tr>
            <td style="font-weight: 800; white-space: nowrap;">
              ${dm.column}
              <div style="margin-block-start: 4px;"><span class="badge ${badge}">${dm.column.includes('میانی') ? 'ناپایدار قطعی' : 'آناتومیک'}</span></div>
            </td>
            <td style="font-size: 0.88rem; line-height: 1.7;">${dm.components}</td>
            <td style="font-size: 0.88rem; line-height: 1.7;"><strong style="color: ${dm.column.includes('میانی') ? 'var(--state-danger)' : 'var(--text-primary)'};">${dm.clinicalOutcome}</strong></td>
          </tr>
        `;
      }).join('');

      const denisPatterns = (sec.denisFracturePatterns || []).map(dp => `
        <div class="clinical-card" style="margin-block-end: var(--space-3); border-inline-start: 4px solid ${dp.pattern.includes('شانس') ? 'var(--state-danger)' : (dp.pattern.includes('انفجاری') ? 'var(--state-warning)' : 'var(--state-success)')};">
          <div class="card-body" style="padding: var(--space-3) var(--space-4);">
            <h4 style="margin: 0 0 var(--space-1) 0; font-size: 0.95rem; font-weight: 700;">${dp.pattern}</h4>
            <p style="margin: 0; font-size: 0.88rem; line-height: 1.7;">${dp.desc}</p>
          </div>
        </div>
      `).join('');

      const hj = sec.hangmanAndJefferson || {};

      contentHtml = `
        <div class="medical-callout callout-info" style="margin-block-end: var(--space-5);">
          <div class="callout-icon">🛡️</div>
          <div class="callout-content"><p>${sec.summary || ''}</p></div>
        </div>

        <!-- 3 Cervical Lines -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">خطوط قوسی سه‌گانه ستون فقرات گردنی (Three Cervical Lines)</h3>
          ${cLines}
        </div>

        <!-- Hangman & Jefferson -->
        <div class="grid-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4); margin-block-end: var(--space-5);">
          <div class="clinical-card" style="border-top: 4px solid var(--state-danger);">
            <div class="card-header bg-light" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-secondary);">
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--state-danger);">شکستگی هنگمن (Hangman’s Fracture)</h4>
            </div>
            <div class="card-body" style="padding: var(--space-4); font-size: 0.88rem; line-height: 1.75;">
              ${hj.hangman || ''}
            </div>
          </div>

          <div class="clinical-card" style="border-top: 4px solid var(--state-warning);">
            <div class="card-header bg-light" style="padding: var(--space-3) var(--space-4); background: var(--bg-surface-secondary);">
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--state-warning);">اتصالات C1-C2 و شکستگی جفرسون</h4>
            </div>
            <div class="card-body" style="padding: var(--space-4); font-size: 0.88rem; line-height: 1.75;">
              ${hj.jefferson || ''}
            </div>
          </div>
        </div>

        <!-- Denis 3-Column Model -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">مدل سه‌ستونی دنیس در ستون فقرات توراکولومبار (Denis Three-Column Model)</h3>
          <div class="table-responsive" style="margin-block-end: var(--space-3);">
            <table class="medical-data-table">
              <thead>
                <tr>
                  <th style="width: 22%; min-width: 130px;">ستون آناتومیک</th>
                  <th style="width: 44%; min-width: 180px;">اجزای درگیر</th>
                  <th style="width: 34%; min-width: 160px;">پیامد بالینی آسیب</th>
                </tr>
              </thead>
              <tbody>
                ${denisRows}
              </tbody>
            </table>
          </div>
          <div class="medical-callout callout-danger" style="margin-block-end: var(--space-4);">
            <div class="callout-icon">⚠️</div>
            <div class="callout-content">
              <strong>معیار ناپایداری ستون مهره‌ها:</strong> آسیب و گسیختگی همزمان در دو یا هر سه ستون، یا هرگونه آسیب درگیرکننده ستون میانی، نشان‌دهنده ناپایداری مکانیکی و خطر بالای آسیب عصبی است.
            </div>
          </div>
        </div>

        <!-- Denis Fracture Patterns -->
        <div class="content-block" style="margin-block-end: var(--space-5);">
          <h3 class="block-title" style="margin-block-end: var(--space-3);">الگوهای شکستگی توراکولومبار بر اساس مدل دنیس</h3>
          ${denisPatterns}
        </div>

        <!-- Hyperflexion Teardrop -->
        <div class="clinical-card" style="margin-block-end: var(--space-5); border-inline-start: 4px solid var(--state-danger);">
          <div class="card-body" style="padding: var(--space-4);">
            <h4 style="margin: 0 0 var(--space-2) 0; color: var(--state-danger);">آسیب‌های هایپرفلکشن گردنی و شکستگی قطره‌اشکی (Cervical Hyperflexion & Teardrop)</h4>
            <p style="margin: 0; font-size: 0.9rem; line-height: 1.75;">${sec.hyperflexionTeardrop || ''}</p>
          </div>
        </div>

        ${getGallery('s9')}
      `;
    } else {
      contentHtml = `<p>${sec.summary || ''}</p>${getGallery(sec.id)}`;
    }

    return contentHtml;
  },

};
