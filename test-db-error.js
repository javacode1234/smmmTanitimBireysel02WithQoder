// Test script to simulate a database error scenario
async function testDbError() {
  try {
    console.log('Testing database error scenario...');
    
    // Try to save data with an invalid ID format that might cause a database error
    console.log('Saving with potentially problematic data...');
    const problematicPayload = {
      id: "invalid-id-format-that-might-cause-an-issue", // Very long ID
      siteName: "Test Site",
      siteDescription: "Test description",
      phone: "+90 123 456 7890",
      email: "test@example.com"
    };
    
    const response = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problematicPayload),
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success! Data:', result);
    } else {
      const errorText = await response.text();
      console.log('Error response status:', response.status);
      console.log('Error text:', JSON.stringify(errorText));
      
      // Check if we get the empty error object issue
      if (errorText === '{}') {
        console.log('⚠️  FOUND THE ISSUE: Empty error object returned!');
      } else if (!errorText) {
        console.log('⚠️  FOUND THE ISSUE: Completely empty response!');
      } else {
        console.log('Error response has content (this is good)');
        try {
          const error = JSON.parse(errorText);
          console.log('Parsed error:', error);
        } catch (parseError) {
          console.log('Error text is not valid JSON:', errorText);
        }
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testDbError();