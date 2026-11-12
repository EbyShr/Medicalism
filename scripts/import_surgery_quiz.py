#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Medical Study WebApp - General Surgery (Lawrence) Quiz Importer & Registry Builder
==================================================================================
Parses Markdown (.md) Question Bank files for General Surgery (Lawrence) with 100%
verbatim data fidelity, binds distractor analyses to options, performs smart option
shuffling (balancing correct answers across A, B, C, D), and updates the quiz registry
and quiz.html automatically.

Usage:
    python scripts/import_surgery_quiz.py [optional_path_to_md_file_or_dir] [--no-shuffle]
"""

import os
import sys
import re
import json
import random
from collections import Counter

# Ensure UTF-8 output in Windows PowerShell / terminal
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_QUIZZES_DIR = os.path.join(BASE_DIR, "data", "quizzes")
SURGERY_QUIZZES_MD_DIR = os.path.join(BASE_DIR, "data", "surgery_quizzes")
QUIZ_REGISTRY_JS_PATH = os.path.join(BASE_DIR, "js", "data", "quiz-registry.js")
QUIZ_HTML_PATH = os.path.join(BASE_DIR, "quiz.html")
SURGERY_MANIFEST_PATH = os.path.join(DATA_QUIZZES_DIR, "surgery_manifest.json")

# Map Persian digits to English digits
PERSIAN_DIGITS_TABLE = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")

def to_english_digits(text: str) -> str:
    return text.translate(PERSIAN_DIGITS_TABLE)

# Chapter metadata overrides for clean display titles in Course View
KNOWN_CHAPTER_METADATA = {
    "abdominal_wall_and_hernia": {
        "id": "surgery-ch10-hernia",
        "title": "فصل ۱۰: فتق‌های جدار شکم و کشاله ران (Abdominal Wall, Including Hernia)",
        "shortTitle": "جدار شکم و فتق‌ها",
        "description": "مجموعه ۲۶ سوال تحلیلی فتق‌های اینگوئینال، فمورال، نافی، اشپیگل، ریشتر و عوارض پس از عمل (سروما، ارکیت ایسکمیک، فتق مختنق) بر اساس کتاب لارنس.",
        "estimatedMinutes": 30
    },
    "biliary_tract_and_gallbladder": {
        "id": "surgery-ch15-biliary",
        "title": "فصل ۱۵: کیسه صفرا و مجاری صفراوی (Biliary Tract & Gallbladder)",
        "shortTitle": "کیسه صفرا و مجاری صفراوی",
        "description": "مجموعه ۱۹ سوال تحلیلی کولهسیستیت حاد و بدون سنگ، کلانژیت حاد، پانکراتیت صفراوی، کلدوکولیتیازیس، کولهسیستوستومی، اسکن HIDA و سنگ‌های صفراوی بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "fluid_and_electrolytes": {
        "id": "surgery-ch02-fluids",
        "title": "فصل ۲: آب، الکترولیت و تعادل اسید و باز (Fluid & Electrolyte Management)",
        "shortTitle": "مایعات و الکترولیت‌ها",
        "description": "مجموعه ۱۷ سوال تحلیلی اختلالات سدیم، پتاسیم، منیزیم، کلسیم، تعادل اسید و باز، مایع‌درمانی و پایش تهویه‌ای بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "liver_and_spleen": {
        "id": "surgery-ch19-liver-spleen",
        "title": "فصل ۱۹: کبد و طحال (Liver & Spleen)",
        "shortTitle": "کبد و طحال",
        "description": "مجموعه ۲۰ سوال تحلیلی کیست هیداتید، آبسه آمیبی و پیوژنیک کبد، واریس مری و پورتال هایپرتنشن، آدنوم کبدی، عوارض اسپلنکتومی، OPSI، آبسه و کیست‌های طحال و آنمی‌های همولیتیک بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "pancreas": {
        "id": "surgery-ch16-pancreas",
        "title": "فصل ۱۶: پانکراس (Pancreas)",
        "shortTitle": "پانکراس",
        "description": "مجموعه ۲۹ سوال تحلیلی پانکراتیت حاد و مزمن، نکروز و سودوکیست، سرطان پانکراس، عمل ویپل، تومورهای نورواندوکرین (انسولینوما، گاسترینوما) و معیارهای رانسون بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    },
    "perioperative_care": {
        "id": "surgery-ch01-periop",
        "title": "فصل ۱: مراقبت‌ها و عوارض قبل و بعد از عمل (Perioperative Care)",
        "shortTitle": "مراقبت‌های قبل و بعد از عمل",
        "description": "مجموعه ۲۶ سوال تحلیلی ارزیابی آزمایشگاهی قبل از عمل، تنظیم داروها (کورتون، دیابت، دیورتیک‌ها)، عوارض ریوی و آتلکتازی، نارسایی حاد کلیه (AKI)، کاتترهای ورید مرکزی (CVC)، فیستول تراکئواینومینیت و جراحی در بارداری بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    },
    "shock_and_resuscitation": {
        "id": "surgery-ch04-shock",
        "title": "فصل ۴: شوک، ارزیابی همودینامیک و احیا (Shock & Resuscitation)",
        "shortTitle": "شوک و احیا",
        "description": "مجموعه ۲۱ سوال تحلیلی شوک هیپوولمیک و کلاس‌های خونریزی، شوک سپتیک و بحران آدرنال، وازوپرسورها و اینوتروپ‌ها، شوک کاردیوژنیک و نوروژنیک، پایش همودینامیک، پاکسازی لاکتات و ارزیابی پاسخ به مایع بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "stomach_and_duodenum": {
        "id": "surgery-ch12-stomach",
        "title": "فصل ۱۲: معده و دوازدهه (Stomach & Duodenum)",
        "shortTitle": "معده و دوازدهه",
        "description": "مجموعه ۴۱ سوال تحلیلی آناتومی و خونرسانی معده، بیماری اولسر پپتیک و عوارض (خونریزی، پرفوراسیون، تنگی پیلور)، آدنوکارسینوم معده و مرحله‌بندی، تومورهای GIST و ایماتینیب، لنفوم‌های معده (MALT و DLBCL)، سندرم‌های دامپینگ و عوارض پس از گاسترکتومی بر اساس رفرنس لارنس.",
        "estimatedMinutes": 45
    },
    "wound_healing_and_trauma": {
        "id": "surgery-ch05-wound-trauma",
        "title": "فصل ۵: ترمیم زخم، پیوند پوست و تروما (Wound Healing & Trauma)",
        "shortTitle": "ترمیم زخم و تروما",
        "description": "مجموعه ۲۳ سوال تحلیلی فازهای التیام زخم، استحکام کششی، پیوند پوست (Imbibition و گرافت‌های STSG/FTSG)، کلوئید و اسکار هایپرتروفیک، ترومای نافذ و بلانت گردن، توراکس، شکم، تامپوناد قلبی، ترومای آئورت و فاشیوتومی بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    },
    "vascular_and_oncology": {
        "id": "surgery-ch24-vascular-oncology",
        "title": "فصل ۲۴: بیماری‌های عروق و انکولوژی جراحی (Vascular Disease & Surgical Oncology)",
        "shortTitle": "بیماری‌های عروق و انکولوژی",
        "description": "مجموعه ۱۷ سوال تحلیلی سارکوم‌های بافت نرم و اصول بیوپسی، کوآرکتاسیون آئورت، ایسکمی حاد و مزمن شریانی، زخم‌های دیابتی، تنگی شریان کاروتید و مطالعه NASCET، امبولکتومی و تومورهای پوستی (BCC و ملانوم) بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "surgical_bleeding_and_transfusion": {
        "id": "surgery-ch03-bleeding",
        "title": "فصل ۳: خونریزی جراحی، انتقال خون و انعقاد (Surgical Bleeding & Transfusion)",
        "shortTitle": "خونریزی جراحی و ترانسفوزیون",
        "description": "مجموعه ۱۲ سوال تحلیلی عوارض انتقال خون (TRALI و TACO)، ارزیابی هموستاز و اختلالات پلاکت، هموفیلی و داروها بر اساس رفرنس لارنس.",
        "estimatedMinutes": 20
    },
    "esophagus": {
        "id": "surgery-ch11-esophagus",
        "title": "فصل ۱۱: بیماری‌های مری و فتق هیاتال (Esophagus & Hiatal Hernia)",
        "shortTitle": "مری و فتق هیاتال",
        "description": "مجموعه ۲۲ سوال تحلیلی آشالازی، دیسفاژی، ریفلاکس گاستروازوفاژیال (GERD)، فتق پاراازوفاژیال، پرفوراسیون مری، سندرم بورهاو و بدخیمی‌های مری بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    },
    "small_intestine": {
        "id": "surgery-ch13-small-intestine",
        "title": "فصل ۱۳: روده باریک (Small Intestine)",
        "shortTitle": "روده باریک",
        "description": "مجموعه ۱۹ سوال تحلیلی انسداد روده باریک، ایسکمی مزانتریک حاد و مزمن، بیماری کرون، نئوپلاسم‌های روده باریک (کارسینوئید و لنفوم)، سندرم روده کوتاه و فیستول‌های انتروکوتانئوس بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "burns": {
        "id": "surgery-ch06-burns",
        "title": "فصل ۶: سوختگی‌ها و آسیب‌های حرارتی (Burns & Thermal Injury)",
        "shortTitle": "سوختگی‌ها",
        "description": "مجموعه ۱۷ سوال تحلیلی فرمول پارک‌لند، مدیریت راه هوایی در آسیب استنشاقی، احیای مایعات، اسکاروتومی و سندرم کمپارتمان، مراقبت موضعی و پیوند در سوختگی بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "surgical_endocrinology": {
        "id": "surgery-ch18-endocrinology",
        "title": "فصل ۱۸: بیماری‌های جراحی غدد درون‌ریز (Surgical Endocrinology)",
        "shortTitle": "جراحی غدد درون‌ریز",
        "description": "مجموعه ۳۲ سوال تحلیلی بیماری‌های تیروئید و کانسر تیروئید، نئوپلازی‌های پاراتیروئید و هایپرپاراتیروئیدیسم اولیه و ثانویه، تومورهای آدرنال و سندرم‌های MEN بر اساس رفرنس لارنس.",
        "estimatedMinutes": 35
    },
    "surgical_infections": {
        "id": "surgery-ch06-infections",
        "title": "فصل ۶: عفونت‌های جراحی و آنتی‌بیوتیک‌ها (Surgical Infections)",
        "shortTitle": "عفونت‌های جراحی",
        "description": "مجموعه ۱۷ سوال تحلیلی طبقه‌بندی زخم‌ها، آنتی‌بیوتیک پروفیلاکسی، عفونت‌های نکروزان بافت نرم (NSTI)، گانگرن فورنیه، پریتونیت حاد و کاتتر دیالیز، کزاز و مارکرهای سپسیس بر اساس رفرنس لارنس.",
        "estimatedMinutes": 25
    },
    "neurosurgery": {
        "id": "surgery-ch28-neurosurgery",
        "title": "فصل ۲۸: جراحی مغز، اعصاب و ستون فقرات (Neurosurgery)",
        "shortTitle": "جراحی مغز و اعصاب",
        "description": "مجموعه ۴۷ سوال تحلیلی ترومای سر و مغز (EDH, SDH, کانتوژن)، تروما و آسیب‌های نخاعی، شکستگی‌های ستون فقرات (جفرسون، دنس، جلاد، شانس)، بیماری‌های دژنراتیو دیسک و تنگی کانال، تومورها و بیماری‌های عروقی مغز بر اساس رفرنس لارنس.",
        "estimatedMinutes": 50
    },
    "trauma": {
        "id": "surgery-ch14-trauma",
        "title": "فصل ۱۴: ترومای قفسه سینه، شکم، لگن و گردن (Thoracoabdominal, Pelvic & Neck Trauma)",
        "shortTitle": "ترومای توراکوآبدومینال و گردن",
        "description": "مجموعه ۲۶ سوال تحلیلی هموتوراکس حجیم و توراکوتومی اورژانس، ترومای نافذ گردن و زون‌های سه‌گانه، شکستگی‌های لگن و آنژیوامبولیزاسیون، آسیب دیافراگم، قفسه سینه مواج (Flail Chest)، ترومای نافذ شکم و فلانک بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    },
    "thoracoabdominal_trauma": {
        "id": "surgery-ch14-trauma",
        "title": "فصل ۱۴: ترومای قفسه سینه، شکم، لگن و گردن (Thoracoabdominal, Pelvic & Neck Trauma)",
        "shortTitle": "ترومای توراکوآبدومینال و گردن",
        "description": "مجموعه ۲۶ سوال تحلیلی هموتوراکس حجیم و توراکوتومی اورژانس، ترومای نافذ گردن و زون‌های سه‌گانه، شکستگی‌های لگن و آنژیوامبولیزاسیون، آسیب دیافراگم، قفسه سینه مواج (Flail Chest)، ترومای نافذ شکم و فلانک بر اساس رفرنس لارنس.",
        "estimatedMinutes": 30
    }
}

def clean_ai_intro_outro(text: str) -> str:
    """Strip any conversational preamble before the first question header."""
    first_q_match = re.search(r'(?m)^##\s*سوال\s*[\d۰-۹]+', text)
    if first_q_match:
        return text[first_q_match.start():]
    return text

def parse_markdown_quiz(md_content: str, chapter_slug: str, shuffle_options: bool = True) -> list:
    """
    Parses questions from Markdown verbatim.
    Binds each option's explanation from Section 2 directly to its option object.
    Optionally shuffles options to achieve a balanced distribution across A, B, C, D.
    """
    cleaned = clean_ai_intro_outro(md_content)
    
    # Split by ## سوال <digits>
    pattern = r'(?m)^##\s*سوال\s*([\d۰-۹]+)\s*\n([\s\S]*?)(?=(?:^##\s*سوال\s*[\d۰-۹]+|\Z))'
    matches = list(re.finditer(pattern, cleaned))
    
    if not matches:
        raise ValueError("هیچ سوالی با الگوی '## سوال X' در فایل یافت نشد.")

    parsed_questions = []
    
    # Pre-calculate balanced target slots if shuffling
    # We cycle through a balanced permutation so correct answers are evenly distributed
    balanced_slots = ['B', 'D', 'A', 'C']

    for q_idx, m in enumerate(matches, 1):
        raw_num = m.group(1)
        body = m.group(2).strip()

        # 1. Metadata (مبحث و منبع)
        topic_m = re.search(r'\*\*مبحث:\*\*\s*(.*)', body)
        topic = topic_m.group(1).strip() if topic_m else "جراحی جنرال لارنس"

        source_m = re.search(r'\*\*منبع:\*\*\s*(.*)', body)
        source = source_m.group(1).strip() if source_m else ""

        # 2. Question Stem (صورت سوال)
        stem_m = re.search(r'\*\*صورت سوال:\*\*\s*\n([\s\S]*?)(?=\*\*گزینه‌ها:\*\*)', body)
        if not stem_m:
            raise ValueError(f"صورت سوال در سوال شماره {raw_num} یافت نشد.")
        stem = stem_m.group(1).strip()

        # 3. Correct Answer Key
        ans_m = re.search(r'\*\*پاسخ صحیح:\*\*\s*([A-DА-Яa-d])(.*)', body)
        if not ans_m:
            raise ValueError(f"کلید پاسخ صحیح در سوال شماره {raw_num} یافت نشد.")
        orig_correct_key = ans_m.group(1).upper()
        correct_extra_note = ans_m.group(2).strip()

        # 4. Options
        opts_section_m = re.search(r'\*\*گزینه‌ها:\*\*([\s\S]*?)(?=\*\*پاسخ صحیح:\*\*)', body)
        if not opts_section_m:
            raise ValueError(f"بخش گزینه‌ها در سوال شماره {raw_num} یافت نشد.")
        
        opts_text = opts_section_m.group(1)
        # Matches: - **A)** <text> or - **A):** <text> or - **A:** <text> or - A) <text>
        opt_matches = re.findall(
            r'-\s*(?:\*\*)?([A-D])\)?(?:\*\*)?(?::|\))?\s*([\s\S]*?)(?=(?:-\s*(?:\*\*)?[A-D]\)?(?:\*\*)?(?::|\))?|\Z))', 
            opts_text
        )
        if len(opt_matches) != 4:
            # Fallback regex for other bullet formats
            opt_matches = re.findall(
                r'-\s*\*\*([A-D])\)\*\*?\s*([\s\S]*?)(?=(?:-\s*\*\*[A-D]\)|\Z))', 
                opts_text
            )
        
        if len(opt_matches) != 4:
            raise ValueError(f"سوال {raw_num}: انتظار ۴ گزینه می‌رفت اما {len(opt_matches)} گزینه استخراج شد.")

        orig_options_dict = {k.upper(): re.sub(r'^\*+\s*', '', v).strip() for k, v in opt_matches}

        # 5. Explanations (3 sections)
        # Section 1: Rationale
        sec1_m = re.search(r'#### ۱\.\s*تحلیل پاسخ صحیح[^\n]*\n([\s\S]*?)(?=#### ۲\.|\Z)', body)
        rationale = sec1_m.group(1).strip() if sec1_m else ""
        if correct_extra_note and correct_extra_note not in rationale:
            rationale = f"{correct_extra_note}\n\n{rationale}" if rationale else correct_extra_note

        # Section 2: Distractor Analysis
        sec2_m = re.search(r'#### ۲\.\s*کالبدشکافی سایر گزینه‌ها[^\n]*\n([\s\S]*?)(?=#### ۳\.|\Z)', body)
        sec2_text = sec2_m.group(1).strip() if sec2_m else ""
        distractor_matches = re.findall(
            r'-\s*\*\*بررسی گزینه\s*([A-D]):\*\*\s*([\s\S]*?)(?=(?:-\s*\*\*بررسی گزینه\s*[A-D]:|\Z))', 
            sec2_text
        )
        
        orig_distractors_dict = {}
        for d_key, d_text in distractor_matches:
            orig_distractors_dict[d_key.upper()] = d_text.strip()

        # Section 3: Lawrence Mini-Lesson
        sec3_m = re.search(r'#### ۳\.\s*درسنامه مکمل لارنس[^\n]*\n([\s\S]*?)(?=---\s*$|\Z)', body)
        mini_lesson = sec3_m.group(1).strip() if sec3_m else ""

        # 6. Bind Option to its Explanation
        # Each option knows its original key, text, explanation, and whether it's correct
        bound_options = []
        for key in ['A', 'B', 'C', 'D']:
            bound_options.append({
                "orig_key": key,
                "text": orig_options_dict[key],
                "explanation": orig_distractors_dict.get(key, ""),
                "is_correct": (key == orig_correct_key)
            })

        # 7. Shuffling / Re-mapping
        keys = ['A', 'B', 'C', 'D']
        orig_to_new = {}
        final_correct_key = orig_correct_key
        final_options = []

        if shuffle_options:
            # Deterministic balanced shuffle:
            # Place the correct option at target_key
            target_key = balanced_slots[(q_idx - 1) % len(balanced_slots)]
            remaining_keys = [k for k in keys if k != target_key]
            
            # Use deterministic seed for remaining 3 options
            rng = random.Random(f"{chapter_slug}_{q_idx}")
            other_options = [opt for opt in bound_options if not opt["is_correct"]]
            rng.shuffle(other_options)
            
            # Map correct option to target_key
            correct_opt = next(opt for opt in bound_options if opt["is_correct"])
            orig_to_new[correct_opt["orig_key"]] = target_key
            
            # Map other 3 options
            for k, opt in zip(remaining_keys, other_options):
                orig_to_new[opt["orig_key"]] = k
            
            final_correct_key = target_key

            # Construct new ordered options A, B, C, D
            for k in keys:
                # Find which option mapped to k
                orig_k = [orig for orig, mapped in orig_to_new.items() if mapped == k][0]
                matched_opt = next(opt for opt in bound_options if opt["orig_key"] == orig_k)
                
                # Remap any internal mention of 'گزینه X' in explanation to match new letters
                cleaned_exp = remap_option_letters(matched_opt["explanation"], orig_to_new)
                
                final_options.append({
                    "key": k,
                    "text": matched_opt["text"],
                    "original_key": matched_opt["orig_key"],
                    "is_correct": matched_opt["is_correct"],
                    "explanation": cleaned_exp
                })

            # Also remap any option references inside rationale
            final_rationale = remap_option_letters(rationale, orig_to_new)
        else:
            for opt in bound_options:
                final_options.append({
                    "key": opt["orig_key"],
                    "text": opt["text"],
                    "original_key": opt["orig_key"],
                    "is_correct": opt["is_correct"],
                    "explanation": opt["explanation"]
                })
            final_rationale = rationale

        # 8. Build Distractors Correction list (for backwards compatibility)
        distractors_correction = []
        for opt in final_options:
            if not opt["is_correct"]:
                distractors_correction.append({
                    "option": opt["key"],
                    "key": opt["key"],
                    "why_incorrect": opt["explanation"],
                    "original_key": opt.get("original_key", opt["key"])
                })

        parsed_questions.append({
            "id": q_idx,
            "topic": topic,
            "source": source,
            "stem": stem,
            "options": final_options,
            "correct_answer": final_correct_key,
            "detailed_explanation": {
                "rationale": final_rationale,
                "distractors_correction": distractors_correction,
                "mini_lesson": mini_lesson,
                "lawrence_lesson": mini_lesson
            }
        })

    return parsed_questions

def remap_option_letters(text: str, orig_to_new: dict) -> str:
    """Remap occurrences of 'گزینه [A-D]' simultaneously without cascaded collision."""
    if not text or not orig_to_new:
        return text
    
    def repl(match):
        letter = match.group(1).upper()
        return f"گزینه {orig_to_new.get(letter, letter)}"
    
    return re.sub(r'گزینه\s*([A-Da-d])\b', repl, text)

def export_chapter_quiz_files(chapter_slug: str, questions: list) -> tuple:
    """Generates the JS data file and JSON data file for the chapter."""
    os.makedirs(DATA_QUIZZES_DIR, exist_ok=True)
    
    var_name = f"SURGERY_{chapter_slug.upper()}_DATA"
    js_filename = f"surgery_{chapter_slug}_data.js"
    json_filename = f"surgery_{chapter_slug}_quiz.json"
    
    js_path = os.path.join(DATA_QUIZZES_DIR, js_filename)
    json_path = os.path.join(DATA_QUIZZES_DIR, json_filename)
    
    # 1. JSON file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
        
    # 2. JS file (assigns to window.<VAR>)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"window.{var_name} = ")
        json.dump(questions, f, ensure_ascii=False, indent=2)
        f.write(";\n")
        
    print(f"  -> Generated: {js_filename} ({len(questions)} questions)")
    print(f"  -> Generated: {json_filename}")
    return js_path, json_path

def update_surgery_manifest(chapter_slug: str, questions: list) -> dict:
    """Updates the central surgery manifest with metadata."""
    manifest = {}
    if os.path.exists(SURGERY_MANIFEST_PATH):
        try:
            with open(SURGERY_MANIFEST_PATH, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}

    meta = KNOWN_CHAPTER_METADATA.get(chapter_slug, {
        "id": f"surgery-{chapter_slug.replace('_', '-')}",
        "title": f"مبحث: {chapter_slug.replace('_', ' ').title()}",
        "shortTitle": chapter_slug.replace('_', ' ').title(),
        "description": f"مجموعه سوالات جامع {chapter_slug.replace('_', ' ')} بر اساس کتاب جراحی لارنس.",
        "estimatedMinutes": max(15, len(questions))
    })

    manifest[chapter_slug] = {
        "id": meta["id"],
        "slug": chapter_slug,
        "title": meta["title"],
        "shortTitle": meta["shortTitle"],
        "badge": f"{len(questions)} سوال",
        "totalQuestions": len(questions),
        "estimatedMinutes": meta["estimatedMinutes"],
        "fileUrl": f"./data/quizzes/surgery_{chapter_slug}_quiz.json",
        "varName": f"SURGERY_{chapter_slug.upper()}_DATA",
        "description": meta["description"]
    }

    with open(SURGERY_MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    return manifest

def update_quiz_registry_js(manifest: dict):
    """
    Ensures js/data/quiz-registry.js has the 'surgery' course with all chapters registered.
    """
    if not os.path.exists(QUIZ_REGISTRY_JS_PATH):
        print(f"Warning: {QUIZ_REGISTRY_JS_PATH} not found.")
        return

    with open(QUIZ_REGISTRY_JS_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build the surgery chapters array
    total_q = sum(item["totalQuestions"] for item in manifest.values())
    
    surgery_chapters_js = [
        f"""        {{
          id: 'surgery-all',
          title: 'همه مباحث (آزمون جامع جراحی جنرال لارنس)',
          shortTitle: 'آزمون جامع جراحی',
          badge: '{total_q} سوال',
          totalQuestions: {total_q},
          estimatedMinutes: {max(30, total_q)},
          isAll: true
        }}"""
    ]

    for item in manifest.values():
        surgery_chapters_js.append(f"""        {{
          id: '{item["id"]}',
          title: '{item["title"]}',
          shortTitle: '{item["shortTitle"]}',
          badge: '{item["badge"]}',
          totalQuestions: {item["totalQuestions"]},
          estimatedMinutes: {item["estimatedMinutes"]},
          fileUrl: '{item["fileUrl"]}',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.{item["varName"]})) ? window.{item["varName"]} : [],
          description: '{item["description"]}'
        }}""")

    chapters_str = ',\n'.join(surgery_chapters_js)
    surgery_course_block = f"""    {{
      id: 'surgery',
      title: 'بانک جامع سوالات جراحی جنرال (رفرنس لارنس)',
      shortTitle: 'جراحی جنرال (لارنس)',
      category: 'جراحی جنرال لارنس',
      categoryColor: '#e11d48',
      description: 'بانک آزمون و تست‌های تحلیلی جراحی عمومی بر اساس رفرنس معتبر لارنس (Lawrence Essentials of General Surgery)؛ شامل تشریح گزینه‌ها، کالبدشکافی دام‌های تستی و درسنامه جامع بالینی.',
      chapters: [
{chapters_str}
      ]
    }}"""

    # Check if 'surgery' course already exists in INITIAL_QUIZZES
    surgery_pattern = r"({\s*id:\s*['\"]surgery['\"][\s\S]*?\n    })"
    if re.search(surgery_pattern, content):
        content = re.sub(surgery_pattern, surgery_course_block.strip(), content, count=1)
        print("  -> Updated existing 'surgery' course in quiz-registry.js")
    else:
        # Insert before the closing of INITIAL_QUIZZES
        initial_quizzes_end = re.search(r"(\n  \];\s*\n\s*class QuizRegistryService)", content)
        if initial_quizzes_end:
            idx = initial_quizzes_end.start(1)
            content = content[:idx] + ",\n" + surgery_course_block + content[idx:]
            print("  -> Injected 'surgery' course into INITIAL_QUIZZES in quiz-registry.js")
        else:
            print("  -> Warning: Could not find INITIAL_QUIZZES closing bracket in quiz-registry.js")

    # Also make sure loadQuestions supports any course with '-all'
    if "quizId === 'ncd-all' || quizId === 'ncd'" in content:
        improved_load = """      // 1. Combined all questions for a course (e.g. 'ncd-all', 'surgery-all')
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
      }"""
        content = re.sub(
            r"\/\/\s*1\.\s*Combined all questions for a course[\s\S]*?this\.questionsCache\.set\('ncd-all', combined\);\s*return combined;\s*\}\s*\}\s*\}",
            improved_load,
            content
        )
        print("  -> Upgraded loadQuestions() to dynamically handle all courses in quiz-registry.js")

    with open(QUIZ_REGISTRY_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(content)

def update_quiz_html(manifest: dict):
    """
    Ensures quiz.html includes script tags for all surgery quiz data files.
    """
    if not os.path.exists(QUIZ_HTML_PATH):
        print(f"Warning: {QUIZ_HTML_PATH} not found.")
        return

    with open(QUIZ_HTML_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the scripts section before quiz-registry.js
    registry_script_match = re.search(r'<script\s+src=["\']\.\/js\/data\/quiz-registry\.js["\']><\/script>', html)
    if not registry_script_match:
        print("Warning: Could not find quiz-registry.js script tag in quiz.html.")
        return

    insert_pos = registry_script_match.start()
    
    needed_scripts = []
    for item in manifest.values():
        script_tag = f'  <script src="./data/quizzes/surgery_{item["slug"]}_data.js"></script>'
        if script_tag not in html and f'surgery_{item["slug"]}_data.js' not in html:
            needed_scripts.append(script_tag)

    if needed_scripts:
        new_scripts_str = "\n".join(needed_scripts) + "\n"
        html = html[:insert_pos] + new_scripts_str + html[insert_pos:]
        with open(QUIZ_HTML_PATH, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"  -> Added {len(needed_scripts)} script tag(s) to quiz.html")
    else:
        print("  -> Script tags already present in quiz.html")

def process_file(md_path: str, shuffle_options: bool = True):
    """Process a single markdown quiz file."""
    filename = os.path.basename(md_path)
    slug = os.path.splitext(filename)[0].lower().replace(" ", "_").replace("-", "_")
    
    print(f"\n==================================================================")
    print(f"Processing Surgery Quiz File: {filename} (slug: {slug})")
    print(f"==================================================================")

    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = parse_markdown_quiz(content, chapter_slug=slug, shuffle_options=shuffle_options)
    print(f"  -> Successfully parsed {len(questions)} questions 100% verbatim!")
    
    # Check answer distribution
    ans_counts = Counter(q["correct_answer"] for q in questions)
    print(f"  -> Shuffled Correct Answer Distribution: {dict(ans_counts)}")
    
    # Export JS and JSON data files
    export_chapter_quiz_files(slug, questions)
    
    # Update manifest, registry, and quiz.html
    manifest = update_surgery_manifest(slug, questions)
    update_quiz_registry_js(manifest)
    update_quiz_html(manifest)
    
    print(f"Done processing {filename}!")
    return questions

def main():
    target_path = None
    shuffle = True

    args = sys.argv[1:]
    for arg in args:
        if arg == '--no-shuffle':
            shuffle = False
        elif not arg.startswith('--'):
            target_path = arg

    if target_path and os.path.isfile(target_path):
        process_file(target_path, shuffle_options=shuffle)
    elif target_path and os.path.isdir(target_path):
        for f in sorted(os.listdir(target_path)):
            if f.endswith('.md'):
                process_file(os.path.join(target_path, f), shuffle_options=shuffle)
    else:
        # Default: process all files in data/surgery_quizzes/
        if os.path.exists(SURGERY_QUIZZES_MD_DIR):
            md_files = [f for f in sorted(os.listdir(SURGERY_QUIZZES_MD_DIR)) if f.endswith('.md')]
            if md_files:
                for f in md_files:
                    process_file(os.path.join(SURGERY_QUIZZES_MD_DIR, f), shuffle_options=shuffle)
            else:
                print(f"No .md files found in {SURGERY_QUIZZES_MD_DIR}")
        else:
            print(f"Directory {SURGERY_QUIZZES_MD_DIR} does not exist.")

if __name__ == '__main__':
    main()
