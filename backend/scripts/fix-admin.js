/**
 * Script to fix/recreate admin user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function fixAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const db = mongoose.connection.db;

    // Check current admin
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@varlixo.com' });
    
    if (existingAdmin) {
      console.log('Found existing admin:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Status:', existingAdmin.status);
      
      // Update the admin with correct role and new password
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
      
      await db.collection('users').updateOne(
        { email: 'admin@varlixo.com' },
        {
          $set: {
            password: hashedPassword,
            role: 'super_admin',
            status: 'active',
            emailVerified: true,
            kycStatus: 'approved',
            updatedAt: new Date()
          }
        }
      );
      
      console.log('\n✅ Admin password reset to: Admin123!@#');
      console.log('✅ Role set to: super_admin');
      console.log('✅ Status set to: active');
    } else {
      console.log('No admin found. Creating new admin...');
      
      const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
      
      const newAdmin = await db.collection('users').insertOne({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@varlixo.com',
        password: hashedPassword,
        role: 'super_admin',
        status: 'active',
        emailVerified: true,
        kycStatus: 'approved',
        referralCode: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create wallet for admin
      await db.collection('wallets').insertOne({
        userId: newAdmin.insertedId,
        mainBalance: 0,
        pendingBalance: 0,
        lockedBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalInvestments: 0,
        totalProfits: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('\n✅ New admin created!');
      console.log('Email: admin@varlixo.com');
      console.log('Password: Admin123!@#');
    }

    console.log('\n--- Admin Login Details ---');
    console.log('URL: http://localhost:3000/admin');
    console.log('Email: admin@varlixo.com');
    console.log('Password: Admin123!@#');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAdmin();




