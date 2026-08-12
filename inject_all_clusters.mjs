import fs from 'fs';
import path from 'path';

const injections = [
  {
    file: 'd:/dashboard_dinkes/src/pages/UKBM.tsx',
    vars: `['pct_aktif']`,
    dirs: `[-1]`,
    labels: `['Posyandu Aktif (%)']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanIbu.tsx',
    vars: `['kematian_ibu_hamil', 'k6_pct', 'persalinan_fasyankes_pct', 'kf_lengkap_pct']`,
    dirs: `[1, -1, -1, -1]`,
    labels: `['Kematian Ibu Hamil', 'K6 (%)', 'Persalinan Fasyankes (%)', 'KF Lengkap (%)']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanAnak.tsx',
    vars: `['kematian_bayi', 'gizi_buruk_pct', 'imunisasi_dasar_lengkap_pct']`,
    dirs: `[1, 1, -1]`,
    labels: `['Kematian Bayi', 'Gizi Buruk (%)', 'Imunisasi Dasar Lengkap (%)']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/UsiaProduktifLansia.tsx',
    vars: `['produktif_laki', 'lansia_dilayani']`,
    dirs: `[-1, -1]`,
    labels: `['Usia Produktif Laki-laki', 'Lansia Dilayani']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PenyakitMenular.tsx',
    vars: `['tbc_kasus', 'tbc_sukses_pct', 'arv_pct', 'diare_semua_umur', 'kusta_mb']`,
    dirs: `[1, -1, -1, 1, 1]`,
    labels: `['TBC Kasus', 'TBC Sukses (%)', 'Mendapat ARV (%)', 'Diare', 'Kusta MB']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PD3I.tsx',
    vars: `['difteri_kasus', 'campak_suspek_kasus', 'klb_24jam_pct']`,
    dirs: `[1, 1, -1]`,
    labels: `['Kasus Difteri', 'Suspek Campak', 'KLB Ditangani <24 Jam (%)']`,
    target: '<DataTable data={pd3iData} columns={[',
    dataVar: 'pd3iData'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/TularVektor.tsx',
    vars: `['dbd_kasus', 'dbd_cfr', 'malaria_positif']`,
    dirs: `[1, 1, 1]`,
    labels: `['Kasus DBD', 'CFR DBD (%)', 'Malaria Positif']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PenyakitTidakMenular.tsx',
    vars: `['hipertensi_laki', 'dm_terkendali_pct']`,
    dirs: `[-1, -1]`,
    labels: `['Pelayanan Hipertensi Laki-laki', 'DM Terkendali (%)']`,
    target: '<DataTable data={ptmData} columns={[',
    dataVar: 'ptmData'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanLingkungan.tsx',
    vars: `['air_minum_memenuhi_syarat_pct', 'sanitasi_aman_pct', 'kualitas_udara_ms_pct', 'babs_pct']`,
    dirs: `[-1, -1, -1, 1]`,
    labels: `['Air Minum MS (%)', 'Sanitasi Aman (%)', 'Kualitas Udara MS (%)', 'BABS (%)']`,
    target: '<DataTable data={data} columns={[',
    dataVar: 'data'
  }
];

injections.forEach(inj => {
  let content = fs.readFileSync(inj.file, 'utf8');

  // Inject import
  if (!content.includes("import RiskClusteringMap")) {
    const importMatch = content.match(/import ChoroplethMap from '\.\.\/components\/ChoroplethMap';/);
    if (importMatch) {
      content = content.replace(
        "import ChoroplethMap from '../components/ChoroplethMap';",
        "import ChoroplethMap from '../components/ChoroplethMap';\nimport RiskClusteringMap from '../components/RiskClusteringMap';"
      );
    } else {
      // Just inject after React import
      content = content.replace(
        "import React",
        "import RiskClusteringMap from '../components/RiskClusteringMap';\nimport React"
      );
      content = content.replace(
        "import { useState",
        "import RiskClusteringMap from '../components/RiskClusteringMap';\nimport { useState"
      );
    }
  }

  // Inject component
  if (!content.includes("<RiskClusteringMap")) {
    const compStr = `\n      <RiskClusteringMap \n        data={${inj.dataVar}} \n        variables={${inj.vars}} \n        directions={${inj.dirs}} \n        variableLabels={${inj.labels}} \n      />\n\n      `;
    content = content.replace(inj.target, compStr + inj.target);
  }

  fs.writeFileSync(inj.file, content, 'utf8');
  console.log('Updated ' + inj.file);
});
