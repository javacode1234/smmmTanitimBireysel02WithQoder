import fetch from 'node-fetch'

async function main() {
  try {
    console.log('Testing API...')
    const res = await fetch('http://localhost:3001/api/test-route')
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Body:', text.substring(0, 500))
  } catch (e) {
    console.error('Error:', e)
  }
}

main()
