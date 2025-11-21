// Test script to check what the customers API actually returns
async function testCustomerAPIError() {
  try {
    console.log('Testing customer API error response...');
    
    const response = await fetch('http://localhost:3000/api/customers');
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    // First try to get as text to see raw response
    const text = await response.text();
    console.log('Raw response text:', JSON.stringify(text));
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (parseError) {
      console.log('Could not parse as JSON:', parseError.message);
    }
    
    if (!response.ok) {
      console.log('Error response detected');
    } else {
      console.log('Success response');
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testCustomerAPIError();