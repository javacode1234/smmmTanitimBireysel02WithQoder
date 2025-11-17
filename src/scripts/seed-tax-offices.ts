import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seedTaxOffices() {
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../data/tax-offices.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV data
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');
    
    // Remove header line
    const dataLines = lines.slice(1);
    
    console.log(`Found ${dataLines.length} tax offices to seed`);
    
    // Process each line
    for (const line of dataLines) {
      const values = line.split(',');
      if (values.length >= 3) {
        const name = values[0].trim();
        const city = values[1].trim() || null;
        const district = values[2].trim() || null;
        
        // Check if tax office already exists
        const existing = await prisma.taxOffice.findUnique({
          where: { name }
        });
        
        if (!existing) {
          await prisma.taxOffice.create({
            data: {
              name,
              city,
              district
            }
          });
          console.log(`Created tax office: ${name}`);
        } else {
          console.log(`Tax office already exists: ${name}`);
        }
      }
    }
    
    console.log('Tax office seeding completed');
  } catch (error) {
    console.error('Error seeding tax offices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTaxOffices();