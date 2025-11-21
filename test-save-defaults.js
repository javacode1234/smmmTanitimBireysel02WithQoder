// Test script to simulate the "Save Defaults to Database" functionality
async function testSaveDefaults() {
  try {
    console.log('Testing save defaults functionality...');
    
    // First, delete any existing settings
    console.log('Deleting existing settings...');
    const deleteResponse = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'DELETE',
    });
    
    console.log('Delete response status:', deleteResponse.status);
    
    // Then try to save default settings (simulating the button click)
    console.log('Saving default settings...');
    const defaultSettings = {
      siteName: "SMMM Ofisi",
      siteDescription: "Profesyonel muhasebe ve mali müşavirlik hizmetleri",
      favicon: "",
      brandIcon: "",
      phone: "+90 (212) 123 45 67",
      email: "info@smmmofisi.com",
      address: "İstanbul, Türkiye",
      mapLatitude: "41.0082",
      mapLongitude: "28.9784",
      mapEmbedUrl: "",
      facebookUrl: "",
      xUrl: "",
      linkedinUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      threadsUrl: "",
    };
    
    const saveResponse = await fetch('http://localhost:3000/api/content/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultSettings),
    });
    
    console.log('Save response status:', saveResponse.status);
    
    if (saveResponse.ok) {
      const savedData = await saveResponse.json();
      console.log('Success! Default settings saved:', savedData);
    } else {
      const errorText = await saveResponse.text();
      console.log('Save error response:', saveResponse.status, saveResponse.statusText, errorText);
      
      // Try to parse the error as JSON
      try {
        const error = JSON.parse(errorText);
        console.log('Parsed error:', error);
      } catch (parseError) {
        console.log('Failed to parse error response:', parseError);
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testSaveDefaults();