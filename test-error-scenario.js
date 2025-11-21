// Test script to simulate the exact error scenario from the original issue
async function testErrorScenario() {
  try {
    console.log('Testing error scenario...');
    
    // Simulate what happens when we click "Save Defaults to Database" button
    console.log('1. Deleting existing settings...');
    const deleteResponse = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'DELETE',
    });
    
    console.log('Delete response status:', deleteResponse.status);
    
    // Simulate saving defaults with a problematic payload that might cause an empty error
    console.log('2. Saving defaults with potential error...');
    const problematicPayload = {
      // Missing some required fields to trigger an error
      siteName: "Test Site",
      // Missing other fields intentionally
    };
    
    const saveResponse = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problematicPayload),
    });
    
    console.log('Save response status:', saveResponse.status);
    
    if (saveResponse.ok) {
      const savedData = await saveResponse.json();
      console.log('Unexpected success! Data:', savedData);
    } else {
      const errorText = await saveResponse.text();
      console.log('Save error response:', saveResponse.status, saveResponse.statusText);
      console.log('Error text:', errorText);
      
      // This is what would cause the "Save error: {}" issue
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
          console.log('Error text is not JSON:', errorText);
        }
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testErrorScenario();