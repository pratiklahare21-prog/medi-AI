import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  INITIAL_TENANTS,
  INITIAL_CATALOG,
  INITIAL_FEEDS,
  INITIAL_DISPUTES,
  INITIAL_AUDIT_LOGS,
  DEFAULT_USERS,
  INITIAL_PRICE_ALERTS,
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Prisma database seeding for Supabase PostgreSQL...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Tenants
  for (const tenant of INITIAL_TENANTS) {
    await prisma.tenant.upsert({
      where: { tenantCode: tenant.tenantCode },
      update: {
        name: tenant.name,
        shortCode: tenant.shortCode,
        schema: tenant.schema,
        region: tenant.region,
        environment: tenant.environment,
        status: tenant.status,
      },
      create: {
        id: tenant.id,
        name: tenant.name,
        shortCode: tenant.shortCode,
        tenantCode: tenant.tenantCode,
        schema: tenant.schema,
        region: tenant.region,
        environment: tenant.environment,
        status: tenant.status,
      },
    });
  }
  console.log(`✅ Tenants seeded (${INITIAL_TENANTS.length})`);

  // 2. Seed Users
  for (const user of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        name: user.name,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        phone: user.phone,
        department: user.department,
      },
      create: {
        id: user.id,
        email: user.email.toLowerCase(),
        passwordHash,
        name: user.name,
        role: user.role,
        title: user.title,
        tenantId: user.tenantId,
        phone: user.phone,
        department: user.department,
      },
    });
  }
  console.log(`✅ Users seeded (${DEFAULT_USERS.length})`);

  // 3. Seed Medicines & Bioequivalents
  for (const med of INITIAL_CATALOG) {
    const medicine = await prisma.medicine.upsert({
      where: { id: med.id },
      update: {
        brandName: med.brandName,
        manufacturer: med.manufacturer,
        formulationType: med.formulationType,
        dosageForm: med.dosageForm,
        activeSalt: med.activeSalt,
        saltStrength: med.saltStrength,
        compositionDetails: med.compositionDetails,
        atcCode: med.atcCode,
        innCode: med.innCode,
        therapeuticCategory: med.therapeuticCategory,
        verifiedGenericsCount: med.verifiedGenericsCount,
        brandedMrp: med.brandedMrp,
        lowestGenericPrice: med.lowestGenericPrice,
        lowestGenericBrand: med.lowestGenericBrand,
        savingsPercent: med.savingsPercent,
        savingsAmount: med.savingsAmount,
        savingsIntervalText: med.savingsIntervalText,
        regulatoryStatus: med.regulatoryStatus,
        bioequivalenceConfidence: med.bioequivalenceConfidence,
        verifierName: med.verifierName,
        pharmacopeiaStandard: med.pharmacopeiaStandard,
        dissolutionNote: med.dissolutionNote,
      },
      create: {
        id: med.id,
        brandName: med.brandName,
        manufacturer: med.manufacturer,
        formulationType: med.formulationType,
        dosageForm: med.dosageForm,
        activeSalt: med.activeSalt,
        saltStrength: med.saltStrength,
        compositionDetails: med.compositionDetails,
        atcCode: med.atcCode,
        innCode: med.innCode,
        therapeuticCategory: med.therapeuticCategory,
        verifiedGenericsCount: med.verifiedGenericsCount,
        brandedMrp: med.brandedMrp,
        lowestGenericPrice: med.lowestGenericPrice,
        lowestGenericBrand: med.lowestGenericBrand,
        savingsPercent: med.savingsPercent,
        savingsAmount: med.savingsAmount,
        savingsIntervalText: med.savingsIntervalText,
        regulatoryStatus: med.regulatoryStatus,
        bioequivalenceConfidence: med.bioequivalenceConfidence,
        verifierName: med.verifierName,
        pharmacopeiaStandard: med.pharmacopeiaStandard,
        dissolutionNote: med.dissolutionNote,
      },
    });

    if (med.genericsList && med.genericsList.length > 0) {
      for (const gen of med.genericsList) {
        await prisma.genericBioequivalent.upsert({
          where: { id: gen.id },
          update: {
            name: gen.name,
            manufacturer: gen.manufacturer,
            compositionMatch: gen.compositionMatch,
            genericStripMrp: gen.genericStripMrp,
            patientSavingsPercent: gen.patientSavingsPercent,
            patientSavingsAmount: gen.patientSavingsAmount,
            verifiedMatch: gen.verifiedMatch,
            includedInPatientRx: gen.includedInPatientRx,
            formularyStatus: gen.formularyStatus,
            similarityFactorF2: gen.similarityFactorF2,
          },
          create: {
            id: gen.id,
            medicineId: medicine.id,
            name: gen.name,
            manufacturer: gen.manufacturer,
            compositionMatch: gen.compositionMatch,
            genericStripMrp: gen.genericStripMrp,
            patientSavingsPercent: gen.patientSavingsPercent,
            patientSavingsAmount: gen.patientSavingsAmount,
            verifiedMatch: gen.verifiedMatch,
            includedInPatientRx: gen.includedInPatientRx,
            formularyStatus: gen.formularyStatus,
            similarityFactorF2: gen.similarityFactorF2,
          },
        });
      }
    }
  }
  console.log(`✅ Medicines and Generics seeded (${INITIAL_CATALOG.length})`);

  // 4. Seed Pricing Feeds
  for (const feed of INITIAL_FEEDS) {
    await prisma.pricingFeed.upsert({
      where: { id: feed.id },
      update: {
        name: feed.name,
        type: feed.type,
        status: feed.status,
        skusParsed: feed.skusParsed,
        updatedAgo: feed.updatedAgo,
        avgResponseMs: feed.avgResponseMs,
        errorRatePercent: feed.errorRatePercent,
        syncProgress: feed.syncProgress,
        slaBreachedHours: feed.slaBreachedHours,
        notes: feed.notes,
        endpointUrl: feed.endpointUrl,
      },
      create: {
        id: feed.id,
        name: feed.name,
        type: feed.type,
        status: feed.status,
        skusParsed: feed.skusParsed,
        updatedAgo: feed.updatedAgo,
        avgResponseMs: feed.avgResponseMs,
        errorRatePercent: feed.errorRatePercent,
        syncProgress: feed.syncProgress,
        slaBreachedHours: feed.slaBreachedHours,
        notes: feed.notes,
        endpointUrl: feed.endpointUrl,
      },
    });
  }
  console.log(`✅ Pricing Feeds seeded (${INITIAL_FEEDS.length})`);

  // 5. Seed Disputes
  for (const dispute of INITIAL_DISPUTES) {
    await prisma.dispute.upsert({
      where: { id: dispute.id },
      update: {
        title: dispute.title,
        feedSource: dispute.feedSource,
        feedCode: dispute.feedCode,
        slaRemaining: dispute.slaRemaining,
        severity: dispute.severity,
        medicineAffected: dispute.medicineAffected,
        activeComposition: dispute.activeComposition,
        discrepancyDescription: dispute.discrepancyDescription,
        clinicalReportsCount: dispute.clinicalReportsCount,
        status: dispute.status,
      },
      create: {
        id: dispute.id,
        title: dispute.title,
        feedSource: dispute.feedSource,
        feedCode: dispute.feedCode,
        slaRemaining: dispute.slaRemaining,
        severity: dispute.severity,
        medicineAffected: dispute.medicineAffected,
        activeComposition: dispute.activeComposition,
        discrepancyDescription: dispute.discrepancyDescription,
        clinicalReportsCount: dispute.clinicalReportsCount,
        status: dispute.status,
        tenantId: 'TN-4092',
      },
    });
  }
  console.log(`✅ Disputes seeded (${INITIAL_DISPUTES.length})`);

  // 6. Seed Price Alerts
  for (const alert of INITIAL_PRICE_ALERTS) {
    await prisma.priceAlert.upsert({
      where: { id: alert.id },
      update: {
        medicineName: alert.medicineName,
        activeSalt: alert.activeSalt,
        brandedMrp: alert.brandedMrp,
        currentLowestPrice: alert.currentLowestPrice,
        targetThresholdPrice: alert.targetThresholdPrice,
        channel: alert.channel,
        recipientTarget: alert.recipientTarget,
        status: alert.status,
        triggeredAt: alert.triggeredAt ? new Date() : null,
        triggeredPrice: alert.triggeredPrice,
        triggeredBrand: alert.triggeredBrand,
        notes: alert.notes,
      },
      create: {
        id: alert.id,
        medicineId: alert.medicineId,
        medicineName: alert.medicineName,
        activeSalt: alert.activeSalt,
        brandedMrp: alert.brandedMrp,
        currentLowestPrice: alert.currentLowestPrice,
        targetThresholdPrice: alert.targetThresholdPrice,
        channel: alert.channel,
        recipientTarget: alert.recipientTarget,
        status: alert.status,
        triggeredAt: alert.triggeredAt ? new Date() : null,
        triggeredPrice: alert.triggeredPrice,
        triggeredBrand: alert.triggeredBrand,
        notes: alert.notes,
      },
    });
  }
  console.log(`✅ Price Alerts seeded (${INITIAL_PRICE_ALERTS.length})`);

  // 7. Seed Audit Logs
  for (const log of INITIAL_AUDIT_LOGS) {
    await prisma.auditLog.upsert({
      where: { id: log.id },
      update: {
        actor: log.actor,
        role: log.role,
        action: log.action,
        targetEntity: log.targetEntity,
        tenantId: log.tenantId,
        hashSignature: log.hashSignature,
        status: log.status,
      },
      create: {
        id: log.id,
        actor: log.actor,
        role: log.role,
        action: log.action,
        targetEntity: log.targetEntity,
        tenantId: log.tenantId,
        hashSignature: log.hashSignature,
        status: log.status,
      },
    });
  }
  console.log(`✅ Audit Logs seeded (${INITIAL_AUDIT_LOGS.length})`);

  console.log('🎉 Supabase PostgreSQL database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
