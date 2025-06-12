import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default users
  const users = [
    {
      email: 'admin@tegpr.com',
      password: 'admin123',
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
    {
      email: 'ae@tegpr.com',
      password: 'ae123',
      name: 'Account Executive',
      role: UserRole.AE,
    },
    {
      email: 'supervisor@tegpr.com',
      password: 'super123',
      name: 'Supervisor',
      role: UserRole.SUPERVISOR,
    },
    {
      email: 'accounting@tegpr.com',
      password: 'acc123',
      name: 'Accounting Manager',
      role: UserRole.ACCOUNTING,
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      console.log(`✅ Created user: ${userData.email}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.email}`);
    }
  }

  // Create sample app settings
  const settings = [
    {
      key: 'app_name',
      value: 'Report Management System',
    },
    {
      key: 'default_report_template',
      value: 'monthly_status_report',
    },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
