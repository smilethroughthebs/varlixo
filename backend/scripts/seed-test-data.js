const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function seedTestData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // 1. Ensure admin has wallet
    const admin = await db.collection('users').findOne({ email: 'admin@varlixo.com' });
    if (admin) {
      const adminWallet = await db.collection('wallets').findOne({ userId: admin._id });
      if (!adminWallet) {
        await db.collection('wallets').insertOne({
          userId: admin._id,
          mainBalance: 10000,
          pendingBalance: 0,
          lockedBalance: 0,
          totalDeposits: 10000,
          totalWithdrawals: 0,
          totalEarnings: 0,
          referralEarnings: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Admin wallet created with balance: $10,000');
      } else {
        console.log('✅ Admin wallet already exists');
      }
    }

    // 2. Create test normal user if doesn't exist
    const testUser = await db.collection('users').findOne({ email: 'test@example.com' });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('Test@123456', 12);
      const newUser = await db.collection('users').insertOne({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        status: 'active',
        emailVerified: true,
        kycStatus: 'approved',
        referralCode: 'TEST001',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create wallet for test user
      await db.collection('wallets').insertOne({
        userId: newUser.insertedId,
        mainBalance: 500,
        pendingBalance: 0,
        lockedBalance: 0,
        totalDeposits: 500,
        totalWithdrawals: 0,
        totalEarnings: 0,
        referralEarnings: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Test user created');
      console.log('   Email: test@example.com');
      console.log('   Password: Test@123456');
      console.log('   Initial Balance: $500');
    } else {
      console.log('✅ Test user already exists');
    }

    console.log('\n--- Login Credentials ---');
    console.log('Admin:');
    console.log('  Email: admin@varlixo.com');
    console.log('  Password: Admin123!@#');
    console.log('\nNormal User:');
    console.log('  Email: test@example.com');
    console.log('  Password: Test@123456');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedTestData();
