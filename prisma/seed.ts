// ==============================================================================
// Database Seed Script
// Populates Institutions, Users, and Sample Civic Problems
// ==============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Civic Triple-Helix Collaboration database...');

  // 1. Seed Institutions
  const iitDelhi = await prisma.institution.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'IIT Delhi - Civil & Environmental Labs',
      type: 'UNIVERSITY',
      latitude: 28.5450,
      longitude: 77.1926,
      departments: ['CIVIL', 'ENVIRONMENTAL', 'CSE_AI', 'MECHANICAL'],
      workloadCapacity: 10,
      activeProjectCount: 3,
      contactEmail: 'civic.labs@iitd.ac.in',
    },
  });

  const tataCsr = await prisma.institution.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Tata Sustainability & Civic Trust',
      type: 'INDUSTRY_PARTNER',
      latitude: 28.6289,
      longitude: 77.2065,
      csrFocusAreas: ['WATER_SANITATION', 'ENVIRONMENT_WASTE', 'EDUCATION'],
      workloadCapacity: 25,
      activeProjectCount: 8,
      contactEmail: 'csr.grants@tata.com',
    },
  });

  console.log('✅ Institutions seeded:', iitDelhi.name, '|', tataCsr.name);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
