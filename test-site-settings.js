// Test script to check if site settings API is working
async function testSiteSettings() {
  try {
    console.log('Testing site settings API...');
    
    // Test POST request
    const testData = {
      siteName: "Test Site",
      siteDescription: "Test description",
      phone: "+90 123 456 7890",
      email: "test@example.com"
    };
    
    const response = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Success! Saved data:', result);
    } else {
      const errorText = await response.text();
      console.log('Error response:', response.status, errorText);
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testSiteSettings();