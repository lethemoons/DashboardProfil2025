import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing data...')
  await prisma.dashboardData.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding admin user...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin'
    }
  })

  console.log('Seeding data from CSV...')
  const csvFilePath = path.join(__dirname, '../../kabupaten_all.csv')
  const results: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        // Data has: table_no, no, kabupaten, metric, value
        if (data.table_no && data.kabupaten && data.metric) {
          results.push({
            tableNo: parseInt(data.table_no),
            no: data.no || '',
            kabupaten: data.kabupaten,
            metric: data.metric,
            value: data.value || ''
          })
        }
      })
      .on('end', async () => {
        console.log(`Parsed ${results.length} rows. Inserting into DB...`)
        // Insert in chunks to avoid memory/SQLite limits
        const chunkSize = 5000
        for (let i = 0; i < results.length; i += chunkSize) {
          const chunk = results.slice(i, i + chunkSize)
          await prisma.dashboardData.createMany({
            data: chunk
          })
          console.log(`Inserted ${i + chunk.length} / ${results.length} rows`)
        }
        console.log('Seeding finished.')
        resolve(null)
      })
      .on('error', (err) => {
        console.error('Error parsing CSV', err)
        reject(err)
      })
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
