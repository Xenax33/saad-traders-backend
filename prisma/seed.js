import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@fbr.gov.pk' },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@fbr.gov.pk',
      businessName: 'FBR Admin',
      province: 'Punjab',
      address: 'House no 533 Block C Johar Town Lahore',
      ntncnic: '1234567890123',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
