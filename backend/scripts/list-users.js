const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    if (!users || users.length === 0) {
      console.log('No users found');
      return;
    }
    console.log('Users:');
    users.forEach(u => {
      console.log(`- ${u.email} | role=${u.role} | status=${u.status} | emailVerified=${u.emailVerified} | kycStatus=${u.kycStatus}`);
    });
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();