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
    },
    {
      id: 'surgery',
      title: 'بانک جامع سوالات جراحی جنرال (رفرنس لارنس)',
      shortTitle: 'جراحی جنرال (لارنس)',
      category: 'جراحی جنرال لارنس',
      categoryColor: '#e11d48',
      badge: '394 سوال در 20 مبحث',
      totalQuestions: 394,
      description: 'بانک آزمون و تست‌های تحلیلی جراحی عمومی بر اساس رفرنس معتبر لارنس (Lawrence Essentials of General Surgery)؛ شامل تشریح گزینه‌ها، کالبدشکافی دام‌های تستی و درسنامه جامع بالینی.',
      chapters: [
        {
          id: 'surgery-all',
          title: 'همه مباحث (آزمون جامع جراحی جنرال لارنس)',
          shortTitle: 'آزمون جامع جراحی',
          badge: '394 سوال',
          totalQuestions: 394,
          estimatedMinutes: 394,
          isAll: true
        },
        {
          id: 'surgery-ch10-hernia',
          title: 'فصل ۱۰: فتق‌های جدار شکم و کشاله ران (Abdominal Wall, Including Hernia)',
          shortTitle: 'جدار شکم و فتق‌ها',
          badge: '24 سوال',
          totalQuestions: 24,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_abdominal_wall_and_hernia_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_ABDOMINAL_WALL_AND_HERNIA_DATA)) ? window.SURGERY_ABDOMINAL_WALL_AND_HERNIA_DATA : [],
          description: 'مجموعه ۲۶ سوال تحلیلی فتق‌های اینگوئینال، فمورال، نافی، اشپیگل، ریشتر و عوارض پس از عمل (سروما، ارکیت ایسکمیک، فتق مختنق) بر اساس کتاب لارنس.'
        },
        {
          id: 'surgery-ch15-biliary',
          title: 'فصل ۱۵: کیسه صفرا و مجاری صفراوی (Biliary Tract & Gallbladder)',
          shortTitle: 'کیسه صفرا و مجاری صفراوی',
          badge: '13 سوال',
          totalQuestions: 13,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_biliary_tract_and_gallbladder_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_BILIARY_TRACT_AND_GALLBLADDER_DATA)) ? window.SURGERY_BILIARY_TRACT_AND_GALLBLADDER_DATA : [],
          description: 'مجموعه ۱۹ سوال تحلیلی کولهسیستیت حاد و بدون سنگ، کلانژیت حاد، پانکراتیت صفراوی، کلدوکولیتیازیس، کولهسیستوستومی، اسکن HIDA و سنگ‌های صفراوی بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch02-fluids',
          title: 'فصل ۲: آب، الکترولیت و تعادل اسید و باز (Fluid & Electrolyte Management)',
          shortTitle: 'مایعات و الکترولیت‌ها',
          badge: '15 سوال',
          totalQuestions: 15,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_fluid_and_electrolytes_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_FLUID_AND_ELECTROLYTES_DATA)) ? window.SURGERY_FLUID_AND_ELECTROLYTES_DATA : [],
          description: 'مجموعه ۱۷ سوال تحلیلی اختلالات سدیم، پتاسیم، منیزیم، کلسیم، تعادل اسید و باز، مایع‌درمانی و پایش تهویه‌ای بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch19-liver-spleen',
          title: 'فصل ۱۹: کبد و طحال (Liver & Spleen)',
          shortTitle: 'کبد و طحال',
          badge: '17 سوال',
          totalQuestions: 17,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_liver_and_spleen_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_LIVER_AND_SPLEEN_DATA)) ? window.SURGERY_LIVER_AND_SPLEEN_DATA : [],
          description: 'مجموعه ۲۰ سوال تحلیلی کیست هیداتید، آبسه آمیبی و پیوژنیک کبد، واریس مری و پورتال هایپرتنشن، آدنوم کبدی، عوارض اسپلنکتومی، OPSI، آبسه و کیست‌های طحال و آنمی‌های همولیتیک بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch16-pancreas',
          title: 'فصل ۱۶: پانکراس (Pancreas)',
          shortTitle: 'پانکراس',
          badge: '21 سوال',
          totalQuestions: 21,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_pancreas_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_PANCREAS_DATA)) ? window.SURGERY_PANCREAS_DATA : [],
          description: 'مجموعه ۲۹ سوال تحلیلی پانکراتیت حاد و مزمن، نکروز و سودوکیست، سرطان پانکراس، عمل ویپل، تومورهای نورواندوکرین (انسولینوما، گاسترینوما) و معیارهای رانسون بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch01-periop',
          title: 'فصل ۱: مراقبت‌ها و عوارض قبل و بعد از عمل (Perioperative Care)',
          shortTitle: 'مراقبت‌های قبل و بعد از عمل',
          badge: '17 سوال',
          totalQuestions: 17,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_perioperative_care_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_PERIOPERATIVE_CARE_DATA)) ? window.SURGERY_PERIOPERATIVE_CARE_DATA : [],
          description: 'مجموعه ۲۶ سوال تحلیلی ارزیابی آزمایشگاهی قبل از عمل، تنظیم داروها (کورتون، دیابت، دیورتیک‌ها)، عوارض ریوی و آتلکتازی، نارسایی حاد کلیه (AKI)، کاتترهای ورید مرکزی (CVC)، فیستول تراکئواینومینیت و جراحی در بارداری بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch04-shock',
          title: 'فصل ۴: شوک، ارزیابی همودینامیک و احیا (Shock & Resuscitation)',
          shortTitle: 'شوک و احیا',
          badge: '20 سوال',
          totalQuestions: 20,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_shock_and_resuscitation_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_SHOCK_AND_RESUSCITATION_DATA)) ? window.SURGERY_SHOCK_AND_RESUSCITATION_DATA : [],
          description: 'مجموعه ۲۱ سوال تحلیلی شوک هیپوولمیک و کلاس‌های خونریزی، شوک سپتیک و بحران آدرنال، وازوپرسورها و اینوتروپ‌ها، شوک کاردیوژنیک و نوروژنیک، پایش همودینامیک، پاکسازی لاکتات و ارزیابی پاسخ به مایع بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch12-stomach',
          title: 'فصل ۱۲: معده و دوازدهه (Stomach & Duodenum)',
          shortTitle: 'معده و دوازدهه',
          badge: '29 سوال',
          totalQuestions: 29,
          estimatedMinutes: 45,
          fileUrl: './data/quizzes/surgery_stomach_and_duodenum_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_STOMACH_AND_DUODENUM_DATA)) ? window.SURGERY_STOMACH_AND_DUODENUM_DATA : [],
          description: 'مجموعه ۴۱ سوال تحلیلی آناتومی و خونرسانی معده، بیماری اولسر پپتیک و عوارض (خونریزی، پرفوراسیون، تنگی پیلور)، آدنوکارسینوم معده و مرحله‌بندی، تومورهای GIST و ایماتینیب، لنفوم‌های معده (MALT و DLBCL)، سندرم‌های دامپینگ و عوارض پس از گاسترکتومی بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch05-wound-trauma',
          title: 'فصل ۵: ترمیم زخم، پیوند پوست و تروما (Wound Healing & Trauma)',
          shortTitle: 'ترمیم زخم و تروما',
          badge: '22 سوال',
          totalQuestions: 22,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_wound_healing_and_trauma_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_WOUND_HEALING_AND_TRAUMA_DATA)) ? window.SURGERY_WOUND_HEALING_AND_TRAUMA_DATA : [],
          description: 'مجموعه ۲۳ سوال تحلیلی فازهای التیام زخم، استحکام کششی، پیوند پوست (Imbibition و گرافت‌های STSG/FTSG)، کلوئید و اسکار هایپرتروفیک، ترومای نافذ و بلانت گردن، توراکس، شکم، تامپوناد قلبی، ترومای آئورت و فاشیوتومی بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch24-vascular-oncology',
          title: 'فصل ۲۴: بیماری‌های عروق و انکولوژی جراحی (Vascular Disease & Surgical Oncology)',
          shortTitle: 'بیماری‌های عروق و انکولوژی',
          badge: '17 سوال',
          totalQuestions: 17,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_vascular_and_oncology_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_VASCULAR_AND_ONCOLOGY_DATA)) ? window.SURGERY_VASCULAR_AND_ONCOLOGY_DATA : [],
          description: 'مجموعه ۱۷ سوال تحلیلی سارکوم‌های بافت نرم و اصول بیوپسی، کوآرکتاسیون آئورت، ایسکمی حاد و مزمن شریانی، زخم‌های دیابتی، تنگی شریان کاروتید و مطالعه NASCET، امبولکتومی و تومورهای پوستی (BCC و ملانوم) بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch03-bleeding',
          title: 'فصل ۳: خونریزی جراحی، انتقال خون و انعقاد (Surgical Bleeding & Transfusion)',
          shortTitle: 'خونریزی جراحی و ترانسفوزیون',
          badge: '9 سوال',
          totalQuestions: 9,
          estimatedMinutes: 20,
          fileUrl: './data/quizzes/surgery_surgical_bleeding_and_transfusion_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_SURGICAL_BLEEDING_AND_TRANSFUSION_DATA)) ? window.SURGERY_SURGICAL_BLEEDING_AND_TRANSFUSION_DATA : [],
          description: 'مجموعه ۱۲ سوال تحلیلی عوارض انتقال خون (TRALI و TACO)، ارزیابی هموستاز و اختلالات پلاکت، هموفیلی و داروها بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch11-esophagus',
          title: 'فصل ۱۱: بیماری‌های مری و فتق هیاتال (Esophagus & Hiatal Hernia)',
          shortTitle: 'مری و فتق هیاتال',
          badge: '20 سوال',
          totalQuestions: 20,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_esophagus_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_ESOPHAGUS_DATA)) ? window.SURGERY_ESOPHAGUS_DATA : [],
          description: 'مجموعه ۲۲ سوال تحلیلی آشالازی، دیسفاژی، ریفلاکس گاستروازوفاژیال (GERD)، فتق پاراازوفاژیال، پرفوراسیون مری، سندرم بورهاو و بدخیمی‌های مری بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch13-small-intestine',
          title: 'فصل ۱۳: روده باریک (Small Intestine)',
          shortTitle: 'روده باریک',
          badge: '15 سوال',
          totalQuestions: 15,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_small_intestine_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_SMALL_INTESTINE_DATA)) ? window.SURGERY_SMALL_INTESTINE_DATA : [],
          description: 'مجموعه ۱۹ سوال تحلیلی انسداد روده باریک، ایسکمی مزانتریک حاد و مزمن، بیماری کرون، نئوپلاسم‌های روده باریک (کارسینوئید و لنفوم)، سندرم روده کوتاه و فیستول‌های انتروکوتانئوس بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch06-burns',
          title: 'فصل ۶: سوختگی‌ها و آسیب‌های حرارتی (Burns & Thermal Injury)',
          shortTitle: 'سوختگی‌ها',
          badge: '13 سوال',
          totalQuestions: 13,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_burns_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_BURNS_DATA)) ? window.SURGERY_BURNS_DATA : [],
          description: 'مجموعه ۱۷ سوال تحلیلی فرمول پارک‌لند، مدیریت راه هوایی در آسیب استنشاقی، احیای مایعات، اسکاروتومی و سندرم کمپارتمان، مراقبت موضعی و پیوند در سوختگی بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch18-endocrinology',
          title: 'فصل ۱۸: بیماری‌های جراحی غدد درون‌ریز (Surgical Endocrinology)',
          shortTitle: 'جراحی غدد درون‌ریز',
          badge: '22 سوال',
          totalQuestions: 22,
          estimatedMinutes: 35,
          fileUrl: './data/quizzes/surgery_surgical_endocrinology_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_SURGICAL_ENDOCRINOLOGY_DATA)) ? window.SURGERY_SURGICAL_ENDOCRINOLOGY_DATA : [],
          description: 'مجموعه ۳۲ سوال تحلیلی بیماری‌های تیروئید و کانسر تیروئید، نئوپلازی‌های پاراتیروئید و هایپرپاراتیروئیدیسم اولیه و ثانویه، تومورهای آدرنال و سندرم‌های MEN بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch06-infections',
          title: 'فصل ۶: عفونت‌های جراحی و آنتی‌بیوتیک‌ها (Surgical Infections)',
          shortTitle: 'عفونت‌های جراحی',
          badge: '12 سوال',
          totalQuestions: 12,
          estimatedMinutes: 25,
          fileUrl: './data/quizzes/surgery_surgical_infections_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_SURGICAL_INFECTIONS_DATA)) ? window.SURGERY_SURGICAL_INFECTIONS_DATA : [],
          description: 'مجموعه ۱۷ سوال تحلیلی طبقه‌بندی زخم‌ها، آنتی‌بیوتیک پروفیلاکسی، عفونت‌های نکروزان بافت نرم (NSTI)، گانگرن فورنیه، پریتونیت حاد و کاتتر دیالیز، کزاز و مارکرهای سپسیس بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch28-neurosurgery',
          title: 'فصل ۲۸: جراحی مغز، اعصاب و ستون فقرات (Neurosurgery)',
          shortTitle: 'جراحی مغز و اعصاب',
          badge: '38 سوال',
          totalQuestions: 38,
          estimatedMinutes: 50,
          fileUrl: './data/quizzes/surgery_neurosurgery_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_NEUROSURGERY_DATA)) ? window.SURGERY_NEUROSURGERY_DATA : [],
          description: 'مجموعه ۴۷ سوال تحلیلی ترومای سر و مغز (EDH, SDH, کانتوژن)، تروما و آسیب‌های نخاعی، شکستگی‌های ستون فقرات (جفرسون، دنس، جلاد، شانس)، بیماری‌های دژنراتیو دیسک و تنگی کانال، تومورها و بیماری‌های عروقی مغز بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch14-trauma',
          title: 'فصل ۱۴: ترومای قفسه سینه، شکم، لگن و گردن (Thoracoabdominal, Pelvic & Neck Trauma)',
          shortTitle: 'ترومای توراکوآبدومینال و گردن',
          badge: '24 سوال',
          totalQuestions: 24,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_trauma_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_TRAUMA_DATA)) ? window.SURGERY_TRAUMA_DATA : [],
          description: 'مجموعه ۲۶ سوال تحلیلی هموتوراکس حجیم و توراکوتومی اورژانس، ترومای نافذ گردن و زون‌های سه‌گانه، شکستگی‌های لگن و آنژیوامبولیزاسیون، آسیب دیافراگم، قفسه سینه مواج (Flail Chest)، ترومای نافذ شکم و فلانک بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch17-breast',
          title: 'فصل ۱۷: بیماری‌های پستان (Breast Disease)',
          shortTitle: 'بیماری‌های پستان',
          badge: '17 سوال',
          totalQuestions: 17,
          estimatedMinutes: 30,
          fileUrl: './data/quizzes/surgery_breast_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_BREAST_DATA)) ? window.SURGERY_BREAST_DATA : [],
          description: 'مجموعه سوالات تحلیلی سرطان پستان، انواع پاتولوژی (موسینوس، داکتال، فیلودس)، غربالگری و ماموگرافی، ژنیکوماستی و اندیکاسیون‌های جراحی بر اساس رفرنس لارنس.'
        },
        {
          id: 'surgery-ch14-colon-rectum',
          title: 'فصل ۱۴: بیماری‌های کولون، رکتوم و مقعد (Diseases of the Colon, Rectum & Anus)',
          shortTitle: 'کولون، رکتوم و مقعد',
          badge: '29 سوال',
          totalQuestions: 29,
          estimatedMinutes: 45,
          fileUrl: './data/quizzes/surgery_colon_and_rectum_quiz.json',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.SURGERY_COLON_AND_RECTUM_DATA)) ? window.SURGERY_COLON_AND_RECTUM_DATA : [],
          description: 'مجموعه سوالات تحلیلی خونریزی دستگاه گوارش تحتانی، هموروئید، فیستول و آبسه آنورکتال، غربالگری و مرحله‌بندی سرطان‌های کولورکتال، سندرم‌های لینچ و FAP، ولولوس سیگموئید، دیورتیکولیت و سندرم اوگیلوی بر اساس رفرنس لارنس.'
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

            // 1. Combined all questions for a course (e.g. 'ncd-all', 'surgery-all')
      const isAllForCourse = (typeof quizId === 'string' && quizId.endsWith('-all')) ? quizId.replace(/-all$/, '') : quizId;
      const targetCourse = this.getQuizById(isAllForCourse);
      if (targetCourse && targetCourse.chapters && (quizId.endsWith('-all') || quizId === isAllForCourse)) {
        const allCacheKey = `${targetCourse.id}-all`;
        if (this.questionsCache.has(allCacheKey)) {
          const cached = this.questionsCache.get(allCacheKey);
          if (cached && cached.length > 0) return cached;
        }

        const individual = targetCourse.chapters.filter(c => !c.isAll);
        const arrays = await Promise.all(individual.map(c => this.loadQuestions(c.id)));
        const combined = arrays.flat();
        if (combined.length > 0) {
          this.questionsCache.set(allCacheKey, combined);
          return combined;
        }
      }

      const quiz = this.getQuizById(quizId);
      if (!quiz) {
        throw new Error(`آزمونی با شناسه "${quizId}" یافت نشد.`);
      }

      const prepareQuestions = (rawList) => {
        if (!Array.isArray(rawList)) return [];
        return rawList.map((q, idx) => {
          const item = { ...q };
          if (!item.chapterId) item.chapterId = quizId;
          if (!item.globalId) {
            const idStr = String(item.id || '');
            if (idStr.startsWith('surg_') || idStr.startsWith('ncd_') || idStr.startsWith('rad_')) {
              item.globalId = idStr;
            } else {
              item.globalId = `${quizId}_q${item.id || (idx + 1)}`;
            }
          }
          return item;
        });
      };

      // Check memory cache first
      if (this.questionsCache.has(quizId)) {
        const cached = this.questionsCache.get(quizId);
        if (cached && cached.length > 0) {
          const prepared = prepareQuestions(cached);
          this.questionsCache.set(quizId, prepared);
          quiz.totalQuestions = prepared.length;
          quiz.badge = `${prepared.length} سوال`;
          return prepared;
        }
      }

      // Try fetching from fileUrl
      if (quiz.fileUrl) {
        try {
          const response = await fetch(quiz.fileUrl);
          if (response.ok) {
            const data = await response.json();
            const rawQuestions = Array.isArray(data) ? data : (data && Array.isArray(data.questions) ? data.questions : []);
            if (rawQuestions.length > 0) {
              const questions = prepareQuestions(rawQuestions);
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
        const questions = prepareQuestions(quiz.fallbackQuestions);
        this.questionsCache.set(quizId, questions);
        quiz.totalQuestions = questions.length;
        quiz.badge = `${questions.length} سوال`;
        return questions;
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
