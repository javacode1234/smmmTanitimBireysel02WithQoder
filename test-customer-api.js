// Test script to verify customer API behavior
async function testCustomerAPI() {
  try {
    console.log('Testing customer API...');
    
    const response = await fetch('http://localhost:3000/api/customers');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response status:', response.status);
      console.log('Error text:', errorText);
      
      // Check if we still get the empty error object issue
      if (errorText === '{}') {
        console.log('⚠️  ISSUE STILL EXISTS: Empty error object returned!');
      } else if (!errorText) {
        console.log('⚠️  ISSUE STILL EXISTS: Completely empty response!');
      } else {
        console.log('✅ Good: Error response has content');
        try {
          const error = JSON.parse(errorText);
          console.log('Parsed error:', error);
        } catch (parseError) {
          console.log('Error text is not JSON:', errorText);
        }
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testCustomerAPI();