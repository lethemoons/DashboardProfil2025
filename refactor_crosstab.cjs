const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, 'src', 'components', 'CrosstabSection.tsx')
let content = fs.readFileSync(filePath, 'utf-8')

// 1. Data Validation (Filtering nulls)
content = content.replace(
  /const rowValues = data\.map\(d => d\[rowVar\]\)\s*const colValues = data\.map\(d => d\[colVar\]\)/,
  `
    const originalCount = data.length;
    const validPairs = data.map(d => ({ r: d[rowVar], c: d[colVar], kab: d.kabupaten }))
      .filter(p => p.r !== null && p.r !== undefined && p.r !== '' && !Number.isNaN(Number(p.r)) && p.c !== null && p.c !== undefined && p.c !== '' && !Number.isNaN(Number(p.c)))

    const rowValues = validPairs.map(p => p.r)
    const colValues = validPairs.map(p => p.c)
    const validCount = validPairs.length;
`
)

// In the loop for data, use validPairs instead of data
content = content.replace(
  /data\.forEach\(d => \{/,
  `validPairs.forEach(d => {
      // mapped from validPairs where r and c are values
      const valR = d.r;
      const valC = d.c;
`
)
content = content.replace(/const rLabel = rowCatInfo\.categorize\(d\[rowVar\]\)/, 'const rLabel = rowCatInfo.categorize(valR)')
content = content.replace(/const cLabel = colCatInfo\.categorize\(d\[colVar\]\)/, 'const cLabel = colCatInfo.categorize(valC)')
content = content.replace(/if \(d\.kabupaten\) \{/, 'if (d.kab) {')
content = content.replace(/itemLists\[rIdx\]\[cIdx\]\.push\(d\.kabupaten\)/, 'itemLists[rIdx][cIdx].push(d.kab)')

// Add originalCount and validCount to returned object
content = content.replace(
  /chiSquareResult\n\s*\}\n\s*\}, \[data/,
  `chiSquareResult,\n      originalCount,\n      validCount\n    }\n  }, [data`
)

// 2. Insights Replacement
content = content.replace(
  /const insights = useMemo\(\(\) => \{[\s\S]*?return list\n  \}, \[crosstabResult.*\]\)/,
  `const insights = useMemo(() => {
    if (!crosstabResult || crosstabResult.totalCount === 0) return []

    const {
      rowCategories, colCategories, matrix, rowTotals, colTotals,
      totalCount, maxVal, maxCell, minVal, minCell, chiSquareResult
    } = crosstabResult

    const rowName = rowVarOption?.label ?? rowVar
    const colName = colVarOption?.label ?? colVar

    const list: string[] = []

    const highestRow = rowCategories.reduce((maxI, _, i) => rowTotals[i] > rowTotals[maxI] ? i : maxI, 0)
    const highestCol = colCategories.reduce((maxJ, _, j) => colTotals[j] > colTotals[maxJ] ? j : maxJ, 0)

    list.push(
      \`Dari total **\${totalCount} wilayah valid**, mayoritas baris (\${rowName}) berada pada kategori **\${rowCategories[highestRow]?.shortLabel ?? rowCategories[highestRow]?.label}** (\${rowTotals[highestRow]} wilayah / \${((rowTotals[highestRow] / totalCount) * 100).toFixed(1)}%), sedangkan kolom (\${colName}) didominasi kategori **\${colCategories[highestCol]?.shortLabel ?? colCategories[highestCol]?.label}** (\${colTotals[highestCol]} wilayah / \${((colTotals[highestCol] / totalCount) * 100).toFixed(1)}%).\`
    )

    if (maxCell && maxVal > 0) {
      list.push(
        \`**Kombinasi Tertinggi:** Kategori **\${rowCategories[maxCell.rIdx]?.label}** bertemu dengan **\${colCategories[maxCell.cIdx]?.label}** (frekuensi **\${maxVal} wilayah**).\`
      )
    }

    if (chiSquareResult && chiSquareResult.df > 0) {
      const pFormatted = chiSquareResult.pValue < 0.001 ? '< 0.001' : \`= \${chiSquareResult.pValue.toFixed(3)}\`
      const chiFormatted = chiSquareResult.chiSquare.toFixed(2)

      let cvStrength = 'sangat lemah'
      const cv = chiSquareResult.cramerV
      if (cv > 0.5) cvStrength = 'kuat'
      else if (cv > 0.3) cvStrength = 'sedang'
      else if (cv > 0.1) cvStrength = 'lemah'

      if (chiSquareResult.hasLowExpectedCounts) {
        list.push(\`**Uji Chi-Square menghasilkan p-value \${pFormatted}.** Secara nominal berada di bawah α = 0.05. Namun, karena sebagian besar sel memiliki expected count < 5, asumsi Uji Chi-Square tidak terpenuhi secara ideal. Hasil perlu diinterpretasikan dengan hati-hati.\`)
      } else {
        if (chiSquareResult.isSignificant) {
          list.push(\`**Uji Chi-Square menghasilkan p-value \${pFormatted}.** Pada taraf signifikansi 5%, terdapat **indikasi hubungan yang signifikan secara statistik** antara \${rowName} dan \${colName}. Nilai Cramer's V sebesar \${cv.toFixed(2)} menunjukkan kekuatan hubungan **\${cvStrength}**.\`)
        } else {
          list.push(\`**Uji Chi-Square menghasilkan p-value \${pFormatted}.** **Tidak terdapat bukti yang cukup** untuk menyatakan adanya hubungan yang signifikan secara statistik antara \${rowName} dan \${colName}. Keduanya tidak memiliki asosiasi statistik yang kuat.\`)
        }
      }
    }

    return list
  }, [crosstabResult, rowVarOption, colVarOption, rowVar, colVar])`
)

// 3. UI Header and Info Context Replacement
content = content.replace(
  /<div className="flex items-center justify-between flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Controls Bar \*\/\}/,
  `
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold">
            ⊞
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {title}
            </h3>
            <p className="text-[11px] text-gray-400">Tabulasi silang interaktif & uji independensi antar dua variabel</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50/80 text-blue-800 rounded-xl text-[11px] border border-blue-100/80 leading-relaxed shadow-sm">
        <strong>💡 Informasi Penggunaan:</strong> Crosstab digunakan untuk melihat pola distribusi dua variabel kategorik. Uji Chi-Square digunakan untuk menguji apakah terdapat hubungan statistik (asosiasi) antara kedua variabel. Hasil analisis ini merupakan informasi pendukung dan <strong>tidak menunjukkan hubungan sebab-akibat</strong>.<br/>
        <span className="mt-1 block">Untuk analisis kesehatan Dinkes, disarankan memasangkan <em>Karakteristik Wilayah × Indikator Kesehatan</em> (misal: Kepadatan Penduduk vs Prevalensi Stunting) atau antar Indikator Kesehatan.</span>
      </div>

      {/* Controls Bar */}`
)

// 4. Update N Observasi
content = content.replace(
  /\{showPercentage && <span className="text-\[10px\] text-teal-600 font-mono">100.0%<\/span>\}/,
  `{showPercentage && <span className="text-[10px] text-teal-600 font-mono">100.0%</span>}
                    <span className="text-[9px] text-teal-600/70 mt-0.5 whitespace-nowrap">N = {crosstabResult.validCount} valid</span>`
)

// 5. Update Chi Square Panel
content = content.replace(
  /\{\/\* Assumption Warning if any \*\/\}[\s\S]*?<\/div>\s*\)\}\s*\{\/\* Automatic Interpretation \*\/\}/,
  `
          <div className={\`mt-2 p-2.5 rounded-lg border text-[11px] flex flex-col gap-1 \${crosstabResult.chiSquareResult.hasLowExpectedCounts ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}\`}>
            <div className="font-semibold flex items-center gap-1.5">
               {crosstabResult.chiSquareResult.hasLowExpectedCounts ? '⚠️ Peringatan Asumsi' : '✅ Asumsi Terpenuhi'}
            </div>
            <div>
               {crosstabResult.chiSquareResult.lowExpectedCount} dari {crosstabResult.colCategories.length * crosstabResult.rowCategories.length} sel ({crosstabResult.chiSquareResult.lowExpectedCountPct.toFixed(1)}%) memiliki expected count {'< 5'}. Minimum expected count = {crosstabResult.chiSquareResult.minExpectedCount.toFixed(2)}.
            </div>
            {crosstabResult.chiSquareResult.hasLowExpectedCounts && (
               <div className="mt-1 font-semibold text-amber-700">
                  Catatan: Karena >20% sel memiliki frekuensi harapan (expected count) < 5, asumsi Uji Chi-Square tidak terpenuhi secara ideal. Hasil p-value perlu diinterpretasikan dengan hati-hati.
               </div>
            )}
          </div>
        </div>
      )}

      {/* Automatic Interpretation */}`
)

content = content.replace(
  /\{insights\.length > 0 && <InsightBox insights=\{insights\} \/>\}/,
  `{insights.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-bold text-gray-700 mb-2 px-1">Interpretasi Analisis</div>
          <InsightBox insights={insights} />
        </div>
      )}`
)

fs.writeFileSync(filePath, content)
console.log('CrosstabSection updated successfully.')
