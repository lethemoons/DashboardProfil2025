import pandas as pd
import numpy as np

# Load original CSV lines
with open('kabupaten_all.csv', 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

if lines[-1] == '':
    lines.pop()

# Function to get bounds
def get_bounds(table_no):
    first, last = -1, -1
    for i, line in enumerate(lines):
        if line.startswith(f"{table_no},"):
            if first == -1: first = i
            last = i
    return first, last

# === TABLE 7 ===
# Remove metric "tahun_2025_tabel_6_kolom_e"
new_lines = []
for line in lines:
    if line.startswith('7,'):
        parts = line.split(',')
        if len(parts) >= 4 and parts[3] == 'tahun_2025_tabel_6_kolom_e':
            continue
    new_lines.append(line)
lines = new_lines

# === TABLE 12 ===
t12_first, t12_last = get_bounds(12)
df12 = pd.read_excel('14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx', sheet_name='12')
metrics12 = [
    "puskesmas",
    "jumlah_posyandu_siklus_hidup_aktif",
    "persen_posyandu_siklus_hidup_aktif",
    "jumlah_posyandu_siklus_hidup_tidak_aktif",
    "persen_posyandu_siklus_hidup_tidak_aktif",
    "jumlah_posyandu_siklus_hidup"
]
t12_new = []
for idx, row in df12.iterrows():
    kab = str(row.iloc[1]).strip()
    if kab.startswith('KAB.') or kab.startswith('KOTA'):
        for i in range(6):
            val = row.iloc[i + 2]
            if pd.notnull(val) and str(val).strip() != '' and str(val).strip() != '-':
                try:
                    v_float = float(val)
                    val_str = str(v_float)
                    t12_new.append(f"12,,{kab},{metrics12[i]},{val_str}")
                except ValueError:
                    pass

# Splice T12
lines = lines[:t12_first] + t12_new + lines[t12_last + 1:]

# === TABLE 13 ===
t13_first, t13_last = get_bounds(13)
df13 = pd.read_excel('14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx', sheet_name='13')
metrics13 = [
    "dokter_l",
    "dokter_p",
    "dokter_l_+_p",
    "dokter_spesialis_l",
    "dokter_spesialis_p",
    "dokter_spesialis_l_+_p",
    "dokter_sub_spesialis_l",
    "dokter_sub_spesialis_p",
    "dokter_sub_spesialis_l_+_p"
]

# Accumulate sums
sums = {}
for idx, row in df13.iterrows():
    kab = str(row.iloc[1]).strip()
    # Normalize naming if needed
    if kab.startswith('KOTA') and not kab.startswith('KOTA '):
        kab = 'KOTA ' + kab[4:].strip()
        
    if kab.startswith('KAB.') or kab.startswith('KOTA'):
        if kab not in sums:
            sums[kab] = [0.0] * 9
        for i in range(9):
            val = row.iloc[i + 2]
            if pd.notnull(val) and str(val).strip() != '' and str(val).strip() != '-':
                try:
                    sums[kab][i] += float(val)
                except ValueError:
                    pass

t13_new = []
for kab in sums:
    for i in range(9):
        t13_new.append(f"13,,{kab},{metrics13[i]},{sums[kab][i]}")

# Splice T13
lines = lines[:t13_first] + t13_new + lines[t13_last + 1:]

# Write back
with open('kabupaten_all.csv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print("Update complete!")
print(f"Table 12 rows generated: {len(t12_new)}")
print(f"Table 13 rows generated: {len(t13_new)}")
