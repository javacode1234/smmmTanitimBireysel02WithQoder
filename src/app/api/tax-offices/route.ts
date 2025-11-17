import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Now we can use the proper TaxOffice model
    const taxOffices = await prisma.taxOffice.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ taxOffices });
  } catch (error) {
    console.error('Error fetching tax offices:', error);
    return NextResponse.json({ error: 'Vergi daireleri alınamadı' }, { status: 500 });
  }
}