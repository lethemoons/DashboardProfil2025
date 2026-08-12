import React, { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import jatimGeo from '../data/jatim-geo.json';

const getKabupatenName = (properties: any, id: string) => {
  let mapName = (properties.kabkot || '');
  mapName = mapName.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const isKota = id && id.startsWith('35-7');
  return isKota ? `Kota ${mapName}` : mapName;
};

interface ChoroplethMapProps {
  data: any[]; 
  indicatorKey: string;
  indicatorLabel: string;
}

const colorRange = ['#F0FAF9', '#B2EBF2', '#0F8F8B', '#095c5a', '#032625'];

export default function ChoroplethMap({ data, indicatorKey, indicatorLabel }: ChoroplethMapProps) {
  const [tooltip, setTooltip] = useState<{ text: string, x: number, y: number } | null>(null);
  const [hoveredKab, setHoveredKab] = useState<string | null>(null);

  // Compute map data and color scale
  const { mapData, min, max, avg, highKab, lowKab, countAbove } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    let highKab = '-';
    let lowKab = '-';
    const mapped: Record<string, number> = {};

    data.forEach(row => {
      // Don't include PROV. JAWA TIMUR summary row in min/max map scale
      if (row.kabupaten && row.kabupaten !== 'PROV. JAWA TIMUR' && row.table_no !== '4') {
        let val = Number(row[indicatorKey] || 0);
        if (!isNaN(val)) {
          mapped[row.kabupaten] = val;
          if (val < min) { min = val; lowKab = row.kabupaten; }
          if (val > max) { max = val; highKab = row.kabupaten; }
          sum += val;
          count++;
        }
      }
    });

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;
    const avg = count > 0 ? sum / count : 0;
    
    let countAbove = 0;
    Object.values(mapped).forEach(v => {
      if (v > avg) countAbove++;
    });

    return { mapData: mapped, min, max, avg, highKab, lowKab, countAbove, count };
  }, [data, indicatorKey]);

  // Create a continuous color scale
  const colorScale = scaleLinear<string>()
    .domain([min, min + (max - min) * 0.25, min + (max - min) * 0.5, min + (max - min) * 0.75, max])
    .range(colorRange);

  const { pathGenerator } = useMemo(() => {
    const projection = geoMercator().fitSize([800, 500], jatimGeo as any);
    return { pathGenerator: geoPath().projection(projection) };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full h-[500px] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 shadow-sm relative">
        
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="absolute z-10 bg-white p-3 rounded-lg shadow-lg border border-gray-100 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="text-xs font-semibold text-gray-800 mb-1">{tooltip.text.split('|')[0]}</div>
            <div className="text-xs text-gray-500">{indicatorLabel}</div>
            <div className="text-sm font-bold text-[#0F8F8B] mt-1">{tooltip.text.split('|')[1]}</div>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative bg-blue-50/10 flex items-center justify-center p-4">
          <svg viewBox="0 0 800 500" className="w-full h-full drop-shadow-sm" preserveAspectRatio="xMidYMid meet">
            {(jatimGeo as any).features.map((feature: any, i: number) => {
              const kabName = getKabupatenName(feature.properties, feature.id);
              const val = mapData[kabName] !== undefined ? mapData[kabName] : 0;
              const fill = mapData[kabName] !== undefined ? colorScale(val) : '#F3F4F6';
              const isHovered = hoveredKab === kabName;

              return (
                <path
                  key={feature.id || i}
                  d={pathGenerator(feature) || ''}
                  fill={isHovered ? '#078FA5' : fill}
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  style={{ transition: 'fill 150ms ease-out', cursor: 'pointer', outline: 'none' }}
                  onMouseEnter={(e) => {
                    setHoveredKab(kabName);
                    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({ 
                        text: `${kabName}|${val.toLocaleString('id-ID', { maximumFractionDigits: 1 })}`, 
                        x: e.clientX - rect.left, 
                        y: e.clientY - rect.top 
                      });
                    }
                  }}
                  onMouseMove={(e) => {
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

        {/* Vertical Legend */}
        <div className="w-full md:w-28 bg-white p-4 flex flex-col justify-end border-t md:border-t-0 md:border-l border-gray-100 z-0">
          <div className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wide">Legenda</div>
          
          <div className="flex flex-col gap-1 flex-1 justify-end pb-4 items-center">
            <div className="text-xs text-gray-600 mb-2 font-medium">{max.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</div>
            
            <div className="w-4 flex-1 rounded flex flex-col overflow-hidden min-h-[200px]">
              {colorRange.slice().reverse().map((c, i) => (
                <div key={i} className="flex-1 w-full" style={{ backgroundColor: c }}></div>
              ))}
            </div>

            <div className="text-xs text-gray-600 mt-2 font-medium">{min.toLocaleString('id-ID', { maximumFractionDigits: 1 })}</div>
          </div>
        </div>
      </div>
      
      {/* Auto Insight Box */}
      <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#0F8F8B] text-white flex items-center justify-center font-serif text-[13px] font-bold">
            i
          </div>
          <span className="text-[#0F8F8B] font-bold text-sm tracking-wide">WAWASAN GEOGRAFIS</span>
        </div>
        <div className="flex items-start gap-2 ml-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F8F8B] mt-1.5 flex-shrink-0" />
          <div className="leading-relaxed">
            Berdasarkan pemetaan di Jawa Timur untuk indikator <strong>{indicatorLabel}</strong>, nilai tertinggi berada di <strong>{highKab}</strong> ({max.toLocaleString('id-ID', { maximumFractionDigits: 1 })}) dan terendah di <strong>{lowKab}</strong> ({min.toLocaleString('id-ID', { maximumFractionDigits: 1 })}). 
            Rata-rata provinsi adalah <strong>{avg.toLocaleString('id-ID', {maximumFractionDigits: 1})}</strong>. Terdapat <strong>{countAbove}</strong> kabupaten/kota yang berada di atas rata-rata provinsi.
          </div>
        </div>
      </div>
    </div>
  );
}
