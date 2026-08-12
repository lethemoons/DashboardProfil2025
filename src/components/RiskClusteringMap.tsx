import React, { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import jatimGeo from '../data/jatim-geo.json';
import { standardize, kmeans, evaluateRiskClusters, RiskDirection } from '../utils/clustering';

const getKabupatenName = (properties: any, id: string) => {
  let mapName = (properties.kabkot || '');
  mapName = mapName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const isKota = id && id.startsWith('35-7');
  return isKota ? `Kota ${mapName}` : mapName;
};

interface RiskClusteringMapProps {
  data: any[];
  variables: string[];
  directions: RiskDirection[];
  variableLabels: string[];
}

const RISK_COLORS = {
  Rendah: '#16a34a', // Hijau
  Sedang: '#eab308', // Kuning
  Tinggi: '#dc2626', // Merah
};

export default function RiskClusteringMap({ data, variables, directions, variableLabels }: RiskClusteringMapProps) {
  const [tooltip, setTooltip] = useState<{ text: string, x: number, y: number } | null>(null);
  const [hoveredKab, setHoveredKab] = useState<string | null>(null);

  const { mapData, clusterProfiles, countByRisk } = useMemo(() => {
    // 1. Extract and clean data
    const kabNames: string[] = [];
    const matrix: number[][] = [];
    
    data.forEach(row => {
      if (row.kabupaten && row.kabupaten !== 'PROV. JAWA TIMUR' && row.table_no !== '4') {
        const vec = variables.map(v => Number(row[v] || 0));
        // Simple missing value check: if all are valid numbers
        if (vec.every(v => !isNaN(v))) {
          kabNames.push(row.kabupaten);
          matrix.push(vec);
        }
      }
    });

    if (matrix.length === 0) {
      return { mapData: {}, clusterProfiles: [], countByRisk: { Rendah: 0, Sedang: 0, Tinggi: 0 } };
    }

    // 2. Standardize
    const { scaled, means: globalMeans, stds: globalStds } = standardize(matrix);

    // 3. K-Means
    const { clusters, centroids } = kmeans(scaled, 3, 100, 42);

    // 4. Evaluate Risks
    const evaluated = evaluateRiskClusters(centroids, directions);
    
    // Map evaluated risks back to cluster index
    const riskByClusterIdx: Record<number, 'Rendah' | 'Sedang' | 'Tinggi'> = {};
    evaluated.forEach(e => {
      riskByClusterIdx[e.clusterId] = e.riskLevel;
    });

    // 5. Construct map mappings
    const mapData: Record<string, { clusterIdx: number, riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' }> = {};
    const countByRisk = { Rendah: 0, Sedang: 0, Tinggi: 0 };
    
    kabNames.forEach((kab, i) => {
      const clusterIdx = clusters[i];
      const riskLevel = riskByClusterIdx[clusterIdx];
      mapData[kab] = { clusterIdx, riskLevel };
      countByRisk[riskLevel]++;
    });

    // 6. Build profiles for summary
    const clusterProfiles = evaluated.map(e => {
      const originalCentroid = centroids[e.clusterId].map((val, j) => (val * globalStds[j]) + globalMeans[j]);
      return {
        riskLevel: e.riskLevel,
        count: countByRisk[e.riskLevel],
        centroid: originalCentroid,
        standardizedCentroid: centroids[e.clusterId]
      };
    });
    
    // Sort profiles to always render Rendah -> Sedang -> Tinggi
    clusterProfiles.sort((a, b) => {
      const order = { Rendah: 1, Sedang: 2, Tinggi: 3 };
      return order[a.riskLevel] - order[b.riskLevel];
    });

    return { mapData, clusterProfiles, countByRisk };
  }, [data, variables, directions]);

  const { pathGenerator } = useMemo(() => {
    const projection = geoMercator().fitSize([800, 500], jatimGeo as any);
    return { pathGenerator: geoPath().projection(projection) };
  }, []);

  if (Object.keys(mapData).length === 0) {
    return (
      <div className="w-full p-10 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
        Data tidak cukup untuk melakukan analisis clustering pada indikator yang dipilih.
      </div>
    );
  }

  const tinggiCount = countByRisk.Tinggi;
  const dominan = Object.entries(countByRisk).sort((a, b) => b[1] - a[1])[0];

  const getNarrative = (profile: any) => {
    const stds = profile.standardizedCentroid;
    let maxIdx = 0;
    let maxAbs = -1;
    for (let i = 0; i < stds.length; i++) {
      if (Math.abs(stds[i]) > maxAbs) {
        maxAbs = Math.abs(stds[i]);
        maxIdx = i;
      }
    }
    
    const maxVal = stds[maxIdx];
    const maxLabel = variableLabels[maxIdx];

    const baseText = {
      'Rendah': 'Cluster ini menunjukkan wilayah dengan profil indikator yang secara umum relatif lebih baik dibandingkan cluster lainnya. Nilai indikator yang digunakan dalam pemetaan risiko cenderung berada pada tingkat yang lebih menguntungkan.',
      'Sedang': 'Cluster ini menunjukkan wilayah dengan kondisi indikator yang berada pada tingkat menengah. Karakteristik wilayah pada cluster ini berada di antara kelompok risiko rendah dan risiko tinggi.',
      'Tinggi': 'Cluster ini menunjukkan wilayah dengan profil indikator yang relatif lebih rentan dibandingkan cluster lainnya. Beberapa indikator utama menunjukkan kondisi yang perlu mendapatkan perhatian lebih.'
    }[profile.riskLevel as 'Rendah' | 'Sedang' | 'Tinggi'];

    let specText = '';
    if (maxAbs > 0.3) {
      const isHigh = maxVal > 0;
      specText = ` Karakteristik utama dari cluster ini sangat dipengaruhi oleh tingkat ${maxLabel} yang relatif lebih ${isHigh ? 'tinggi' : 'rendah'} dibandingkan rata-rata wilayah lain.`;
    }

    return baseText + specText;
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Analisis Clustering Pemetaan Risiko</h3>
        <p className="text-sm text-gray-500">
          Indikator yang digunakan: {variableLabels.map(v => <span key={v} className="inline-block bg-gray-100 px-2 py-0.5 rounded text-gray-700 mr-2 text-xs font-medium border border-gray-200">{v}</span>)}
        </p>
      </div>

      <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 shadow-sm">
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-100 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="text-xs font-semibold text-gray-800 mb-1">{tooltip.text.split('|')[0]}</div>
            <div className="text-xs text-gray-500">Kategori Risiko</div>
            <div className="text-sm font-bold mt-1" style={{ color: RISK_COLORS[tooltip.text.split('|')[1] as keyof typeof RISK_COLORS] }}>
              {tooltip.text.split('|')[1]}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative bg-gray-50/50 flex items-center justify-center p-4">
          <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm" preserveAspectRatio="xMidYMid meet">
            {(jatimGeo as any).features.map((feature: any, i: number) => {
              const kabName = getKabupatenName(feature.properties, feature.id);
              const kabData = mapData[kabName];
              const fill = kabData ? RISK_COLORS[kabData.riskLevel] : '#F3F4F6';
              const isHovered = hoveredKab === kabName;

              return (
                <path
                  key={feature.id || i}
                  d={pathGenerator(feature) || ''}
                  fill={fill}
                  stroke={isHovered ? "#374151" : "#FFFFFF"}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  style={{ transition: 'fill 150ms ease-out', cursor: kabData ? 'pointer' : 'default', outline: 'none' }}
                  onMouseEnter={(e) => {
                    if (!kabData) return;
                    setHoveredKab(kabName);
                    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({ 
                        text: `${kabName}|Risiko ${kabData.riskLevel}`, 
                        x: e.clientX - rect.left, 
                        y: e.clientY - rect.top 
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!kabData) return;
                    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                    if (rect) {
                      setTooltip(prev => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredKab(null);
                    setTooltip(null);
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="w-full md:w-48 bg-white p-5 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 z-0 gap-4">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-2">Tingkat Risiko</div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.Tinggi }}></div>
            <div className="text-sm font-semibold text-gray-700">Risiko Tinggi</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.Sedang }}></div>
            <div className="text-sm font-semibold text-gray-700">Risiko Sedang</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: RISK_COLORS.Rendah }}></div>
            <div className="text-sm font-semibold text-gray-700">Risiko Rendah</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusterProfiles.map((profile, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col border-t-4" style={{ borderTopColor: RISK_COLORS[profile.riskLevel as keyof typeof RISK_COLORS] }}>
            <h4 className="font-bold text-gray-800 mb-1">Risiko {profile.riskLevel}</h4>
            <div className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-md w-max text-gray-600 mb-4">{profile.count} Kabupaten/Kota</div>
            <div className="text-sm text-gray-700 leading-relaxed flex-1">
              {getNarrative(profile)}
            </div>
          </div>
        ))}
      </div>

      {/* Auto Insight Box */}
      <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#0F8F8B] text-white flex items-center justify-center font-serif text-[13px] font-bold">
            i
          </div>
          <span className="text-[#0F8F8B] font-bold text-sm tracking-wide">WAWASAN RISIKO OTOMATIS</span>
        </div>
        <div className="flex flex-col gap-3 ml-1">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: RISK_COLORS[dominan[0] as keyof typeof RISK_COLORS] }} />
            <div className="leading-relaxed">
              Berdasarkan hasil clustering {variableLabels.length} indikator utama, sebagian besar kabupaten/kota di Jawa Timur berada pada kelompok <strong style={{ color: RISK_COLORS[dominan[0] as keyof typeof RISK_COLORS] }}>Risiko {dominan[0]}</strong> ({dominan[1]} wilayah).
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#dc2626] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Terdapat <strong>{tinggiCount} kabupaten/kota</strong> yang terklasifikasi sebagai <strong className="text-[#dc2626]">Risiko Tinggi</strong>. Wilayah pada kelompok ini perlu mendapat prioritas intervensi dan pemantauan lebih lanjut mengingat karakteristik kumulatif indikator mereka yang berada di zona lebih rentan dibandingkan kelompok lainnya.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
