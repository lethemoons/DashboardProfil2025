import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine
, LabelList } from 'recharts';
import { evaluateTarget, TARGETS } from '../utils/targets';
import DataTable from './DataTable';
import { getDynamicDomain } from '../utils/stats';

interface Indicator {
  key: string;
  label: string;
  isPercentage?: boolean;
}

interface RankChartProps {
  data: any[];
  indicators: Indicator[];
  defaultIndicator?: string;
  title?: string;
}

export default function RankChart({ data, indicators, defaultIndicator, title = "Data per Kabupaten/Kota" }: RankChartProps) {
  const [indicator, setIndicator] = useState(defaultIndicator || indicators[0]?.key || '');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [limit, setLimit] = useState<number | 'all'>(10);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndicator = indicators.find(i => i.key === indicator) || indicators[0];
  const targetConfig = TARGETS[activeIndicator.key];

  // Process data: filter out province summary, extract values, and sort
  const processedData = useMemo(() => {
    const validData = data
      .filter(d => d.kabupaten && d.kabupaten !== 'PROV. JAWA TIMUR')
      .map(d => ({
        kabupaten: d.kabupaten,
        value: Number(d[indicator] || 0),
        rawRow: d
      }));

    validData.sort((a, b) => sortOrder === 'desc' ? b.value - a.value : a.value - b.value);

    // Inject ranking
    return validData.map((d, i) => ({ ...d, rank: i + 1 }));
  }, [data, indicator, sortOrder]);

  const displayedData = limit === 'all' ? processedData : processedData.slice(0, limit);

  // Compute Insights
  const { maxKab, minKab, avg, maxVal, minVal, aboveAvg, belowAvg } = useMemo(() => {
    if (processedData.length === 0) return { maxKab: '-', minKab: '-', avg: 0, maxVal: 0, minVal: 0, aboveAvg: 0, belowAvg: 0 };
    
    let sum = 0;
    processedData.forEach(d => sum += d.value);
    const average = sum / processedData.length;
    
    const maxItem = [...processedData].sort((a, b) => b.value - a.value)[0];
    const minItem = [...processedData].sort((a, b) => a.value - b.value)[0];
    
    let above = 0;
    let below = 0;
    processedData.forEach(d => {
      if (d.value >= average) above++;
      else below++;
    });

    return {
      maxKab: maxItem?.kabupaten || '-',
      minKab: minItem?.kabupaten || '-',
      maxVal: maxItem?.value || 0,
      minVal: minItem?.value || 0,
      avg: average,
      aboveAvg: above,
      belowAvg: below
    };
  }, [processedData]);

  const formatValue = (v: number) => {
    return activeIndicator.isPercentage 
      ? `${v.toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`
      : Math.round(v).toLocaleString('id-ID');
  };

  const chartHeight = limit === 'all' ? processedData.length * 40 + 60 : (limit * 40) + 60;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{title}</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-2">Indikator</span>
              <select 
                value={indicator} 
                onChange={e => setIndicator(e.target.value)}
                className="text-xs font-medium bg-transparent outline-none py-1 pr-2 text-gray-700 cursor-pointer"
              >
                {indicators.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-2">Urutkan</span>
              <select 
                value={sortOrder} 
                onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="text-xs font-medium bg-transparent outline-none py-1 pr-2 text-gray-700 cursor-pointer"
              >
                <option value="desc">Tertinggi → Terendah</option>
                <option value="asc">Terendah → Tertinggi</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-2">Tampilkan</span>
              <select 
                value={limit} 
                onChange={e => setLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="text-xs font-medium bg-transparent outline-none py-1 pr-2 text-gray-700 cursor-pointer"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value="all">Semua Kabupaten/Kota</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full overflow-y-auto overflow-x-hidden" style={{ maxHeight: limit === 'all' ? '600px' : 'auto' }}>
          <ResponsiveContainer width="100%" height={Math.max(chartHeight, 300)}>
            <BarChart 
              data={displayedData} 
              layout="vertical" 
              margin={{ top: 10, right: 80, left: 100, bottom: 10 }}
              onMouseMove={(e: any) => {
                if (e.activeTooltipIndex !== undefined) setHoveredIndex(e.activeTooltipIndex);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <XAxis type="number" hide domain={[0, (dataMax: any) => getDynamicDomain(dataMax, activeIndicator?.isPercentage)]} />
              <YAxis 
                type="category" 
                dataKey="kabupaten" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 500 }} 
                width={140} 
              />
              {targetConfig && (
                <ReferenceLine 
                  x={targetConfig.target_value} 
                  stroke={targetConfig.target_direction === '>=' || targetConfig.target_direction === '>' ? '#0F8F8B' : '#ef4444'}
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    position: 'insideTopRight',
                    value: `${['<=', '<'].includes(targetConfig.target_direction) ? 'Batas Maksimum' : 'Target Minimum'}: ${targetConfig.target_value}${targetConfig.isPercentage ? '%' : ''}`,
                    fill: '#4B5563',
                    fontSize: 11,
                    fontWeight: 600
                  }}
                />
              )}
              <Tooltip 
                cursor={{ fill: 'rgba(15, 176, 170, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-100 p-3 rounded-xl shadow-lg flex flex-col gap-1 min-w-[200px]">
                        <div className="text-sm font-bold text-gray-800">{row.kabupaten}</div>
                        <div className="text-xs text-gray-500 mb-2">{activeIndicator.label}</div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Nilai</span>
                          <span className="text-sm font-bold text-[#0F8F8B]">{formatValue(row.value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Peringkat</span>
                          <span className="text-xs font-bold text-gray-700">#{row.rank} dari {processedData.length}</span>
                        </div>
                        {targetConfig && (
                          <div className={`mt-2 pt-2 border-t flex flex-col gap-1 ${evaluateTarget(row.value, activeIndicator.key)?.status === 'tercapai' ? 'border-[#0F8F8B]/20' : 'border-[#ef4444]/20'}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Target</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${evaluateTarget(row.value, activeIndicator.key)?.status === 'tercapai' ? 'bg-[#0F8F8B]/10 text-[#0F8F8B]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
                                {evaluateTarget(row.value, activeIndicator.key)?.status === 'tercapai' ? 'Tercapai' : 'Belum Tercapai'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]} 
                label={{ 
                  position: 'right', 
                  formatter: (v: any) => formatValue(v),
                  fill: '#6B7280',
                  fontSize: 11,
                  fontWeight: 600
                }}
                animationDuration={600}
              >
                {displayedData.map((entry, index) => {
                  let fillColor = '#0F8F8B';
                  if (hoveredIndex === index) {
                    fillColor = '#078FA5'; // Hover color
                  }
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={fillColor} 
                      style={{ transition: 'fill 0.2s ease-in-out' }}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Auto Insight Box */}
      <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#0F8F8B] text-white flex items-center justify-center font-serif text-[13px] font-bold">
            i
          </div>
          <span className="text-[#0F8F8B] font-bold text-sm tracking-wide">KESIMPULAN SINGKAT</span>
        </div>
        <div className="flex items-start gap-2 ml-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0F8F8B] mt-1.5 flex-shrink-0" />
          <div className="leading-relaxed">
            Kabupaten/kota dengan nilai tertinggi adalah <strong>{maxKab}</strong> ({formatValue(maxVal)}), 
            sedangkan terendah adalah <strong>{minKab}</strong> ({formatValue(minVal)}). 
            Rata-rata provinsi berada di <strong>{formatValue(avg)}</strong>. 
            Secara total, terdapat <strong>{aboveAvg} kabupaten/kota</strong> di atas rata-rata dan <strong>{belowAvg}</strong> di bawahnya.
            {targetConfig && (() => {
              const tercapaiCount = processedData.filter(d => evaluateTarget(d.value, activeIndicator.key)?.status === 'tercapai').length;
              return (
                <span className="block mt-2 font-medium text-gray-800 border-t border-[#CCEEED] pt-2">
                  Berdasarkan target yang ditetapkan ({['<=', '<'].includes(targetConfig.target_direction) ? 'maksimum' : 'minimum'} {targetConfig.target_value}{targetConfig.isPercentage ? '%' : ''}), sebanyak <strong>{tercapaiCount} dari {processedData.length} kabupaten/kota</strong> telah mencapai target tersebut.
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
