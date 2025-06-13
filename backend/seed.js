const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default users
  const defaultUsers = [
    {
      email: 'admin@tegpr.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN'
    },
    {
      email: 'ae@tegpr.com',
      password: 'ae123',
      name: 'Account Executive',
      role: 'AE'
    },
    {
      email: 'supervisor@tegpr.com',
      password: 'super123',
      name: 'Supervisor',
      role: 'SUPERVISOR'
    },
    {
      email: 'accounting@tegpr.com',
      password: 'acc123',
      name: 'Accounting Manager',
      role: 'ACCOUNTING'
    }
  ];

  for (const userData of defaultUsers) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword
      }
    });

    console.log(`✅ Created/Updated user: ${user.email} (${user.role})`);
  }

  console.log('🌱 Seeding completed!');
  console.log('\n📝 Default user accounts:');
  console.log('Admin: admin@tegpr.com / admin123');
  console.log('AE: ae@tegpr.com / ae123');
  console.log('Supervisor: supervisor@tegpr.com / super123');
  console.log('Accounting: accounting@tegpr.com / acc123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
