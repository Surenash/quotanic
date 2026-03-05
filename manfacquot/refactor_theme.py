import os
import re

# The directories to search
TARGET_DIRS = ['.', './components', './pages', './types']

# Regex replacements definition
# We want to replace hex codes AND rgba definitions with CSS variables
REPLACEMENTS = [
    # 1. Neon Cyan
    (r"#0AF0F0", r"var(--neon-cyan)"),
    (r"10,\s*240,\s*240", r"var(--neon-cyan-rgb)"),
    
    # 2. Neon Magenta
    (r"#F005B4", r"var(--neon-magenta)"),
    (r"240,\s*5,\s*180", r"var(--neon-magenta-rgb)"),
    
    # 3. Neon Orange
    (r"#FF7A00", r"var(--neon-orange)"),
    (r"255,\s*122,\s*0", r"var(--neon-orange-rgb)"),
    
    # 4. Background Deep Space
    (r"#02040a", r"var(--bg-deep-space)"),
    (r"2,\s*4,\s*10", r"var(--bg-deep-space-rgb)"),
    
    # 5. Background Panel
    (r"rgba\(16,\s*24,\s*48,\s*(0\.\d+)\)", r"var(--bg-panel)"), # Using root var directly due to alpha
    
    # 6. Text Primary
    (r"#E0E7FF", r"var(--text-primary)"),
    (r"224,\s*231,\s*255", r"var(--text-primary-rgb)"),
    (r"#FFFFFF", r"var(--text-primary)"),  # Catch stray whites
    
    # 7. Text Secondary
    (r"#94A3B8", r"var(--text-secondary)"),
    (r"148,\s*163,\s*184", r"var(--text-secondary)"),
    
    # 8. Borders
    (r"rgba\(175,\s*200,\s*255,\s*0\.15\)", r"var(--border-color)"),
    (r"rgba\(175,\s*200,\s*255,\s*0\.3\)", r"var(--border-color-strong)"),
    
    # 9. Status Colors
    (r"#10B981", r"var(--status-success)"),
    (r"16,\s*185,\s*129", r"var(--status-success-rgb)"),
    
    (r"#F59E0B", r"var(--status-warning)"),
    (r"245,\s*158,\s*11", r"var(--status-warning-rgb)"),
    
    (r"#EF4444", r"var(--status-error)"),
    (r"239,\s*68,\s*68", r"var(--status-error-rgb)"),
    
    (r"#F87171", r"var(--status-error)"), # Another red variant
    (r"248,\s*113,\s*113", r"var(--status-error-rgb)"),
    
    # Catch stray grey backgrounds
    (r"rgba\(255,\s*255,\s*255,\s*0\.05\)", r"var(--bg-panel)"),
    (r"rgba\(255,\s*255,\s*255,\s*0\.02\)", r"var(--bg-panel)"),
]

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False
        
    original = content
    
    for pattern, replacement in REPLACEMENTS:
        # Ignore case for hex codes
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
        
    if content != original:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error writing {filepath}: {e}")
            return False
    return False

def main():
    modified_count = 0
    for directory in TARGET_DIRS:
        if not os.path.exists(directory):
            continue
            
        for root, _, files in os.walk(directory):
            # Skip node_modules and python venv
            if 'node_modules' in root or 'venv' in root or 'dist' in root:
                continue
                
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    filepath = os.path.join(root, file)
                    if process_file(filepath):
                        print(f"Updated {filepath}")
                        modified_count += 1
                        
    print(f"\nDone! Modified {modified_count} files.")

if __name__ == '__main__':
    main()
