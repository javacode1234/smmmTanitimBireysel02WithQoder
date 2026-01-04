
import * as fs from 'fs'
import * as iconv from 'iconv-lite'

const file = 'C:\\Users\\muammer\\Desktop\\smmmProjeDosyalar\\iller.csv'

console.log(`\n--- Analyzing ${file} ---`)
try {
  const buffer = fs.readFileSync(file)
  
  // Try UTF-8
  const utf8 = buffer.toString('utf-8')
  console.log('\n[UTF-8 Preview]:')
  console.log(utf8.split('\n').slice(0, 10).join('\n'))
  
  // Try Win1254
  const win1254 = iconv.decode(buffer, 'win1254')
  console.log('\n[Win1254 Preview]:')
  console.log(win1254.split('\n').slice(0, 10).join('\n'))
  
} catch (e) {
  console.error('Error reading file:', e)
}
