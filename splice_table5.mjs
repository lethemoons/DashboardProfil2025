import fs from 'fs'

const lines = fs.readFileSync('kabupaten_all.csv', 'utf-8').split('\n')
const newTable5Lines = fs.readFileSync('table5_new.csv', 'utf-8').trim().split('\n')

// Remove trailing empty line in lines if any
if (lines[lines.length - 1] === '') {
  lines.pop()
}

// Find the bounds again just to be 100% safe
let first = -1
let last = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('5,')) {
    if (first === -1) first = i
    last = i
  }
}

console.log(`Replacing lines ${first + 1} to ${last + 1} with ${newTable5Lines.length} new lines.`)

// Splice the array
lines.splice(first, last - first + 1, ...newTable5Lines)

fs.writeFileSync('kabupaten_all.csv', lines.join('\n') + '\n')
console.log('Successfully updated kabupaten_all.csv')
