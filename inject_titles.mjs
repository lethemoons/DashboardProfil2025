import fs from 'fs';
import path from 'path';

const injections = [
  {
    file: 'd:/dashboard_dinkes/src/pages/UKBM.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Keaktifan Posyandu'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanIbu.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Kesehatan Ibu'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanAnak.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Kesehatan Anak'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/UsiaProduktifLansia.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Usia Produktif & Lansia'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PenyakitMenular.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Penyakit Menular Langsung'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PD3I.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko PD3I'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/TularVektor.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Penyakit Tular Vektor & Zoonotik'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/PenyakitTidakMenular.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Penyakit Tidak Menular'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/KesehatanLingkungan.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Kesehatan Lingkungan'
  },
  {
    file: 'd:/dashboard_dinkes/src/pages/AksesMutu.tsx',
    title: 'Analisis Klasterisasi Pemetaan Risiko Akses & Mutu Pelayanan Kesehatan'
  }
];

injections.forEach(inj => {
  let content = fs.readFileSync(inj.file, 'utf8');

  // Insert title property right after <RiskClusteringMap
  content = content.replace(
    /<RiskClusteringMap\s+/g,
    `<RiskClusteringMap \n        title="${inj.title}"\n        `
  );

  fs.writeFileSync(inj.file, content, 'utf8');
  console.log('Updated ' + inj.file);
});
