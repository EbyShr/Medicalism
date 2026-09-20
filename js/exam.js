/**
 * SPECIAL EXAM MODULE (بخش ویژه آزمون)
 * Interactive Radiology Cases, Quiz Simulation, Study Mode, and Precision Image Annotation Overlays.
 */

window.EXAM_QUESTIONS_DATA = [
  {
    "questionId": "q1",
    "image": "./chapters/rad-exam/images/q1.png",
    "prompt": "کدام مورد محتمل‌ترین تشخیص زمینه‌ای است؟",
    "options": [
      {
        "id": "الف",
        "text": "سل آدرنال (Adrenal Tuberculosis)"
      },
      {
        "id": "ب",
        "text": "خونریزی آدرنال (Adrenal Hemorrhage)"
      },
      {
        "id": "ج",
        "text": "آدنوکورتیکال کارسینوما (Adrenocortical Carcinoma)"
      },
      {
        "id": "د",
        "text": "فئوکروموسیتوم (Pheochromocytoma)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در گرافی ساده شکم، کلسیفیکاسیون دوطرفه متراکم در بستر آناتومیک غدد فوق‌کلیوی دیده می‌شود که الگوی کلاسیک مرحله مزمن سل آدرنال است. خونریزی حاد یا بدخیمی‌های آدرنال معمولاً ضایعه یک‌طرفه با نمای توده‌ای یا کلسیفیکاسیون نامنظم و موضعی ایجاد می‌کنند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.33,
        "y": 0.2,
        "w": 0.08,
        "h": 0.11,
        "label": "کلسیفیکاسیون آدرنال راست"
      },
      {
        "type": "box",
        "x": 0.62,
        "y": 0.22,
        "w": 0.07,
        "h": 0.08,
        "label": "کلسیفیکاسیون آدرنال چپ"
      }
    ]
  },
  {
    "questionId": "q2",
    "image": "./chapters/rad-exam/images/q2.png",
    "prompt": "در رادیوگرافی ساده شکم، علت نواحی رادیواوپک بسیار متراکم در مسیر کولون نزولی و سیگموئید کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "باقی ماندن باریوم در دیورتیکول‌های کولون (Retained barium in colonic diverticula)"
      },
      {
        "id": "ب",
        "text": "فلبولیت‌های متعدد وریدی (Pelvic phleboliths)"
      },
      {
        "id": "ج",
        "text": "سنگ‌های رادیواوپک سیستم ادراری (Urinary tract calculi)"
      },
      {
        "id": "د",
        "text": "مصرف قرص‌های حاوی آهن یا بیسموت (Ingested radiopaque pills)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "نواحی بسیار متراکم، گرد و مشخص با دانسیته باریوم در امتداد حاشیه کولون نزولی و سیگموئید دیده می‌شوند که ناشی از به دام افتادن ماده حاجب در دیورتیکول‌های کولون پس از بررسی‌های فلوروسکوپی قبلی است. سنگ‌های ادراری در مسیر کلیه و حالب قرار دارند و فلبولیت‌ها دانسیته کمتر، حاشیه شفاف‌تر و اندازه کوچکتری در لگن دارند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.72,
        "y": 0.35,
        "w": 0.10,
        "h": 0.20,
        "label": "باریوم محبوس در دیورتیکول‌های کولون نزولی"
      },
      {
        "type": "box",
        "x": 0.43,
        "y": 0.85,
        "w": 0.17,
        "h": 0.11,
        "label": "تجمع باریوم در دیورتیکول‌های سیگموئید"
      }
    ]
  },
  {
    "questionId": "q3",
    "image": "./chapters/rad-exam/images/q3.png",
    "prompt": "در تصویر اوروگرافی وریدی (IVU)، کدام مورد محتمل‌ترین تشخیص برای موقعیت و وضعیت قرارگیری کلیه چپ بیمار است؟",
    "options": [
      {
        "id": "الف",
        "text": "کلیه اکتوپیک / لگنی چپ (Left pelvic/ectopic kidney)"
      },
      {
        "id": "ب",
        "text": "نفروپتوز کلیه چپ (Left renal nephroptosis)"
      },
      {
        "id": "ج",
        "text": "کلیه نعل‌اسبی (Horseshoe kidney)"
      },
      {
        "id": "د",
        "text": "آژنزی کلیه چپ (Left renal agenesis)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در گرافی IVU، کلیه راست در بستر نرمال خود دیده می‌شود، اما حفره کلیوی چپ خالی بوده و سیستم پلویوکالیسیل کلیه چپ در حفره ایلیاک/لگن با درجاتی از مالروتیشن قرار گرفته است که مؤید کلیه اکتوپیک مادرزادی (لگنی) است. در نفروپتوز طول حالب طبیعی بوده و دچار پیچ‌خوردگی (kinking) می‌شود، در حالی که در کلیه لگنی طول حالب به طور مادرزادی کوتاه است.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.60,
        "y": 0.54,
        "w": 0.15,
        "h": 0.20,
        "label": "کلیه اکتوپیک لگنی چپ با ترشح ماده حاجب"
      }
    ]
  },
  {
    "questionId": "q4",
    "image": "./chapters/rad-exam/images/q4.png",
    "prompt": "با توجه به نمای رادیوگرافی، نوع واکنش پریوستال (Periosteal reaction) و محتمل‌ترین تشخیص کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "واکنش خورشیدی (Sunburst) – استئوسارکوم (Osteosarcoma)"
      },
      {
        "id": "ب",
        "text": "واکنش پوست‌پیازی (Onion-skin) – یوئینگ سارکوم (Ewing sarcoma)"
      },
      {
        "id": "ج",
        "text": "واکنش یکنواخت و سالید (Solid) – استئوئید استئوما (Osteoid osteoma)"
      },
      {
        "id": "د",
        "text": "واکنش لایه‌لایه متوقف‌شده – استئومیلیت حاد (Acute osteomyelitis)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در گرافی، اسپیکول‌های استخوانی ظریف و واگرا به صورت عمود بر قشر استخوان دیده می‌شوند که نمای کلاسیک واکنش پریوستال خورشیدی (Sunburst) ناشی از ماتریکس استخوان‌ساز بدخیم در استئوسارکوم است. یوئینگ سارکوم کلاسیک با نمای پیازی‌شکل (Onion-skin) با لایه‌های متحدالمرکز موازی کورتکس مشخص می‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.42,
        "y": 0.13,
        "w": 0.21,
        "h": 0.50,
        "label": "واکنش پریوستال خورشیدی (Sunburst) و توده بافت نرم"
      }
    ]
  },
  {
    "questionId": "q5",
    "image": "./chapters/rad-exam/images/q5.png",
    "prompt": "نوع شکستگی مشاهده‌شده در رادیوگرافی مچ دست این کودک کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "شکستگی باکل یا توروس (Torus / Buckle fracture)"
      },
      {
        "id": "ب",
        "text": "شکستگی گرین‌استیک یا ترکه نو (Greenstick fracture)"
      },
      {
        "id": "ج",
        "text": "شکستگی سالتر-هریس (Salter-Harris fracture)"
      },
      {
        "id": "د",
        "text": "تغییر شکل پلاستیک بدون شکستگی (Plastic deformation)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "رادیوگرافی فرورفتگی و برجستگی (انبعاج) کورتکس استخوان همراه با خط فشاری ظریف و بدون جابه‌جایی در متافیز استخوان رادیوس دیستال را نشان می‌دهد که نمای کلاسیک شکستگی توروس یا باکل (Torus / Buckle fracture) در کودکان است. صفحه رشد کاملاً سالم است که شکستگی سالتر-هریس را رد می‌کند، و عدم شکستگی واضح یک کورتکس همراه با خمیدگی کورتکس مقابل نیز شکستگی گرین‌استیک را منتفی می‌سازد.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.28,
        "y": 0.63,
        "w": 0.26,
        "h": 0.08,
        "label": "شکستگی توروس (Torus / Buckle) در متافیز رادیوس"
      }
    ]
  },
  {
    "questionId": "q6",
    "image": "./chapters/rad-exam/images/q6.png",
    "prompt": "نمای زیر در بیمار ترومایی بزرگسال در درجه اول مطرح‌کننده چه نوع شکستگی می‌باشد؟",
    "options": [
      {
        "id": "الف",
        "text": "Humerus epicondyle (اپی‌کندیل هومروس)"
      },
      {
        "id": "ب",
        "text": "Radius head (سر رادیوس)"
      },
      {
        "id": "ج",
        "text": "Trochlea (تروکله‌آ)"
      },
      {
        "id": "د",
        "text": "Capitulum (کاپیتلوم)"
      }
    ],
    "correctOptionId": "ب",
    "confidence": "high",
    "explanation": "حضور پد چربی قدامی بالاآمده (Sail sign) و نمایان شدن پد چربی خلفی در گرافی لترال آرنج، نشانه قطعی افیوژن/هم‌آرتروز مفصلی است. در بیماران بزرگسال به دنبال ترومای حاد، این یافته حتی در غیاب خط شکستگی واضح، در درجه اول نشان‌دهنده شکستگی سر رادیوس (Radial head) در نظر گرفته می‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "point",
        "x": 0.47,
        "y": 0.32,
        "label": "پد چربی قدامی (Sail sign)"
      },
      {
        "type": "point",
        "x": 0.96,
        "y": 0.49,
        "label": "پد چربی خلفی غیرطبیعی"
      }
    ]
  },
  {
    "questionId": "q7",
    "image": "./chapters/rad-exam/images/q7.png",
    "prompt": "با توجه به سی‌تی‌اسکن مغز بدون کنتراست بیمار، کدام یافته پاتولوژیک در تصویر دیده نمی‌شود؟",
    "options": [
      {
        "id": "الف",
        "text": "Sulcal effacement (محو شدن شیارها)"
      },
      {
        "id": "ب",
        "text": "Loss of Gray-white matter differentiation (از بین رفتن تمایز ماده خاکستری و سفید)"
      },
      {
        "id": "ج",
        "text": "Small lateral ventricles (کوچک و فشرده شدن بطن‌های جانبی)"
      },
      {
        "id": "د",
        "text": "Subarachnoid hemorrhage (خونریزی ساب‌آراکنوئید)"
      }
    ],
    "correctOptionId": "د",
    "confidence": "high",
    "explanation": "تصویر نمای کلاسیک ادم منتشر مغزی (Diffuse cerebral edema) را نشان می‌دهد که با محو شدن شیارها (Sulcal effacement)، از بین رفتن تمایز ماده خاکستری و سفید و بطن‌های باریک و فشرده (Slit-like ventricles) مشخص می‌شود. هیچ‌گونه هایپردنسیتی یا شواهدی از خونریزی در فضای ساب‌آراکنوئید دیده نمی‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.36,
        "y": 0.35,
        "w": 0.28,
        "h": 0.25,
        "label": "بطن‌های جانبی فشرده و کوچک‌شده (Small lateral ventricles)"
      },
      {
        "type": "box",
        "x": 0.15,
        "y": 0.20,
        "w": 0.25,
        "h": 0.30,
        "label": "محو شدن شیارها و از بین رفتن مرز ماده سفید و خاکستری"
      }
    ]
  },
  {
    "questionId": "q8",
    "image": "./chapters/rad-exam/images/q8.png",
    "prompt": "کدام مورد تشخیص صحیح است؟",
    "options": [
      {
        "id": "الف",
        "text": "خونریزی ساب‌آراکنوئید حاد (Acute subarachnoid hemorrhage)"
      },
      {
        "id": "ب",
        "text": "خونریزی اپیدورال حاد (Acute epidural hemorrhage)"
      },
      {
        "id": "ج",
        "text": "خونریزی سابدورال مزمن (Chronic subdural hemorrhage)"
      },
      {
        "id": "د",
        "text": "کلسیفیکاسیون فیزیولوژیک سیسترن‌ها (Physiologic cistern calcification)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در سی‌تی‌اسکن بدون کنتراست مغز، هایپردنسیتی بارز ناشی از خونریزی حاد در فضای سیسترن سوپراسلار (با نمای کلاسیک ستاره‌ای شکل) و انتشار آن به درون شیار سیلوین چپ دیده می‌شود که تشخیص قطعی خونریزی ساب‌آراکنوئید (SAH) است. خونریزی‌های اپیدورال و سابدورال در فضاهای خارج‌محوری پریفرال تجمع می‌ابند و حوضچه‌های مایع مغزی-نخاعی قاعده‌ای را به این شکل درگیر نمی‌کنند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.38,
        "y": 0.41,
        "w": 0.24,
        "h": 0.13,
        "label": "خونریزی حاد در سیسترن سوپراسلار (نمای ستاره‌ای)",
        "labelPos": "bottom"
      },
      {
        "type": "point",
        "x": 0.69,
        "y": 0.39,
        "label": "گسترش خون به شیار سیلوین چپ"
      }
    ]
  },
  {
    "questionId": "q9",
    "image": "./chapters/rad-exam/images/q9.png",
    "prompt": "در سی‌تی‌اسکن بدون کنتراست مغز در این بیمار ترومایی، ضایعه هایپردنس خارج‌محوری در سمت چپ مطرح‌کننده کدام تشخیص است؟",
    "options": [
      {
        "id": "الف",
        "text": "هماتوم اپیدورال حاد (Acute epidural hematoma)"
      },
      {
        "id": "ب",
        "text": "هماتوم سابدورال حاد (Acute subdural hematoma)"
      },
      {
        "id": "ج",
        "text": "خونریزی ساب‌آراکنوئید تروماتیک (Traumatic subarachnoid hemorrhage)"
      },
      {
        "id": "د",
        "text": "کنتوژن هموراژیک ایزوله (Isolated hemorrhagic contusion)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "ضایعه هایپردنس خارج‌محوری با نمای دوکوژ (عدسی‌شکل یا biconvex) در ناحیه تمپوروپریتال چپ، نمای کلاسیک هماتوم اپیدورال حاد (EDH) ناشی از پارگی شریان مننژه میانی است. در لوب تمپورال راست نیز هایپردنسیتی اینتراپارانشیمال ناشی از کنتوژن متقابل (Coup-contrecoup) مشاهده می‌شود. هماتوم سابدورال بر خلاف این ضایعه، نمایی هلالیشکل دارد و از خطوط درز جمجمه عبور می‌کند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.78,
        "y": 0.43,
        "w": 0.10,
        "h": 0.28,
        "label": "هماتوم اپیدورال حاد با نمای عدسی‌شکل (EDH)"
      },
      {
        "type": "box",
        "x": 0.12,
        "y": 0.48,
        "w": 0.11,
        "h": 0.12,
        "label": "کنتوژن هموراژیک متقابل (Contrecoup contusion)",
        "labelPos": "bottom"
      }
    ]
  },
  {
    "questionId": "q10",
    "prompt": "کدام‌یک از نشانه‌ها در آسیب ایسکمیک حاد مغزی در سی‌تی‌اسکن دیده نمی‌شود؟",
    "options": [
      {
        "id": "الف",
        "text": "Insular ribbon sign (محو شدن نوار کورتکس اینسولار)"
      },
      {
        "id": "ب",
        "text": "Dense MCA sign (علامت هایپردنس شریان مغزی میانی)"
      },
      {
        "id": "ج",
        "text": "Obliteration of lateral ventricle (محو شدن و انسداد بطن طرفی)"
      },
      {
        "id": "د",
        "text": "Low density area in cortex (ناحیه با دانسیته پایین در کورتکس)"
      }
    ],
    "correctOptionId": "ج",
    "confidence": "high",
    "explanation": "در فاز حاد و زودهنگام ایسکمی مغزی، یافته‌های اولیه شامل Dense MCA sign، از بین رفتن تمایز ماده سفید و خاکستری نظیر Insular ribbon sign، هایپودنسیتی کورتکس و محو شدن شیارهای موضعی (Sulcal effacement) است. فشردگی و محو شدن بطن طرفی (Obliteration of lateral ventricle) نیازمند مس‌افکت و ادم شدید است که معمولاً پس از گذشت ۲۴ تا ۷۲ ساعت و در مراحل دیررس‌تر تظاهر می‌یابد.",
    "source": "ai-inferred",
    "annotations": []
  },
  {
    "questionId": "q11",
    "prompt": "با توجه به دو گرافی بالا که تصویر اول بدون تزریق و تصویر دوم با تزریق می‌باشد، کدام یافته دیده نمی‌شود؟",
    "options": [
      {
        "id": "الف",
        "text": "سنگ شاخ‌گوزنی کلیه چپ (Left renal staghorn calculus)"
      },
      {
        "id": "ب",
        "text": "کالیکتازی کالیس‌های تحتانی کلیه چپ (Left lower pole caliectasis)"
      },
      {
        "id": "ج",
        "text": "Filling defect در لگنچه کلیه چپ (Left renal pelvis filling defect)"
      },
      {
        "id": "د",
        "text": "حالب متسع (Dilated ureter)"
      }
    ],
    "correctOptionId": "د",
    "confidence": "high",
    "explanation": "در کلیشه ساده شکم (KUB)، دانسیته رادیواوپک شاخه‌ای منطبق بر سنگ شاخ‌گوزنی در کلیه چپ به وضوح دیده می‌شود که در گرافی با تزریق (IVU) منجر به ایجاد نقص پرشدگی (Filling defect) در لگنچه و کالیکتازی در کالیس‌های قطب تحتانی شده است. با این حال، هیچ‌گونه اتساعی در مسیر حالب (حالب متسع یا هیدروورتر) مشاهده نمی‌شود.",
    "source": "ai-inferred",
    "image": "./chapters/rad-exam/images/q11_ivu.png",
    "images": [
      {
        "id": "kub",
        "label": "۱. بدون تزریق (KUB)",
        "image": "./chapters/rad-exam/images/q11_kub.png",
        "annotations": [
          {
            "type": "box",
            "x": 0.66,
            "y": 0.14,
            "w": 0.14,
            "h": 0.16,
            "label": "سنگ شاخ‌گوزنی رادیواوپک کلیه چپ",
            "labelPos": "bottom"
          }
        ]
      },
      {
        "id": "ivu",
        "label": "۲. با تزریق (IVU)",
        "image": "./chapters/rad-exam/images/q11_ivu.png",
        "annotations": [
          {
            "type": "box",
            "x": 0.64,
            "y": 0.16,
            "w": 0.14,
            "h": 0.18,
            "label": "نقص پرشدگی در لگنچه و کالیکتازی تحتانی",
            "labelPos": "bottom"
          }
        ]
      }
    ],
    "annotations": [
      {
        "type": "box",
        "x": 0.64,
        "y": 0.16,
        "w": 0.14,
        "h": 0.18,
        "label": "نقص پرشدگی در لگنچه و کالیکتازی تحتانی کلیه چپ",
        "labelPos": "bottom"
      }
    ]
  },
  {
    "questionId": "q12",
    "image": "./chapters/rad-exam/images/q12.png",
    "prompt": "با توجه به تصویر رادیوگرافی زیر، نوع نمای گرافی و محتمل‌ترین تشخیص کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "نمای دهان‌باز (Open-mouth odontoid view) – شکستگی جفرسون (Jefferson fracture)"
      },
      {
        "id": "ب",
        "text": "نمای لترال ستون فقرات گردنی – شکستگی هنگمن (Hangman's fracture)"
      },
      {
        "id": "ج",
        "text": "نمای مایل گردنی (Oblique view) – شکستگی زائده دانس تیپ ۲"
      },
      {
        "id": "د",
        "text": "نمای قدامی-خلفی (AP view) – دررفتگی دوطرفه فاست‌های گردنی"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "تصویر ارائه‌شده یک نمای دهان‌باز (Open-mouth odontoid view) است که مهره‌های اطلس (C1) و آکسیس (C2) را نشان می‌دهد. جابه‌جایی و بیرون‌زدگی دوطرفه لترال‌مس‌های مهره اطلس به سمت خارج نسبت به تنه و سطوح مفصلی C2 (فلش‌های سفید) پاتوگنومونیک شکستگی انفجاری مهره C1 یا شکستگی جفرسون (Jefferson fracture) است.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.07,
        "y": 0.40,
        "w": 0.18,
        "h": 0.24,
        "label": "جابه‌جایی به خارج توده طرفی راست C1 نسبت به C2",
        "labelPos": "bottom"
      },
      {
        "type": "box",
        "x": 0.75,
        "y": 0.40,
        "w": 0.18,
        "h": 0.24,
        "label": "جابه‌جایی به خارج توده طرفی چپ C1 نسبت به C2",
        "labelPos": "top"
      }
    ]
  },
  {
    "questionId": "q13",
    "image": "./chapters/rad-exam/images/q13.png",
    "prompt": "با توجه به نمای رادیوگرافی قدامی-خلفی (AP) شانه چپ، کدام مورد محتمل‌ترین تشخیص است؟",
    "options": [
      {
        "id": "الف",
        "text": "دررفتگی خلفی شانه (Posterior shoulder dislocation)"
      },
      {
        "id": "ب",
        "text": "دررفتگی قدامی شانه (Anterior shoulder dislocation)"
      },
      {
        "id": "ج",
        "text": "دررفتگی مفصل آکرومیوکلاویکولار (Acromioclavicular joint dislocation)"
      },
      {
        "id": "د",
        "text": "دررفتگی تحتانی شانه (Luxatio erecta)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در گرافی AP شانه، سر استخوان هومروس به دلیل چرخش داخلی ثابت (Fixed internal rotation) تقارن گرد و مشخصی پیدا کرده که نمای کلاسیک لامپ حبابی (Lightbulb sign) را ایجاد می‌کند و مؤید دررفتگی خلفی شانه است. در دررفتگی قدامی شانه، سر هومروس به سمت داخل و پایین (موقعیت سابکوراکوئید) جابه‌جا شده و از حفره گلنوئید خارج می‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.45,
        "y": 0.30,
        "w": 0.28,
        "h": 0.22,
        "label": "نمای لامپ حبابی (Lightbulb sign) ناشی از دررفتگی خلفی شانه",
        "labelPos": "bottom"
      }
    ]
  },
  {
    "questionId": "q14",
    "image": "./chapters/rad-exam/images/q14.png",
    "prompt": "با توجه به گرافی ساده شکم، محتمل‌ترین تشخیص برای این بیمار کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "ولولوس سکوم (Cecal volvulus)"
      },
      {
        "id": "ب",
        "text": "ولولوس سیگموئید (Sigmoid volvulus)"
      },
      {
        "id": "ج",
        "text": "انسداد مکانیکی ساده روده باریک (Simple SBO)"
      },
      {
        "id": "د",
        "text": "مگاکولون توکسیک (Toxic megacolon)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "اتساع شدید سکوم به صورت یک لوپ بزرگ پر از گاز که از حفره ایلیاک راست خارج شده و به سمت کوادران فوقانی چپ (LUQ) شیفت پیدا کرده، همراه با اتساع لوپ‌های روده باریک بالادست، نمای تیپیک ولولوس سکوم است. در ولولوس سیگموئید، اتساع از لگن آغاز شده و رأس لوپ دوگانه (نمای دانه قهوه) به سمت کوادران فوقانی راست (RUQ) امتداد می‌یابد.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.55,
        "y": 0.12,
        "w": 0.35,
        "h": 0.45,
        "label": "سکوم متسع جابه‌جاشده به LUQ",
        "labelPos": "bottom"
      },
      {
        "type": "box",
        "x": 0.12,
        "y": 0.24,
        "w": 0.30,
        "h": 0.24,
        "label": "اتساع لوپ‌های روده باریک (SBO)",
        "labelPos": "top"
      }
    ]
  },
  {
    "questionId": "q15",
    "image": "./chapters/rad-exam/images/q15.png",
    "prompt": "با توجه به نمای گرافی ساده شکم، لوپ‌های متسع مربوط به کدام بخش لوله گوارش بوده و شایع‌ترین علت زمینه‌ای این وضعیت چیست؟",
    "options": [
      {
        "id": "الف",
        "text": "روده باریک (ژژونوم) – چسبندگی‌های داخل شکمی (Adhesions)"
      },
      {
        "id": "ب",
        "text": "روده باریک (ایلئوم) – سنگ کیسه صفرا (Gallstone ileus)"
      },
      {
        "id": "ج",
        "text": "کولون عرضی – ولولوس کولون (Colonic volvulus)"
      },
      {
        "id": "د",
        "text": "کولون نزولی – تنگی ناشی از کارسینوم کولورکتال"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "چین‌های مخاطی ظریف و متراکمی که تمام عرض روده را به طور کامل طی می‌کنند (Valvulae conniventes یا Plicae circulares) اختصاصی روده باریک (به‌ویژه ژژونوم) هستند و همراهی آن با کاهش بارز گاز در کولون و رکتوم، تشخیص انسداد مکانیکی روده باریک (SBO) را قطعی می‌کند. شایع‌ترین علت انسداد مکانیکی روده باریک در بالغین، باندهای چسبندگی پس از جراحی (Adhesions) است، در حالی که در کولون چین‌های هاسترا فواصل بیشتری داشته و تمام عرض لومن را طی نمی‌کنند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.54,
        "y": 0.06,
        "w": 0.38,
        "h": 0.29,
        "label": "لوپ متسع روده باریک با چین‌های والوولا کانینونتس",
        "labelPos": "bottom"
      }
    ]
  },
  {
    "questionId": "q16",
    "image": "./chapters/rad-exam/images/q16.png",
    "prompt": "با توجه به کلیشه سیستواورتروگرافی حین ادرار کردن (VCUG)، درجه (Grade) ریفلاکس وزیکواورترال (VUR) در سمت راست و چپ به ترتیب کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "راست گرید III و چپ گرید II"
      },
      {
        "id": "ب",
        "text": "راست گرید IV و چپ گرید III"
      },
      {
        "id": "ج",
        "text": "راست گرید II و چپ گرید I"
      },
      {
        "id": "د",
        "text": "راست گرید V و چپ گرید II"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "در سمت چپ، ماده حاجب به لگنچه و کالیس‌ها رسیده اما هیچ اتساعی ایجاد نکرده و فورنیکس‌ها تیز باقی مانده‌اند که منطبق بر گرید II است. در سمت راست، ریفلاکس همراه با اتساع متوسط لگنچه و حالب و بلانتینگ (کندی زاویه) کالیس‌ها دیده می‌شود که تعریف دقیق گرید III است (عدم وجود پیچ‌خوردگی شدید حالب و تخریب کامل کالیس‌ها، گرید IV و V را رد می‌کند).",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.22,
        "y": 0.09,
        "w": 0.19,
        "h": 0.23,
        "label": "ریفلاکس گرید III راست (اتساع لگنچه و کندی کالیس‌ها)",
        "labelPos": "bottom",
        "labelAlign": "left"
      },
      {
        "type": "box",
        "x": 0.60,
        "y": 0.08,
        "w": 0.17,
        "h": 0.22,
        "label": "ریفلاکس گرید II چپ (بدون اتساع، فورنیکس تیز)",
        "labelPos": "top",
        "labelAlign": "right"
      }
    ]
  },
  {
    "questionId": "q17",
    "image": "./chapters/rad-exam/images/q17.png",
    "prompt": "با توجه به سی‌تی‌اسکن مغز، کدام یافته در تصویر دیده نمی‌شود؟",
    "options": [
      {
        "id": "الف",
        "text": "Vasogenic edema (ادم وازوژنیک)"
      },
      {
        "id": "ب",
        "text": "Midline shift (انحراف خط وسط)"
      },
      {
        "id": "ج",
        "text": "هماتوم اپیدورال (EDH)"
      },
      {
        "id": "د",
        "text": "Obliteration of right lateral ventricle (انسداد بطن طرفی راست)"
      }
    ],
    "correctOptionId": "ج",
    "confidence": "high",
    "explanation": "در سی‌تی‌اسکن مغز، یک ضایعه توده‌ای بزرگ در نیمکره راست با ادم وازوژنیک شدید انگشتی‌شکل (Digit-like vasogenic edema)، شیفت بارز خط وسط (Midline shift) به سمت چپ و کلاپس/انسداد کامل بطن جانبی راست مشاهده می‌شود. هیچ‌گونه ضایعه هایپردنس خارج‌محوری با نمای دوکوژ (عدسی‌شکل) منطبق بر هماتوم اپیدورال (EDH) در تصویر دیده نمی‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.14,
        "y": 0.30,
        "w": 0.36,
        "h": 0.42,
        "label": "توده نیمکره راست همراه با ادم وازوژنیک شدید",
        "labelPos": "bottom",
        "labelAlign": "left"
      },
      {
        "type": "point",
        "x": 0.53,
        "y": 0.40,
        "label": "شیفت خط وسط به چپ و کلاپس بطن راست",
        "maxWidth": "155px"
      }
    ]
  },
  {
    "questionId": "q18",
    "image": "./chapters/rad-exam/images/q18.png",
    "prompt": "در رادیوگرافی لترال ستون فقرات گردنی، شکستگی مشاهده‌شده در زائده خاری مهره تحتانی گردنی مطرح‌کننده کدام نوع آسیب است؟",
    "options": [
      {
        "id": "الف",
        "text": "شکستگی کِلِیشاولرز (Clay-shoveler fracture)"
      },
      {
        "id": "ب",
        "text": "شکستگی هنگمن (Hangman's fracture)"
      },
      {
        "id": "ج",
        "text": "شکستگی قطره اشکی انقباضی یا اکستنشن (Teardrop fracture)"
      },
      {
        "id": "د",
        "text": "شکستگی زائده دانس تیپ ۳ (Type III odontoid fracture)"
      }
    ],
    "correctOptionId": "الف",
    "confidence": "high",
    "explanation": "شکستگی خطی و اوولسیون زائده خاری مهره C7 (یا C6) همراه با جابه‌جایی خفیف قطعه به سمت پایین در نمای لترال گردن، مشخصه پاتوگنومونیک شکستگی کِلِیشاولرز (Clay-shoveler fracture) است. خطوط ستون مهره‌ای قدامی و خلفی و تنه مهره‌ها کاملاً تراز و پایدار هستند و آسیب پدیکول C2 (هنگمن) یا شکستگی بادی مهره دیده نمی‌شود.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.15,
        "y": 0.59,
        "w": 0.29,
        "h": 0.18,
        "label": "شکستگی زائده خاری C7 (Clay-shoveler fracture)",
        "labelPos": "bottom",
        "labelAlign": "left"
      }
    ]
  },
  {
    "questionId": "q19",
    "image": "./chapters/rad-exam/images/q19.png",
    "prompt": "بر اساس گرافی چه نشانه‌ای مشاهده می‌شود و این نشانه مؤید کدام‌یک از اختلالات زیر می‌باشد؟",
    "options": [
      {
        "id": "الف",
        "text": "Continuous diaphragm sign – پنوموتوراکس"
      },
      {
        "id": "ب",
        "text": "Continuous diaphragm sign – پنومومدیاستن"
      },
      {
        "id": "ج",
        "text": "Deep sulcus sign – پنوموتوراکس"
      },
      {
        "id": "د",
        "text": "Deep sulcus sign – پنومومدیاستن"
      }
    ],
    "correctOptionId": "ب",
    "confidence": "high",
    "explanation": "در گرافی قفسه سینه، نشانه دیافراگم پیوسته (Continuous diaphragm sign) دیده می‌شود؛ به این صورت که گنبد دیافراگم در تمام طول خط وسط و در زیر سایه قلب به صورت یک خط ممتد و واضح از هوا قابل رویت است. این یافته ناشی از تجمع هوای آزاد در فضای مدیاستن و بین پریکارد و دیافراگم بوده و پاتوگنومونیک پنومومدیاستن (Pneumomediastinum) است. در حالت نرمال، بخش مرکزی دیافراگم به دلیل دانسیته یکسان با قاعده قلب (Silhouette sign) محو است. نشانه Deep sulcus sign در بیماران سوپاین ناشی از پنوموتوراکس در زاویه کوستوفرنیک است.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.38,
        "y": 0.65,
        "w": 0.30,
        "h": 0.07,
        "label": "نشانه دیافراگم پیوسته زیر قلب (Continuous diaphragm sign)",
        "labelPos": "bottom"
      }
    ]
  },
  {
    "questionId": "q20",
    "image": "./chapters/rad-exam/images/q20.png",
    "prompt": "مرد ۴۵ ساله‌ای به دنبال تصادف با موتورسیکلت با تنگی نفس شدید، تاکی‌کاردی و افت فشار خون به اورژانس آورده شده است. با توجه به گرافی، محتمل‌ترین تشخیص کدام است؟",
    "options": [
      {
        "id": "الف",
        "text": "Simple Pneumothorax (پنوموتوراکس ساده)"
      },
      {
        "id": "ب",
        "text": "Massive Hemothorax (هموتوراکس ماسیو)"
      },
      {
        "id": "ج",
        "text": "Tension Pneumothorax (پنوموتوراکس فشاری)"
      },
      {
        "id": "د",
        "text": "Atelectasis (آتلکتازی)"
      }
    ],
    "correctOptionId": "ج",
    "confidence": "high",
    "explanation": "در رادیوگرافی قفسه سینه، پنوموتوراکس وسیع سمت راست با هایپرلوسنسی بارز و فقدان کامل مارکینگ‌های عروقی (Vascular markings) همراه با کلاپس کامل ریه راست مشاهده می‌شود. انحراف شدید و شیفت تراشه و مدیاستن به سمت چپ (سمت مقابل) به همراه پایین آمدن و صاف‌شدگی گنبد دیافراگم راست، نشانه‌های رادیولوژیک فشار مثبت بالای داخل فضای جنب هستند که همراهی آن با علائم بالینی شوک انسدادی و دیسترس تنفسی، تشخیص پنوموتوراکس فشاری (Tension Pneumothorax) را به عنوان یک اورژانس تهدیدکننده حیات قطعی می‌کند.",
    "source": "ai-inferred",
    "annotations": [
      {
        "type": "box",
        "x": 0.05,
        "y": 0.12,
        "w": 0.40,
        "h": 0.72,
        "label": "پنوموتوراکس وسیع راست و کلاپس ریه",
        "labelPos": "inside-top",
        "labelAlign": "left"
      },
      {
        "type": "point",
        "x": 0.58,
        "y": 0.35,
        "label": "انحراف تراشه و مدیاستن به سمت چپ",
        "maxWidth": "155px"
      }
    ]
  }
];

window.ExamModule = (function() {
  // State management
  let currentMode = localStorage.getItem('rad_exam_mode') || 'quiz'; // 'quiz' | 'study'
  const userAnswers = {}; // { q1: 'الف' }
  const submittedQuestions = {}; // { q1: true }
  const annotationsVisible = {}; // { q1: boolean }
  const activeImageIdx = {}; // { q11: 0 }

  // Sync with RadiologyModule image viewer if available
  function registerInRadiologyManifest() {
    if (window.RadiologyModule && window.RadiologyModule.manifestCache) {
      const items = [];
      window.EXAM_QUESTIONS_DATA.forEach((q, idx) => {
        if (q.images && q.images.length > 0) {
          q.images.forEach((imgObj, subIdx) => {
            items.push({
              file: `q${idx + 1}_${subIdx + 1}.png`,
              path: imgObj.image,
              caption: `سوال ${idx + 1} (${imgObj.label}): ${q.prompt}`
            });
          });
        } else if (q.image) {
          items.push({
            file: `q${idx + 1}.png`,
            path: q.image,
            caption: `سوال ${idx + 1}: ${q.prompt}`
          });
        }
      });

      window.RadiologyModule.manifestCache['rad-exam'] = {
        chapterId: 'rad-exam',
        sections: {
          'exam-all': items
        }
      };
    }
  }

  function getQuestions() {
    return window.EXAM_QUESTIONS_DATA || [];
  }

  function getQuestionsCount() {
    return getQuestions().length;
  }

  function setMode(mode) {
    if (mode !== 'quiz' && mode !== 'study') return;
    currentMode = mode;
    localStorage.setItem('rad_exam_mode', mode);

    // If switching to study mode, show annotations for all questions
    if (mode === 'study') {
      getQuestions().forEach(q => {
        annotationsVisible[q.questionId] = true;
      });
    }

    // Re-render exam section if currently visible
    const container = document.getElementById('chapterContentArea');
    if (container && window.ComponentRenderer) {
      const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
      const examCh = chapters.find(c => c.id === 'rad-exam');
      if (examCh && window.appState && window.appState.activeChapterId === 'rad-exam') {
        window.ComponentRenderer.renderChapter(examCh, container);
      }
    }
  }

  function resetQuiz() {
    for (const key in userAnswers) delete userAnswers[key];
    for (const key in submittedQuestions) delete submittedQuestions[key];
    for (const key in annotationsVisible) delete annotationsVisible[key];

    const container = document.getElementById('chapterContentArea');
    if (container && window.ComponentRenderer) {
      const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
      const examCh = chapters.find(c => c.id === 'rad-exam');
      if (examCh) {
        window.ComponentRenderer.renderChapter(examCh, container);
      }
    }
  }

  function selectOption(questionId, optionId) {
    if (currentMode !== 'quiz') return;
    if (submittedQuestions[questionId]) return;

    userAnswers[questionId] = optionId;

    // Update option buttons UI
    const card = document.getElementById(`exam-card-${questionId}`);
    if (!card) return;

    card.querySelectorAll('.exam-option-item').forEach(btn => {
      const optId = btn.getAttribute('data-option-id');
      if (optId === optionId) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('is-selected');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Enable submit button
    const submitBtn = card.querySelector('.exam-submit-btn');
    if (submitBtn) {
      submitBtn.removeAttribute('disabled');
    }
  }

  function submitAnswer(questionId) {
    if (currentMode !== 'quiz') return;
    if (!userAnswers[questionId]) return;

    submittedQuestions[questionId] = true;
    annotationsVisible[questionId] = true; // Auto-reveal finding upon submit

    // Re-render just this card or entire exam view
    const container = document.getElementById('chapterContentArea');
    if (container && window.ComponentRenderer) {
      const chapters = window.ACTIVE_REGISTRY || window.CHAPTERS_REGISTRY || [];
      const examCh = chapters.find(c => c.id === 'rad-exam');
      if (examCh) {
        window.ComponentRenderer.renderChapter(examCh, container);
      }
    }
  }

  function toggleAnnotations(questionId) {
    const isCurrentlyVisible = annotationsVisible[questionId] !== false;
    annotationsVisible[questionId] = !isCurrentlyVisible;

    const overlay = document.getElementById(`annotations-${questionId}`);
    const btn = document.querySelector(`.toggle-ann-btn[data-qid="${questionId}"]`);

    if (overlay) {
      if (annotationsVisible[questionId]) {
        overlay.classList.remove('is-hidden');
      } else {
        overlay.classList.add('is-hidden');
      }
    }

    if (btn) {
      const textSpan = btn.querySelector('span');
      if (annotationsVisible[questionId]) {
        btn.classList.add('is-active');
        if (textSpan) textSpan.textContent = 'مخفی‌سازی یافته‌ها';
      } else {
        btn.classList.remove('is-active');
        if (textSpan) textSpan.textContent = 'نمایش یافته‌ها';
      }
    }
  }

  function renderAnnotationsHtml(annotations) {
    return (annotations || []).map(ann => {
      const distLeft = ann.x;
      const distRight = 1 - (ann.x + (ann.w || 0));
      const labelLen = (ann.label || '').length;
      const estWidthPct = Math.min(0.42, (labelLen * 0.009) + 0.08);

      const canFitRight = (distRight >= estWidthPct);
      const canFitLeft = (distLeft >= estWidthPct);

      let posHoriz = '';
      if (canFitRight && !canFitLeft) {
        posHoriz = 'left: 0; right: auto;';
      } else if (canFitLeft && !canFitRight) {
        posHoriz = 'right: 0; left: auto;';
      } else if (canFitRight && canFitLeft) {
        // Both fit: expand outward away from midline to prevent bilateral label collisions
        posHoriz = (ann.x < 0.5) ? 'right: 0; left: auto;' : 'left: 0; right: auto;';
      } else {
        // Neither fits comfortably: expand into whichever side has more room
        posHoriz = (distLeft >= distRight) ? 'right: 0; left: auto;' : 'left: 0; right: auto;';
      }

      let posVert = (ann.y < 0.18) ? 'top: 6px; bottom: auto;' : 'bottom: calc(100% + 5px); top: auto;';
      if (ann.labelPos === 'bottom') {
        posVert = 'top: calc(100% + 5px); bottom: auto;';
      } else if (ann.labelPos === 'top') {
        posVert = 'bottom: calc(100% + 5px); top: auto;';
      } else if (ann.labelPos === 'inside-top') {
        posVert = 'top: 6px; bottom: auto;';
      }

      if (ann.labelAlign === 'left') {
        posHoriz = 'left: 0; right: auto;';
      } else if (ann.labelAlign === 'right') {
        posHoriz = 'right: 0; left: auto;';
      }

      let extraStyle = '';
      if (ann.maxWidth) {
        extraStyle += ` max-width: ${ann.maxWidth};`;
      }

      const posStyle = `${posHoriz} ${posVert}${extraStyle}`;

      if (ann.type === 'box') {
        const left = ann.x * 100;
        const top = ann.y * 100;
        const width = ann.w * 100;
        const height = ann.h * 100;
        return `
          <div class="exam-annotation-box" 
               style="left: ${left}%; top: ${top}%; width: ${width}%; height: ${height}%;"
               title="${ann.label}">
            <span class="exam-annotation-label" style="${posStyle}">${ann.label}</span>
          </div>
        `;
      } else if (ann.type === 'point') {
        const left = ann.x * 100;
        const top = ann.y * 100;
        return `
          <div class="exam-annotation-point" 
               style="left: ${left}%; top: ${top}%;"
               title="${ann.label}">
            <div class="exam-point-pin"></div>
            <span class="exam-annotation-label" style="${posStyle}">${ann.label}</span>
          </div>
        `;
      }
      return '';
    }).join('');
  }

  function switchImageTab(questionId, imageIndex) {
    activeImageIdx[questionId] = imageIndex;
    const card = document.getElementById(`exam-card-${questionId}`);
    if (!card) return;

    // Update tab button styles
    card.querySelectorAll('.exam-img-tab-btn').forEach(b => {
      const idx = parseInt(b.getAttribute('data-img-idx'), 10);
      if (idx === imageIndex) {
        b.classList.add('is-active');
      } else {
        b.classList.remove('is-active');
      }
    });

    const q = getQuestions().find(item => item.questionId === questionId);
    if (!q || !q.images || !q.images[imageIndex]) return;

    const imgObj = q.images[imageIndex];
    const imgElem = card.querySelector('.exam-question-img');
    if (imgElem) {
      imgElem.src = imgObj.image;
    }

    const overlay = document.getElementById(`annotations-${questionId}`);
    if (overlay) {
      overlay.innerHTML = renderAnnotationsHtml(imgObj.annotations || []);
    }
  }

  function openImageInViewer(questionId, btn) {
    const questions = getQuestions();
    registerInRadiologyManifest();

    let targetIdx = 0;
    let found = false;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.questionId === questionId) {
        const subIdx = activeImageIdx[questionId] || 0;
        targetIdx += subIdx;
        found = true;
        break;
      }
      if (q.images && q.images.length > 0) {
        targetIdx += q.images.length;
      } else if (q.image) {
        targetIdx += 1;
      }
    }

    if (!found) return;

    if (window.RadiologyModule && typeof window.RadiologyModule.openViewer === 'function') {
      window.RadiologyModule.openViewer('rad-exam', 'exam-all', targetIdx, btn);
    } else {
      const q = questions.find(item => item.questionId === questionId);
      const subIdx = activeImageIdx[questionId] || 0;
      const imgSrc = (q && q.images && q.images[subIdx]) ? q.images[subIdx].image : (q ? q.image : '');
      if (imgSrc) window.open(imgSrc, '_blank');
    }
  }

  /**
   * Render HTML for the entire Exam Section
   */
  function renderExamSection(section, chapterId) {
    registerInRadiologyManifest();
    const questions = getQuestions();
    const totalQ = questions.length;

    // Calculate score in quiz mode
    let answeredCount = 0;
    let correctCount = 0;
    questions.forEach(q => {
      if (submittedQuestions[q.questionId]) {
        answeredCount++;
        if (userAnswers[q.questionId] === q.correctOptionId) {
          correctCount++;
        }
      }
    });

    const isStudy = currentMode === 'study';

    let html = `
      <div class="exam-section-wrapper">
        <!-- 1. Top Exam Header Banner -->
        <div class="exam-header-banner">
          <div class="exam-banner-title-group">
            <div class="exam-banner-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <div class="exam-banner-title">بخش ویژه آزمون: کیس‌های تصویری و شبیه‌ساز بالینی</div>
              <div class="exam-banner-desc">تحلیل دقیق کلیشه‌های رادیولوژی، مختصات یافته‌های پاتولوژیک و کلید تشریحی بالینی</div>
            </div>
          </div>

          <!-- Mode Switcher Segmented Control -->
          <div class="exam-mode-control" role="tablist" aria-label="انتخاب حالت آزمون یا مطالعه">
            <button type="button" 
                    class="exam-mode-btn ${!isStudy ? 'is-active' : ''}" 
                    data-mode="quiz"
                    role="tab"
                    aria-selected="${!isStudy}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="exam-btn-label-full">حالت آزمون (کوئیز)</span>
              <span class="exam-btn-label-short">حالت کوئیز</span>
            </button>
            <button type="button" 
                    class="exam-mode-btn ${isStudy ? 'is-active' : ''}" 
                    data-mode="study"
                    role="tab"
                    aria-selected="${isStudy}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span class="exam-btn-label-full">حالت مطالعه (تشریحی)</span>
              <span class="exam-btn-label-short">حالت مطالعه</span>
            </button>
          </div>
        </div>
    `;

    // 2. Score Tracker Bar (in Quiz mode)
    if (!isStudy) {
      const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
      html += `
        <div class="exam-score-bar">
          <div class="exam-score-info">
            <span>وضعیت آزمون:</span>
            <span class="exam-score-count">پاسخ داده شده: ${answeredCount} از ${totalQ}</span>
            ${answeredCount > 0 ? `<span>•</span> <span class="exam-score-count" style="color: ${percentage >= 70 ? '#10b981' : '#f59e0b'};">درصد پاسخ‌های صحیح: ${percentage}٪ (${correctCount} از ${answeredCount})</span>` : ''}
          </div>
          ${answeredCount > 0 ? `
            <button type="button" class="exam-reset-btn" id="examResetQuizBtn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              <span>شروع مجدد آزمون</span>
            </button>
          ` : ''}
        </div>
      `;
    }

    // 3. Question Cards Stream
    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const isSubmitted = isStudy || !!submittedQuestions[q.questionId];
      const selectedOpt = userAnswers[q.questionId] || null;
      const isCorrect = isSubmitted && (isStudy || selectedOpt === q.correctOptionId);

      // Default annotation visibility: in study mode always true, in quiz mode true if submitted or toggled
      const showAnn = isStudy ? (annotationsVisible[q.questionId] !== false) : (annotationsVisible[q.questionId] === true);

      const hasImages = (q.images && q.images.length > 0) || !!q.image;
      const curImgIdx = activeImageIdx[q.questionId] || 0;
      const curImgObj = (q.images && q.images[curImgIdx]) ? q.images[curImgIdx] : null;
      const curImgSrc = curImgObj ? curImgObj.image : q.image;
      const curAnnotations = curImgObj ? (curImgObj.annotations || []) : (q.annotations || []);

      html += `
        <div class="exam-question-card" id="exam-card-${q.questionId}">
          <!-- Card Topbar -->
          <div class="exam-question-topbar">
            <div class="exam-badge-group">
              <span class="exam-q-num-badge">سوال شماره ${qNum}</span>
            </div>
          </div>

          <!-- Question Prompt -->
          <div class="exam-prompt-text">${q.prompt}</div>

          <!-- Split Layout: Image on Left/Top (if present), Options on Right/Bottom -->
          <div class="exam-split-layout ${!hasImages ? 'is-text-only' : ''}">
            
            ${hasImages ? `
            <div class="exam-image-column">
              ${(q.images && q.images.length > 1) ? `
                <!-- Multi-Image Switcher Tabs -->
                <div class="exam-image-switcher" role="tablist" aria-label="انتخاب کلیشه رادیولوژی">
                  ${q.images.map((imgItem, sIdx) => `
                    <button type="button" 
                            class="exam-img-tab-btn ${sIdx === curImgIdx ? 'is-active' : ''}" 
                            data-qid="${q.questionId}" 
                            data-img-idx="${sIdx}">
                      ${imgItem.label}
                    </button>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Radiologic Image with Annotation Overlay -->
              <div class="exam-image-frame" id="img-frame-${q.questionId}">
                <img src="${curImgSrc}" 
                     alt="کلیشه تشخیصی سوال ${qNum}" 
                     class="exam-question-img">

                <!-- Annotations Overlay (Boxes & Pins) -->
                <div class="exam-annotations-overlay ${showAnn ? '' : 'is-hidden'}" id="annotations-${q.questionId}">
                  ${renderAnnotationsHtml(curAnnotations)}
                </div>

                <!-- Floating Image Control Buttons -->
                <div class="exam-image-controls">
                  <button type="button" 
                          class="exam-img-ctrl-btn toggle-ann-btn ${showAnn ? 'is-active' : ''}" 
                          data-qid="${q.questionId}"
                          title="تغییر وضعیت نمایش نشانگرهای تشخیصی بر روی کلیشه">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>${showAnn ? 'مخفی‌سازی یافته‌ها' : 'نمایش یافته‌ها'}</span>
                  </button>

                  <button type="button" 
                          class="exam-img-ctrl-btn inspect-img-btn" 
                          data-qid="${q.questionId}"
                          title="باز کردن در نمایشگر تخصصی رادیولوژی با قابلیت زوم و تنظیم کنتراست">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </svg>
                    <span>بزرگنمایی</span>
                  </button>
                </div>
              </div>
            </div>
            ` : ''}

            <!-- Options & Interaction Column -->
            <div class="exam-options-column">
              <div class="exam-options-list" role="radiogroup" aria-label="گزینه‌های سوال ${qNum}">
                ${q.options.map(opt => {
                  const isThisCorrect = opt.id === q.correctOptionId;
                  const isThisSelected = selectedOpt === opt.id;

                  let optClass = '';
                  let statusIcon = '';

                  if (isStudy) {
                    if (isThisCorrect) {
                      optClass = 'is-correct';
                      statusIcon = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      `;
                    }
                  } else {
                    // Quiz Mode
                    if (isSubmitted) {
                      if (isThisCorrect) {
                        optClass = 'is-correct';
                        statusIcon = `
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        `;
                      } else if (isThisSelected) {
                        optClass = 'is-wrong';
                        statusIcon = `
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        `;
                      }
                    } else {
                      if (isThisSelected) {
                        optClass = 'is-selected';
                      }
                    }
                  }

                  return `
                    <button type="button" 
                            class="exam-option-item ${optClass}" 
                            data-qid="${q.questionId}" 
                            data-option-id="${opt.id}"
                            ${isSubmitted ? 'disabled' : ''}
                            aria-checked="${isThisSelected}">
                      <div class="exam-option-text-group">
                        <span class="exam-option-key">${opt.id}</span>
                        <span class="exam-option-title">${opt.text}</span>
                      </div>
                      <div class="exam-option-status-icon">
                        ${statusIcon}
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Submit Answer Button in Quiz Mode -->
              ${(!isStudy && !isSubmitted) ? `
                <button type="button" 
                        class="exam-submit-btn" 
                        data-qid="${q.questionId}" 
                        ${!selectedOpt ? 'disabled' : ''}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>ثبت و بررسی پاسخ</span>
                </button>
              ` : ''}

              <!-- Clinical Explanation Box -->
              ${isSubmitted ? `
                <div class="exam-explanation-box ${isStudy ? '' : (isCorrect ? 'is-correct-box' : 'is-wrong-box')}">
                  <div class="exam-explanation-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>تحلیل تشریحی و کلید تشخیصی:</span>
                  </div>
                  <div class="exam-explanation-text">${q.explanation}</div>
                </div>
              ` : ''}

            </div>

          </div>
        </div>
      `;
    });

    html += `
      </div>
    `;

    return html;
  }

  /**
   * Bind DOM Events on the Exam Container
   */
  function bindContainerEvents(container) {
    if (!container) return;

    // Mode Switcher buttons
    container.querySelectorAll('.exam-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        setMode(mode);
      });
    });

    // Reset Quiz button
    const resetBtn = container.querySelector('#examResetQuizBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        resetQuiz();
      });
    }

    // Option items click (in Quiz mode)
    container.querySelectorAll('.exam-option-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-qid');
        const optId = btn.getAttribute('data-option-id');
        selectOption(qId, optId);
      });
    });

    // Submit buttons click
    container.querySelectorAll('.exam-submit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-qid');
        submitAnswer(qId);
      });
    });

    // Toggle Annotations buttons
    container.querySelectorAll('.toggle-ann-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-qid');
        toggleAnnotations(qId);
      });
    });

    // Inspect Image buttons
    container.querySelectorAll('.inspect-img-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-qid');
        openImageInViewer(qId, btn);
      });
    });

    // Image Switcher Tab buttons (for multi-image questions)
    container.querySelectorAll('.exam-img-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = btn.getAttribute('data-qid');
        const idx = parseInt(btn.getAttribute('data-img-idx'), 10);
        if (qId && !isNaN(idx)) {
          switchImageTab(qId, idx);
        }
      });
    });
  }

  return {
    getQuestions,
    getQuestionsCount,
    setMode,
    renderExamSection,
    bindContainerEvents,
    toggleAnnotations,
    submitAnswer,
    resetQuiz,
    openImageInViewer
  };
})();
