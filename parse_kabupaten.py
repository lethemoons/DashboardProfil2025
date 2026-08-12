import pandas as pd
import openpyxl
from pathlib import Path
import re
import math

XLSX = Path(__file__).resolve().parent.parent / "14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx"
OUT_DIR = Path(__file__).resolve().parent.parent / "kabupaten"

PROVINCE_ONLY = {2, 3, 4, 9, 10, 19, 21, 34, 62}

def clean_col_name(name):
    name = str(name).strip()
    try:
        n = float(name)
        if n == int(n):
            name = str(int(n))
    except ValueError:
        pass
    name = name.lower()
    name = re.sub(r'[^\w\s\+/]', '', name)
    name = re.sub(r'[\s/]+', '_', name)
    name = re.sub(r'_+', '_', name)
    return name.strip('_')

def is_column_number_row(row):
    vals = [v for v in row if v is not None and str(v).strip()]
    if not vals:
        return False
    if not all(isinstance(v, (int, float)) for v in vals):
        return False
    ints = [int(v) for v in vals]
    if ints == list(range(1, len(ints) + 1)):
        return True
    return False

def has_text(row):
    return any(v is not None and not isinstance(v, (int, float)) for v in row)

def merge_headers(header_rows):
    ncols = max(len(r) for r in header_rows)
    filled = []
    for row in header_rows:
        r = list(row) + [None] * (ncols - len(row))
        last = None
        for i in range(ncols):
            v = r[i]
            if v is not None and str(v).strip() and str(v).strip() != 'nan':
                last = str(v).strip()
            else:
                r[i] = last
        filled.append(r)

    col_names = []
    for col in range(ncols):
        parts = [str(filled[r][col]).strip() for r in range(len(filled))
                 if filled[r][col] is not None and str(filled[r][col]).strip() != 'nan']
        col_names.append(clean_col_name(' '.join(parts)) if parts else f'col_{col}')
    return col_names

def safe_val(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        if math.isnan(v) or math.isinf(v):
            return None
        return v
    s = str(v).strip()
    if s in ('#DIV/0!', '-', '', 'nan'):
        return None
    if s.upper() in ('#VALUE!', '#REF!', '#N/A'):
        return None
    return s

KAB_RE = re.compile(r'^(KAB\.\s*|KOTA\s)', re.IGNORECASE)
PROV_RE = re.compile(r'^PROVINSI$', re.IGNORECASE)
FOOT_RE = re.compile(r'^(SUMBER|CATATAN|Sumber|Catatan)')
SECTION_A_RE = re.compile(r'^[A-D]$')

def main():
    OUT_DIR.mkdir(exist_ok=True)
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)

    combined_rows = []
    sheet_summaries = []

    for s in range(1, 89):
        sname = str(s)
        if s in PROVINCE_ONLY:
            sheet_summaries.append(f"  Sheet {sname:>3}: SKIP — province-only table")
            continue

        ws = wb[sname]
        all_rows = list(ws.iter_rows(values_only=True))
        if not all_rows:
            sheet_summaries.append(f"  Sheet {sname:>3}: SKIP — empty")
            continue

        first_data_idx = None
        for i, r in enumerate(all_rows):
            b = r[1] if len(r) > 1 else None
            if b is not None and KAB_RE.search(str(b)):
                first_data_idx = i
                break

        if first_data_idx is None:
            sheet_summaries.append(f"  Sheet {sname:>3}: SKIP — no kabupaten rows found")
            continue

        parsed = []
        for r in all_rows[first_data_idx:]:
            if not r or len(r) < 2:
                continue
            b = str(r[1]).strip() if r[1] is not None else ''
            if not b or not KAB_RE.search(b):
                if PROV_RE.search(b):
                    continue
                if FOOT_RE.search(str(r[0] or '')):
                    break
                continue
            cleaned = [safe_val(v) for v in r]
            parsed.append(cleaned)

        if not parsed:
            sheet_summaries.append(f"  Sheet {sname:>3}: SKIP — no data rows after filter")
            continue

        parsed = [row for row in parsed if row[1] is not None and KAB_RE.search(str(row[1]))]
        if not parsed:
            sheet_summaries.append(f"  Sheet {sname:>3}: SKIP — no valid kab rows after validation")
            continue

        data_width = 2
        for row in parsed:
            for ci in range(len(row) - 1, -1, -1):
                if row[ci] is not None:
                    data_width = max(data_width, ci + 1)
                    break

        for row in parsed:
            del row[data_width:]

        header_raw = []
        for i in range(first_data_idx - 1, max(first_data_idx - 8, 0) - 1, -1):
            r = all_rows[i]
            if is_column_number_row(r):
                continue
            r_trimmed = r[:data_width] if len(r) > data_width else r + (None,) * (data_width - len(r))
            if any(v is not None for v in r_trimmed):
                header_raw.append(r_trimmed)
            if len(header_raw) >= 2:
                break
        header_raw.reverse()

        if not header_raw:
            f = all_rows[first_data_idx - 1] if first_data_idx > 0 else tuple()
            header_raw = [(f + (None,) * data_width)[:data_width]]

        col_names = merge_headers(header_raw)
        while len(col_names) < data_width:
            col_names.append(f'col_{len(col_names)}')
        col_names = col_names[:data_width]
        if col_names:
            col_names[0] = 'no'
        if len(col_names) > 1:
            col_names[1] = 'kabupaten'

        for row in parsed:
            while len(row) < len(col_names):
                row.append(None)

        df = pd.DataFrame(parsed, columns=col_names)
        csv_path = OUT_DIR / f'tabel_{s:02d}.csv'
        df.to_csv(csv_path, index=False)

        kab_rows = 0
        for row in parsed:
            kab = row[1]
            no_val = row[0]
            for ci in range(2, len(col_names)):
                if row[ci] is not None:
                    combined_rows.append({
                        'table_no': s,
                        'no': no_val if no_val is not None else '',
                        'kabupaten': kab,
                        'metric': col_names[ci],
                        'value': row[ci]
                    })
                    kab_rows += 1

        sheet_summaries.append(
            f"  Sheet {sname:>3}: OK — {len(parsed)} kab, {len(col_names)} cols, {kab_rows} values"
        )

    wb.close()

    if combined_rows:
        dfc = pd.DataFrame(combined_rows)
        csvc = OUT_DIR / 'kabupaten_all.csv'
        dfc.to_csv(csvc, index=False)
        sheet_summaries.append(f"\n  Combined: {len(combined_rows)} metric rows")

    print("\n".join(sheet_summaries))
    print(f"\nOutput directory: {OUT_DIR}")

if __name__ == '__main__':
    main()
