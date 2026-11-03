// Script: seed_pg.mjs
// Jalankan SETELAH schema PostgreSQL sudah di-push ke Neon
// Usage: node seed_pg.mjs
// Requires: backend/.env dengan DATABASE_URL sudah diisi

import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

console.log('🚀 Seeding Neon PostgreSQL dari export_data.json...')

let exportObj
try {
  const raw = fs.readFileSync('./export_data.json', 'utf8')
  exportObj = JSON.parse(raw)
} catch (err) {
  console.error('❌ Gagal baca export_data.json:', err.message)
  console.error('   Pastikan sudah jalankan export_sqlite.mjs terlebih dahulu!')
  process.exit(1)
}

const { dashboardData, users } = exportObj
console.log(`   - ${dashboardData.length} baris DashboardData`)
console.log(`   - ${users.length} Users`)

try {
  // Seed Users
  console.log('\n👤 Seeding users...')
  for (const user of users) {
    const { id, createdAt, updatedAt, ...userData } = user
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData,
    })
  }
  console.log(`   ✅ ${users.length} user berhasil di-seed`)

  // Seed DashboardData in batches
  console.log('\n📊 Seeding dashboard data (dalam batch 1000)...')
  const BATCH_SIZE = 1000
  const cleanData = dashboardData.map(({ id, ...rest }) => rest)

  let inserted = 0
  for (let i = 0; i < cleanData.length; i += BATCH_SIZE) {
    const batch = cleanData.slice(i, i + BATCH_SIZE)
    await prisma.dashboardData.createMany({ data: batch })
    inserted += batch.length
    const pct = Math.round((inserted / cleanData.length) * 100)
    process.stdout.write(`\r   Progress: ${inserted}/${cleanData.length} (${pct}%)`)
  }

  console.log(`\n   ✅ ${inserted} baris berhasil di-seed ke Neon!`)
  console.log('\n🎉 Seeding selesai! Database Neon sudah siap.')
} catch (err) {
  console.error('\n❌ Seeding gagal:', err.message)
  if (err.message.includes('Unique constraint')) {
    console.error('   Tip: Data mungkin sudah ada. Coba hapus dulu via Neon dashboard.')
  }
} finally {
  await prisma.$disconnect()
}
