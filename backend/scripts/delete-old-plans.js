/**
 * Script to delete old investment plans
 * Keeps only the 6 new plans created on Dec 8, 2025
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/varlixo';

// Plan schema (simplified)
const planSchema = new mongoose.Schema({
  name: String,
  slug: String,
  status: String,
  createdAt: Date,
}, { collection: 'investmentplans' });

const Plan = mongoose.model('InvestmentPlan', planSchema);

async function deleteOldPlans() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // The 6 new plans we want to keep
    const newPlanSlugs = [
      'starter-yield',
      'prime-growth',
      'elite-advance',
      'ultra-max',
      'infinity-pro',
      'flash-promo'
    ];

    // Find all plans
    const allPlans = await Plan.find({});
    console.log(`\n📊 Total plans found: ${allPlans.length}`);

    // Identify old plans to delete
    const oldPlans = allPlans.filter(plan => !newPlanSlugs.includes(plan.slug));
    console.log(`\n🗑️  Old plans to delete: ${oldPlans.length}`);
    
    if (oldPlans.length > 0) {
      console.log('\nOld plans:');
      oldPlans.forEach(plan => {
        console.log(`  - ${plan.name} (${plan.slug})`);
      });

      // Delete old plans
      const result = await Plan.deleteMany({
        slug: { $nin: newPlanSlugs }
      });

      console.log(`\n✅ Deleted ${result.deletedCount} old plans`);
    } else {
      console.log('\n✅ No old plans to delete');
    }

    // Show remaining plans
    const remainingPlans = await Plan.find({});
    console.log(`\n📊 Remaining plans: ${remainingPlans.length}`);
    remainingPlans.forEach(plan => {
      console.log(`  ✓ ${plan.name} (${plan.slug})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteOldPlans();
