import os
import re

directory = r'c:\Users\ASUS\Documents\SEMESTER 6\PKL\projekpkl\DashboardProfil2025\src\pages'

def ensure_cell_import(content):
    if ' Cell' not in content and '{ Cell' not in content:
        content = re.sub(r'(import\s+\{[^}]*)(\}\s+from\s+[\'"]recharts[\'"])', r'\1, Cell \2', content)
    return content

for filename in os.listdir(directory):
    if not filename.endswith('.tsx'): continue
    
    # We only modify specific files that have charts
    if filename not in ['KesehatanAnak.tsx', 'KesehatanIbu.tsx', 'KesehatanKeluarga.tsx', 'KesehatanLingkungan.tsx', 'PD3I.tsx', 'PengendalianPenyakit.tsx', 'PenyakitMenular.tsx', 'PenyakitTidakMenular.tsx', 'TularVektor.tsx', 'UsiaProduktifLansia.tsx']:
        continue
        
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    content = ensure_cell_import(content)

    # Now let's replace <Bar ... fill="#0F8F8B" ... ><LabelList ... /></Bar>
    # We need to find the data array name. Usually it's `chartData`.
    # Let's find <BarChart data={DataVar} ...
    # And then inside it, the <Bar ...>
    
    # We will use regex to find <BarChart data={...} ... > ... </BarChart> and then process inside it
    def process_barchart(match):
        bc = match.group(0)
        data_var_match = re.search(r'<BarChart[^>]+data=\{([a-zA-Z0-9_]+)\}', bc)
        if not data_var_match: return bc
        data_var = data_var_match.group(1)
        
        # Replace <Bar dataKey={dkey} ... fill="#0F8F8B" ... ><LabelList ... /></Bar>
        def process_bar(bar_match):
            bar_full = bar_match.group(0)
            
            # Extract dataKey of the Bar
            dkey_match = re.search(r'dataKey=\{([a-zA-Z0-9_]+)\}', bar_full)
            if not dkey_match:
                # Try string match like dataKey="kasus" (in PenyakitMenular)
                dkey_match = re.search(r'dataKey="([a-zA-Z0-9_]+)"', bar_full)
                if not dkey_match: return bar_full
                dkey = f"'{dkey_match.group(1)}'"
            else:
                dkey = dkey_match.group(1)
                
            # If the bar is already containing a mapping (i.e. we already modified it), skip
            if 'chartData.map' in bar_full or 'map(' in bar_full:
                return bar_full
                
            # Remove fill="#0F8F8B" from the opening <Bar> tag, as we will use Cell
            bar_open = re.search(r'<Bar[^>]+>', bar_full).group(0)
            bar_open_new = re.sub(r'\s*fill="[^"]+"\s*', ' ', bar_open)
            
            # Extract the inner <LabelList ... />
            label_list = re.search(r'<LabelList[^>]+/>', bar_full)
            label_list_str = label_list.group(0) if label_list else ''
            
            # Some specific target extraction logic
            tgt_expr = f"TARGETS[{dkey}]"
            if filename == 'PenyakitMenular.tsx' and dkey == 'indic':
                tgt_expr = f"TARGETS[indic] || (indic === 'tbc_sukses_pct' ? TARGETS['tbc_tsr_pct'] : indic === 'arv_pct' ? TARGETS['odhiv_arv_pct'] : null)"
            if filename == 'PenyakitMenular.tsx' and dkey == "'sukses_pct'":
                tgt_expr = "TARGETS['tbc_tsr_pct']"
            if filename == 'PenyakitMenular.tsx' and dkey == "'pengobatan_lengkap'":
                tgt_expr = "null" # no target
            if filename == 'UsiaProduktifLansia.tsx':
                tgt_expr = "targetConfig"
                
            # If we are in UsiaProduktifLansia, the target might be targetConfig
            
            map_code = f"""
                {{{data_var}.map((entry: any, index: number) => {{
                  const val = entry[{dkey}] as number;
                  let color = "#0F8F8B";
                  const tgt = {tgt_expr};
                  if (tgt && typeof val === 'number') {{
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                  }}
                  return <Cell key={{`cell-${{index}}`}} fill={{color}} />;
                }})}}
"""
            
            # Combine
            return f"{bar_open_new}\n{map_code}\n                {label_list_str}\n              </Bar>"
            
        # Replace all bars in this chart
        bc = re.sub(r'<Bar\b[^>]*>.*?</Bar>', process_bar, bc, flags=re.DOTALL)
        return bc

    content = re.sub(r'<BarChart.*?</BarChart>', process_barchart, content, flags=re.DOTALL)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
