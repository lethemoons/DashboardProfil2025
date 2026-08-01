import pandas as pd

df = pd.read_excel('14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx', sheet_name='5')

blocks = [
    (17, "fasilitas_pelayanan_kesehatan_tingkat_pertama_puskesmas"),
    (57, "fasilitas_pelayanan_kesehatan_tingkat_pertama_klink_pratama"),
    (97, "fasilitas_pelayanan_kesehatan_tingkat_pertama_praktik_mandiri_dokter"),
    (137, "fasilitas_pelayanan_kesehatan_tingkat_pertama_praktik_mandiri_dokter_gigi"),
    (177, "fasilitas_pelayanan_kesehatan_tingkat_pertama_praktik_mandiri_bidan"),
    (217, "fasilitas_pelayanan_kesehatan_tingkat_pertama_praktik_mandiri_perawat"),
    (259, "fasilitas_pelayanan_kesehatan_tingkat_lanjut_klinik_utama"),
    (299, "fasilitas_pelayanan_kesehatan_tingkat_lanjut_rs_umum"),
    (339, "fasilitas_pelayanan_kesehatan_tingkat_lanjut_rs_khusus"),
    (379, "fasilitas_pelayanan_kesehatan_tingkat_lanjut_praktik_mandiri_dokter_spesialis")
]

suffixes = [
    "_rawat_jalan_l",
    "_rawat_jalan_p",
    "_rawat_jalan_l_+_p",
    "_rawat_inap_l",
    "_rawat_inap_p",
    "_rawat_inap_l_+_p",
    "_gangguan_jiwa_l",
    "_gangguan_jiwa_p",
    "_gangguan_jiwa_l_+_p"
]

output_lines = []

for start_idx, prefix in blocks:
    for i in range(1, 40):
        row = df.iloc[start_idx + i]
        kab = str(row.iloc[1]).strip()
        if not kab.startswith('KAB.') and not kab.startswith('KOTA'):
            continue
        
        for col_idx in range(9):
            val = row.iloc[col_idx + 2]
            if pd.notnull(val) and str(val).strip() != '' and str(val).strip() != '-':
                try:
                    v_float = float(val)
                    if v_float.is_integer():
                        val_str = str(v_float)
                    else:
                        val_str = str(v_float)
                except ValueError:
                    continue
                
                metric = prefix + suffixes[col_idx]
                line = f"5,,{kab},{metric},{val_str}"
                output_lines.append(line)

with open('table5_new.csv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines) + '\n')

print(f"Generated {len(output_lines)} lines")
