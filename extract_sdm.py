import openpyxl
import json

def normalize_kab(name):
    n = str(name).strip()
    if n.startswith('KAB. '):
        return n.replace('KAB. ', '').title()
    elif n.startswith('KOTA '):
        return 'Kota ' + n.replace('KOTA ', '').title()
    return n.title()

wb = openpyxl.load_workbook('data_sdm_kesehatan.xlsx', data_only=True)

def get_row(sheet_name):
    ws = wb[sheet_name]
    res = {}
    
    # Store all rows for each kab
    kab_rows = {}
    
    for row in ws.iter_rows(values_only=True):
        if not row: continue
        kab_val = row[1]
        
        if kab_val and isinstance(kab_val, str) and (kab_val.strip().startswith('KAB.') or kab_val.strip().startswith('KOTA')):
            kab = normalize_kab(kab_val)
            if kab not in kab_rows:
                kab_rows[kab] = []
            kab_rows[kab].append(row)
            
    # Return the last row for each kab
    for kab, rows in kab_rows.items():
        res[kab] = rows[-1]
        
    return res

t13 = get_row('13')
t14 = get_row('14')
t15 = get_row('15')
t16 = get_row('16')
t17 = get_row('17')

final_data = []

for kab in t13.keys():
    r13 = t13.get(kab, [])
    r14 = t14.get(kab, [])
    r15 = t15.get(kab, [])
    r16 = t16.get(kab, [])
    r17 = t17.get(kab, [])
    
    def safe_get(r, idx):
        try:
            if idx < len(r) and r[idx] is not None:
                return float(r[idx])
            return 0
        except:
            return 0
            
    final_data.append({
        'kabupaten': kab,
        'jumlah_dokter': safe_get(r13, 4),
        'jumlah_dokter_spesialis': safe_get(r13, 7),
        'jumlah_dokter_sub_spesialis': safe_get(r13, 10),
        'jumlah_dokter_gigi': safe_get(r13, 16),
        'jumlah_dokter_gigi_spesialis': safe_get(r13, 19),
        'jumlah_dokter_gigi_sub_spesialis': safe_get(r13, 22),
        'jumlah_keperawatan': safe_get(r14, 4),
        'jumlah_tenaga_kebidanan': safe_get(r14, 5),
        'jumlah_tenaga_kesehatan_masyarakat': safe_get(r15, 4),
        'jumlah_tenaga_kesehatan_lingkungan': safe_get(r15, 7),
        'jumlah_tenaga_gizi': safe_get(r15, 10),
        'jumlah_tenaga_kefarmasian': safe_get(r16, 4),
        'jumlah_tenaga_psikologis_klinis': safe_get(r16, 7),
        'jumlah_tenaga_kesehatan_tradisional': safe_get(r16, 10),
        'jumlah_tenaga_tehnik_biomedika': safe_get(r17, 4),
        'jumlah_tenaga_tehnik_keterapian_fisik': safe_get(r17, 7),
        'jumlah_tenaga_keteknisan_medis': safe_get(r17, 10)
    })

with open('src/data/sdm.json', 'w') as f:
    json.dump(final_data, f, indent=2)

print("Extracted kabupatens:", len(final_data))
