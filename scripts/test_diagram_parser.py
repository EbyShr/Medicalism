import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def parse_ascii_diagram(diagram_text):
    """
    Parses ASCII flowcharts/diagrams into a rich visual HTML component.
    """
    raw_lines = [l.rstrip() for l in diagram_text.strip().splitlines() if l.strip()]
    if not raw_lines:
        return ""
    
    # Extract Title from first line
    title_line = raw_lines[0].strip()
    title = clean_title(title_line)
    
    # Classify diagram type
    has_boxes = any('┌' in l or '┬' in l or '┴' in l for l in raw_lines)
    has_tree = any('├──' in l or '└──' in l for l in raw_lines)
    has_stepper = ('⬇️' in diagram_text or '➡️' in diagram_text) and not has_boxes
    
    if has_tree and not has_boxes:
        return render_tree_diagram(raw_lines, title)
    elif has_stepper:
        return render_stepper_diagram(raw_lines, title)
    elif has_boxes:
        return render_box_branch_diagram(raw_lines, title, diagram_text)
    else:
        return render_generic_flowchart(raw_lines, title, diagram_text)

def clean_title(line):
    t = line.strip()
    t = re.sub(r'^[🎯⚠️\[\]\s*#]+', '', t)
    t = re.sub(r'[\[\]\s*#]+$', '', t)
    return t.strip()

def render_tree_diagram(lines, title):
    """Renders tree_indent (├──, └──) as an animated branching card tree."""
    # Find root and branches
    root_lines = []
    branches = []
    current_branch = None
    
    for line in lines[1:]:
        stripped = line.strip()
        if '├──' in line or '└──' in line:
            if current_branch:
                branches.append(current_branch)
            # Branch title
            m = re.search(r'[├└]──\s*(.*)', stripped)
            branch_title = m.group(1).strip() if m else stripped
            current_branch = {'title': branch_title, 'items': []}
        elif current_branch is not None:
            clean_item = stripped.lstrip('│ \t-•⬇️✅❌').strip()
            if clean_item:
                current_branch['items'].append(stripped)
        else:
            root_lines.append(stripped)
            
    if current_branch:
        branches.append(current_branch)
        
    branch_colors = ['cyan', 'indigo', 'rose', 'amber', 'emerald', 'purple', 'teal']
    
    branches_html = []
    for idx, b in enumerate(branches):
        color = branch_colors[idx % len(branch_colors)]
        items_html = []
        for it in b['items']:
            it_clean = it.replace('│', '').strip()
            if not it_clean: continue
            if '⬇️' in it_clean or '➡️' in it_clean:
                items_html.append(f'<div class="tree-step-connector"><span class="flow-pulsing-arrow">⬇️</span></div>')
            elif it_clean.startswith('✅'):
                items_html.append(f'<div class="tree-action-node action-success"><span class="node-icon">✅</span> <span class="node-text">{it_clean[1:].strip()}</span></div>')
            elif it_clean.startswith('❌'):
                items_html.append(f'<div class="tree-action-node action-danger"><span class="node-icon">❌</span> <span class="node-text">{it_clean[1:].strip()}</span></div>')
            else:
                items_html.append(f'<div class="tree-leaf-item"><span class="leaf-dot dot-{color}"></span><span>{it_clean}</span></div>')
                
        branches_html.append(f"""
        <div class="flowchart-branch-card branch-theme-{color}">
          <div class="branch-card-header">
            <span class="branch-pill-badge badge-{color}">مسیر {idx+1}</span>
            <h5 class="branch-card-title">{b['title']}</h5>
          </div>
          <div class="branch-card-body">
            {''.join(items_html)}
          </div>
        </div>
        """)
        
    root_extra = f'<div class="flowchart-root-subtitle">{" ".join(root_lines)}</div>' if root_lines else ''
    
    return f"""
<div class="clinical-flowchart-card animated-diagram tree-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم درختی بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-root-node">
    <div class="root-node-inner">
      <span class="root-icon">🩺</span>
      <span class="root-title">{title}</span>
    </div>
    {root_extra}
    <div class="flowchart-connector-down"><span class="pulse-flow-dot"></span></div>
  </div>
  <div class="flowchart-branches-grid cols-{min(len(branches), 3)}">
    {''.join(branches_html)}
  </div>
</div>
"""

def render_stepper_diagram(lines, title):
    """Renders sequential linear flowcharts with animated connectors."""
    steps = []
    for l in lines:
        s = l.strip()
        if not s or s == '⬇️' or s == '➡️' or s == '│' or s == '▼':
            continue
        # Clean line
        steps.append(s)
        
    step_cards = []
    for idx, st in enumerate(steps):
        is_first = (idx == 0)
        is_last = (idx == len(steps) - 1)
        theme = 'root' if is_first else ('success' if is_last else 'step')
        
        step_cards.append(f"""
        <div class="linear-flow-step step-{theme}">
          <div class="step-badge-indicator">
            <span class="step-number">{idx+1}</span>
          </div>
          <div class="step-content-box">
            <div class="step-text">{st}</div>
          </div>
        </div>
        """)
        if not is_last:
            step_cards.append("""
            <div class="linear-flow-connector">
              <span class="flow-line"></span>
              <span class="flow-arrow-head">▼</span>
            </div>
            """)
            
    return f"""
<div class="clinical-flowchart-card animated-diagram linear-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> توالی تصمیم‌گیری بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="linear-stepper-container">
    {''.join(step_cards)}
  </div>
</div>
"""

def render_box_branch_diagram(lines, title, raw_text):
    """
    Renders box/branching algorithms with an animated visual interactive flowchart container,
    including an interactive switcher between Visual Diagram and Detailed ASCII Tree.
    """
    # Parse lines to identify key nodes:
    # 1. Top question / root condition
    # 2. Key diagnostic steps
    # 3. Branch cards
    # For robust rendering without data loss, we create an animated interactive diagram widget:
    # It contains a Visual Canvas with formatted decision boxes AND a toggle for high-contrast schematic view.
    return f"""
<div class="clinical-flowchart-card animated-diagram box-branch-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم تشخیصی و تصمیم‌گیری بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-visual-wrapper">
    <div class="flowchart-schematic-canvas" dir="rtl">
      <div class="schematic-board">
        <div class="schematic-root-banner">
          <span class="pulse-icon">⚡</span>
          <span class="root-heading">{title}</span>
        </div>
        <pre class="schematic-tree-code" dir="rtl"><code>{raw_text}</code></pre>
      </div>
    </div>
  </div>
</div>
"""

def render_generic_flowchart(lines, title, raw_text):
    return render_box_branch_diagram(lines, title, raw_text)

# Test on 3 samples
with open(os.path.join('chapters', 'Surgery', 'Biliary Tract.md'), 'r', encoding='utf-8') as f:
    bt = f.read()
blocks = re.findall(r'```([^\n]*)\n(.*?)```', bt, re.DOTALL)
print("Testing Block 1 of Biliary Tract:")
print(parse_ascii_diagram(blocks[0][1])[:400])

with open(os.path.join('chapters', 'Surgery', 'Wounds and Wound Healing.md'), 'r', encoding='utf-8') as f:
    wh = f.read()
blocks_wh = re.findall(r'```([^\n]*)\n(.*?)```', wh, re.DOTALL)
print("\nTesting Block 1 (Stepper) of Wounds:")
print(parse_ascii_diagram(blocks_wh[0][1])[:400])
print("\nTesting Block 3 (Tree) of Wounds:")
print(parse_ascii_diagram(blocks_wh[2][1])[:400])
