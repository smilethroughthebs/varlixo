/**
 * Unlock admin account and reset password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function unlockAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Get admin user
    const admin = await db.collection('users').findOne({ email: 'admin@varlixo.com' });
    
    if (admin) {
      console.log('Current admin status:');
      console.log('  - Failed attempts:', admin.failedLoginAttempts || 0);
      console.log('  - Locked until:', admin.lockUntil || 'Not locked');
      console.log('  - Status:', admin.status);
      console.log('  - Role:', admin.role);
    }
    
    // Reset password and unlock
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await db.collection('users').updateOne(
      { email: 'admin@varlixo.com' },
      {
        $set: {
          password: hashedPassword,
          role: 'super_admin',
          status: 'active',
          emailVerified: true,
          failedLoginAttempts: 0,
          lockUntil: null
        }
      }
    );
    
    console.log('\n✅ Admin account unlocked and password reset!');
    console.log('\n========================================');
    console.log('URL: http://localhost:3000/admin');
    console.log('Email: admin@varlixo.com');
    console.log('Password: admin123');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

unlockAdmin();






