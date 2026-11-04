import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def format_math_expr(raw):
    s = raw.strip()
    # Strip \text{...} wrappers
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    # Strip \mathrm{...}
    s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
    # Replace en-dash / hyphens inside dimensions
    s = s.replace(r'\text{-}', '–').replace(r'\text{–}', '–')
    # Temperature degrees
    s = re.sub(r'\^\\circ\s*F', '°F', s)
    s = re.sub(r'\^\\circ\s*C', '°C', s)
    # Exponents
    s = s.replace(r'kg/m^2', 'kg/m²')
    s = s.replace(r'/m^2', '/m²')
    s = s.replace(r'^2', '²')
    s = s.replace(r'^3', '³')
    s = s.replace(r'\%', '%')
    s = s.replace(r'\_', '_')
    s = s.replace(r'\mu', 'µ')
    s = s.replace(r'\times', '×')
    s = s.replace(r'\pm', '±')
    s = s.replace(r'\ge', '≥')
    s = s.replace(r'\le', '≤')
    s = s.replace(r'\geq', '≥')
    s = s.replace(r'\leq', '≤')
    s = s.replace(r'\sim', '~')
    s = s.replace(r'\approx', '≈')
    # Handle fractions: \frac{a}{b} -> a/b
    s = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'\1/\2', s)
    # Protect HbA_{1c} token before escaping comparison operators
    s = re.sub(r'HbA_\{?1c\}?', '###HBA1C###', s)
    # Escape < and > for HTML safety
    s = s.replace('<', '&lt;').replace('>', '&gt;')
    # Restore styled HbA1c
    s = s.replace('###HBA1C###', 'HbA<sub>1c</sub>')
    # Clean redundant whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    return f'<span class="med-measure" dir="ltr">{s}</span>'

test_cases = [
    r'+2\text{ to }+4\text{ g/d}',
    r'0.08\text{ واحد}',
    r'0.25 \text{ to } 0.5\text{ mL/kg/h}',
    r'1,500\ \mu\text{g}',
    r'HbA_{1c} < 8\%',
    r'< 1\text{–}2\text{ cm}',
    r'BMI > 40\text{ kg/m^2}',
    r'38.5^\circ C',
    r'101.7^\circ F',
    r'\frac{Na - 140}{140}',
    r'\ge 65\text{ mmHg}',
    r'5 \times 10^9/\text{L}',
    r'\pm 2\text{ SD}'
]

for tc in test_cases:
    print(f"INPUT:  ${tc}$")
    print(f"OUTPUT: {format_math_expr(tc)}\n")
