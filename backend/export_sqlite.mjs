// Script: export_sqlite.mjs
// Jalankan SEBELUM ganti schema ke PostgreSQL
// Usage: node export_sqlite.mjs
// Output: export_data.json

import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

console.log('🔄 Exporting data from SQLite...')

try {
  const [dashboardData, users] = await Promise.all([
    prisma.dashboardData.findMany(),
    prisma.user.findMany(),
  ])

  const exportObj = {
    exportedAt: new Date().toISOString(),
    totalDashboardRows: dashboardData.length,
    totalUsers: users.length,
    dashboardData,
    users,
  }

  fs.writeFileSync('./export_data.json', JSON.stringify(exportObj))
  console.log(`✅ Export selesai!`)
  console.log(`   - DashboardData: ${dashboardData.length} baris`)
  console.log(`   - Users: ${users.length} user`)
  console.log(`   - File: backend/export_data.json`)
} catch (err) {
  console.error('❌ Export gagal:', err.message)
} finally {
  await prisma.$disconnect()
}
