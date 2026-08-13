/**
 * Membersihkan nama indikator dari simbol, unit, atau tanda kurung agar enak dibaca dalam kalimat.
 * Contoh: "Kepadatan (org/km²)" -> "kepadatan"
 */
function cleanIndicatorName(name: string | undefined): string {
  if (!name) return 'indikator';
  // Hapus semua yang ada di dalam tanda kurung, seperti "(%)" atau "(org/km²)"
  // Hapus string setelah tanda ' —' jika ada
  let cleaned = name.replace(/\s*\(.*?\)/g, '').split(' —')[0].trim().toLowerCase();
  
  // Beberapa penyesuaian khusus agar kalimat lebih luwes
  if (cleaned.startsWith('persentase ') || cleaned.startsWith('proporsi ')) {
    cleaned = cleaned.replace('persentase ', 'tingkat ').replace('proporsi ', 'tingkat ');
  }
  
  return cleaned;
}

/**
 * Menghasilkan kalimat insight otomatis berdasarkan nilai korelasi Pearson.
 * Insight ini menggunakan bahasa awam yang mudah dipahami, tanpa menggunakan istilah statistik berat.
 */
export function generateCorrelationInsight(
  indicatorXRaw: string | undefined,
  indicatorYRaw: string | undefined,
  r: number
): string {
  const x = cleanIndicatorName(indicatorXRaw);
  const y = cleanIndicatorName(indicatorYRaw);
  
  const absR = Math.abs(r);
  const rFormatted = r.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  // Tentukan kekuatan hubungan
  let strengthLabel = '';
  if (absR >= 0.75) strengthLabel = 'sangat kuat';
  else if (absR >= 0.5) strengthLabel = 'kuat';
  else if (absR >= 0.25) strengthLabel = 'cukup kuat';
  else if (absR >= 0.1) strengthLabel = 'lemah';
  else strengthLabel = 'sangat lemah';

  // Tentukan arah hubungan dan susun kalimat utama
  if (absR < 0.1) {
    return `${x.charAt(0).toUpperCase() + x.slice(1)} dan ${y} memiliki hubungan yang sangat lemah (r = ${rFormatted}). Artinya, tidak terlihat hubungan yang jelas antara ${x} dan ${y} antarwilayah. Informasi ini menunjukkan bahwa faktor-faktor lain mungkin lebih berperan.`;
  }

  if (r > 0) {
    return `${x.charAt(0).toUpperCase() + x.slice(1)} dan ${y} memiliki hubungan yang ${strengthLabel} dan searah (r = ${rFormatted}). Artinya, wilayah dengan ${x} yang lebih tinggi cenderung memiliki ${y} yang lebih tinggi. Informasi ini dapat menjadi pertimbangan dalam perencanaan dan pemerataan layanan kesehatan antarwilayah.`;
  } else {
    return `${x.charAt(0).toUpperCase() + x.slice(1)} dan ${y} memiliki hubungan yang ${strengthLabel} dan berlawanan arah (r = ${rFormatted}). Artinya, wilayah dengan ${x} yang lebih tinggi cenderung memiliki ${y} yang lebih rendah. Informasi ini dapat menjadi pertimbangan dalam perencanaan dan pemerataan layanan kesehatan antarwilayah.`;
  }
}

/**
 * Menghasilkan kalimat insight dinamis untuk grafik batang berdasarkan data dan indikator yang dipilih.
 * Menyertakan perhitungan statistik dasar (maksimum, minimum, rata-rata) dan dapat menerima
 * template implikasi kustom untuk memberikan konteks pada data.
 */
export function generateDynamicBarInsight(
  data: any[],
  indicatorKey: string,
  indicatorLabel: string,
  implicationContext: string = ""
): string {
  if (!data || data.length === 0 || !indicatorKey) return '';

  const validData = data.filter(d => typeof d[indicatorKey] === 'number');
  if (validData.length === 0) return '';

  const total = validData.reduce((sum, d) => sum + d[indicatorKey], 0);
  const avg = total / validData.length;
  
  let maxKab = validData[0];
  let minKab = validData[0];

  validData.forEach(d => {
    if (d[indicatorKey] > maxKab[indicatorKey]) maxKab = d;
    if (d[indicatorKey] < minKab[indicatorKey]) minKab = d;
  });

  const countAboveAvg = validData.filter(d => d[indicatorKey] >= avg).length;
  const countBelowAvg = validData.length - countAboveAvg;

  const isPercentage = indicatorKey.includes('pct') || indicatorKey.includes('persentase');
  const fmt = (val: number) => isPercentage 
    ? val.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
    : Math.round(val).toLocaleString('id-ID');

  const cleanLabel = cleanIndicatorName(indicatorLabel);
  const cleanLabelTitle = cleanLabel.charAt(0).toUpperCase() + cleanLabel.slice(1);

  let insight = `Berdasarkan data ${cleanLabel}, nilai rata-rata provinsi berada di angka ${fmt(avg)}. `;
  insight += `Kabupaten/kota dengan capaian tertinggi adalah ${maxKab.kabupaten.replace('Kota ', '')} (${fmt(maxKab[indicatorKey])}), `;
  insight += `sedangkan yang terendah adalah ${minKab.kabupaten.replace('Kota ', '')} (${fmt(minKab[indicatorKey])}). `;
  
  if (implicationContext) {
    insight += ` ${implicationContext}`;
  } else {
    insight += ` Secara total, terdapat ${countAboveAvg} kabupaten/kota di atas rata-rata dan ${countBelowAvg} di bawahnya. Ketimpangan nilai ekstrem antara nilai tertinggi dan terendah ini mengindikasikan perlunya pemerataan intervensi dan sumber daya secara lebih spesifik.`;
  }

  return insight;
}
