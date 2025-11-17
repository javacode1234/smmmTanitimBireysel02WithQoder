// This script should be run in a browser environment to test the API

async function testApi() {
  try {
    console.log('Testing institutions API...');
    
    const response = await fetch('http://localhost:3000/api/content/institutions');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();