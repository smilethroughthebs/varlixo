const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

async function checkWallets() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const wallets = await db.collection('wallets').find({}).toArray();
    if (!wallets || wallets.length === 0) {
      console.log('No wallets found');
    } else {
      console.log('Wallets:');
      wallets.forEach(w => {
        console.log(`- userId=${w.userId} | mainBalance=${w.mainBalance || 0} | pending=${w.pendingBalance || 0}`);
      });
    }

    // Check admin wallet by email join
    const admin = await db.collection('users').findOne({ email: 'admin@varlixo.com' });
    if (!admin) {
      console.log('Admin user not found');
    } else {
      const adminWallet = await db.collection('wallets').findOne({ userId: admin._id });
      console.log('Admin wallet:', adminWallet ? 'exists' : 'missing');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkWallets();