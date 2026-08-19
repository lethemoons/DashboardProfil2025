import os

directory = r'c:\Users\ASUS\Documents\SEMESTER 6\PKL\projekpkl\DashboardProfil2025\src\pages'

search_str = 'else if (tgt.target_direction === \'<\' && val >= tgt.target_value) color = "#9EAF24";'
replace_str = 'else if (tgt.target_direction === \'<\' && val >= tgt.target_value) color = "#9EAF24";\n                      else if (tgt.target_direction === \'=\' && val !== tgt.target_value) color = "#9EAF24";'

search_str2 = 'else if (tgt.target_direction === \'<\' && val >= tgt.target_value) fillColor = "#9EAF24";'
replace_str2 = 'else if (tgt.target_direction === \'<\' && val >= tgt.target_value) fillColor = "#9EAF24";\n                      else if (tgt.target_direction === \'=\' && val !== tgt.target_value) fillColor = "#9EAF24";'

for filename in os.listdir(directory):
    if not filename.endswith('.tsx'): continue
    
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = content.replace(search_str, replace_str)
    content = content.replace(search_str2, replace_str2)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
