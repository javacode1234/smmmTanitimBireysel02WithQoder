const DEFAULT_INSTITUTIONS = [
  {
    name: "TOBB",
    description: "Türkiye Odalar ve Borsalar Birliği",
    url: "https://www.tobb.org.tr",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNjZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC13ZWlnaHQ9ImJvbGQiPlRPQkI8L3RleHQ+PC9zdmc+",
    isActive: true,
    order: 0,
  },
  {
    name: "TÜRMÖB",
    description: "Türkiye Serbest Muhasebeci Mali Müşavirler ve Yeminli Mali Müşavirler Odaları Birliği",
    url: "https://www.turmob.org.tr",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNjYwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC13ZWlnaHQ9ImJvbGQiPlTFnFJNT8SwQjwvdGV4dD48L3N2Zz4=",
    isActive: true,
    order: 1,
  },
  {
    name: "GIB",
    description: "Gelir İdaresi Başkanlığı",
    url: "https://www.gib.gov.tr",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2ZmY2NiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC13ZWlnaHQ9ImJvbGQiPkdJQjwvdGV4dD48L3N2Zz4=",
    isActive: true,
    order: 2,
  },
  {
    name: "SGK",
    description: "Sosyal Güvenlik Kurumu",
    url: "https://www.sgk.gov.tr",
    logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNjZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC13ZWlnaHQ9ImJvbGQiPlNHSzwvdGV4dD48L3N2Zz4=",
    isActive: true,
    order: 3,
  },
];

async function testSaveDefaults() {
  console.log('Testing save defaults functionality...');
  
  try {
    // 1. Reset all institutions
    console.log('1. Resetting institutions...');
    const resetResponse = await fetch('http://localhost:3000/api/content/institutions/reset', {
      method: 'DELETE',
    });
    
    console.log('Reset response status:', resetResponse.status);
    const resetData = await resetResponse.json();
    console.log('Reset response data:', resetData);
    
    // 2. Save default institutions one by one
    console.log('2. Saving default institutions...');
    for (let i = 0; i < DEFAULT_INSTITUTIONS.length; i++) {
      const institution = DEFAULT_INSTITUTIONS[i];
      console.log(`Saving institution ${i + 1}: ${institution.name}`);
      
      const response = await fetch('http://localhost:3000/api/content/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(institution),
      });
      
      console.log(`Response status for ${institution.name}:`, response.status);
      if (response.ok) {
        const data = await response.json();
        console.log(`Saved ${institution.name}:`, data);
      } else {
        const errorData = await response.json();
        console.log(`Error saving ${institution.name}:`, errorData);
      }
    }
    
    // 3. Fetch and verify
    console.log('3. Fetching institutions to verify...');
    const fetchResponse = await fetch('http://localhost:3000/api/content/institutions');
    console.log('Fetch response status:', fetchResponse.status);
    const fetchedData = await fetchResponse.json();
    console.log('Fetched institutions:', fetchedData);
    console.log('Total institutions fetched:', fetchedData.length);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSaveDefaults();