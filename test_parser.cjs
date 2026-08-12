const fs = require('fs');
const rawData = fs.readFileSync('kabupaten_all.csv', 'utf-8').split('\n').filter(Boolean).map(line => {
  const parts = line.split(',');
  return {
    tableNo: parts[0],
    kabupaten: parts[2],
    metric: parts[3],
    value: parts[4]
  }
});

const grouped = {};
const metricCounter = {};

rawData.forEach(row => {
  if (!row.kabupaten) return;
  if (row.tableNo !== '60') return;
  
  let normalizedKab = row.kabupaten.trim();
  if (normalizedKab.startsWith('KAB. ')) {
    normalizedKab = normalizedKab.replace('KAB. ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  } else if (normalizedKab.startsWith('KOTA ')) {
    normalizedKab = 'Kota ' + normalizedKab.replace('KOTA ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }
  
  if (!grouped[normalizedKab]) grouped[normalizedKab] = {};
  
  const counterKey = `${normalizedKab}_${row.tableNo}_${row.metric}`;
  metricCounter[counterKey] = (metricCounter[counterKey] || 0) + 1;
  const count = metricCounter[counterKey];
  
  const rawKey = row.metric;
  const tableKey = `${row.tableNo}_${rawKey}`;
  
  if (grouped[normalizedKab][rawKey] === undefined) {
    grouped[normalizedKab][rawKey] = row.value;
  }
  
  grouped[normalizedKab][`${tableKey}_${count}`] = row.value;
});

console.log(grouped['Pacitan']);
