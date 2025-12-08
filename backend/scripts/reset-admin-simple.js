/**
 * Reset admin with simple password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Simple password: admin123
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await db.collection('users').updateOne(
      { email: 'admin@varlixo.com' },
      {
        $set: {
          password: hashedPassword,
          role: 'super_admin',
          status: 'active',
          emailVerified: true
        }
      }
    );
    
    console.log('\n✅ Admin password reset!');
    console.log('\n--- LOGIN DETAILS ---');
    console.log('URL: http://localhost:3000/admin');
    console.log('Email: admin@varlixo.com');
    console.log('Password: admin123');
    console.log('-------------------\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetAdmin();






