/**
 * ANTI-GRAVITY RADIOLOGY IMAGE SYSTEM & INTERACTIVE VIEWER
 * 
 * Rules:
 * 1. Never invent or alter captions.
 * 2. Never describe image content.
 * 3. Manifest order is strictly preserved.
 * 4. Missing files show a clear, non-alarming placeholder with the filename.
 * 5. Malformed manifests show specific, actionable diagnostics.
 * 6. Viewer supports continuous pointer zoom, physical pan (unmirrored),
 *    live CSS adjustments (contrast, brightness, invert) with auto-reset,
 *    safe-area insets, and iOS Safari fullscreen fallback.
 */

window.RadiologyModule = (function() {
  // Pre-registered manifests fallback for direct file:/// execution
  const manifestCache = {
    'rad-ch01': {
      "chapterId": "rad-ch01",
      "sections": {
            "s1": [
                  {
                        "file": "image1.jpeg"
                  },
                  {
                        "file": "image2.jpeg"
                  },
                  {
                        "file": "image3.jpeg"
                  }
            ],
            "s2": [
                  {
                        "file": "image4.jpeg"
                  },
                  {
                        "file": "image5.jpeg"
                  }
            ],
            "s3": [
                  {
                        "file": "image6.jpeg"
                  },
                  {
                        "file": "image7.jpeg"
                  },
                  {
                        "file": "image9.jpeg"
                  },
                  {
                        "file": "image10.jpeg"
                  },
                  {
                        "file": "image11.jpeg"
                  },
                  {
                        "file": "image12.jpeg"
                  },
                  {
                        "file": "image13.jpeg"
                  },
                  {
                        "file": "image14.jpeg"
                  },
                  {
                        "file": "image15.jpeg"
                  },
                  {
                        "file": "image16.jpeg"
                  },
                  {
                        "file": "image17.jpeg"
                  },
                  {
                        "file": "image18.jpeg"
                  },
                  {
                        "file": "image19.jpeg"
                  }
            ],
            "s4": [
                  {
                        "file": "image20.jpeg"
                  },
                  {
                        "file": "image22.jpeg"
                  },
                  {
                        "file": "image23.jpeg"
                  },
                  {
                        "file": "image24.jpeg"
                  },
                  {
                        "file": "image25.jpeg"
                  },
                  {
                        "file": "image28.jpeg"
                  },
                  {
                        "file": "image29.jpeg"
                  },
                  {
                        "file": "image38.jpeg"
                  },
                  {
                        "file": "image39.jpeg"
                  },
                  {
                        "file": "image40.jpeg"
                  },
                  {
                        "file": "image41.jpeg"
                  },
                  {
                        "file": "image42.jpeg"
                  },
                  {
                        "file": "image43.jpeg"
                  },
                  {
                        "file": "image44.jpeg"
                  },
                  {
                        "file": "image46.jpeg"
                  },
                  {
                        "file": "image48.jpeg"
                  },
                  {
                        "file": "image49.jpeg"
                  },
                  {
                        "file": "image50.jpeg"
                  },
                  {
                        "file": "image51.jpeg"
                  },
                  {
                        "file": "image52.jpeg"
                  },
                  {
                        "file": "image53.jpeg"
                  },
                  {
                        "file": "image54.jpeg"
                  },
                  {
                        "file": "image55.jpeg"
                  },
                  {
                        "file": "image56.jpeg"
                  },
                  {
                        "file": "image57.jpeg"
                  },
                  {
                        "file": "image58.jpeg"
                  },
                  {
                        "file": "image59.jpeg"
                  },
                  {
                        "file": "image60.jpeg"
                  },
                  {
                        "file": "image61.jpeg"
                  },
                  {
                        "file": "image62.jpeg"
                  },
                  {
                        "file": "image63.jpeg"
                  }
            ],
            "s5": [
                  {
                        "file": "image31.jpeg"
                  },
                  {
                        "file": "image32.jpeg"
                  },
                  {
                        "file": "image33.jpeg"
                  },
                  {
                        "file": "image34.jpeg"
                  },
                  {
                        "file": "image35.jpeg"
                  },
                  {
                        "file": "image37.jpeg"
                  }
            ],
            "s6": [
                  {
                        "file": "image64.jpeg"
                  },
                  {
                        "file": "image65.jpeg"
                  },
                  {
                        "file": "image66.jpeg"
                  },
                  {
                        "file": "image67.jpeg"
                  },
                  {
                        "file": "image68.jpeg"
                  },
                  {
                        "file": "image69.jpeg"
                  },
                  {
                        "file": "image70.jpeg"
                  },
                  {
                        "file": "image71.jpeg"
                  }
            ],
            "s7": [
                  {
                        "file": "image72.jpeg"
                  },
                  {
                        "file": "image73.jpeg"
                  },
                  {
                        "file": "image74.jpeg"
                  },
                  {
                        "file": "image75.jpeg"
                  },
                  {
                        "file": "image76.jpeg"
                  },
                  {
                        "file": "image77.jpeg"
                  },
                  {
                        "file": "image78.jpeg"
                  },
                  {
                        "file": "image79.jpeg"
                  },
                  {
                        "file": "image80.jpeg"
                  },
                  {
                        "file": "image81.jpeg"
                  },
                  {
                        "file": "image82.jpeg"
                  },
                  {
                        "file": "image83.jpeg"
                  }
            ],
            "s8": [
                  {
                        "file": "image84.jpeg"
                  },
                  {
                        "file": "image85.jpeg"
                  },
                  {
                        "file": "image86.jpeg"
                  },
                  {
                        "file": "image87.jpeg"
                  },
                  {
                        "file": "image88.jpeg"
                  },
                  {
                        "file": "image89.jpeg"
                  },
                  {
                        "file": "image90.jpeg"
                  },
                  {
                        "file": "image91.jpeg"
                  },
                  {
                        "file": "image92.jpeg"
                  },
                  {
                        "file": "image93.jpeg"
                  },
                  {
                        "file": "image94.jpeg"
                  },
                  {
                        "file": "image95.jpeg"
                  },
                  {
                        "file": "image96.jpeg"
                  },
                  {
                        "file": "image97.jpeg"
                  },
                  {
                        "file": "image98.jpeg"
                  },
                  {
                        "file": "image99.jpeg"
                  },
                  {
                        "file": "image100.jpeg"
                  },
                  {
                        "file": "image101.jpeg"
                  }
            ],
            "s9": [
                  {
                        "file": "image102.jpeg"
                  },
                  {
                        "file": "image103.jpeg"
                  },
                  {
                        "file": "image104.jpeg"
                  },
                  {
                        "file": "image105.jpeg"
                  },
                  {
                        "file": "image106.jpeg"
                  },
                  {
                        "file": "image107.jpeg"
                  },
                  {
                        "file": "image108.jpeg"
                  },
                  {
                        "file": "image109.jpeg"
                  },
                  {
                        "file": "image110.jpeg"
                  },
                  {
                        "file": "image111.jpeg"
                  },
                  {
                        "file": "image112.jpeg"
                  },
                  {
                        "file": "image113.jpeg"
                  },
                  {
                        "file": "image114.jpeg"
                  },
                  {
                        "file": "image115.jpeg"
                  },
                  {
                        "file": "image116.jpeg"
                  },
                  {
                        "file": "image117.jpeg"
                  },
                  {
                        "file": "image118.jpeg"
                  },
                  {
                        "file": "image119.jpeg"
                  },
                  {
                        "file": "image120.jpeg"
                  },
                  {
                        "file": "image121.jpeg"
                  },
                  {
                        "file": "image122.jpeg"
                  },
                  {
                        "file": "image123.jpeg"
                  },
                  {
                        "file": "image124.jpeg"
                  },
                  {
                        "file": "image125.jpeg"
                  },
                  {
                        "file": "image126.jpeg"
                  },
                  {
                        "file": "image127.jpeg"
                  },
                  {
                        "file": "image128.jpeg"
                  },
                  {
                        "file": "image129.jpeg"
                  },
                  {
                        "file": "image130.jpeg"
                  },
                  {
                        "file": "image131.jpeg"
                  }
            ]
      }
},
    'ch-32': {
      "chapterId": "rad-ch01",
      "sections": {
            "s1": [
                  {
                        "file": "image1.jpeg"
                  },
                  {
                        "file": "image2.jpeg"
                  },
                  {
                        "file": "image3.jpeg"
                  }
            ],
            "s2": [
                  {
                        "file": "image4.jpeg"
                  },
                  {
                        "file": "image5.jpeg"
                  }
            ],
            "s3": [
                  {
                        "file": "image6.jpeg"
                  },
                  {
                        "file": "image7.jpeg"
                  },
                  {
                        "file": "image9.jpeg"
                  },
                  {
                        "file": "image10.jpeg"
                  },
                  {
                        "file": "image11.jpeg"
                  },
                  {
                        "file": "image12.jpeg"
                  },
                  {
                        "file": "image13.jpeg"
                  },
                  {
                        "file": "image14.jpeg"
                  },
                  {
                        "file": "image15.jpeg"
                  },
                  {
                        "file": "image16.jpeg"
                  },
                  {
                        "file": "image17.jpeg"
                  },
                  {
                        "file": "image18.jpeg"
                  },
                  {
                        "file": "image19.jpeg"
                  }
            ],
            "s4": [
                  {
                        "file": "image20.jpeg"
                  },
                  {
                        "file": "image22.jpeg"
                  },
                  {
                        "file": "image23.jpeg"
                  },
                  {
                        "file": "image24.jpeg"
                  },
                  {
                        "file": "image25.jpeg"
                  },
                  {
                        "file": "image28.jpeg"
                  },
                  {
                        "file": "image29.jpeg"
                  },
                  {
                        "file": "image38.jpeg"
                  },
                  {
                        "file": "image39.jpeg"
                  },
                  {
                        "file": "image40.jpeg"
                  },
                  {
                        "file": "image41.jpeg"
                  },
                  {
                        "file": "image42.jpeg"
                  },
                  {
                        "file": "image43.jpeg"
                  },
                  {
                        "file": "image44.jpeg"
                  },
                  {
                        "file": "image46.jpeg"
                  },
                  {
                        "file": "image48.jpeg"
                  },
                  {
                        "file": "image49.jpeg"
                  },
                  {
                        "file": "image50.jpeg"
                  },
                  {
                        "file": "image51.jpeg"
                  },
                  {
                        "file": "image52.jpeg"
                  },
                  {
                        "file": "image53.jpeg"
                  },
                  {
                        "file": "image54.jpeg"
                  },
                  {
                        "file": "image55.jpeg"
                  },
                  {
                        "file": "image56.jpeg"
                  },
                  {
                        "file": "image57.jpeg"
                  },
                  {
                        "file": "image58.jpeg"
                  },
                  {
                        "file": "image59.jpeg"
                  },
                  {
                        "file": "image60.jpeg"
                  },
                  {
                        "file": "image61.jpeg"
                  },
                  {
                        "file": "image62.jpeg"
                  },
                  {
                        "file": "image63.jpeg"
                  }
            ],
            "s5": [
                  {
                        "file": "image31.jpeg"
                  },
                  {
                        "file": "image32.jpeg"
                  },
                  {
                        "file": "image33.jpeg"
                  },
                  {
                        "file": "image34.jpeg"
                  },
                  {
                        "file": "image35.jpeg"
                  },
                  {
                        "file": "image37.jpeg"
                  }
            ],
            "s6": [
                  {
                        "file": "image64.jpeg"
                  },
                  {
                        "file": "image65.jpeg"
                  },
                  {
                        "file": "image66.jpeg"
                  },
                  {
                        "file": "image67.jpeg"
                  },
                  {
                        "file": "image68.jpeg"
                  },
                  {
                        "file": "image69.jpeg"
                  },
                  {
                        "file": "image70.jpeg"
                  },
                  {
                        "file": "image71.jpeg"
                  }
            ],
            "s7": [
                  {
                        "file": "image72.jpeg"
                  },
                  {
                        "file": "image73.jpeg"
                  },
                  {
                        "file": "image74.jpeg"
                  },
                  {
                        "file": "image75.jpeg"
                  },
                  {
                        "file": "image76.jpeg"
                  },
                  {
                        "file": "image77.jpeg"
                  },
                  {
                        "file": "image78.jpeg"
                  },
                  {
                        "file": "image79.jpeg"
                  },
                  {
                        "file": "image80.jpeg"
                  },
                  {
                        "file": "image81.jpeg"
                  },
                  {
                        "file": "image82.jpeg"
                  },
                  {
                        "file": "image83.jpeg"
                  }
            ],
            "s8": [
                  {
                        "file": "image84.jpeg"
                  },
                  {
                        "file": "image85.jpeg"
                  },
                  {
                        "file": "image86.jpeg"
                  },
                  {
                        "file": "image87.jpeg"
                  },
                  {
                        "file": "image88.jpeg"
                  },
                  {
                        "file": "image89.jpeg"
                  },
                  {
                        "file": "image90.jpeg"
                  },
                  {
                        "file": "image91.jpeg"
                  },
                  {
                        "file": "image92.jpeg"
                  },
                  {
                        "file": "image93.jpeg"
                  },
                  {
                        "file": "image94.jpeg"
                  },
                  {
                        "file": "image95.jpeg"
                  },
                  {
                        "file": "image96.jpeg"
                  },
                  {
                        "file": "image97.jpeg"
                  },
                  {
                        "file": "image98.jpeg"
                  },
                  {
                        "file": "image99.jpeg"
                  },
                  {
                        "file": "image100.jpeg"
                  },
                  {
                        "file": "image101.jpeg"
                  }
            ],
            "s9": [
                  {
                        "file": "image102.jpeg"
                  },
                  {
                        "file": "image103.jpeg"
                  },
                  {
                        "file": "image104.jpeg"
                  },
                  {
                        "file": "image105.jpeg"
                  },
                  {
                        "file": "image106.jpeg"
                  },
                  {
                        "file": "image107.jpeg"
                  },
                  {
                        "file": "image108.jpeg"
                  },
                  {
                        "file": "image109.jpeg"
                  },
                  {
                        "file": "image110.jpeg"
                  },
                  {
                        "file": "image111.jpeg"
                  },
                  {
                        "file": "image112.jpeg"
                  },
                  {
                        "file": "image113.jpeg"
                  },
                  {
                        "file": "image114.jpeg"
                  },
                  {
                        "file": "image115.jpeg"
                  },
                  {
                        "file": "image116.jpeg"
                  },
                  {
                        "file": "image117.jpeg"
                  },
                  {
                        "file": "image118.jpeg"
                  },
                  {
                        "file": "image119.jpeg"
                  },
                  {
                        "file": "image120.jpeg"
                  },
                  {
                        "file": "image121.jpeg"
                  },
                  {
                        "file": "image122.jpeg"
                  },
                  {
                        "file": "image123.jpeg"
                  },
                  {
                        "file": "image124.jpeg"
                  },
                  {
                        "file": "image125.jpeg"
                  },
                  {
                        "file": "image126.jpeg"
                  },
                  {
                        "file": "image127.jpeg"
                  },
                  {
                        "file": "image128.jpeg"
                  },
                  {
                        "file": "image129.jpeg"
                  },
                  {
                        "file": "image130.jpeg"
                  },
                  {
                        "file": "image131.jpeg"
                  }
            ]
      }
}
  };

  let manifestDiagnostics = {};

  // Viewer state
  let viewerEl = null;
  let currentChapterId = null;
  let currentSectionId = null;
  let currentImageIndex = 0;
  let currentImages = [];
  let originatingTrigger = null;
  let savedScrollY = 0;

  // Zoom & Pan state
  let scale = 1.0;
  let minScale = 1.0;
  let maxScale = 6.0;
  let translateX = 0;
  let translateY = 0;
  let naturalWidth = 0;
  let naturalHeight = 0;
  let fittedWidth = 0;
  let fittedHeight = 0;

  // Dragging state (PHYSICAL, NOT MIRRORED)
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startTranslateX = 0;
  let startTranslateY = 0;

  // Pinch zoom state
  let initialPinchDistance = 0;
  let initialPinchScale = 1.0;
  let pinchMidpoint = { x: 0, y: 0 };

  // Adjustments state (Live CSS Filters)
  let contrast = 1.0;   // 0.5 to 2.5
  let brightness = 1.0; // 0.5 to 2.0
  let invert = false;

  // Caption visibility state
  let captionVisible = true;

  /**
   * Loads or fetches manifest for a chapter
   */
  async function loadManifest(chapterId) {
    if (manifestCache[chapterId] && Object.keys(manifestCache[chapterId].sections).length > 0) {
      // Try to fetch fresh from disk if possible (http/https), fallback to cache
      try {
        const res = await fetch(`chapters/${chapterId}/images.json?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          validateAndSetManifest(chapterId, json);
        }
      } catch (e) {
        // file:/// protocol or offline; keep cache
      }
      return manifestCache[chapterId];
    }

    try {
      const res = await fetch(`chapters/${chapterId}/images.json?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      validateAndSetManifest(chapterId, json);
    } catch (err) {
      manifestDiagnostics[chapterId] = {
        file: `chapters/${chapterId}/images.json`,
        error: err.message,
        expected: 'Valid JSON format matching { chapterId: string, sections: { [sectionId]: Array<{file: string, caption?: string}> } }'
      };
    }

    return manifestCache[chapterId] || null;
  }

  function validateAndSetManifest(chapterId, json) {
    if (!json || typeof json !== 'object') {
      throw new Error('Manifest root must be an object');
    }
    if (!json.chapterId) {
      throw new Error('Missing "chapterId" property in manifest');
    }
    if (!json.sections || typeof json.sections !== 'object') {
      throw new Error('Missing or invalid "sections" map in manifest');
    }

    // Merge non-destructively
    if (!manifestCache[chapterId]) {
      manifestCache[chapterId] = json;
    } else {
      const existing = manifestCache[chapterId].sections || {};
      for (const [secId, imgList] of Object.entries(json.sections)) {
        existing[secId] = imgList;
      }
      manifestCache[chapterId].sections = existing;
    }
    delete manifestDiagnostics[chapterId];
  }

  /**
   * Returns list of images for a section
   */
  function getSectionImages(chapterId, sectionId) {
    const manifest = manifestCache[chapterId];
    if (!manifest || !manifest.sections) return [];
    return manifest.sections[sectionId] || [];
  }

  /**
   * Renders the inline preview gallery for a section
   */
  function renderGallery(sectionId, chapterId) {
    const diagnostic = manifestDiagnostics[chapterId];
    if (diagnostic) {
      return `
        <div class="radiology-diagnostic-banner" role="alert">
          <div class="radiology-diagnostic-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>خطا در بارگذاری مانیفست تصاویر رادیولوژی</span>
          </div>
          <div class="radiology-diagnostic-body">
            <strong>فایل:</strong> <code>${diagnostic.file}</code><br>
            <strong>پیام خطا:</strong> ${diagnostic.error}<br>
            <strong>ساختار مورد انتظار:</strong>
            <pre class="radiology-diagnostic-code">${diagnostic.expected}</pre>
          </div>
        </div>
      `;
    }

    const images = getSectionImages(chapterId, sectionId);
    if (!images || images.length === 0) {
      // Empty array renders NO gallery at all
      return '';
    }

    const count = images.length;
    const isDense = count > 6;
    const previewCutoff = 5;

    const cardsHtml = images.map((img, idx) => {
      const imgPath = `chapters/${chapterId}/images/${img.file}`;
      const hasCaption = Boolean(img.caption && img.caption.trim());
      const altText = hasCaption ? escapeAttr(img.caption) : '';
      const ariaLabel = hasCaption 
        ? escapeAttr(img.caption)
        : `کلیشه رادیولوژی شماره ${idx + 1} از ${count} در این مبحث`;

      const isOverflow = isDense && (idx >= previewCutoff);
      const cardClass = isOverflow ? 'radiology-card radiology-card-overflow' : 'radiology-card';

      return `
        <div class="${cardClass}" data-index="${idx}">
          <button type="button" 
                  class="radiology-thumb-btn" 
                  data-chapter="${chapterId}" 
                  data-section="${sectionId}" 
                  data-index="${idx}"
                  aria-label="${ariaLabel}">
            <img src="${imgPath}" 
                 alt="${altText}" 
                 class="radiology-thumb-img" 
                 loading="lazy" 
                 decoding="async"
                 onerror="window.RadiologyModule.handleImageError(this, '${escapeAttr(img.file)}')">
            <div class="radiology-thumb-overlay" aria-hidden="true">
              <span class="radiology-inspect-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                ${idx + 1}
              </span>
            </div>
          </button>
          ${hasCaption ? `<div class="radiology-card-caption">${escapeHtml(img.caption)}</div>` : ''}
        </div>
      `;
    }).join('');

    const moreCardHtml = isDense ? `
      <div class="radiology-card radiology-card-more">
        <button type="button" 
                class="radiology-more-btn" 
                data-chapter="${chapterId}" 
                data-section="${sectionId}" 
                data-index="${previewCutoff}"
                aria-label="مشاهده تمام ${count} کلیشه در نمایشگر تخصصی">
          <div class="radiology-more-content">
            <span class="radiology-more-count">+${count - previewCutoff}</span>
            <span class="radiology-more-label">کلیشه دیگر</span>
            <span class="radiology-more-sub">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              نمایشگر
            </span>
          </div>
        </button>
      </div>
    ` : '';

    const expandFooterHtml = isDense ? `
      <div class="radiology-gallery-footer">
        <button type="button" 
                class="radiology-expand-btn" 
                data-section="${sectionId}" 
                aria-expanded="false" 
                aria-controls="grid-${sectionId}">
          <span class="expand-label-closed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            نمایش تمام ${count} کلیشه به صورت شبکه‌ای
          </span>
          <span class="expand-label-opened">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            بستن گرید کلیشه‌ها (حالت خلاصه)
          </span>
        </button>
      </div>
    ` : '';

    return `
      <div class="radiology-gallery-wrapper" id="gallery-${sectionId}">
        <div class="radiology-gallery-header">
          <div class="radiology-gallery-title-group">
            <div class="radiology-gallery-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <span class="radiology-gallery-label">کلیشه‌های رادیولوژی این مبحث</span>
            <span class="radiology-gallery-count-badge">${count} کلیشه</span>
          </div>
          <div class="radiology-gallery-header-actions">
            <button type="button" 
                    class="radiology-launch-viewer-btn" 
                    data-chapter="${chapterId}" 
                    data-section="${sectionId}" 
                    data-index="0"
                    title="مشاهده تمام ${count} کلیشه در نمایشگر تخصصی (ورق زدن با کلیدهای جهت‌نما)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              <span>ورود به نمایشگر (${count})</span>
            </button>
          </div>
        </div>
        <div class="radiology-grid" id="grid-${sectionId}">
          ${cardsHtml}
          ${moreCardHtml}
        </div>
        ${expandFooterHtml}
      </div>
    `;
  }

  /**
   * Handles missing image files gracefully without breaking the gallery
   */
  function handleImageError(imgEl, filename) {
    const parentBtn = imgEl.closest('.radiology-thumb-btn');
    if (!parentBtn) return;

    parentBtn.innerHTML = `
      <div class="radiology-missing-placeholder">
        <svg class="radiology-missing-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="radiology-missing-title">تصویر یافت نشد</span>
        <span class="radiology-missing-filename">${escapeHtml(filename)}</span>
      </div>
    `;
  }

  /* ==========================================================================
     FULL VIEWER IMPLEMENTATION
     ========================================================================== */

  function ensureViewerElement() {
    if (viewerEl) return viewerEl;

    const overlay = document.createElement('div');
    overlay.className = 'radiology-viewer-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'نمایشگر تخصصی تصویربرداری پزشکی');
    overlay.style.display = 'none';

    overlay.innerHTML = `
      <!-- Top Bar -->
      <div class="viewer-top-bar">
        <div class="viewer-info-group">
          <div class="viewer-section-title" id="viewerSectionTitle">عنوان مبحث</div>
          <div class="viewer-counter-badge" id="viewerCounterBadge">۱ / ۱</div>
        </div>
        <div class="viewer-actions-group">
          <button type="button" class="viewer-btn" id="viewerToggleCaptionBtn" title="نمایش/پنهان‌سازی زیرنویس">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>زیرنویس</span>
          </button>
          <button type="button" class="viewer-btn" id="viewerFullscreenBtn" title="حالت تمام‌صفحه (f)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
          <button type="button" class="viewer-btn viewer-btn-close" id="viewerCloseBtn" title="بستن نمایشگر (Esc)" aria-label="بستن">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Viewport -->
      <div class="viewer-viewport" id="viewerViewport">
        <div class="viewer-image-surface" id="viewerImageSurface">
          <img class="viewer-main-img" id="viewerMainImg" src="" alt="">
        </div>

        <!-- Logical RTL Navigation Buttons -->
        <button type="button" class="viewer-nav-btn viewer-nav-btn-next" id="viewerNextBtn" title="تصویر بعدی (جهت‌نمای چپ)" aria-label="تصویر بعدی">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button type="button" class="viewer-nav-btn viewer-nav-btn-prev" id="viewerPrevBtn" title="تصویر قبلی (جهت‌نمای راست)" aria-label="تصویر قبلی">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- Floating Caption Box -->
        <div class="viewer-caption-box" id="viewerCaptionBox">
          <div class="viewer-caption-text" id="viewerCaptionText"></div>
          <button type="button" class="viewer-caption-close" id="viewerCaptionDismissBtn" title="پنهان کردن" aria-label="پنهان کردن زیرنویس">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom Adjustment Controls Bar -->
      <div class="viewer-bottom-bar">
        <div class="viewer-controls-row">
          <!-- Zoom Controls -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="viewer-btn" id="viewerZoomOutBtn" title="کوچک‌نمایی (−)" aria-label="کوچک‌نمایی">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <span class="viewer-counter-badge" id="viewerZoomLevel" style="min-width: 48px; text-align: center;">100%</span>
            <button type="button" class="viewer-btn" id="viewerZoomInBtn" title="بزرگ‌نمایی (+)" aria-label="بزرگ‌نمایی">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button type="button" class="viewer-btn" id="viewerResetBtn" title="بازنشانی زوم و فیلترها (0)">
              بازنشانی
            </button>
          </div>

          <!-- Live CSS Filter Controls -->
          <div class="viewer-slider-group">
            <div class="viewer-slider-item">
              <span>کنتراست:</span>
              <input type="range" class="viewer-slider" id="viewerContrastSlider" min="0.5" max="2.5" step="0.05" value="1.0">
            </div>
            <div class="viewer-slider-item">
              <span>روشنایی:</span>
              <input type="range" class="viewer-slider" id="viewerBrightnessSlider" min="0.5" max="2.0" step="0.05" value="1.0">
            </div>
            <button type="button" class="viewer-btn viewer-toggle-btn" id="viewerInvertBtn" title="معکوس‌سازی رنگ نگاتیو/پوزیتیو">
              نگاتیو / اینورت
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    viewerEl = overlay;
    bindViewerEvents(overlay);
    return overlay;
  }

  function bindViewerEvents(overlay) {
    const closeBtn = overlay.querySelector('#viewerCloseBtn');
    const prevBtn = overlay.querySelector('#viewerPrevBtn');
    const nextBtn = overlay.querySelector('#viewerNextBtn');
    const zoomInBtn = overlay.querySelector('#viewerZoomInBtn');
    const zoomOutBtn = overlay.querySelector('#viewerZoomOutBtn');
    const resetBtn = overlay.querySelector('#viewerResetBtn');
    const contrastSlider = overlay.querySelector('#viewerContrastSlider');
    const brightnessSlider = overlay.querySelector('#viewerBrightnessSlider');
    const invertBtn = overlay.querySelector('#viewerInvertBtn');
    const fullscreenBtn = overlay.querySelector('#viewerFullscreenBtn');
    const toggleCaptionBtn = overlay.querySelector('#viewerToggleCaptionBtn');
    const captionDismissBtn = overlay.querySelector('#viewerCaptionDismissBtn');
    const viewport = overlay.querySelector('#viewerViewport');

    closeBtn.addEventListener('click', closeViewer);
    prevBtn.addEventListener('click', () => navigateImage(-1));
    nextBtn.addEventListener('click', () => navigateImage(1));

    zoomInBtn.addEventListener('click', () => stepZoom(1.25));
    zoomOutBtn.addEventListener('click', () => stepZoom(1 / 1.25));
    resetBtn.addEventListener('click', resetViewAndAdjustments);

    contrastSlider.addEventListener('input', (e) => {
      contrast = parseFloat(e.target.value);
      applyFilter();
    });

    brightnessSlider.addEventListener('input', (e) => {
      brightness = parseFloat(e.target.value);
      applyFilter();
    });

    invertBtn.addEventListener('click', () => {
      invert = !invert;
      invertBtn.classList.toggle('is-active', invert);
      applyFilter();
    });

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    toggleCaptionBtn.addEventListener('click', () => {
      captionVisible = !captionVisible;
      updateCaptionVisibility();
    });

    captionDismissBtn.addEventListener('click', () => {
      captionVisible = false;
      updateCaptionVisibility();
    });

    // Viewport Desktop Wheel Zoom (toward pointer coordinates)
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      const zoomFactor = e.deltaY < 0 ? 1.15 : (1 / 1.15);
      zoomToward(zoomFactor, pointerX, pointerY);
    }, { passive: false });

    // Double-click / Double-tap zoom toggle
    viewport.addEventListener('dblclick', (e) => {
      e.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;

      if (scale > 1.2) {
        // Reset to fit
        scale = 1.0;
        centerImageInViewport();
      } else {
        // Zoom to 2.5x centered on pointer
        zoomToward(2.5 / scale, pointerX, pointerY);
      }
      applyTransform();
    });

    // Pointer-based Physical Drag (Mouse & Touch)
    viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, .viewer-caption-box')) return;
      if (scale <= 1.0) return; // Only pan when zoomed

      isDragging = true;
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);

      startPointerX = e.clientX;
      startPointerY = e.clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;

      // PHYSICAL PANNING: Dragging left moves image left (NO RTL MIRRORING)
      const dx = e.clientX - startPointerX;
      const dy = e.clientY - startPointerY;

      translateX = startTranslateX + dx;
      translateY = startTranslateY + dy;

      constrainPan();
      applyTransform();
    });

    const endDrag = (e) => {
      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // Two-finger pinch zoom on touch screens
    viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        isDragging = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialPinchScale = scale;

        const rect = viewport.getBoundingClientRect();
        pinchMidpoint = {
          x: ((t1.clientX + t2.clientX) / 2) - rect.left,
          y: ((t1.clientY + t2.clientY) / 2) - rect.top
        };
      }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (initialPinchDistance > 0) {
          const pinchRatio = currentDistance / initialPinchDistance;
          const targetScale = clamp(initialPinchScale * pinchRatio, minScale, maxScale);
          const zoomFactor = targetScale / scale;
          zoomToward(zoomFactor, pinchMidpoint.x, pinchMidpoint.y);
        }
      }
    }, { passive: false });

    // Keyboard Shortcuts & Focus Trap
    document.addEventListener('keydown', handleKeyDown);

    // Re-center on window resize
    window.addEventListener('resize', () => {
      if (viewerEl && viewerEl.style.display !== 'none') {
        fitImageToViewport();
        applyTransform();
      }
    });
  }

  function handleKeyDown(e) {
    if (!viewerEl || viewerEl.style.display === 'none') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeViewer();
    } else if (e.key === 'ArrowRight') {
      // In RTL, ArrowRight moves backward in reading sequence (Prev)
      e.preventDefault();
      navigateImage(-1);
    } else if (e.key === 'ArrowLeft') {
      // In RTL, ArrowLeft moves forward in reading sequence (Next)
      e.preventDefault();
      navigateImage(1);
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      stepZoom(1.25);
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      stepZoom(1 / 1.25);
    } else if (e.key === '0') {
      e.preventDefault();
      resetViewAndAdjustments();
    } else if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      toggleFullscreen();
    } else if (e.key === 'Tab') {
      // Focus trap within viewer
      trapFocus(e);
    }
  }

  function trapFocus(e) {
    const focusable = viewerEl.querySelectorAll('button:not(:disabled), [tabindex]:not([tabindex="-1"]), input');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openViewer(chapterId, sectionId, imageIndex, triggerBtn = null) {
    currentChapterId = chapterId;
    currentSectionId = sectionId;
    currentImageIndex = imageIndex;
    currentImages = getSectionImages(chapterId, sectionId);
    originatingTrigger = triggerBtn;

    if (!currentImages || currentImages.length === 0) return;

    // Save exact scroll position
    savedScrollY = window.scrollY;
    document.body.classList.add('viewer-open');

    const overlay = ensureViewerElement();
    overlay.style.display = 'flex';

    // Reset view & adjustments for new inspection
    captionVisible = true;
    resetAdjustments();

    // Section title
    const sectionEl = document.getElementById(sectionId);
    const titleEl = overlay.querySelector('#viewerSectionTitle');
    if (sectionEl) {
      const h2 = sectionEl.querySelector('h2');
      titleEl.innerText = h2 ? h2.innerText : 'بررسی کلیشه رادیولوژی';
    } else {
      titleEl.innerText = 'بررسی کلیشه رادیولوژی';
    }

    loadImage(currentImageIndex);

    // Set initial focus
    const closeBtn = overlay.querySelector('#viewerCloseBtn');
    setTimeout(() => closeBtn && closeBtn.focus(), 50);
  }

  function closeViewer() {
    if (!viewerEl) return;

    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch {}
    }

    viewerEl.style.display = 'none';
    document.body.classList.remove('viewer-open');

    // Restore exact scroll position
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });

    // Return focus to originating thumbnail button
    if (originatingTrigger && typeof originatingTrigger.focus === 'function') {
      originatingTrigger.focus();
    }
  }

  function loadImage(idx) {
    if (idx < 0 || idx >= currentImages.length) return;
    currentImageIndex = idx;

    // Adjustments MUST reset between images to avoid silent carry-over bug
    resetAdjustments();

    const imgData = currentImages[idx];
    const mainImg = viewerEl.querySelector('#viewerMainImg');
    const counterBadge = viewerEl.querySelector('#viewerCounterBadge');
    const prevBtn = viewerEl.querySelector('#viewerPrevBtn');
    const nextBtn = viewerEl.querySelector('#viewerNextBtn');
    const captionBox = viewerEl.querySelector('#viewerCaptionBox');
    const captionText = viewerEl.querySelector('#viewerCaptionText');
    const toggleCaptionBtn = viewerEl.querySelector('#viewerToggleCaptionBtn');

    // Update Counter (RTL-aware)
    counterBadge.innerText = `${idx + 1} / ${currentImages.length}`;

    // Navigation buttons within section
    prevBtn.disabled = (idx === 0);
    nextBtn.disabled = (idx === currentImages.length - 1);

    // Caption handling
    const hasCaption = Boolean(imgData.caption && imgData.caption.trim());
    if (hasCaption) {
      captionText.innerText = imgData.caption;
      captionBox.style.display = 'flex';
      toggleCaptionBtn.style.display = 'inline-flex';
      updateCaptionVisibility();
    } else {
      // Prompt rule: When no caption exists, show nothing in its place
      captionBox.style.display = 'none';
      toggleCaptionBtn.style.display = 'none';
    }

    const imgPath = `chapters/${currentChapterId}/images/${imgData.file}`;
    mainImg.src = imgPath;
    mainImg.alt = hasCaption ? imgData.caption : '';

    mainImg.onload = () => {
      naturalWidth = mainImg.naturalWidth || 800;
      naturalHeight = mainImg.naturalHeight || 600;
      fitImageToViewport();
      applyTransform();
    };

    // Preload only adjacent images
    if (idx > 0) {
      const prevSrc = `chapters/${currentChapterId}/images/${currentImages[idx - 1].file}`;
      const img1 = new Image(); img1.src = prevSrc;
    }
    if (idx < currentImages.length - 1) {
      const nextSrc = `chapters/${currentChapterId}/images/${currentImages[idx + 1].file}`;
      const img2 = new Image(); img2.src = nextSrc;
    }
  }

  function navigateImage(direction) {
    const newIdx = currentImageIndex + direction;
    if (newIdx >= 0 && newIdx < currentImages.length) {
      loadImage(newIdx);
    }
  }

  function fitImageToViewport() {
    const viewport = viewerEl.querySelector('#viewerViewport');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    if (!naturalWidth || !naturalHeight || !vw || !vh) return;

    // Calculate aspect fit dimensions
    const ratio = Math.min(vw / naturalWidth, vh / naturalHeight, 1.0);
    fittedWidth = naturalWidth * ratio;
    fittedHeight = naturalHeight * ratio;

    const surface = viewerEl.querySelector('#viewerImageSurface');
    const mainImg = viewerEl.querySelector('#viewerMainImg');
    surface.style.width = `${fittedWidth}px`;
    surface.style.height = `${fittedHeight}px`;
    mainImg.style.width = `${fittedWidth}px`;
    mainImg.style.height = `${fittedHeight}px`;

    scale = 1.0;
    centerImageInViewport();
  }

  function centerImageInViewport() {
    const viewport = viewerEl.querySelector('#viewerViewport');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    translateX = (vw - fittedWidth * scale) / 2;
    translateY = (vh - fittedHeight * scale) / 2;
  }

  /**
   * Continuous zoom toward pointer coordinates (mx, my)
   */
  function zoomToward(factor, pointerX, pointerY) {
    const oldScale = scale;
    const targetScale = clamp(oldScale * factor, minScale, maxScale);
    if (targetScale === oldScale) return;

    // Zoom towards pointer position
    translateX = pointerX - (pointerX - translateX) * (targetScale / oldScale);
    translateY = pointerY - (pointerY - translateY) * (targetScale / oldScale);
    scale = targetScale;

    constrainPan();
    applyTransform();
  }

  function stepZoom(factor) {
    const viewport = viewerEl.querySelector('#viewerViewport');
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    zoomToward(factor, cx, cy);
  }

  function constrainPan() {
    const viewport = viewerEl.querySelector('#viewerViewport');
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const curW = fittedWidth * scale;
    const curH = fittedHeight * scale;

    // Constrain so at least 15% of the image remains visible
    const minVisibleX = Math.min(vw * 0.2, curW * 0.2);
    const minVisibleY = Math.min(vh * 0.2, curH * 0.2);

    const minX = -curW + minVisibleX;
    const maxX = vw - minVisibleX;
    const minY = -curH + minVisibleY;
    const maxY = vh - minVisibleY;

    if (curW < vw) {
      translateX = (vw - curW) / 2;
    } else {
      translateX = clamp(translateX, minX, maxX);
    }

    if (curH < vh) {
      translateY = (vh - curH) / 2;
    } else {
      translateY = clamp(translateY, minY, maxY);
    }
  }

  function applyTransform() {
    const surface = viewerEl.querySelector('#viewerImageSurface');
    const zoomLevel = viewerEl.querySelector('#viewerZoomLevel');
    if (surface) {
      surface.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    if (zoomLevel) {
      zoomLevel.innerText = `${Math.round(scale * 100)}%`;
    }
  }

  function applyFilter() {
    const surface = viewerEl.querySelector('#viewerImageSurface');
    if (!surface) return;
    const filterStr = `contrast(${contrast}) brightness(${brightness}) ${invert ? 'invert(1)' : ''}`;
    surface.style.filter = filterStr;
  }

  function resetAdjustments() {
    contrast = 1.0;
    brightness = 1.0;
    invert = false;

    if (viewerEl) {
      const contrastSlider = viewerEl.querySelector('#viewerContrastSlider');
      const brightnessSlider = viewerEl.querySelector('#viewerBrightnessSlider');
      const invertBtn = viewerEl.querySelector('#viewerInvertBtn');
      if (contrastSlider) contrastSlider.value = '1.0';
      if (brightnessSlider) brightnessSlider.value = '1.0';
      if (invertBtn) invertBtn.classList.remove('is-active');
    }

    applyFilter();
  }

  function resetViewAndAdjustments() {
    scale = 1.0;
    centerImageInViewport();
    applyTransform();
    resetAdjustments();
  }

  function updateCaptionVisibility() {
    const captionBox = viewerEl.querySelector('#viewerCaptionBox');
    if (!captionBox) return;
    if (captionVisible) {
      captionBox.classList.remove('is-hidden');
    } else {
      captionBox.classList.add('is-hidden');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Try Fullscreen API
      if (viewerEl.requestFullscreen) {
        viewerEl.requestFullscreen().catch(() => {
          // iOS Safari fallback: CSS overlay handles 100dvh
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  /* Utility helpers */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /**
   * Initializes event delegation on container for opening images and copying section IDs
   */
  function bindContainerEvents(container) {
    if (!container) return;

    // Gallery button clicks (standard thumbnails, more card, and launch viewer button)
    container.querySelectorAll('.radiology-thumb-btn, .radiology-more-btn, .radiology-launch-viewer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chId = btn.getAttribute('data-chapter');
        const secId = btn.getAttribute('data-section');
        const idx = parseInt(btn.getAttribute('data-index'), 10) || 0;
        openViewer(chId, secId, idx, btn);
      });
    });

    // Expand / Collapse toggles
    container.querySelectorAll('.radiology-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const secId = btn.getAttribute('data-section');
        const wrapper = document.getElementById(`gallery-${secId}`);
        if (!wrapper) return;
        const isExp = wrapper.classList.toggle('is-expanded');
        btn.setAttribute('aria-expanded', isExp ? 'true' : 'false');
      });
    });

    // Section ID copy badges
    container.querySelectorAll('.section-id-badge').forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = badge.getAttribute('data-id');
        if (id && navigator.clipboard) {
          navigator.clipboard.writeText(id).then(() => {
            const originalText = badge.innerHTML;
            badge.innerHTML = `<span>کپی شد!</span>`;
            setTimeout(() => { badge.innerHTML = originalText; }, 1200);
          }).catch(() => {});
        }
      });
    });
  }

  return {
    loadManifest,
    getSectionImages,
    renderGallery,
    handleImageError,
    openViewer,
    closeViewer,
    bindContainerEvents,
    manifestCache
  };
})();
